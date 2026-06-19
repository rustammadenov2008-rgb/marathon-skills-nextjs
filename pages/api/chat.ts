import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).end();

  const { message } = req.body as { message: string };
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // Получаем статистику для контекста
    const { count: total } = await supabaseAdmin
      .from('runners').select('*', { count: 'exact', head: true });

    const daysLeft = Math.ceil(
      (new Date('2026-06-15T09:00:00').getTime() - Date.now()) / 86400000
    );

    const systemPrompt = `Ты помощник Marathon Skills 2026 — международного марафона.
Отвечай кратко, по-русски, дружелюбно.

ИНФОРМАЦИЯ О МАРАФОНЕ:
- Дата: 15 июня 2026 года, 09:00
- До старта: ${daysLeft} дней
- Дистанции: 10 км (Спринт), 21.1 км (Полумарафон), 42.2 км (Марафон)
- Зарегистрировано участников: ${total}
- Участники из 40+ стран мира
- Регистрация доступна на сайте

ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ:
- Как зарегистрироваться? Нажмите кнопку "Регистрация" в шапке сайта
- Сколько стоит участие? Уточняйте на официальном сайте
- Где пройдёт марафон? Информация публикуется ближе к дате
- Что взять на марафон? Удобная обувь, вода, номер участника
- Как рассчитать BMI? Используйте BMI-калькулятор на сайте после регистрации

Отвечай только на вопросы о марафоне. Если вопрос не по теме — вежливо перенаправь.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Извините, не могу ответить прямо сейчас.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Chat service unavailable' });
  }
}
