import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import { Runner } from '@/lib/supabase';
import { useEffect, useState } from 'react';

function ParticipantsPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [total,   setTotal]   = useState(0);
  const [role,    setRole]    = useState('');
  const [sort,    setSort]    = useState('name');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (role)   params.set('role', role);
    if (sort)   params.set('sort', sort);
    if (search) params.set('search', search);
    const res  = await fetch('/api/runners?' + params);
    const data = await res.json();
    setRunners(Array.isArray(data) ? data : []);
    // Get total count without filters
    const tot = await fetch('/api/runners');
    const all = await tot.json();
    setTotal(Array.isArray(all) ? all.length : 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, [role, sort]);

  return (
    <Layout backHref="/" title="MARATHON SKILLS 2026">
      <div style={{ padding:'24px 40px' }}>
        <div className="page-title">Список зарегистрированных пользователей</div>
        <div className="divider-orange"/>

        {/* Controls */}
        <div className="controls">
          <div className="total">Всего пользователей: {total}</div>
          <div className="filters">
            <div className="filter-row">
              <span className="fl">Фильтр по ролям:</span>
              <select className="white" value={role} onChange={e=>setRole(e.target.value)}>
                <option value="">Все роли</option>
                <option value="Координатор">Координатор</option>
                <option value="Бегун">Бегун</option>
              </select>
            </div>
            <div className="filter-row">
              <span className="fl">Сортировать по:</span>
              <select className="white" value={sort} onChange={e=>setSort(e.target.value)}>
                <option value="name">Имени</option>
                <option value="surname">Фамилии</option>
                <option value="email">Email</option>
                <option value="role">Роли</option>
              </select>
            </div>
            <div className="filter-row">
              <span className="fl">Поиск:</span>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск..." style={{ width:180 }}/>
              <button className="btn-orange" style={{ padding:'7px 14px', fontSize:12 }} onClick={load}>Обновить</button>
            </div>
          </div>
        </div>

        {loading
          ? <div style={{ color:'var(--muted)', padding:'20px 0' }}>Загрузка...</div>
          : <table>
              <thead><tr>
                <th>ИМЯ</th><th>ФАМИЛИЯ</th><th>EMAIL</th><th>РОЛЬ</th>
              </tr></thead>
              <tbody>
                {runners.map(r=>(
                  <tr key={r.id}>
                    <td>{r.name}</td><td>{r.surname}</td><td>{r.email}</td><td>{r.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      <style jsx>{`
        .controls { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
        .total { font-size:13px; font-weight:700; color:var(--muted); padding-top:4px; }
        .filters { display:flex; flex-direction:column; gap:8px; }
        .filter-row { display:flex; align-items:center; gap:10px; }
        .fl { font-size:12px; color:var(--muted); width:130px; text-align:right; }
      `}</style>
    </Layout>
  );
}

export default withAuth(ParticipantsPage);
