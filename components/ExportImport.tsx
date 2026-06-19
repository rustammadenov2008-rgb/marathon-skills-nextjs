import { useRef, useState } from 'react';

export default function ExportImport({ onImportDone }: { onImportDone?: () => void }) {
  const fileRef             = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result,    setResult]    = useState<string | null>(null);

  // ── Экспорт ──
  function handleExport() {
    window.open('/api/export', '_blank');
  }

  // ── Импорт ──
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const res  = await fetch('/api/import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ csv: text }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult(`✅ Импортировано: ${data.inserted} | Пропущено: ${data.skipped}` +
          (data.errors?.length ? `\n⚠️ Ошибки:\n${data.errors.slice(0,3).join('\n')}` : ''));
        onImportDone?.();
      } else {
        setResult(`❌ Ошибка: ${data.error}`);
      }
    } catch {
      setResult('❌ Ошибка чтения файла');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div className="ei-wrap">
      {/* Export */}
      <button className="btn-export" onClick={handleExport} title="Скачать всех участников в CSV">
        ⬇ Экспорт CSV
      </button>

      {/* Import */}
      <button className="btn-import"
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        title="Загрузить участников из CSV файла">
        {importing ? '⏳ Импорт...' : '⬆ Импорт CSV'}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.txt"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      {/* Result message */}
      {result && (
        <div className={`ei-result ${result.startsWith('✅') ? 'success' : 'error'}`}>
          {result.split('\n').map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      {/* CSV format hint */}
      <div className="ei-hint">
        📄 Формат CSV: <code>email, имя, фамилия, пол, страна, дата рождения, роль</code>
      </div>

      <style jsx>{`
        .ei-wrap { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:16px; }

        .btn-export {
          background: #2A2F38; color: #E8501A;
          border: 1px solid #E8501A; border-radius:6px;
          padding: 7px 16px; font-size:13px; font-weight:600;
          cursor:pointer; transition: all .2s;
        }
        .btn-export:hover { background: rgba(232,80,26,.1); }

        .btn-import {
          background: #E8501A; color: #fff; border: none;
          border-radius:6px; padding: 8px 16px;
          font-size:13px; font-weight:600;
          cursor:pointer; transition: background .2s;
        }
        .btn-import:hover:not(:disabled) { background: #C43F10; }
        .btn-import:disabled { opacity:.6; cursor:default; }

        .ei-result {
          width: 100%; padding: 10px 14px;
          border-radius: 6px; font-size: 13px; line-height: 1.6;
        }
        .ei-result.success {
          background: rgba(61,181,74,.1);
          border: 1px solid rgba(61,181,74,.3);
          color: #3DB54A;
        }
        .ei-result.error {
          background: rgba(248,81,73,.1);
          border: 1px solid rgba(248,81,73,.3);
          color: #F85149;
        }

        .ei-hint {
          width: 100%; font-size: 11px; color: #A0A8B4;
          padding: 6px 0;
        }
        .ei-hint code {
          background: #2A2F38; padding: 2px 6px;
          border-radius: 3px; font-family: monospace;
          font-size: 11px; color: #E6EDF3;
        }
      `}</style>
    </div>
  );
}
