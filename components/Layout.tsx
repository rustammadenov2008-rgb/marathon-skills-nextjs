import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCountdown } from '@/hooks/useCountdown';

interface LayoutProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  title?: string;
  showNav?: boolean;
  rightSlot?: React.ReactNode;
  showLoginBtn?: boolean;
}

export default function Layout({
  children,
  backHref,
  backLabel = '← Назад',
  title = 'MARATHON SKILLS 2026',
  showNav = false,
  rightSlot,
  showLoginBtn = false,
}: LayoutProps) {
  const { data: session } = useSession();
  const countdown = useCountdown();

  return (
    <div className="layout">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          {backHref && (
            <Link href={backHref} className="btn-back">{backLabel}</Link>
          )}

          <span className="header-title">{title}</span>

          {showNav && (
            <nav className="header-nav">
              <Link href="/participants" className="btn-outline">Список участников</Link>
              <Link href="/register"    className="btn-orange">Регистрация</Link>
            </nav>
          )}

          {rightSlot}

          {/* ── USER CHIP ── */}
          {session?.user && (
            <div className="user-chip">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt="avatar"
                  width={32} height={32}
                  className="avatar"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="user-name">
                {session.user.name?.split(' ')[0]}
              </span>
              <button
                className="btn-signout"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="main">{children}</main>

      {/* ── TIMER BAR ── */}
      <footer className="timer-bar">
        <div className="timer-center">
          <div className="timer-label">ДО  СТАРТА  МАРАФОНА</div>
          <div className="timer-value">{countdown}</div>
        </div>

        {showLoginBtn && (
          <Link href="/admin/login" className="btn-orange login-corner">
            🔒 LOGIN
          </Link>
        )}
      </footer>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--bg);
        }

        /* ── header ── */
        .header { background: var(--bg-header); flex-shrink: 0; }
        .header-inner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .header-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--orange);
          letter-spacing: 1px;
          flex: 1;
        }
        .header-nav { display: flex; gap: 10px; }

        /* ── user chip ── */
        .user-chip { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .user-chip :global(.avatar) { border-radius: 50%; }
        .user-name { font-size: 13px; color: var(--muted); }
        .btn-signout {
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-family: var(--font-body);
          transition: border-color .2s, color .2s;
        }
        .btn-signout:hover { border-color: var(--orange); color: var(--orange); }

        /* ── main ── */
        .main { flex: 1; overflow-y: auto; }

        /* ── timer bar ── */
        .timer-bar {
          background: var(--bg-header);
          padding: 10px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .timer-center { text-align: center; }
        .timer-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--muted);
          letter-spacing: 2px;
          margin-bottom: 2px;
        }
        .timer-value {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--orange);
        }
        .login-corner {
          position: absolute;
          right: 24px;
          font-size: 12px !important;
          padding: 7px 14px !important;
        }

        @media (max-width: 640px) {
          .header-inner { padding: 10px 16px; gap: 10px; }
          .timer-bar    { padding: 10px 16px; }
          .login-corner { position: static; margin-left: auto; }
        }
      `}</style>
    </div>
  );
}
