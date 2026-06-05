import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { getCountdown } from '@/lib/timer';
import { useState } from 'react';

function HomePage() {
  const canvas1 = useRef<HTMLCanvasElement>(null);
  const canvas2 = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    setCountdown(getCountdown());
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    drawCity(canvas1.current);
    drawBridge(canvas2.current);
  }, []);

  return (
    <Layout showNav showLoginBtn>
      <div className="hero">
        <h1>MARATHON SKILLS 2026</h1>
        <p>Международный любительский марафон</p>
      </div>

      <div className="countdown-section">
        <div className="c-label">ДО  СТАРТА  МАРАФОНА</div>
        <div className="c-val">{countdown}</div>
      </div>

      <div className="orange-line"/>

      <div className="content-grid">
        {/* Left */}
        <div>
          <div className="section-label">О МАРАФОНЕ</div>
          <p className="about-text">
            Marathon Skills — ежегодный международный марафон для любителей и профессионалов.
            Участники из более чем 40 стран соревнуются на дистанциях 10 км, полумарафон и марафон (42,2 км).
          </p>
          <p className="about-text">
            <strong>Марафон</strong> — это не просто забег на дистанцию <strong>42,195 км.</strong> Примерно на{' '}
            <strong>30–35 километре</strong> многие бегуны сталкиваются с явлением, которое называют «стеной».
          </p>
          <div className="canvas-wrap">
            <canvas ref={canvas1} width={560} height={200}/>
          </div>
        </div>

        {/* Right */}
        <div>
          <div className="section-label">ДИСТАНЦИИ</div>
          <div className="dist-list">
            {[['10','Спринт','Для начинающих','orange'],
              ['21','Полумарафон','Для опытных бегунов','orange'],
              ['42','Марафон','Элита и любители','green']].map(([n,t,s,c])=>(
              <div className="dist-item" key={n}>
                <div className={`dist-badge ${c}`}>{n}</div>
                <div>
                  <div className="dist-name">{n} км — {t}</div>
                  <div className="dist-sub">{s}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="canvas-wrap">
            <canvas ref={canvas2} width={560} height={200}/>
          </div>
        </div>
      </div>

      <div className="bottom-btns">
        <Link href="/register"     className="btn-orange">Зарегистрироваться</Link>
        <Link href="/participants" className="btn-outline">Список участников</Link>
      </div>

      <style jsx>{`
        .hero { text-align:center; padding:50px 20px 24px; }
        .hero h1 { font-family:var(--font-display); font-size:40px; color:var(--orange); letter-spacing:2px; margin-bottom:8px; }
        .hero p  { font-size:14px; color:var(--muted); }
        .countdown-section { text-align:center; }
        .c-label { font-size:11px; font-weight:600; color:var(--muted); letter-spacing:3px; margin-bottom:6px; }
        .c-val   { font-family:var(--font-display); font-size:40px; color:var(--orange); }
        .orange-line { height:2px; background:var(--orange); margin:20px 40px; }
        .content-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; padding:0 40px 32px; }
        .about-text { font-size:13px; color:var(--muted); line-height:22px; margin-bottom:14px; }
        .about-text strong { color:#fff; }
        .canvas-wrap { border-radius:6px; overflow:hidden; }
        .canvas-wrap canvas { width:100%; height:200px; display:block; }
        .dist-list { display:flex; flex-direction:column; gap:12px; margin-bottom:16px; }
        .dist-item { display:flex; align-items:center; gap:14px; }
        .dist-badge { width:46px; height:46px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-size:20px; font-weight:700; color:#fff; flex-shrink:0; }
        .dist-badge.orange { background:var(--orange); }
        .dist-badge.green  { background:var(--green); }
        .dist-name { font-size:13px; font-weight:600; }
        .dist-sub  { font-size:11px; color:var(--muted); }
        .bottom-btns { display:flex; justify-content:center; gap:14px; padding-bottom:40px; }
      `}</style>
    </Layout>
  );
}

// Canvas drawing helpers
function drawCity(c: HTMLCanvasElement | null) {
  if (!c) return;
  const ctx = c.getContext('2d')!;
  const W = c.width, H = c.height;
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#1a2a4a'); sky.addColorStop(1,'#2d4a7a');
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#0d1f3c';
  [[0,130,30],[40,110,40],[90,85,55],[160,100,50],[220,75,75],[310,95,50],[375,115,40]].forEach(([x,y,w]) => ctx.fillRect(x,y,w,H-y));
  const road = ctx.createLinearGradient(0,155,0,H);
  road.addColorStop(0,'#2a2a2a'); road.addColorStop(1,'#444');
  ctx.fillStyle = road; ctx.fillRect(0,155,W,H-155);
  ctx.fillStyle='rgba(240,192,32,.6)';
  for(let x=0;x<W;x+=70) ctx.fillRect(x,172,42,5);
  const drawR = (x:number,y:number,col:string) => {
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.ellipse(x,y-38,8,8,0,0,Math.PI*2); ctx.fill();
    ctx.fillRect(x-5,y-30,10,22);
  };
  [[90,157,'#E8501A'],[170,155,'rgba(255,255,255,.85)'],[260,158,'#E8501A'],[360,156,'rgba(255,255,255,.8)']].forEach(([x,y,c])=>drawR(Number(x),Number(y),c as string));
  ctx.fillStyle='#E8501A'; ctx.font='bold 18px Oswald,sans-serif'; ctx.textAlign='center';
  ctx.fillText('MARATHON START · LONDON 2026',W/2,28);
  ctx.fillStyle='#A0A8B4'; ctx.font='11px Inter,sans-serif';
  ctx.fillText('15 June 2026',W/2,48);
}

function drawBridge(c: HTMLCanvasElement | null) {
  if (!c) return;
  const ctx = c.getContext('2d')!;
  const W = c.width, H = c.height;
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#0a1525'); sky.addColorStop(.6,'#1a3055'); sky.addColorStop(1,'#0d1f3c');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  [[50,20],[150,12],[280,18],[420,10],[510,18]].forEach(([x,y])=>{
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
  });
  ctx.fillStyle='#2a3a50'; ctx.fillRect(130,0,12,100); ctx.fillRect(400,0,12,100);
  ctx.strokeStyle='rgba(74,96,128,.7)'; ctx.lineWidth=1.5;
  [[136,5,0,100],[136,5,75,100],[136,5,200,100],[406,5,540,100],[406,5,460,100],[406,5,350,100]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });
  ctx.fillStyle='#2a3a50'; ctx.fillRect(0,96,W,10);
  ctx.fillStyle='rgba(232,80,26,.5)'; ctx.fillRect(0,94,W,4);
  const water = ctx.createLinearGradient(0,106,0,H);
  water.addColorStop(0,'#0d2240'); water.addColorStop(1,'#091830');
  ctx.fillStyle=water; ctx.fillRect(0,106,W,H-106);
  ctx.fillStyle='#E8501A';
  ctx.beginPath(); ctx.ellipse(270,72,8,8,0,0,Math.PI*2); ctx.fill();
  ctx.fillRect(264,81,10,20);
  ctx.fillStyle='#E8501A'; ctx.font='bold 16px Oswald,sans-serif'; ctx.textAlign='center';
  ctx.fillText('ВЕРРАЗАНО · НЬЮ-ЙОРК',W/2,26);
}

export default withAuth(HomePage);
