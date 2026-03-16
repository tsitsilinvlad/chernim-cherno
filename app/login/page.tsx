export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", padding: 40, fontFamily: "Arial, sans-serif", background: "#f5f5f5" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "white", borderRadius: 24, padding: 32, border: "1px solid #e5e5e5" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>
          Inventory Intelligence
        </div>
        <h1 style={{ fontSize: 42, margin: 0, marginBottom: 12 }}>Приложение запущено</h1>
        <p style={{ fontSize: 18, color: "#444", marginBottom: 24 }}>
          Базовая версия работает. Следующий шаг — подключить загрузку Excel и аналитику оборачиваемости.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <div style={{ padding: 20, border: "1px solid #e5e5e5", borderRadius: 20 }}>
            <div style={{ fontSize: 14, color: "#666" }}>Статус</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>Online</div>
          </div>
          <div style={{ padding: 20, border: "1px solid #e5e5e5", borderRadius: 20 }}>
            <div style={{ fontSize: 14, color: "#666" }}>Следующий этап</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>Импорт Excel</div>
          </div>
        </div>
      </div>
    </main>
  );
}
