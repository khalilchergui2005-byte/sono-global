'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agencyName, setAgencyName] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((d: { agencyName?: string }) => {
        if (d.agencyName) setAgencyName(d.agencyName);
      })
      .catch(() => {});
  }, []);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { token?: string; user?: unknown; error?: string };
      if (!res.ok) {
        setError(data.error || '\u062e\u0637\u0623 \u0641\u064a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644');
        return;
      }
      localStorage.setItem('sg_token', data.token ?? '');
      localStorage.setItem('sg_user', JSON.stringify(data.user));
      const redirect = searchParams.get('redirect');
      router.push(redirect ?? '/account');
    } catch {
      setError('\u062a\u0639\u0630\u0631 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0627\u0644\u062e\u0627\u062f\u0645');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Cairo,sans-serif',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #060d26 0%, #0a1628 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo,sans-serif', direction: 'rtl', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'linear-gradient(135deg, #0A7EB5, #0653a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(10,126,181,0.35)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 6px' }}>
            {'\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
            {'\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0643 \u0641\u064a'}{agencyName ? ` ${agencyName}` : ''}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '2rem' }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              {'\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a'}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && void submit()}
              style={{ ...inp, direction: 'ltr' }}
              placeholder="example@email.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              {'\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && void submit()}
              style={inp}
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={() => void submit()}
            disabled={loading}
            style={{ width: '100%', background: loading ? 'rgba(10,126,181,0.4)' : 'linear-gradient(135deg, #0A7EB5, #0653a0)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'opacity 0.2s' }}
          >
            {loading ? '\u062c\u0627\u0631\u064a \u0627\u0644\u062f\u062e\u0648\u0644...' : '\u062f\u062e\u0648\u0644'}
          </button>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '1.5rem 0 0' }}>
            {'\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f'}{' '}
            <Link href="/register" style={{ color: '#0A7EB5', textDecoration: 'none', fontWeight: 600 }}>
              {'\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#060d26' }} />}>
      <LoginForm />
    </Suspense>
  );
}