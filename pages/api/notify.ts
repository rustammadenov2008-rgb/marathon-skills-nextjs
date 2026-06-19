// Этот файл вызывается из /api/runners при регистрации нового участника
// Отправляет уведомление администратору в Telegram

const TOKEN    = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_ID = process.env.TELEGRAM_ADMIN_CHAT_ID!; // твой личный chat_id

export async function notifyAdminNewRunner(runner: {
  name: string; surname: string; email: string;
  country: string; role: string;
}) {
  if (!TOKEN || !ADMIN_ID) return;

  const text =
    `🆕 <b>Новый участник зарегистрирован!</b>\n\n` +
    `👤 <b>${runner.name} ${runner.surname}</b>\n` +
    `📧 ${runner.email}\n` +
    `🌍 ${runner.country}\n` +
    `🏃 Роль: ${runner.role}\n\n` +
    `⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML' }),
  }).catch(() => {});
}

export async function notifyAdminEdit(runner: {
  name: string; surname: string; email: string;
}, editedBy: string) {
  if (!TOKEN || !ADMIN_ID) return;

  const text =
    `✏️ <b>Участник отредактирован</b>\n\n` +
    `👤 ${runner.name} ${runner.surname}\n` +
    `📧 ${runner.email}\n` +
    `👁 Кем: ${editedBy}\n` +
    `⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML' }),
  }).catch(() => {});
}
