'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agencyName, setAgencyName] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((d: { agencyName?: string }) => {
        if (d.agencyName) setAgencyName(d.agencyName);
      })
      .catch(() => {})
      .finally(() => setSettingsLoaded(true));
  }, []);

  const submit = async () => {
    setError('');
    if (form.password !== form.confirm) return setError('كلمتا المرور غير متطابقتين');
    if (form.password.length < 6) return setError('كلمة المرور 6 أحرف على الأقل');
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    });
    const data = await res.json() as { token?: string; user?: unknown; error?: string };
    setLoading(false);
    if (!res.ok) return setError(data.error || 'خطأ في إنشاء الحساب');
    localStorage.setItem('sg_token', data.token ?? '');
    localStorage.setItem('sg_user', JSON.stringify(data.user));
    router.push('/account');
  };

  const fields = [
    { key: 'name',     label: 'الاسم الكامل',        type: 'text',     placeholder: 'محمد بن علي' },
    { key: 'email',    label: 'البريد الإلكتروني',  type: 'email',    placeholder: 'example@email.com' },
    { key: 'phone',    label: 'رقم الهاتف',        type: 'tel',      placeholder: '0661234567' },
    { key: 'password', label: 'كلمة المرور',        type: 'password', placeholder: '••••••••' },
    { key: 'confirm',  label: 'تأكيد كلمة المرور',  type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo,sans-serif', direction: 'rtl', padding: '1rem', opacity: settingsLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src='/logo.png' alt='' style={{ width: '60px', height: '60px', borderRadius: '14px', marginBottom: '1rem' }} />
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: 0 }}>
            {'إنشاء حساب'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '6px 0 0' }}>
            {'انضم إلى'}{agencyName ? ' ' + agencyName : ''}
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '2rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', display: 'block', marginBottom: '6px' }}>{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 14px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Cairo,sans-serif' }} placeholder={f.placeholder} />
            </div>
          ))}
          <button onClick={() => { void submit(); }} disabled={loading} style={{ width: '100%', background: loading ? 'rgba(10,126,181,0.4)' : 'linear-gradient(135deg, #0A7EB5, #0653a0)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', marginTop: '0.5rem' }}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '1.5rem 0 0' }}>
            {'لديك حساب؟'}{' '}
            <Link href='/login' style={{ color: '#0A7EB5', textDecoration: 'none', fontWeight: 600 }}>
              {'تسجيل الدخول'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}