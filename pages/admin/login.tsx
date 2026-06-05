import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

function AdminLoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [pass,  setPass]  = useState('');
  const [error, setError] = useState('');

  function handleLogin() {
    if (login === 'admin' && pass === 'admin') {
      router.push('/admin/users');
    } else {
      setError('Неверный логин или пароль.');
    }
  }

  return (
    <Layout backHref="/" title="MARATHON SKILLS 2026">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, padding:30 }}>
        <div className="card">
          <h2>Форма авторизации</h2>
          <p>Пожалуйста, авторизуйтесь в системе, используя ваш логин и пароль.</p>
          {error && <div className="error-msg">{error}</div>}

          <div className="login-field">
            <label>Login:</label>
            <input type="text" value={login} onChange={e=>setLogin(e.target.value)} placeholder="Enter your login"/>
          </div>
          <div className="login-field">
            <label>Password:</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
          </div>

          <div className="form-btns">
            <button className="btn-orange" onClick={handleLogin}>Login</button>
            <button className="btn-outline" onClick={()=>router.push('/')}>Cancel</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card { background:var(--bg-panel); border-radius:10px; padding:44px 50px; width:420px; }
        h2 { font-size:22px; font-weight:600; text-align:center; margin-bottom:8px; }
        p  { font-size:12px; color:var(--muted); text-align:center; margin-bottom:24px; }
        .login-field { display:grid; grid-template-columns:100px 1fr; align-items:center; gap:10px; margin-bottom:14px; }
        .login-field label { font-size:14px; color:var(--muted); text-align:right; }
      `}</style>
    </Layout>
  );
}

export default withAuth(AdminLoginPage);
