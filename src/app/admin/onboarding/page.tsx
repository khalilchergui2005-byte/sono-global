'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { n: 1, label: 'معلومات الوكالة' },
  { n: 2, label: 'بيانات التواصل' },
  { n: 3, label: 'Amadeus API' },
  { n: 4, label: 'Chargily Pay' },
  { n: 5, label: 'إنهاء الإعداد' },
];

const INPUT: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
  padding: '12px 14px', color: 'white', fontSize: '14px',
  fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box',
};

const LABEL: React.CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.5)',
  fontSize: '12px', fontWeight: 700, marginBottom: '6px',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [s1, setS1] = useState({ agencyName: '', agencyDescription: '', workingHours: '' });
  const [s2, setS2] = useState({ phonePrimary: '', phoneWhatsapp: '', email: '', address: '' });
  const [s3, setS3] = useState({ amadeus_client_id: '', amadeus_client_secret: '', amadeus_markup_percent: '10' });
  const [s4, setS4] = useState({ chargily_api_key: '', chargily_webhook_secret: '', payment_methods: 'cash,cib,bank_transfer,ccp' });

  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [testingAmadeus, setTestingAmadeus] = useState(false);
  const [amadeusStatus, setAmadeusStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d && !d.error) {
        setS1({ agencyName: d.agencyName || '', agencyDescription: d.agencyDescription || '', workingHours: d.workingHours || '' });
        setS2({ phonePrimary: d.phonePrimary || '', phoneWhatsapp: d.phoneWhatsapp || '', email: d.email || '', address: d.address || '' });
        if (d.logoUrl) { setLogoUrl(d.logoUrl); setLogoPreview(d.logoUrl); }
      }
    }).catch(() => {});
    fetch('/api/siteconfig').then(r => r.json()).then(d => {
      if (d && !d.error) {
        setS3({ amadeus_client_id: d.amadeus_client_id || '', amadeus_client_secret: d.amadeus_client_secret || '', amadeus_markup_percent: d.amadeus_markup_percent || '10' });
        setS4({ chargily_api_key: d.chargily_api_key || '', chargily_webhook_secret: d.chargily_webhook_secret || '', payment_methods: d.payment_methods || 'cash,cib,bank_transfer,ccp' });
      }
    }).catch(() => {});
  }, []);

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setLogoUrl(data.url);
        setLogoPreview(data.url);
      } else {
        setError('فشل رفع الصورة');
      }
    } catch {
      setError('فشل رفع الصورة');
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveStep1 = async () => {
    if (!s1.agencyName.trim()) { setError('اسم الوكالة مطلوب'); return false; }
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agencyName: s1.agencyName,
        agencyDescription: s1.agencyDescription,
        workingHours: s1.workingHours,
        logoUrl: logoUrl,
      }),
    });
    return res.ok;
  };

  const saveStep2 = async () => {
    if (!s2.phonePrimary.trim()) { setError('رقم الهاتف الرئيسي مطلوب'); return false; }
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phonePrimary: s2.phonePrimary, phoneWhatsapp: s2.phoneWhatsapp, email: s2.email, address: s2.address }),
    });
    return res.ok;
  };

  const saveStep3 = async () => {
    const res = await fetch('/api/siteconfig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amadeus_client_id: s3.amadeus_client_id, amadeus_client_secret: s3.amadeus_client_secret, amadeus_markup_percent: s3.amadeus_markup_percent }),
    });
    return res.ok;
  };

  const saveStep4 = async () => {
    const res = await fetch('/api/siteconfig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chargily_api_key: s4.chargily_api_key, chargily_webhook_secret: s4.chargily_webhook_secret, payment_methods: s4.payment_methods }),
    });
    return res.ok;
  };

  const testAmadeus = async () => {
    setTestingAmadeus(true); setAmadeusStatus('idle');
    await saveStep3();
    const res = await fetch('/api/amadeus/token');
    setAmadeusStatus(res.ok ? 'ok' : 'fail');
    setTestingAmadeus(false);
  };

  const next = async () => {
    setError(''); setSaving(true);
    let ok = true;
    if (step === 1) ok = await saveStep1();
    else if (step === 2) ok = await saveStep2();
    else if (step === 3) ok = await saveStep3();
    else if (step === 4) ok = await saveStep4();
    setSaving(false);
    if (!ok) { if (!error) setError('حدث خطأ في الحفظ، حاول مجدداً'); return; }
    setStep((step + 1) as Step);
  };

  const finish = async () => {
    setSaving(true);
    await fetch('/api/siteconfig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_complete: 'true' }),
    });
    await fetch('/api/admin/complete-onboarding', { method: 'POST' });
    setSaving(false);
    router.push('/admin/dashboard');
  };

  const progress = ((step - 1) / 4) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #060d26 0%, #0a1628 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif', direction: 'rtl', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '580px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img
            src={logoPreview || '/logo.png'}
            alt="logo"
            style={{ width: '56px', height: '56px', borderRadius: '14px', marginBottom: '1rem', objectFit: 'contain' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
          />
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 6px' }}>إعداد وكالتك</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>أكمل الخطوات التالية لبدء استخدام المنصة</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          {STEPS.map(s => (
            <div key={s.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step > s.n ? '#10b981' : step === s.n ? '#f5a623' : 'rgba(255,255,255,0.08)', border: `2px solid ${step > s.n ? '#10b981' : step === s.n ? '#f5a623' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: step >= s.n ? 'white' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }}>
                {step > s.n ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : s.n}
              </div>
              <span style={{ color: step === s.n ? '#f5a623' : 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #f5a623, #10b981)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem' }}>

          {step === 1 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 1.5rem' }}>معلومات الوكالة</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                <div>
                  <label style={LABEL}>شعار الوكالة (اختياري)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{ width: '72px', height: '72px', borderRadius: '14px', border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,166,35,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadingLogo}
                        style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: uploadingLogo ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', opacity: uploadingLogo ? 0.6 : 1 }}
                      >
                        {uploadingLogo ? 'جاري الرفع...' : logoPreview ? 'تغيير الشعار' : 'رفع شعار'}
                      </button>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '6px 0 0' }}>PNG أو JPG — يظهر في الهيدر والموقع</p>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => setLogoPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                        uploadLogo(file);
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={LABEL}>اسم الوكالة *</label>
                  <input value={s1.agencyName} onChange={e => setS1(p => ({ ...p, agencyName: e.target.value }))} placeholder="مثال: Next Visa Travel" style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>وصف الوكالة</label>
                  <textarea value={s1.agencyDescription} onChange={e => setS1(p => ({ ...p, agencyDescription: e.target.value }))} placeholder="نبذة مختصرة عن وكالتك..." rows={3} style={{ ...INPUT, resize: 'none' }} />
                </div>
                <div>
                  <label style={LABEL}>ساعات العمل</label>
                  <input value={s1.workingHours} onChange={e => setS1(p => ({ ...p, workingHours: e.target.value }))} placeholder="مثال: السبت - الخميس: 8ص - 6م" style={INPUT} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 1.5rem' }}>بيانات التواصل</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={LABEL}>رقم الهاتف الرئيسي *</label>
                  <input value={s2.phonePrimary} onChange={e => setS2(p => ({ ...p, phonePrimary: e.target.value }))} placeholder="+213..." style={{ ...INPUT, direction: 'ltr' }} />
                </div>
                <div>
                  <label style={LABEL}>رقم واتساب</label>
                  <input value={s2.phoneWhatsapp} onChange={e => setS2(p => ({ ...p, phoneWhatsapp: e.target.value }))} placeholder="+213..." style={{ ...INPUT, direction: 'ltr' }} />
                </div>
                <div>
                  <label style={LABEL}>البريد الإلكتروني</label>
                  <input type="email" value={s2.email} onChange={e => setS2(p => ({ ...p, email: e.target.value }))} placeholder="contact@agency.com" style={{ ...INPUT, direction: 'ltr' }} />
                </div>
                <div>
                  <label style={LABEL}>العنوان</label>
                  <input value={s2.address} onChange={e => setS2(p => ({ ...p, address: e.target.value }))} placeholder="المدينة، الحي، الشارع..." style={INPUT} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 0.5rem' }}>Amadeus API</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 1.5rem' }}>اختياري — مطلوب لبحث الرحلات والفنادق تلقائياً</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={LABEL}>Client ID</label>
                  <input value={s3.amadeus_client_id} onChange={e => setS3(p => ({ ...p, amadeus_client_id: e.target.value }))} placeholder="API Key من Amadeus for Developers" style={{ ...INPUT, direction: 'ltr', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={LABEL}>Client Secret</label>
                  <input type="password" value={s3.amadeus_client_secret} onChange={e => setS3(p => ({ ...p, amadeus_client_secret: e.target.value }))} placeholder="API Secret" style={{ ...INPUT, direction: 'ltr', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={LABEL}>نسبة الربح % (تضاف على الأسعار)</label>
                  <input type="number" min="0" max="100" value={s3.amadeus_markup_percent} onChange={e => setS3(p => ({ ...p, amadeus_markup_percent: e.target.value }))} style={{ ...INPUT, direction: 'ltr' }} />
                </div>
                <button
                  onClick={testAmadeus}
                  disabled={testingAmadeus || !s3.amadeus_client_id}
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: testingAmadeus || !s3.amadeus_client_id ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', opacity: !s3.amadeus_client_id ? 0.5 : 1 }}
                >
                  {testingAmadeus ? 'جاري الاختبار...' : 'اختبار الاتصال'}
                </button>
                {amadeusStatus === 'ok' && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    الاتصال يعمل بنجاح
                  </div>
                )}
                {amadeusStatus === 'fail' && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>
                    فشل الاتصال — تحقق من الـ credentials
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: '0 0 0.5rem' }}>Chargily Pay</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 1.5rem' }}>اختياري — مطلوب للدفع الإلكتروني عبر CIB/Dahabia</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={LABEL}>Chargily API Key</label>
                  <input type="password" value={s4.chargily_api_key} onChange={e => setS4(p => ({ ...p, chargily_api_key: e.target.value }))} placeholder="sk_live_..." style={{ ...INPUT, direction: 'ltr', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={LABEL}>Webhook Secret</label>
                  <input type="password" value={s4.chargily_webhook_secret} onChange={e => setS4(p => ({ ...p, chargily_webhook_secret: e.target.value }))} placeholder="whsec_..." style={{ ...INPUT, direction: 'ltr', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={LABEL}>طرق الدفع المتاحة</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['cash', 'cib', 'dahabia', 'bank_transfer', 'ccp'].map(method => {
                      const labels: Record<string, string> = { cash: 'كاش', cib: 'CIB', dahabia: 'Dahabia', bank_transfer: 'تحويل بنكي', ccp: 'CCP' };
                      const active = s4.payment_methods.split(',').includes(method);
                      return (
                        <button
                          key={method}
                          onClick={() => {
                            const methods = s4.payment_methods.split(',').filter(Boolean);
                            const updated = active ? methods.filter(m => m !== method) : [...methods, method];
                            setS4(p => ({ ...p, payment_methods: updated.join(',') }));
                          }}
                          style={{ background: active ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`, color: active ? '#f5a623' : 'rgba(255,255,255,0.4)', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
                        >
                          {labels[method]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 900, marginBottom: '10px' }}>وكالتك جاهزة!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '2rem', lineHeight: 1.7 }}>
                تم حفظ جميع الإعدادات بنجاح.<br />
                يمكنك الآن البدء في إدارة وكالتك من لوحة التحكم.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
                {[
                  { label: 'إضافة باقات سياحية', href: '/admin/packages/new' },
                  { label: 'إدارة الخدمات', href: '/admin/services' },
                  { label: 'لوحة التحكم', href: '/admin/dashboard' },
                ].map(link => (
                  <a key={link.href} href={link.href} style={{ display: 'block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginTop: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '12px' }}>
            {step > 1 && step < 5 && (
              <button
                onClick={() => { setError(''); setStep((step - 1) as Step); }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '11px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
              >
                رجوع
              </button>
            )}
            {step < 5 && (
              <button
                onClick={next}
                disabled={saving}
                style={{ flex: 1, background: saving ? '#475569' : 'linear-gradient(135deg, #f5a623, #c47d0e)', color: 'white', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif' }}
              >
                {saving ? 'جاري الحفظ...' : step === 4 ? 'حفظ والمتابعة' : 'التالي'}
              </button>
            )}
            {step === 5 && (
              <button
                onClick={finish}
                disabled={saving}
                style={{ flex: 1, background: saving ? '#475569' : 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', padding: '11px 24px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif' }}
              >
                {saving ? 'جاري التحميل...' : 'ابدأ الاستخدام'}
              </button>
            )}
          </div>

          {(step === 3 || step === 4) && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={next}
                disabled={saving}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', textDecoration: 'underline' }}
              >
                تخطي هذه الخطوة
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '1.5rem' }}>
          يمكنك تعديل هذه الإعدادات لاحقاً من إعدادات الموقع
        </p>
      </div>
    </div>
  );
}