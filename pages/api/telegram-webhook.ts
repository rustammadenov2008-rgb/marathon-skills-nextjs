import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

// Отправить сообщение через Telegram API
async function sendMessage(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const body = req.body;
    const message = body?.message;

    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId: number = message.chat.id;
    const text: string = (message.text || '').trim();

    // Команда /start
    if (text === '/start') {
      await sendMessage(
        chatId,
        '👋 <b>Добро пожаловать в Marathon Skills Bot!</b>\n\n' +
          'Введите фамилию, имя или email участника.\n\n' +
          'Примеры:\n' +
          '<code>Иванов</code>\n' +
          '<code>Иван</code>\n' +
          '<code>ivan@mail.com</code>'
      );

      return res.status(200).json({ ok: true });
    }

    // Команда /help
    if (text === '/help') {
      await sendMessage(
        chatId,
        '📖 <b>Как пользоваться ботом:</b>\n\n' +
          'Введите:\n' +
          '• фамилию\n' +
          '• имя\n' +
          '• email\n\n' +
          'Бот найдёт участника в базе Marathon Skills.'
      );

      return res.status(200).json({ ok: true });
    }

    // Поиск пользователя
    const searchText = text;

    const { data, error } = await supabaseAdmin
      .from('runners')
      .select('name, surname, role, country, email, bmi')
      .or(
        `surname.ilike.${searchText},name.ilike.${searchText},email.ilike.${searchText}`
      );

    // Не найден
    if (error || !data || data.length === 0) {
      await sendMessage(
        chatId,
        `❌ Пользователь «<b>${searchText}</b>» не найден.`
      );

      return res.status(200).json({ ok: true });
    }

    // Найден один пользователь
    if (data.length === 1) {
      const user = data[0];

      const bmiText = user.bmi
        ? `\n📊 BMI: <b>${user.bmi}</b>`
        : '';

      await sendMessage(
        chatId,
        `✅ Пользователь найден!\n\n` +
          `👤 Имя: <b>${user.name} ${user.surname}</b>\n` +
          `🏃 Роль: <b>${user.role}</b>\n` +
          `🌍 Страна: <b>${user.country}</b>\n` +
          `📧 Email: <b>${user.email}</b>` +
          bmiText
      );

      return res.status(200).json({ ok: true });
    }

    // Найдено несколько пользователей
    let response =
      `🔍 Найдено несколько пользователей (${data.length}):\n\n`;

    data.forEach((user, index) => {
      response +=
        `${index + 1}. ${user.name} ${user.surname}\n` +
        `📧 ${user.email}\n\n`;
    });

    response +=
      'Введите email пользователя для более точного поиска.';

    await sendMessage(chatId, response);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);

    return res.status(200).json({ ok: true });
  }
}
