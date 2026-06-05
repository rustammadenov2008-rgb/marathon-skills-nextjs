import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useRef } from 'react';

function RegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', surname: '', gender: 'Мужской',
    country: 'Russia', date_of_birth: '1978-07-16',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setError('');
    if (!form.name || !form.surname) { setError('Заполните имя и фамилию.'); return; }

    const email = session?.user?.email || '';
    setLoading(true);
    try {
      const res = await fetch('/api/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка регистрации'); return; }
      router.push('/bmi');
    } finally { setLoading(false); }
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <Layout backHref="/" title="MARATHON SKILLS 2026">
      <div className="scroll-content" style={{ maxWidth: 760 }}>
        <div className="page-title">Регистрация бегуна</div>
        <div className="page-subtitle">Заполните все поля, чтобы зарегистрироваться в качестве бегуна</div>
        {error && <div className="error-msg">{error}</div>}
        <div className="divider"/>

        <div className="form-grid">
          {/* Left */}
          <div>
            <div className="field-group">
              <span className="field-label">Email:</span>
              <input type="email" value={session?.user?.email || ''} readOnly style={{ opacity:.6 }}/>
            </div>
            <div className="field-group">
              <span className="field-label">Имя:</span>
              <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Имя"/>
            </div>
            <div className="field-group">
              <span className="field-label">Фамилия:</span>
              <input type="text" value={form.surname} onChange={e=>set('surname',e.target.value)} placeholder="Фамилия"/>
            </div>
            <div className="field-group">
              <span className="field-label">Пол:</span>
              <select className="white" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                <option>Мужской</option><option>Женский</option>
              </select>
            </div>
          </div>

          {/* Right */}
          <div>
            <div
              className="photo-preview"
              onClick={() => fileRef.current?.click()}
            >
              {photoPreview
                ? <img src={photoPreview} alt="photo"/>
                : <span>Фото</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto}/>

            <div style={{ marginBottom:12 }}>
              <div className="field-label" style={{ textAlign:'left', marginBottom:4 }}>Дата рождения:</div>
              <input type="date" className="white-date" value={form.date_of_birth} onChange={e=>set('date_of_birth',e.target.value)}/>
            </div>
            <div>
              <div className="field-label" style={{ textAlign:'left', marginBottom:4 }}>Страна:</div>
              <select className="white" value={form.country} onChange={e=>set('country',e.target.value)}>
                {['Russia','Germany','France','USA','UK','Italy','Spain','Japan','Kazakhstan','Other'].map(c=>(
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="divider"/>
        <div className="form-btns">
          <button className="btn-orange" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Загрузка...' : 'Регистрация'}
          </button>
          <button className="btn-outline" onClick={() => router.push('/')}>Отмена</button>
        </div>
      </div>

      <style jsx>{`
        .form-grid { display:grid; grid-template-columns:1fr 200px; gap:24px; }
        .photo-preview {
          width:100%; height:150px; background:var(--bg-panel); border-radius:6px;
          display:flex; align-items:center; justify-content:center;
          color:var(--muted); font-size:14px; margin-bottom:12px;
          overflow:hidden; cursor:pointer;
          border:2px dashed var(--border); transition:border-color .2s;
        }
        .photo-preview:hover { border-color:var(--orange); }
        .photo-preview img { width:100%; height:100%; object-fit:cover; }
        .white-date { background:#fff; color:#000; }
      `}</style>
    </Layout>
  );
}

export default withAuth(RegisterPage);
