'use client';

import { useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';

type Snapshot = {
  id: string;
  name: string;
  price: number | null;
  lastSaleDate: string | null;
  soldUnits: number | null;
  stockLeft: number | null;
  turnoverPerDay: number | null;
  stockDays: number | null;
  idealOrder: number | null;
  status: string | null;
  stockLabel: string | null;
};

type Upload = {
  id: string;
  fileName: string;
  sheetName: string | null;
  uploadedAt: string;
  uploadedBy: string | null;
  items: Snapshot[];
};

type Settings = {
  id: string;
  mustReallocateMin: number;
  maybeReallocateMin: number;
  keepMin: number;
  normalStockDays: number;
  criticalStockDays: number;
};

function fmt(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}
function cur(value: number | null | undefined) { return value == null ? '—' : `${fmt(value)} ₽`; }
function dt(value: string | null | undefined) { return value ? new Intl.DateTimeFormat('ru-RU').format(new Date(value)) : '—'; }

export default function DashboardClient({ initialUploads, initialSettings, userEmail, userRole }: {
  initialUploads: Upload[];
  initialSettings: Settings;
  userEmail: string;
  userRole: string;
}) {
  const [uploads, setUploads] = useState(initialUploads);
  const [settings, setSettings] = useState(initialSettings);
  const [selectedId, setSelectedId] = useState(initialUploads[0]?.id || '');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedUpload = uploads.find((u) => u.id === selectedId) || uploads[0] || null;
  const previousUpload = selectedUpload ? uploads[uploads.findIndex((u) => u.id === selectedUpload.id) + 1] || null : null;
  const previousMap = useMemo(() => new Map((previousUpload?.items || []).map((i) => [i.name, i])), [previousUpload]);

  const filteredItems = (selectedUpload?.items || []).filter((item) => {
    const a = item.name.toLowerCase().includes(search.toLowerCase());
    const b = statusFilter === 'all' || item.status === statusFilter;
    return a && b;
  });

  const stats = useMemo(() => {
    const items = selectedUpload?.items || [];
    return {
      must: items.filter((i) => i.status === 'обязательно переразместить').length,
      maybe: items.filter((i) => i.status === 'возможно переразместить').length,
      sell: items.filter((i) => i.status === 'допродавать').length,
      critical: items.filter((i) => i.stockLabel === 'критическое затоваривание').length,
    };
  }, [selectedUpload]);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true); setError('');
    const form = new FormData(); form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok) { setError(json.error || 'Ошибка загрузки'); setLoading(false); return; }
    setUploads(json.uploads); setSelectedId(json.uploads[0]?.id || ''); setLoading(false); event.target.value = '';
  }

  async function saveSettings() {
    setLoading(true);
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    const json = await res.json();
    if (!res.ok) setError(json.error || 'Ошибка сохранения настроек');
    setSettings(json.settings || settings);
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#71717a' }}>Production Stage 2</p>
          <h1 style={{ margin: '6px 0', fontSize: 40 }}>Inventory Intelligence</h1>
          <p style={{ color: '#71717a', margin: 0 }}>Вход: {userEmail} · роль: {userRole}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={primaryBtn}>
            {loading ? 'Загрузка...' : 'Загрузить Excel'}
            <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
          </label>
          <button style={secondaryBtn} onClick={() => signOut({ callbackUrl: '/login' })}>Выйти</button>
        </div>
      </div>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, color: '#991b1b' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginTop: 24 }}>
        <div className="card" style={{ padding: 18 }}><div style={{ color: '#71717a', fontSize: 14 }}>Обязательно переразместить</div><div style={{ fontSize: 32, marginTop: 8 }}>{stats.must}</div></div>
        <div className="card" style={{ padding: 18 }}><div style={{ color: '#71717a', fontSize: 14 }}>Возможно переразместить</div><div style={{ fontSize: 32, marginTop: 8 }}>{stats.maybe}</div></div>
        <div className="card" style={{ padding: 18 }}><div style={{ color: '#71717a', fontSize: 14 }}>Допродавать</div><div style={{ fontSize: 32, marginTop: 8 }}>{stats.sell}</div></div>
        <div className="card" style={{ padding: 18 }}><div style={{ color: '#71717a', fontSize: 14 }}>Критическое затоваривание</div><div style={{ fontSize: 32, marginTop: 8 }}>{stats.critical}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 24 }}>
        <section className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: 18, borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>Товары</h2>
              <p style={{ color: '#71717a', margin: '6px 0 0' }}>{selectedUpload ? `${selectedUpload.fileName} · ${dt(selectedUpload.uploadedAt)}` : 'Пока нет загрузок'}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию" style={inputStyle} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={inputStyle}>
                <option value="all">Все статусы</option>
                <option value="обязательно переразместить">Обязательно переразместить</option>
                <option value="возможно переразместить">Возможно переразместить</option>
                <option value="не переразмещать">Не переразмещать</option>
                <option value="допродавать">Допродавать</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead style={{ background: '#fafafa', color: '#71717a' }}>
                <tr>
                  <th>Наименование</th><th>Цена</th><th>Последняя продажа</th><th>Продано</th><th>Остаток</th><th>₽/день</th><th>Δ</th><th>Запас дней</th><th>Идеальный заказ</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const prev = previousMap.get(item.name);
                  const delta = prev ? (item.turnoverPerDay || 0) - (prev.turnoverPerDay || 0) : null;
                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{cur(item.price)}</td>
                      <td>{dt(item.lastSaleDate)}</td>
                      <td>{fmt(item.soldUnits)}</td>
                      <td>{fmt(item.stockLeft)}</td>
                      <td>{cur(item.turnoverPerDay)}</td>
                      <td style={{ color: delta == null ? '#71717a' : delta >= 0 ? '#166534' : '#b91c1c' }}>{delta == null ? 'новый' : `${delta >= 0 ? '+' : ''}${cur(delta)}`}</td>
                      <td>{fmt(item.stockDays)}</td>
                      <td>{fmt(item.idealOrder)}</td>
                      <td><span className="badge" style={badgeStyle(item.status || '')}>{item.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ display: 'grid', gap: 20 }}>
          <section className="card" style={{ padding: 18 }}>
            <h2 style={{ marginTop: 0 }}>История загрузок</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {uploads.map((upload) => (
                <button key={upload.id} onClick={() => setSelectedId(upload.id)} style={{ ...secondaryBtn, justifyContent: 'space-between', textAlign: 'left', background: selectedId === upload.id ? '#18181b' : 'white', color: selectedId === upload.id ? 'white' : '#18181b' }}>
                  <span>{upload.fileName}</span>
                  <span style={{ color: selectedId === upload.id ? '#d4d4d8' : '#71717a' }}>{dt(upload.uploadedAt)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card" style={{ padding: 18 }}>
            <h2 style={{ marginTop: 0 }}>Настройки порогов</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <label>Обязательно переразместить от<input style={inputStyle} type="number" value={settings.mustReallocateMin} onChange={(e) => setSettings({ ...settings, mustReallocateMin: Number(e.target.value) || 0 })} /></label>
              <label>Возможно переразместить от<input style={inputStyle} type="number" value={settings.maybeReallocateMin} onChange={(e) => setSettings({ ...settings, maybeReallocateMin: Number(e.target.value) || 0 })} /></label>
              <label>Не переразмещать от<input style={inputStyle} type="number" value={settings.keepMin} onChange={(e) => setSettings({ ...settings, keepMin: Number(e.target.value) || 0 })} /></label>
              <label>Затоваривание от дней<input style={inputStyle} type="number" value={settings.normalStockDays} onChange={(e) => setSettings({ ...settings, normalStockDays: Number(e.target.value) || 0 })} /></label>
              <label>Критическое затоваривание от дней<input style={inputStyle} type="number" value={settings.criticalStockDays} onChange={(e) => setSettings({ ...settings, criticalStockDays: Number(e.target.value) || 0 })} /></label>
              <button onClick={saveSettings} style={primaryBtn}>Сохранить настройки</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = { padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: 14, width: '100%', background: 'white' };
const primaryBtn: React.CSSProperties = { padding: '12px 16px', borderRadius: 16, border: 'none', background: '#18181b', color: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 };
const secondaryBtn: React.CSSProperties = { padding: '12px 16px', borderRadius: 16, border: '1px solid #e4e4e7', background: 'white', color: '#18181b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 };
function badgeStyle(status: string): React.CSSProperties {
  if (status === 'обязательно переразместить') return { background: '#18181b', color: 'white' };
  if (status === 'возможно переразместить') return { background: '#e4e4e7', color: '#18181b' };
  if (status === 'не переразмещать') return { background: '#dbeafe', color: '#1e3a8a' };
  if (status === 'допродавать') return { background: '#fef3c7', color: '#92400e' };
  return { background: '#f4f4f5', color: '#3f3f46' };
}
