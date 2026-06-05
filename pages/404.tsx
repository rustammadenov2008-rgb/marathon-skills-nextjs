import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#1A1E24', gap: 20,
    }}>
      <div style={{
        fontFamily: 'Oswald, sans-serif', fontSize: 96,
        color: '#E8501A', fontWeight: 700, lineHeight: 1,
      }}>404</div>
      <div style={{ fontSize: 18, color: '#A0A8B4' }}>Страница не найдена</div>
      <Link href="/" className="btn-orange" style={{ marginTop: 10 }}>
        На главную
      </Link>
    </div>
  );
}
