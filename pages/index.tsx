import ChatWidget from '@/components/ChatWidget';
import Layout from '@/components/Layout';
import { withAuth } from '@/components/withAuth';
import Link from 'next/link';
import { useCountdown } from '@/hooks/useCountdown';

function HomePage() {
  const countdown = useCountdown();

  return (
    <Layout showNav showLoginBtn>
      {/* Hero */}
      <div className="hero">
        <h1>MARATHON SKILLS 2026</h1>
        <p>Международный любительский марафон</p>
      </div>

      {/* Countdown */}
      <div className="countdown-section">
        <div className="c-label">ДО  СТАРТА  МАРАФОНА</div>
        <div className="c-val">{countdown}</div>
      </div>

      <div className="orange-line"/>

      {/* Two-column content */}
      <div className="content-grid">

        {/* LEFT: about + photo */}
        <div>
          <div className="section-label">О МАРАФОНЕ</div>
          <p className="about-text">
            Marathon Skills — ежегодный международный марафон для любителей и профессионалов.
            Участники из более чем 40 стран соревнуются на дистанциях 10 км, полумарафон и марафон (42,2 км).
          </p>
          <p className="about-text">
            <strong>Марафон</strong> — это не просто забег на дистанцию <strong>42,195 км.</strong> Это ежегодный ритуал,
            который объединяет профессиональных атлетов, любителей и тысячи зрителей в едином порыве воли и выносливости.
          </p>
          <p className="about-text">
            Примерно на <strong>30–35 километре</strong> многие бегуны сталкиваются с явлением, которое называют «стеной».
            В этот момент запасы гликогена в мышцах истощаются, и организм начинает требовать немедленной остановки.
            Преодоление этого барьера — это уже не вопрос физики, а вопрос чистого упрямства и силы духа.
          </p>
          <p className="about-text">
            Раз в году целые мегаполисы перекрывают движение, чтобы отдать улицы бегунам. Для участников это уникальный
            шанс увидеть город без машин: пробежать по мосту Верразано в Нью-Йорке или мимо Бранденбургских ворот
            в Берлине под крики тысяч болельщиков.
          </p>

          {/* Photo 1 */}
          <div className="photo-wrap">
            <img
              src="https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=700&q=80"
              alt="Marathon runners"
            />
          </div>
        </div>

        {/* RIGHT: distances + photo */}
        <div>
          <div className="section-label">ДИСТАНЦИИ</div>
          <div className="dist-list">
            {[
              ['10','Спринт','Для начинающих','orange'],
              ['21','Полумарафон','Для опытных бегунов','orange'],
              ['42','Марафон','Элита и любители','green'],
            ].map(([n,t,s,c]) => (
              <div className="dist-item" key={n}>
                <div className={`dist-badge ${c}`}>{n}</div>
                <div>
                  <div className="dist-name">{n} км — {t}</div>
                  <div className="dist-sub">{s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Photo 2 */}
          <div className="photo-wrap">
            <img
              src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=700&q=80"
              alt="Marathon finish"
            />
          </div>

          {/* Photo 3 */}
          <div className="photo-wrap" style={{ marginTop: 14 }}>
            <img
              src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=700&q=80"
              alt="Running crowd"
            />
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="bottom-btns">
        <Link href="/register"     className="btn-orange">Зарегистрироваться</Link>
        <Link href="/participants" className="btn-outline">Список участников</Link>
      </div>

      <style jsx>{`
        .hero { text-align:center; padding:50px 20px 24px; }
        .hero h1 {
          font-family:var(--font-display); font-size:40px;
          color:var(--orange); letter-spacing:2px; margin-bottom:8px;
        }
        .hero p { font-size:14px; color:var(--muted); }

        .countdown-section { text-align:center; }
        .c-label {
          font-size:11px; font-weight:600; color:var(--muted);
          letter-spacing:3px; margin-bottom:6px;
        }
        .c-val {
          font-family:var(--font-display); font-size:40px; color:var(--orange);
        }

        .orange-line { height:2px; background:var(--orange); margin:20px 40px; }

        .content-grid {
          display:grid; grid-template-columns:1fr 1fr;
          gap:32px; padding:0 40px 32px;
        }

        .about-text {
          font-size:14px; color:var(--muted);
          line-height:24px; margin-bottom:14px;
        }
        .about-text strong { color:#fff; }

        .photo-wrap {
          border-radius:8px; overflow:hidden;
          width:100%; margin-top:4px;
        }
        .photo-wrap img {
          width:100%; height:220px;
          object-fit:cover; display:block;
          transition: transform .3s ease;
        }
        .photo-wrap img:hover { transform:scale(1.02); }

        .dist-list { display:flex; flex-direction:column; gap:12px; margin-bottom:16px; }
        .dist-item { display:flex; align-items:center; gap:14px; }
        .dist-badge {
          width:46px; height:46px; border-radius:6px;
          display:flex; align-items:center; justify-content:center;
          font-family:var(--font-display); font-size:20px;
          font-weight:700; color:#fff; flex-shrink:0;
        }
        .dist-badge.orange { background:var(--orange); }
        .dist-badge.green  { background:var(--green); }
        .dist-name { font-size:13px; font-weight:600; }
        .dist-sub  { font-size:11px; color:var(--muted); }

        .bottom-btns {
          display:flex; justify-content:center;
          gap:14px; padding-bottom:40px;
        }

        @media (max-width:700px) {
          .content-grid { grid-template-columns:1fr; padding:0 16px 24px; }
          .orange-line  { margin:20px 16px; }
        }
      `}</style>
      <ChatWidget />
    </Layout>
  );
}

export default withAuth(HomePage);
