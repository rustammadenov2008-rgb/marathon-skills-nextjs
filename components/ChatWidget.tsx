import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'bot'; text: string };

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '👋 Привет! Я ИИ-помощник Marathon Skills 2026. Задайте любой вопрос о марафоне!' }
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'bot', text: data.reply || 'Ошибка ответа.' }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Сервис временно недоступен.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="ИИ-помощник">
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>🤖 ИИ-помощник Marathon 2026</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg bot">
                <div className="bubble typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Задайте вопрос о марафоне..."
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>

          {/* Quick questions */}
          <div className="quick-btns">
            {['Как зарегистрироваться?','Когда марафон?','Какие дистанции?'].map(q => (
              <button key={q} onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-fab {
          position: fixed; bottom: 24px; right: 24px;
          width: 56px; height: 56px; border-radius: 50%;
          background: #E8501A; color: #fff; border: none;
          font-size: 24px; cursor: pointer; z-index: 1000;
          box-shadow: 0 4px 16px rgba(232,80,26,.4);
          transition: transform .2s, background .2s;
          display: flex; align-items: center; justify-content: center;
        }
        .chat-fab:hover { background: #C43F10; transform: scale(1.08); }

        .chat-window {
          position: fixed; bottom: 90px; right: 24px;
          width: 360px; height: 500px;
          background: #22272F; border: 1px solid #3A3F4A;
          border-radius: 12px; z-index: 999;
          display: flex; flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,.5);
          animation: slideUp .2s ease;
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:none; }
        }

        .chat-header {
          background: #1E2530; border-radius: 12px 12px 0 0;
          padding: 12px 16px; display: flex;
          justify-content: space-between; align-items: center;
          font-size: 14px; font-weight: 600; color: #E8501A;
          border-bottom: 1px solid #3A3F4A;
        }
        .chat-header button {
          background: none; border: none; color: #A0A8B4;
          cursor: pointer; font-size: 16px;
        }

        .chat-messages {
          flex: 1; overflow-y: auto; padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: #3A3F4A; border-radius: 2px; }

        .msg { display: flex; }
        .msg.user { justify-content: flex-end; }
        .msg.bot  { justify-content: flex-start; }

        .bubble {
          max-width: 80%; padding: 9px 13px;
          border-radius: 12px; font-size: 13px; line-height: 1.6;
        }
        .msg.user .bubble {
          background: #E8501A; color: #fff;
          border-bottom-right-radius: 3px;
        }
        .msg.bot .bubble {
          background: #2A2F38; color: #E6EDF3;
          border-bottom-left-radius: 3px;
          border: 1px solid #3A3F4A;
        }

        /* Typing animation */
        .typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; }
        .typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #A0A8B4; animation: bounce 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: .2s; }
        .typing span:nth-child(3) { animation-delay: .4s; }
        @keyframes bounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-6px); }
        }

        .chat-input {
          padding: 10px 12px; display: flex; gap: 8px;
          border-top: 1px solid #3A3F4A;
        }
        .chat-input input {
          flex: 1; background: #2A2F38; color: #fff;
          border: 1px solid #3A3F4A; border-radius: 6px;
          padding: 8px 10px; font-size: 13px; outline: none;
        }
        .chat-input input:focus { border-color: #E8501A; }
        .chat-input button {
          background: #E8501A; color: #fff; border: none;
          width: 36px; height: 36px; border-radius: 6px;
          cursor: pointer; font-size: 16px; flex-shrink: 0;
          transition: background .2s;
        }
        .chat-input button:hover:not(:disabled) { background: #C43F10; }
        .chat-input button:disabled { opacity: .5; cursor: default; }

        .quick-btns {
          padding: 8px 12px 10px; display: flex; gap: 6px;
          flex-wrap: wrap; border-top: 1px solid #3A3F4A;
        }
        .quick-btns button {
          background: #2A2F38; color: #A0A8B4;
          border: 1px solid #3A3F4A; border-radius: 14px;
          padding: 4px 10px; font-size: 11px; cursor: pointer;
          transition: all .2s; white-space: nowrap;
        }
        .quick-btns button:hover { border-color: #E8501A; color: #E8501A; }

        @media (max-width: 420px) {
          .chat-window { width: calc(100vw - 32px); right: 16px; }
        }
      `}</style>
    </>
  );
}
