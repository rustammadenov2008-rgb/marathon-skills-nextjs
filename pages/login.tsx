import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getCountdown } from '@/lib/timer';
import { useState } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (status === 'authenticated') router.replace('/');
  }, [status, router]);

  useEffect(() => {
    setCountdown(getCountdown());
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <span className="title">MARATHON SKILLS 2026</span>
        </div>
      </header>

      <main className="main">
        <div className="card">
          <h1>Добро пожаловать</h1>
          <p>Войдите через Google, чтобы зарегистрироваться на марафон</p>

          <button className="google-btn" onClick={() => signIn('google')}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.1c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.6-4.2 7.4-10.4 7.4-17.5z" fill="#4285F4"/>
              <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.9 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.8H2.5v6.2C6.5 42.6 14.7 48 24 48z" fill="#34A853"/>
              <path d="M10.6 28.7c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5v-6.2H2.5A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8l8.1-6.1z" fill="#FBBC04"/>
              <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.4 2.5 13.2l8.1 6.2C12.5 13.7 17.8 9.5 24 9.5z" fill="#EA4335"/>
            </svg>
            Войти через Google
          </button>
        </div>
      </main>

      <footer className="timer-bar">
        <div className="timer-label">ДО  СТАРТА  МАРАФОНА</div>
        <div className="timer-val">{countdown}</div>
      </footer>

      <style jsx>{`
        .page { display:flex; flex-direction:column; min-height:100vh; background:var(--bg); }
        .header { background:var(--bg-header); }
        .header-inner { padding:12px 24px; }
        .title { font-family:var(--font-display); font-size:20px; color:var(--orange); letter-spacing:1px; }
        .main { flex:1; display:flex; align-items:center; justify-content:center; }
        .card {
          background:var(--bg-panel); border-radius:10px; padding:50px 56px;
          width:420px; text-align:center;
        }
        h1 { font-size:24px; font-weight:600; margin-bottom:10px; }
        p  { font-size:13px; color:var(--muted); margin-bottom:32px; }
        .google-btn {
          display:flex; align-items:center; justify-content:center; gap:12px;
          background:#fff; color:#333; border:none; width:100%; padding:12px 20px;
          border-radius:6px; cursor:pointer; font-size:14px; font-weight:500;
          font-family:var(--font-body); transition:box-shadow .2s;
        }
        .google-btn:hover { box-shadow:0 2px 12px rgba(0,0,0,.25); }
        .timer-bar { background:var(--bg-header); padding:10px; text-align:center; }
        .timer-label { font-size:10px; font-weight:600; color:var(--muted); letter-spacing:2px; }
        .timer-val { font-family:var(--font-display); font-size:20px; color:var(--orange); }
      `}</style>
    </div>
  );
}
