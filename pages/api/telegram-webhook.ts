import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

// Отправить сообщение через Telegram API
async function sendMessage(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Telegram шлёт только POST
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const body = req.body;
    const message = body?.message;

    if (!message) return res.status(200).json({ ok: true });

    const chatId: number  = message.chat.id;
    const text: string    = (message.text || '').trim();

    // Команда /start
    if (text === '/start') {
      await sendMessage(chatId,
        '👋 <b>Добро пожаловать в Marathon Skills Bot!</b>\n\n' +
        'Введите фамилию бегуна, чтобы узнать его данные.\n\n' +
        'Например: <code>User1</code>'
      );
      return res.status(200).json({ ok: true });
    }

    // Команда /help
    if (text === '/help') {
      await sendMessage(chatId,
        '📖 <b>Как пользоваться ботом:</b>\n\n' +
        '1. Введите фамилию бегуна\n' +
        '2. Бот найдёт его в базе данных Marathon Skills\n' +
        '3. Вы получите информацию об участнике\n\n' +
        'Пример: <code>Иванов</code>'
      );
      return res.status(200).json({ ok: true });
    }

    // Поиск по фамилии в Supabase
    const surname = text;

    const { data, error } = await supabaseAdmin
      .from('runners')
      .select('name, surname, role, country, email, bmi')
      .ilike('surname', surname)
      .limit(1)
      .single();

    if (error || !data) {
      await sendMessage(chatId,
        `❌ Фамилия «<b>${surname}</b>» не найдена в базе.\n\n` +
        'Проверьте правильность написания и попробуйте снова.'
      );
    } else {
      const bmiText = data.bmi ? `\n📊 BMI: <b>${data.bmi}</b>` : '';
      await sendMessage(chatId,
        `✅ Фамилия <b>${data.surname}</b> найдена!\n\n` +
        `👤 Имя: <b>${data.name} ${data.surname}</b>\n` +
        `🏃 Роль: <b>${data.role}</b>\n` +
        `🌍 Страна: <b>${data.country}</b>\n` +
        `📧 Email: <b>${data.email}</b>` +
        bmiText
      );
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return res.status(200).json({ ok: true }); // всегда 200 для Telegram
  }
}
