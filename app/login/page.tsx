'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError('Неверный логин или пароль.');
      return;
    }
    window.location.href = '/';
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: 420, padding: 24 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#71717a' }}>Inventory Intelligence</p>
        <h1 style={{ margin: '8px 0 6px', fontSize: 32 }}>Вход</h1>
        <p style={{ margin: 0, color: '#71717a' }}>Owner и Employee доступны через .env настройки.</p>
        <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Пароль" style={inputStyle} />
          {error && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}
          <button type="submit" style={buttonStyle}>Войти</button>
        </div>
      </form>
    </main>
  );
}

const inputStyle = {
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid #e4e4e7',
  outline: 'none',
} as const;

const buttonStyle = {
  padding: '12px 14px',
  borderRadius: 14,
  border: 'none',
  background: '#18181b',
  color: 'white',
  cursor: 'pointer',
} as const;
