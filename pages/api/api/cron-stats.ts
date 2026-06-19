import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

// Этот эндпоинт вызывается Vercel Cron каждый день в 09:00
// Настройка в vercel.json:
// "crons": [{ "path": "/api/cron-stats", "schedule": "0 9 * * *" }]

const TOKEN    = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_ID = process.env.TELEGRAM_ADMIN_CHAT_ID!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Защита от несанкционированного вызова
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Получаем общее число участников
    const { count: total } = await supabaseAdmin
      .from('runners')
      .select('*', { count: 'exact', head: true });

    // Участники за последние 24 часа
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const { data: newToday } = await supabaseAdmin
      .from('runners')
      .select('name, surname, country')
      .gte('created_at', yesterday);

    // Разбивка по ролям
    const { data: byRole } = await supabaseAdmin
      .from('runners')
      .select('role');

    const runners   = byRole?.filter(r => r.role === 'Бегун').length ?? 0;
    const coordinators = byRole?.filter(r => r.role === 'Координатор').length ?? 0;

    // Разбивка по странам (топ-5)
    const { data: byCountry } = await supabaseAdmin
      .from('runners')
      .select('country');

    const countryCounts: Record<string, number> = {};
    byCountry?.forEach(r => {
      countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([c, n]) => `  🌍 ${c}: ${n}`)
      .join('\n');

    // Дней до марафона
    const daysLeft = Math.ceil(
      (new Date('2026-06-15').getTime() - Date.now()) / 86400000
    );

    // Новые участники за сегодня
    const newList = newToday && newToday.length > 0
      ? newToday.map(r => `  • ${r.name} ${r.surname} (${r.country})`).join('\n')
      : '  Новых участников нет';

    const text =
      `📊 <b>Ежедневная статистика Marathon Skills 2026</b>\n` +
      `📅 ${new Date().toLocaleDateString('ru-RU')}\n\n` +
      `👥 <b>Всего участников:</b> ${total}\n` +
      `🏃 Бегунов: ${runners}\n` +
      `🎯 Координаторов: ${coordinators}\n\n` +
      `🆕 <b>Новые за последние 24 ч:</b>\n${newList}\n\n` +
      `🌍 <b>Топ стран:</b>\n${topCountries}\n\n` +
      `⏳ <b>До старта марафона: ${daysLeft} дней</b>`;

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML' }),
    });

    return res.status(200).json({ ok: true, total, newToday: newToday?.length });
  } catch (err) {
    console.error('Cron stats error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
