import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API   = `https://api.telegram.org/bot${TOKEN}`;

// Сессии для пошаговой регистрации
type RegState = {
  step: 'email'|'name'|'surname'|'gender'|'dob'|'country'|'confirm';
  mode?: 'search' | 'reg';
  email?: string; name?: string; surname?: string;
  gender?: string; dob?: string; country?: string;
};
const sessions: Record<number, RegState> = {};

// Состояние ИИ-чата (история сообщений)
const chatHistory: Record<number, Array<{role:string; content:string}>> = {};

async function send(chatId: number, text: string, keyboard?: object) {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (keyboard) body.reply_markup = keyboard;
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mainMenu = {
  keyboard: [
    [{ text: '📋 О марафоне' }, { text: '🏃 Зарегистрироваться' }],
    [{ text: '👥 Участники' },  { text: '🔍 Найти участника'    }],
    [{ text: '🤖 ИИ-помощник' },{ text: '📊 Статистика'         }],
  ],
  resize_keyboard: true,
};

const genderKeyboard = {
  keyboard: [[{ text: '👨 Мужской' }, { text: '👩 Женский' }]],
  one_time_keyboard: true, resize_keyboard: true,
};

const countryKeyboard = {
  keyboard: [
    [{ text: 'Russia' }, { text: 'Kazakhstan' }],
    [{ text: 'Germany'},  { text: 'France'     }],
    [{ text: 'USA'    },  { text: 'UK'         }],
    [{ text: 'Other'  }],
  ],
  one_time_keyboard: true, resize_keyboard: true,
};

const removeKeyboard = { remove_keyboard: true };

function getCountdown(): string {
  const diff = new Date('2026-06-15T09:00:00').getTime() - Date.now();
  if (diff <= 0) return 'Марафон уже начался!';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `⏳ ${d} дн. ${h} ч. ${m} мин.`;
}

async function askAI(chatId: number, userMessage: string): Promise<string> {
  if (!chatHistory[chatId]) chatHistory[chatId] = [];
  chatHistory[chatId].push({ role: 'user', content: userMessage });
  // Keep only last 10 messages
  if (chatHistory[chatId].length > 10) chatHistory[chatId] = chatHistory[chatId].slice(-10);

  const { count: total } = await supabaseAdmin
    .from('runners').select('*', { count: 'exact', head: true });

  const daysLeft = Math.ceil(
    (new Date('2026-06-15T09:00:00').getTime() - Date.now()) / 86400000
  );

  const systemPrompt = `Ты помощник Marathon Skills 2026 в Telegram. Отвечай кратко (до 200 слов), по-русски.
Марафон: 15 июня 2026, 09:00. До старта: ${daysLeft} дней.
Участников: ${total}. Дистанции: 10 км, 21.1 км, 42.2 км.
Регистрация на сайте: marathon-skills-nextjs.vercel.app
Отвечай только на вопросы о марафоне.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: chatHistory[chatId],
      }),
    });
    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Не могу ответить сейчас.';
    chatHistory[chatId].push({ role: 'assistant', content: reply });
    return reply;
  } catch {
    return 'Сервис временно недоступен. Попробуйте позже.';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  try {
    const message = req.body?.message;
    if (!message) return res.status(200).json({ ok: true });

    const chatId: number = message.chat.id;
    const text: string   = (message.text || '').trim();
    const session        = sessions[chatId];

    // ── Если в режиме ИИ-чата ──
    if (session && (session as any).aiMode) {
      if (text === '🏠 Меню' || text === '/menu') {
        delete sessions[chatId];
        delete chatHistory[chatId];
        await send(chatId, '↩️ Возвращаемся в главное меню', mainMenu);
        return res.status(200).json({ ok: true });
      }
      const typing = fetch(`${API}/sendChatAction`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
      });
      const reply = await askAI(chatId, text);
      await typing;
      await send(chatId, `🤖 ${reply}`, {
        keyboard: [[{ text: '🏠 Меню' }]], resize_keyboard: true
      });
      return res.status(200).json({ ok: true });
    }

    // ── Основные команды ──
    if (text === '/start' || text === '/menu') {
      delete sessions[chatId];
      await send(chatId,
        '👋 <b>Добро пожаловать в Marathon Skills 2026!</b>\n\n' +
        `${getCountdown()}\n\nВыберите действие:`, mainMenu);
      return res.status(200).json({ ok: true });
    }

    // ── О марафоне ──
    if (text === '📋 О марафоне') {
      await send(chatId,
        `🏅 <b>Marathon Skills 2026</b>\n\n` +
        `📅 Дата: <b>15 июня 2026, 09:00</b>\n` +
        `${getCountdown()}\n\n` +
        `🏃 <b>Дистанции:</b>\n` +
        `• 10 км — Спринт (начинающие)\n` +
        `• 21.1 км — Полумарафон (опытные)\n` +
        `• 42.2 км — Марафон (элита)\n\n` +
        `🌍 Участники из 40+ стран\n` +
        `🔗 <a href="https://marathon-skills-nextjs.vercel.app">Сайт марафона</a>`,
        mainMenu);
      return res.status(200).json({ ok: true });
    }

    // ── Статистика ──
    if (text === '📊 Статистика') {
      const { count: total } = await supabaseAdmin
        .from('runners').select('*', { count: 'exact', head: true });
      const { data: byRole } = await supabaseAdmin.from('runners').select('role');
      const runners      = byRole?.filter(r => r.role === 'Бегун').length ?? 0;
      const coordinators = byRole?.filter(r => r.role === 'Координатор').length ?? 0;

      const { data: byCountry } = await supabaseAdmin.from('runners').select('country');
      const cc: Record<string, number> = {};
      byCountry?.forEach(r => { cc[r.country] = (cc[r.country] || 0) + 1; });
      const top = Object.entries(cc).sort((a,b) => b[1]-a[1]).slice(0,5)
        .map(([c,n]) => `  🌍 ${c}: ${n}`).join('\n');

      await send(chatId,
        `📊 <b>Статистика Marathon Skills 2026</b>\n\n` +
        `👥 Всего участников: <b>${total}</b>\n` +
        `🏃 Бегунов: <b>${runners}</b>\n` +
        `🎯 Координаторов: <b>${coordinators}</b>\n\n` +
        `🌍 <b>Топ стран:</b>\n${top}\n\n` +
        `${getCountdown()}`, mainMenu);
      return res.status(200).json({ ok: true });
    }

    // ── ИИ-помощник ──
    if (text === '🤖 ИИ-помощник') {
      sessions[chatId] = { step: 'email' };
      (sessions[chatId] as any).aiMode = true;
      chatHistory[chatId] = [];
      await send(chatId,
        '🤖 <b>ИИ-помощник Marathon Skills</b>\n\n' +
        'Задайте любой вопрос о марафоне!\n' +
        'Нажмите <b>«🏠 Меню»</b> чтобы вернуться.',
        { keyboard: [[{ text: '🏠 Меню' }]], resize_keyboard: true });
      return res.status(200).json({ ok: true });
    }

    // ── Список участников ──
    if (text === '👥 Участники') {
      const { data } = await supabaseAdmin
        .from('runners').select('name, surname, role, country').order('name').limit(10);
      if (!data || data.length === 0) {
        await send(chatId, '📭 Участников пока нет.', mainMenu);
        return res.status(200).json({ ok: true });
      }
      const list = data.map((r, i) =>
        `${i+1}. <b>${r.name} ${r.surname}</b> — ${r.role} 🌍 ${r.country}`).join('\n');
      await send(chatId, `👥 <b>Участники (первые 10):</b>\n\n${list}`, mainMenu);
      return res.status(200).json({ ok: true });
    }

    // ── Найти участника ──
    if (text === '🔍 Найти участника') {
      sessions[chatId] = { step: 'email', mode: 'search' } as any;
      await send(chatId, '🔍 Введите фамилию участника:', removeKeyboard);
      return res.status(200).json({ ok: true });
    }

    // ── Регистрация ──
    if (text === '🏃 Зарегистрироваться') {
      sessions[chatId] = { step: 'email', mode: 'reg' };
      await send(chatId,
        '📝 <b>Регистрация на Marathon Skills 2026</b>\n\n' +
        '📧 <b>Шаг 1/7:</b> Введите Email:', removeKeyboard);
      return res.status(200).json({ ok: true });
    }

    if (text === '/cancel' || text === '❌ Отмена') {
      delete sessions[chatId];
      await send(chatId, '❌ Отменено.', mainMenu);
      return res.status(200).json({ ok: true });
    }

    // ── Режим поиска ──
    if (session && (session as any).mode === 'search') {
      delete sessions[chatId];
      const { data, error } = await supabaseAdmin
        .from('runners').select('name, surname, role, country, email, bmi')
        .ilike('surname', text).limit(1).single();
      if (error || !data) {
        await send(chatId, `❌ Фамилия «<b>${text}</b>» не найдена.`, mainMenu);
      } else {
        const bmiText = data.bmi ? `\n📊 BMI: <b>${data.bmi}</b>` : '';
        await send(chatId,
          `✅ <b>${data.name} ${data.surname}</b>\n` +
          `🏃 ${data.role} | 🌍 ${data.country}\n` +
          `📧 ${data.email}${bmiText}`, mainMenu);
      }
      return res.status(200).json({ ok: true });
    }

    // ── Пошаговая регистрация ──
    if (session && session.mode === 'reg') {
      if (session.step === 'email') {
        if (!text.includes('@') || !text.includes('.')) {
          await send(chatId, '❌ Некорректный email. Попробуйте:'); return res.status(200).json({ ok: true });
        }
        session.email = text; session.step = 'name';
        await send(chatId, '👤 <b>Шаг 2/7:</b> Введите <b>Имя</b>:');
        return res.status(200).json({ ok: true });
      }
      if (session.step === 'name') {
        if (text.length < 2) { await send(chatId, '❌ Слишком короткое. Ещё раз:'); return res.status(200).json({ ok: true }); }
        session.name = text; session.step = 'surname';
        await send(chatId, '👤 <b>Шаг 3/7:</b> Введите <b>Фамилию</b>:');
        return res.status(200).json({ ok: true });
      }
      if (session.step === 'surname') {
        if (text.length < 2) { await send(chatId, '❌ Слишком короткое. Ещё раз:'); return res.status(200).json({ ok: true }); }
        session.surname = text; session.step = 'gender';
        await send(chatId, '⚧ <b>Шаг 4/7:</b> Выберите <b>Пол</b>:', genderKeyboard);
        return res.status(200).json({ ok: true });
      }
      if (session.step === 'gender') {
        const g = text.replace('👨 ','').replace('👩 ','');
        if (g !== 'Мужской' && g !== 'Женский') {
          await send(chatId, '❌ Выберите из вариантов:', genderKeyboard); return res.status(200).json({ ok: true });
        }
        session.gender = g; session.step = 'dob';
        await send(chatId, '📅 <b>Шаг 5/7:</b> Дата рождения:\nФормат: <code>ГГГГ-ММ-ДД</code>\nПример: <code>1990-06-15</code>', removeKeyboard);
        return res.status(200).json({ ok: true });
      }
      if (session.step === 'dob') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
          await send(chatId, '❌ Формат: <code>ГГГГ-ММ-ДД</code>'); return res.status(200).json({ ok: true });
        }
        session.dob = text; session.step = 'country';
        await send(chatId, '🌍 <b>Шаг 6/7:</b> Выберите <b>Страну</b>:', countryKeyboard);
        return res.status(200).json({ ok: true });
      }
      if (session.step === 'country') {
        session.country = text; session.step = 'confirm';
        await send(chatId,
          `✅ <b>Шаг 7/7: Подтверждение</b>\n\n` +
          `📧 ${session.email}\n👤 ${session.name} ${session.surname}\n` +
          `⚧ ${session.gender}\n📅 ${session.dob}\n🌍 ${session.country}\n\nВсё верно?`,
          { keyboard: [[{ text: '✅ Подтвердить' }, { text: '❌ Отмена' }]], one_time_keyboard: true, resize_keyboard: true });
        return res.status(200).json({ ok: true });
      }
      if (session.step === 'confirm') {
        if (text === '✅ Подтвердить') {
          const { error } = await supabaseAdmin.from('runners').insert({
            user_id: `tg_${chatId}`, email: session.email,
            name: session.name, surname: session.surname,
            gender: session.gender, country: session.country,
            date_of_birth: session.dob, role: 'Бегун',
          });
          delete sessions[chatId];
          if (error) {
            await send(chatId, '❌ Ошибка при регистрации. Попробуйте позже.', mainMenu);
          } else {
            // Уведомить админа
            const adminId = process.env.TELEGRAM_ADMIN_CHAT_ID;
            if (adminId && adminId !== String(chatId)) {
              await send(Number(adminId),
                `🆕 <b>Новый участник через Telegram!</b>\n` +
                `👤 ${session.name} ${session.surname}\n📧 ${session.email}\n🌍 ${session.country}`);
            }
            await send(chatId,
              `🎉 <b>Регистрация успешна!</b>\n\nДобро пожаловать, <b>${session.name} ${session.surname}</b>!\nMarathon Skills 2026 — 15 июня 2026 🏃`, mainMenu);
          }
        } else {
          delete sessions[chatId];
          await send(chatId, '❌ Регистрация отменена.', mainMenu);
        }
        return res.status(200).json({ ok: true });
      }
    }

    // По умолчанию — поиск по фамилии
    if (!session && text && !text.startsWith('/')) {
      const { data, error } = await supabaseAdmin
        .from('runners').select('name, surname, role, country, email, bmi')
        .ilike('surname', text).limit(1).single();
      if (error || !data) {
        await send(chatId, `❌ «<b>${text}</b>» не найдено.\n\nИспользуйте меню 👇`, mainMenu);
      } else {
        const bmiText = data.bmi ? `\n📊 BMI: <b>${data.bmi}</b>` : '';
        await send(chatId,
          `✅ <b>${data.name} ${data.surname}</b>\n🏃 ${data.role} | 🌍 ${data.country}\n📧 ${data.email}${bmiText}`,
          mainMenu);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).json({ ok: true });
  }
}
