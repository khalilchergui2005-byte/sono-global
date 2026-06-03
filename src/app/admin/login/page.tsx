'use client';
import { useState } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('أدخل البريد الإلكتروني وكلمة المرور');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json() as { error?: string; ok?: boolean; onboardingComplete?: boolean };
      if (!res.ok) {
        setError(data.error || 'حدث خطأ، حاول مجدداً');
        return;
      }
      setTimeout(() => {
        window.location.replace(
          data.onboardingComplete ? '/admin/dashboard' : '/admin/onboarding'
        );
      }, 100);
    } catch {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Cairo, sans-serif',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #060d26 0%, #0a1628 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #f5a623, #c47d0e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(245,166,35,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 6px' }}>
            {'دخول لوحة التحكم'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
            {'للمشرفين فقط'}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              {'البريد الإلكتروني'}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
              placeholder="admin@agency.com"
              style={{ ...inp, direction: 'ltr' }}
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              {'كلمة المرور'}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleSubmit()}
              placeholder="xxxxxxxx"
              style={{ ...inp, direction: 'ltr' }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button
            onClick={() => void handleSubmit()}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#475569' : 'linear-gradient(135deg, #f5a623, #c47d0e)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', marginTop: '4px' }}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </div>
      </div>
    </div>
  );
}
