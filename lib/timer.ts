export const MARATHON_DATE = new Date('2026-06-15T09:00:00');

export function getCountdown(): string {
  const diff = MARATHON_DATE.getTime() - Date.now();
  if (diff <= 0) return 'Марафон уже начался!';
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000)  / 60_000);
  const s = Math.floor((diff % 60_000)     / 1_000);
  return `${d} дн.  ${String(h).padStart(2,'0')} ч.  ${String(m).padStart(2,'0')} мин.  ${String(s).padStart(2,'0')} сек.`;
}
