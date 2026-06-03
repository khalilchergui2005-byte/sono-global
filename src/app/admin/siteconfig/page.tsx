'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';

type Config = {
  amadeus_client_id:       string;
  amadeus_client_secret:   string;
  amadeus_markup_percent:  string;
  chargily_api_key:        string;
  chargily_webhook_secret: string;
  payment_methods:         string;
};

const PAYMENT_OPTIONS = [
  { key: 'cash',          label: 'كاش' },
  { key: 'cib',           label: 'CIB / Dahabia' },
  { key: 'bank_transfer', label: 'تحويل بنكي' },
  { key: 'ccp',           label: 'CCP بريدي' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.25rem' }}>
      <h2 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: 'white',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'Cairo,sans-serif',
  boxSizing: 'border-box',
};

function SecretInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingLeft: '42px' }}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setShow(p => !p)}
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.35)',
          padding: '4px',
        }}
      >
        {show ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

export default function SiteConfigPage() {
  const [config, setConfig] = useState<Config>({
    amadeus_client_id:       '',
    amadeus_client_secret:   '',
    amadeus_markup_percent:  '10',
    chargily_api_key:        '',
    chargily_webhook_secret: '',
    payment_methods:         'cash,cib,bank_transfer,ccp',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch('/api/siteconfig')
      .then(r => r.json())
      .then((d: Config) => { setConfig(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: keyof Config, value: string) =>
    setConfig(prev => ({ ...prev, [key]: value }));

  const togglePayment = (key: string) => {
    const current = config.payment_methods.split(',').filter(Boolean);
    const updated  = current.includes(key)
      ? current.filter(k => k !== key)
      : [...current, key];
    set('payment_methods', updated.join(','));
  };

  const save = async () => {
    setSaving(true);
    await fetch('/api/siteconfig', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>جاري التحميل...</div>
    </div>
  );

  const activePayments = config.payment_methods.split(',').filter(Boolean);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Cairo,sans-serif', direction: 'rtl', maxWidth: '760px' }}>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: 0 }}>الإعدادات المتقدمة</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0 0' }}>إعدادات التكاملات وطرق الدفع</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: saved
              ? 'linear-gradient(135deg,#10b981,#059669)'
              : 'linear-gradient(135deg,#f5a623,#c47d0e)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 24px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Cairo,sans-serif',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {saving ? 'جاري الحفظ...' : saved ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              تم الحفظ
            </>
          ) : 'حفظ الإعدادات'}
        </button>
      </div>

      <Section title="Amadeus — بيانات الاعتماد">
        <Field label="Client ID">
          <SecretInput
            value={config.amadeus_client_id}
            onChange={v => set('amadeus_client_id', v)}
            placeholder="أدخل Amadeus Client ID"
          />
        </Field>
        <Field label="Client Secret">
          <SecretInput
            value={config.amadeus_client_secret}
            onChange={v => set('amadeus_client_secret', v)}
            placeholder="أدخل Amadeus Client Secret"
          />
        </Field>
        <Field label="نسبة الربح على سعر Amadeus (%)">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={config.amadeus_markup_percent}
              onChange={e => set('amadeus_markup_percent', e.target.value)}
              style={{ ...inputStyle, maxWidth: '160px' }}
            />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              مثال: القيمة 10 تعني السعر × 1.10
            </span>
          </div>
        </Field>
      </Section>

      <Section title="Chargily Pay — بيانات الاعتماد">
        <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem' }}>
          <p style={{ color: 'rgba(245,166,35,0.8)', fontSize: '12px', margin: 0 }}>
 احصل على بيانات الاعتماد من لوحة تحكم Chargily Pay على{' '}
            <a href="https://pay.chargily.net" target="_blank" rel="noreferrer" style={{ color: '#f5a623', textDecoration: 'underline' }}>pay.chargily.net</a>
          </p>
        </div>
        <Field label="API Key">
          <SecretInput
            value={config.chargily_api_key}
            onChange={v => set('chargily_api_key', v)}
            placeholder="sk_live_..."
          />
        </Field>
        <Field label="Webhook Secret">
          <SecretInput
            value={config.chargily_webhook_secret}
            onChange={v => set('chargily_webhook_secret', v)}
            placeholder="whsec_..."
          />
        </Field>
      </Section>

      <Section title="طرق الدفع المقبولة">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {PAYMENT_OPTIONS.map(p => {
            const active = activePayments.includes(p.key);
            return (
              <button
                key={p.key}
                onClick={() => togglePayment(p.key)}
                style={{
                  background: active ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#f5a623' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${active ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Cairo,sans-serif',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {active && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

    </div>
  );
}