'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';

type Settings = {
  agencyName: string; agencyDescription: string;
  phonePrimary: string; phoneWhatsapp: string; email: string;
  address: string; mapsUrl: string; workingHours: string;
  phones: string[]; emails: string[]; whatsapp: string[];
  facebook: string[]; instagram: string[]; tiktok: string[]; youtube: string[];
  consultationPrice: string; currency: string;
  amadeus_client_id: string; amadeus_client_secret: string;
  amadeus_markup_percent: string;
  chargily_api_key: string; chargily_webhook_secret: string;
  payment_methods: string;
  logoUrl: string;
};

const EMPTY: Settings = {
  agencyName: '', agencyDescription: '',
  phonePrimary: '', phoneWhatsapp: '', email: '',
  address: '', mapsUrl: '', workingHours: '',
  phones: [''], emails: [''], whatsapp: [''],
  facebook: [''], instagram: [''], tiktok: [''], youtube: [''],
  consultationPrice: '2500', currency: 'DZD',
  amadeus_client_id: '', amadeus_client_secret: '', amadeus_markup_percent: '10',
  chargily_api_key: '', chargily_webhook_secret: '',
  payment_methods: 'cash,cib,bank_transfer,ccp',
  logoUrl: '',
};

const TABS = [
  { key: 'agency',       label: 'معلومات الوكالة' },
  { key: 'contact',      label: 'التواصل' },
  { key: 'integrations', label: 'التكاملات' },
  { key: 'payments',     label: 'طرق الدفع' },
];

const PAYMENT_OPTIONS = [
  { key: 'cash',          label: 'كاش' },
  { key: 'cib',           label: 'CIB / Dahabia' },
  { key: 'bank_transfer', label: 'تحويل بنكي' },
  { key: 'ccp',           label: 'CCP بريدي' },
];

const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  padding: '10px 14px', color: 'white', fontSize: '13px',
  outline: 'none', fontFamily: 'Cairo,sans-serif', boxSizing: 'border-box',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
      {children}
    </div>
  );
}

function DynamicList({ label, list, onChange, onAdd, onRemove, placeholder, type = 'text' }: {
  label: string; list: string[]; placeholder: string; type?: string;
  onChange: (i: number, v: string) => void;
  onAdd: () => void; onRemove: (i: number) => void;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600 }}>{label}</label>
        <button onClick={onAdd} style={{ background: 'rgba(10,126,181,0.15)', color: '#38bdf8', border: '1px solid rgba(10,126,181,0.2)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>+ إضافة</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {list.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px' }}>
            <input type={type} value={item} onChange={e => onChange(i, e.target.value)} placeholder={placeholder + ' (' + (i + 1) + ')'} style={{ ...inp, flex: 1 }} />
            <button onClick={() => onRemove(i)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: '12px', fontWeight: 700 }}>حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(EMPTY);
  const [tab, setTab] = useState('agency');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/settings').then(r => r.json()),
      fetch('/api/siteconfig').then(r => r.json()),
    ]).then(([s, c]) => {
      const logoVal = s.logoUrl || '';
      setForm({
        agencyName:              s.agencyName        || '',
        agencyDescription:       s.agencyDescription || '',
        phonePrimary:            s.phonePrimary       || '',
        phoneWhatsapp:           s.phoneWhatsapp      || '',
        email:                   s.email              || '',
        address:                 s.address            || '',
        mapsUrl:                 s.mapsUrl            || '',
        workingHours:            s.workingHours       || '',
        phones:                  s.phones?.length    ? s.phones    : [''],
        emails:                  s.emails?.length    ? s.emails    : [''],
        whatsapp:                s.whatsapp?.length  ? s.whatsapp  : [''],
        facebook:                s.facebook?.length  ? s.facebook  : [''],
        instagram:               s.instagram?.length ? s.instagram : [''],
        tiktok:                  s.tiktok?.length    ? s.tiktok    : [''],
        youtube:                 s.youtube?.length   ? s.youtube   : [''],
        consultationPrice:       s.consultationPrice || '2500',
        currency:                s.currency          || 'DZD',
        amadeus_client_id:       c.amadeus_client_id       || '',
        amadeus_client_secret:   c.amadeus_client_secret   || '',
        amadeus_markup_percent:  c.amadeus_markup_percent  || '10',
        chargily_api_key:        c.chargily_api_key        || '',
        chargily_webhook_secret: c.chargily_webhook_secret || '',
        payment_methods:         c.payment_methods         || 'cash,cib,bank_transfer,ccp',
        logoUrl:                 logoVal,
      });
      if (logoVal) setLogoPreview(logoVal);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings, val: string) =>
    setForm(p => ({ ...p, [key]: val }));

  const arrChange = useCallback((field: keyof Settings, i: number, val: string) => {
    setForm(p => { const a = [...(p[field] as string[])]; a[i] = val; return { ...p, [field]: a }; });
  }, []);
  const arrAdd = useCallback((field: keyof Settings) => {
    setForm(p => ({ ...p, [field]: [...(p[field] as string[]), ''] }));
  }, []);
  const arrRemove = useCallback((field: keyof Settings, i: number) => {
    setForm(p => {
      const a = [...(p[field] as string[])];
      if (a.length > 1) a.splice(i, 1); else a[i] = '';
      return { ...p, [field]: a };
    });
  }, []);

  const togglePayment = (key: string) => {
    const cur = form.payment_methods.split(',').filter(Boolean);
    const upd = cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key];
    set('payment_methods', upd.join(','));
  };

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm(p => ({ ...p, logoUrl: data.url }));
        setLogoPreview(data.url);
      }
    } catch {
      // upload failed silently
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = async () => {
    setSaving(true);
    const clean = (arr: string[]) => arr.filter(s => s.trim());
    await Promise.all([
      fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl:           form.logoUrl,
          agencyName:        form.agencyName,
          agencyDescription: form.agencyDescription,
          phonePrimary:      form.phonePrimary,
          phoneWhatsapp:     form.phoneWhatsapp,
          email:             form.email,
          address:           form.address,
          mapsUrl:           form.mapsUrl,
          workingHours:      form.workingHours,
          phones:            clean(form.phones),
          emails:            clean(form.emails),
          whatsapp:          clean(form.whatsapp),
          facebook:          clean(form.facebook),
          instagram:         clean(form.instagram),
          tiktok:            clean(form.tiktok),
          youtube:           clean(form.youtube),
          consultationPrice: form.consultationPrice,
          currency:          form.currency,
        }),
      }),
      fetch('/api/siteconfig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amadeus_client_id:       form.amadeus_client_id,
          amadeus_client_secret:   form.amadeus_client_secret,
          amadeus_markup_percent:  form.amadeus_markup_percent,
          chargily_api_key:        form.chargily_api_key,
          chargily_webhook_secret: form.chargily_webhook_secret,
          payment_methods:         form.payment_methods,
        }),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontFamily: 'Cairo,sans-serif' }}>جاري التحميل...</div>
    </div>
  );

  const activePay = form.payment_methods.split(',').filter(Boolean);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Cairo,sans-serif', direction: 'rtl', maxWidth: '860px' }}>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: 0 }}>إعدادات الموقع</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0 0' }}>جميع إعدادات الوكالة في مكان واحد</p>
        </div>
        <button onClick={save} disabled={saving} style={{
          background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f5a623,#c47d0e)',
          color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px',
          fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'Cairo,sans-serif', opacity: saving ? 0.7 : 1, transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: 'transparent',
            color: tab === t.key ? '#f5a623' : 'rgba(255,255,255,0.4)',
            border: 'none', borderBottom: tab === t.key ? '2px solid #f5a623' : '2px solid transparent',
            padding: '10px 20px', fontSize: '13px', fontWeight: tab === t.key ? 700 : 500,
            cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'agency' && (
        <Card>
          <Field label="شعار الوكالة">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ width: '80px', height: '80px', borderRadius: '14px', border: '2px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,166,35,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingLogo}
                  style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', color: '#f5a623', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: uploadingLogo ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', opacity: uploadingLogo ? 0.6 : 1, display: 'block', marginBottom: '6px' }}
                >
                  {uploadingLogo ? 'جاري الرفع...' : logoPreview ? 'تغيير الشعار' : 'رفع شعار'}
                </button>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: 0 }}>PNG أو JPG — يظهر في الهيدر والموقع</p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => { setLogoPreview(''); setForm(p => ({ ...p, logoUrl: '' })); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: '11px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', padding: '4px 0', marginTop: '4px' }}
                  >
                    حذف الشعار
                  </button>
                )}
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
          </Field>

          <Field label="اسم الوكالة">
            <input value={form.agencyName} onChange={e => set('agencyName', e.target.value)} placeholder="Sono Global Travel" style={inp} />
          </Field>
          <Field label="وصف الوكالة">
            <input value={form.agencyDescription} onChange={e => set('agencyDescription', e.target.value)} placeholder="وكالة سفر وسياحة..." style={inp} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="سعر الاستشارة (دج)">
              <input type="number" value={form.consultationPrice} onChange={e => set('consultationPrice', e.target.value)} placeholder="2500" style={inp} />
            </Field>
            <Field label="العملة">
              <input value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="DZD" style={inp} />
            </Field>
          </div>
          <Field label="ساعات العمل">
            <input value={form.workingHours} onChange={e => set('workingHours', e.target.value)} placeholder="السبت - الخميس: 9ص - 6م" style={inp} />
          </Field>
          <Field label="العنوان الكامل">
            <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="شارع الاستقلال، سطيف" style={inp} />
          </Field>
          <Field label="رابط Google Maps">
            <input value={form.mapsUrl} onChange={e => set('mapsUrl', e.target.value)} placeholder="https://maps.google.com/..." style={inp} />
          </Field>
        </Card>
      )}

      {tab === 'contact' && (
        <>
          <Card>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>أرقام الهاتف والاتصال</div>
            <DynamicList label="أرقام الهاتف" list={form.phones} placeholder="+213 XXX XXX XXX" type="tel"
              onChange={(i, v) => arrChange('phones', i, v)} onAdd={() => arrAdd('phones')} onRemove={i => arrRemove('phones', i)} />
            <DynamicList label="حسابات واتساب" list={form.whatsapp} placeholder="+213 XXX XXX XXX" type="tel"
              onChange={(i, v) => arrChange('whatsapp', i, v)} onAdd={() => arrAdd('whatsapp')} onRemove={i => arrRemove('whatsapp', i)} />
            <DynamicList label="البريد الإلكتروني" list={form.emails} placeholder="example@sono.com" type="email"
              onChange={(i, v) => arrChange('emails', i, v)} onAdd={() => arrAdd('emails')} onRemove={i => arrRemove('emails', i)} />
          </Card>
          <Card>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>شبكات التواصل الاجتماعي</div>
            <DynamicList label="Facebook" list={form.facebook} placeholder="https://facebook.com/..."
              onChange={(i, v) => arrChange('facebook', i, v)} onAdd={() => arrAdd('facebook')} onRemove={i => arrRemove('facebook', i)} />
            <DynamicList label="Instagram" list={form.instagram} placeholder="https://instagram.com/..."
              onChange={(i, v) => arrChange('instagram', i, v)} onAdd={() => arrAdd('instagram')} onRemove={i => arrRemove('instagram', i)} />
            <DynamicList label="TikTok" list={form.tiktok} placeholder="https://tiktok.com/@..."
              onChange={(i, v) => arrChange('tiktok', i, v)} onAdd={() => arrAdd('tiktok')} onRemove={i => arrRemove('tiktok', i)} />
            <DynamicList label="YouTube" list={form.youtube} placeholder="https://youtube.com/..."
              onChange={(i, v) => arrChange('youtube', i, v)} onAdd={() => arrAdd('youtube')} onRemove={i => arrRemove('youtube', i)} />
          </Card>
        </>
      )}

      {tab === 'integrations' && (
        <>
          <Card>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>Amadeus — الطيران والفنادق</div>
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1rem', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              سجّل مجاناً على <span style={{ color: '#a5b4fc' }}>developers.amadeus.com</span> واحصل على Client ID و Secret من ال sandbox
            </div>
            <Field label="Client ID">
              <input value={form.amadeus_client_id} onChange={e => set('amadeus_client_id', e.target.value)} placeholder="أدخل Amadeus Client ID" style={inp} />
            </Field>
            <Field label="Client Secret">
              <input type="password" value={form.amadeus_client_secret} onChange={e => set('amadeus_client_secret', e.target.value)} placeholder="أدخل Amadeus Client Secret" style={inp} />
            </Field>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={async () => {
                  setTestStatus('loading');
                  try {
                    const res = await fetch('/api/amadeus/token');
                    const data = await res.json();
                    setTestStatus(data.ok ? 'ok' : 'error');
                    setTestMsg(data.error || '');
                  } catch {
                    setTestStatus('error');
                    setTestMsg('خطأ في الشبكة');
                  }
                }}
                disabled={testStatus === 'loading'}
                style={{
                  background: testStatus === 'ok' ? 'rgba(16,185,129,0.15)' : testStatus === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                  color: testStatus === 'ok' ? '#10b981' : testStatus === 'error' ? '#ef4444' : '#818cf8',
                  border: '1px solid ' + (testStatus === 'ok' ? 'rgba(16,185,129,0.3)' : testStatus === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'),
                  borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 700,
                  cursor: testStatus === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: 'Cairo,sans-serif',
                }}
              >
                {testStatus === 'loading' ? 'جاري الاختبار...' : testStatus === 'ok' ? 'الاتصال يعمل' : testStatus === 'error' ? testMsg : 'اختبار الاتصال بـ Amadeus'}
              </button>
            </div>
            <Field label="نسبة الربح على سعر Amadeus (%)">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="number" min="0" max="100" step="0.5" value={form.amadeus_markup_percent} onChange={e => set('amadeus_markup_percent', e.target.value)} style={{ ...inp, maxWidth: '160px' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>مثال: 10 = السعر x 1.10</span>
              </div>
            </Field>
          </Card>
          <Card>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>Chargily — الدفع الإلكتروني</div>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '1rem', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              سجّل على <span style={{ color: '#6ee7b7' }}>chargily.com</span> للحصول على API Key لقبول دفع CIB/Dahabia
            </div>
            <Field label="API Key">
              <input type="password" value={form.chargily_api_key} onChange={e => set('chargily_api_key', e.target.value)} placeholder="أدخل Chargily API Key" style={inp} />
            </Field>
            <Field label="Webhook Secret">
              <input type="password" value={form.chargily_webhook_secret} onChange={e => set('chargily_webhook_secret', e.target.value)} placeholder="أدخل Webhook Secret" style={inp} />
            </Field>
          </Card>
        </>
      )}

      {tab === 'payments' && (
        <Card>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>طرق الدفع المقبولة في الموقع</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {PAYMENT_OPTIONS.map(p => {
              const active = activePay.includes(p.key);
              return (
                <button key={p.key} onClick={() => togglePayment(p.key)} style={{
                  background: active ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#f5a623' : 'rgba(255,255,255,0.4)',
                  border: '1px solid ' + (active ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'),
                  borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  {active && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                  {p.label}
                </button>
              );
            })}
          </div>
        </Card>
      )}

    </div>
  );
}