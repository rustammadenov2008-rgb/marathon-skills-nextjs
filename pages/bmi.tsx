import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

function BmiPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [arrowPct, setArrowPct] = useState(0);
  const [saving, setSaving] = useState(false);

  function calcBmi() {
    const h = height / 100;
    const val = weight / (h * h);
    setBmi(Math.round(val * 10) / 10);
    let cat: string, pct: number;
    if (val < 18.5)     { cat='Недостаточный'; pct=Math.max(0,val/18.5*.25); }
    else if (val < 25)  { cat='Здоровый';      pct=.25+(val-18.5)/6.5*.25; }
    else if (val < 30)  { cat='Избыточный';    pct=.50+(val-25)/5*.25; }
    else                { cat='Ожирение';       pct=Math.min(1,.75+(val-30)/20*.25); }
    setCategory(cat);
    setArrowPct(Math.max(0, Math.min(272, pct * 280 - 8)));
  }

  async function saveBmi() {
    if (!bmi) { alert('Сначала рассчитайте BMI.'); return; }
    setSaving(true);
    try {
      // Find runner by user email and update BMI
      const meRes = await fetch('/api/runners/me');
      const runner = await meRes.json();
      if (runner?.id) {
        await fetch(`/api/runners/${runner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bmi }),
        });
      }
      router.push('/participants');
    } finally { setSaving(false); }
  }

  return (
    <Layout backHref="/" title="BMI CALCULATOR"
      rightSlot={<button className="btn-orange" onClick={saveBmi} disabled={saving} style={{ marginLeft:'auto' }}>{saving?'Сохранение...':'Сохранить'}</button>}>

      <div className="scroll-content">
        <div className="page-title">BMI Калькулятор</div>
        <div className="page-subtitle">Индекс массы тела</div>
        <div className="divider"/>

        <div className="bmi-grid">
          {/* Left */}
          <div>
            <p style={{ fontSize:12, color:'var(--muted)', lineHeight:'20px', marginBottom:20 }}>
              ИМТ = вес (кг) ÷ рост² (м). Рассчитывается и сохраняется в вашем профиле бегуна.
            </p>

            <div className="gender-icons">
              <div className="g-icon">
                <svg viewBox="0 0 50 70" width="44" height="60">
                  <ellipse cx="25" cy="10" rx="10" ry="10" fill="#A0A8B4"/>
                  <rect x="19" y="22" width="12" height="28" rx="3" fill="#A0A8B4"/>
                  <rect x="7"  y="25" width="12" height="5" rx="2" fill="#A0A8B4"/>
                  <rect x="31" y="25" width="12" height="5" rx="2" fill="#A0A8B4"/>
                  <rect x="18" y="50" width="7" height="20" rx="2" fill="#A0A8B4"/>
                  <rect x="27" y="50" width="7" height="20" rx="2" fill="#A0A8B4"/>
                </svg>
                <span>Мужской</span>
              </div>
              <div className="g-icon">
                <svg viewBox="0 0 50 70" width="44" height="60">
                  <ellipse cx="25" cy="10" rx="10" ry="10" fill="#A0A8B4"/>
                  <polygon points="25,22 8,52 42,52" fill="#A0A8B4"/>
                  <rect x="18" y="52" width="7" height="18" rx="2" fill="#A0A8B4"/>
                  <rect x="27" y="52" width="7" height="18" rx="2" fill="#A0A8B4"/>
                </svg>
                <span>Женский</span>
              </div>
            </div>

            <div className="bmi-fields">
              <div className="bmi-row">
                <label>Рост:</label>
                <input type="number" value={height} min={100} max={250} onChange={e=>setHeight(Number(e.target.value))} style={{ width:90 }}/>
                <span>см</span>
              </div>
              <div className="bmi-row">
                <label>Вес:</label>
                <input type="number" value={weight} min={30} max={300} onChange={e=>setWeight(Number(e.target.value))} style={{ width:90 }}/>
                <span>кг</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button className="btn-orange" onClick={calcBmi}>Рассчитать</button>
              <button className="btn-outline" onClick={()=>router.push('/')}>Отмена</button>
            </div>
          </div>

          {/* Right */}
          <div className="result-panel">
            <svg width="80" height="120" viewBox="0 0 60 140">
              <ellipse cx="30" cy="10" rx="10" ry="10" fill="#E8501A"/>
              <rect x="22" y="22" width="16" height="60" rx="3" fill="#E8501A"/>
              <rect x="4"  y="26" width="18" height="6" rx="3" fill="#E8501A"/>
              <rect x="38" y="26" width="18" height="6" rx="3" fill="#E8501A"/>
              <rect x="22" y="84" width="7" height="56" rx="3" fill="#E8501A"/>
              <rect x="31" y="84" width="7" height="56" rx="3" fill="#E8501A"/>
            </svg>

            <div className="bmi-cat">{category || '—'}</div>
            <div className="bmi-val">{bmi ?? ''}</div>

            <div className="scale-wrap">
              <div className="scale-bar">
                <div style={{ background:'#E8501A' }}/>
                <div style={{ background:'#3DB54A' }}/>
                <div style={{ background:'#FF9800' }}/>
                <div style={{ background:'#E53935' }}/>
              </div>
              <div className="indicator">
                <span style={{ left: arrowPct }}>▼</span>
              </div>
              <div className="scale-labels">
                <span>Недостаточный</span><span>Здоровый</span>
                <span>Избыточный</span><span>Ожирение</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bmi-grid { display:grid; grid-template-columns:280px 1fr; gap:40px; max-width:780px; margin:0 auto; }
        .gender-icons { display:flex; gap:14px; margin-bottom:20px; }
        .g-icon { background:var(--bg-panel); border-radius:6px; width:90px; height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; }
        .g-icon span { font-size:10px; color:var(--muted); }
        .bmi-fields { margin-bottom:20px; }
        .bmi-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .bmi-row label { width:50px; font-size:13px; color:var(--muted); }
        .bmi-row span  { font-size:12px; color:var(--muted); }
        .result-panel { background:var(--bg-panel); border-radius:8px; padding:28px; display:flex; flex-direction:column; align-items:center; }
        .bmi-cat { font-size:20px; font-weight:600; margin:12px 0 6px; }
        .bmi-val { font-family:var(--font-display); font-size:40px; color:var(--orange); margin-bottom:18px; }
        .scale-wrap { width:280px; }
        .scale-bar { display:grid; grid-template-columns:repeat(4,1fr); height:10px; border-radius:5px; overflow:hidden; margin-bottom:4px; }
        .indicator { position:relative; height:16px; }
        .indicator span { position:absolute; color:var(--orange); font-size:12px; transition:left .5s ease; }
        .scale-labels { display:grid; grid-template-columns:repeat(4,1fr); font-size:9px; color:var(--muted); text-align:center; }
      `}</style>
    </Layout>
  );
}

export default withAuth(BmiPage);
