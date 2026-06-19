import ExportImport from '@/components/ExportImport';
import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import { Runner } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function AdminUsersPage() {
  const router = useRouter();
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
    const tot = await fetch('/api/runners');
    const all = await tot.json();
    setTotal(Array.isArray(all) ? all.length : 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, [role, sort]);

  function editUser(id: string) {
    router.push(`/admin/edit/${id}`);
  }

  return (
    <Layout backHref="/admin/login" title="MARATHON SKILLS 2026"
      rightSlot={
        <button className="btn-outline" style={{ marginLeft:'auto', fontSize:12, padding:'6px 14px' }}
          onClick={()=>router.push('/')}>Logout</button>
      }>

      <div style={{ padding:'24px 40px' }}>
        <div className="page-title">Список зарегистрированных пользователей</div>
        <div className="divider-orange"/>

        <div className="controls">
          <button className="btn-outline" style={{ fontSize:12, padding:'10px 16px', lineHeight:'1.4' }}
            onClick={()=>router.push('/admin/edit/new')}>
            + Добавление<br/>нового
          </button>
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

        <div style={{ fontSize:13, fontWeight:700, color:'var(--muted)', marginBottom:10 }}>
          Всего пользователей: {total}
        </div>

        {loading
          ? <div style={{ color:'var(--muted)' }}>Загрузка...</div>
          : <table>
              <thead><tr>
                <th>ИМЯ</th><th>ФАМИЛИЯ</th><th>EMAIL</th><th>РОЛЬ</th><th></th>
              </tr></thead>
              <tbody>
                {runners.map(r=>(
                  <tr key={r.id}>
                    <td>{r.name}</td><td>{r.surname}</td><td>{r.email}</td><td>{r.role}</td>
                    <td><button className="btn-edit" onClick={()=>editUser(r.id)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      <style jsx>{`
        .controls { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; gap:20px; }
        .filters { display:flex; flex-direction:column; gap:8px; }
        .filter-row { display:flex; align-items:center; gap:10px; }
        .fl { font-size:12px; color:var(--muted); width:130px; text-align:right; }
      `}</style>
    </Layout>
  );
}

export default withAuth(AdminUsersPage);
