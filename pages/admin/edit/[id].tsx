import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import { Runner } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function AdminEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === 'new';

  const [runner, setRunner] = useState<Partial<Runner>>({ role:'Бегун', name:'', surname:'', email:'' });
  const [pass,   setPass]   = useState('');
  const [pass2,  setPass2]  = useState('');
  const [error,  setError]  = useState('');
  const [saving, setSaving] = useState(false);
  const [loading,setLoading]= useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      fetch(`/api/runners/${id}`)
        .then(r => r.json())
        .then(data => { setRunner(data); setLoading(false); });
    }
  }, [id, isNew]);

  async function handleSave() {
    setError('');
    if (!runner.name || !runner.surname) { setError('Имя и фамилия обязательны.'); return; }
    if (pass && pass !== pass2) { setError('Пароли не совпадают.'); return; }

    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch('/api/runners', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({
            email:   runner.email || `${runner.name?.toLowerCase()}.${runner.surname?.toLowerCase()}@marathon.com`,
            name:    runner.name,
            surname: runner.surname,
            gender:  runner.gender  || 'Мужской',
            country: runner.country || 'Other',
          }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      } else {
        await fetch(`/api/runners/${id}`, {
          method:'PUT',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ name:runner.name, surname:runner.surname, role:runner.role }),
        });
      }
      router.push('/admin/users');
    } finally { setSaving(false); }
  }

  if (loading) return <div style={{ color:'var(--muted)', padding:40 }}>Загрузка...</div>;

  return (
    <Layout backHref="/admin/users" title="MARATHON SKILLS 2026">
      <div className="scroll-content" style={{ maxWidth:700 }}>
        <div className="page-title">Редактирование пользователя</div>
        {error && <div className="error-msg">{error}</div>}
        <div className="divider"/>

        <div className="edit-grid">
          {/* Left */}
          <div>
            <div className="field-group" style={{ gridTemplateColumns:'100px 1fr' }}>
              <span className="field-label">Email:</span>
              {isNew
                ? <input type="email" value={runner.email||''} onChange={e=>setRunner(r=>({...r,email:e.target.value}))} placeholder="Email"/>
                : <span style={{ fontSize:13, color:'var(--muted)', fontStyle:'italic', padding:'7px 0' }}>{runner.email}</span>
              }
            </div>
            <div className="field-group" style={{ gridTemplateColumns:'100px 1fr' }}>
              <span className="field-label">Имя:</span>
              <input type="text" value={runner.name||''} onChange={e=>setRunner(r=>({...r,name:e.target.value}))} placeholder="Имя"/>
            </div>
            <div className="field-group" style={{ gridTemplateColumns:'100px 1fr' }}>
              <span className="field-label">Фамилия:</span>
              <input type="text" value={runner.surname||''} onChange={e=>setRunner(r=>({...r,surname:e.target.value}))} placeholder="Фамилия"/>
            </div>
            <div className="field-group" style={{ gridTemplateColumns:'100px 1fr' }}>
              <span className="field-label">Роль:</span>
              <select className="white" value={runner.role||'Бегун'} onChange={e=>setRunner(r=>({...r,role:e.target.value}))}>
                <option>Бегун</option>
                <option>Координатор</option>
              </select>
            </div>
          </div>

          {/* Right: password */}
          <div className="pass-panel">
            <h3>Смена пароля</h3>
            <p>Оставьте поля незаполненными,<br/>если не хотите менять пароль.</p>
            <div className="field-group" style={{ gridTemplateColumns:'120px 1fr' }}>
              <span className="field-label">Пароль:</span>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password"/>
            </div>
            <div className="field-group" style={{ gridTemplateColumns:'120px 1fr' }}>
              <span className="field-label">Повтор пароля:</span>
              <input type="password" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Re-enter password"/>
            </div>
          </div>
        </div>

        <div className="divider"/>
        <div className="form-btns">
          <button className="btn-orange" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button className="btn-outline" onClick={()=>router.push('/admin/users')}>Отмена</button>
        </div>
      </div>

      <style jsx>{`
        .edit-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
        .pass-panel { background:var(--bg-panel); border-radius:6px; padding:20px; }
        .pass-panel h3 { font-size:15px; font-weight:600; text-align:center; margin-bottom:8px; }
        .pass-panel p  { font-size:11px; color:var(--muted); text-align:center; margin-bottom:16px; }
      `}</style>
    </Layout>
  );
}

export default withAuth(AdminEditPage);
