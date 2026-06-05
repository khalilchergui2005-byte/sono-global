'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Service = {
  id: string; title: string; slug: string; icon: string; color: string;
  image: string; imageLabel: string; description: string;
  details: string[]; destinations: string[];
};

const ICON_PATHS: Record<string, string> = {
  plane:     'M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
  passport:  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  globe:     'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  briefcase: 'M20 6h-2.18c.07-.44.18-.88.18-1.35C18 3.15 16.85 2 15.35 2h-6.7C7.15 2 6 3.15 6 4.65c0 .47.1.91.18 1.35H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm2.35-12h-4.7c-.35 0-.65-.3-.65-.65 0-.35.3-.65.65-.65h4.7c.35 0 .65.3.65.65 0 .35-.3.65-.65.65z',
  mosque:    'M12 3L2 9v2h2v9h16v-9h2V9L12 3zm0 2.5L20 10H4l8-4.5zM10 20v-6h4v6h-4z',
  hotel:     'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z',
  student:   'M12 3L1 9l4 2.18V15c0 3 5 5 7 5s7-2 7-5v-3.82L23 9 12 3zm6 8.99l-6 3.01-6-3.01V10l6-3 6 3v1.99z',
  map:       'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z',
  migration: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
};

const SvgIcon = ({ iconKey, size = 20, color = 'currentColor' }: { iconKey: string; size?: number; color?: string }) => {
  const path = ICON_PATHS[iconKey] || ICON_PATHS['plane'];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
};

const steps = [
  { n: '01', title: 'تواصل معنا', desc: 'أرسل طلبك وسيتصل بك مستشارنا خلال ساعات' },
  { n: '02', title: 'تحليل الملف', desc: 'نراجع وضعك ونحدد أفضل خطة لتحقيق هدفك' },
  { n: '03', title: 'تجهيز الوثائق', desc: 'نتكفل بإعداد كامل الملف بدقة واحترافية' },
  { n: '04', title: 'المتابعة حتى النهاية', desc: 'نرافقك في كل خطوة حتى الحصول على النتيجة' },
];

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [price, setPrice] = useState('2500');

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/services/${slug}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then(data => { if (data) setService(data); })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d?.consultationPrice) setPrice(d.consultationPrice); })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, service: service?.title, serviceSlug: service?.slug, paid: false }),
      });
      if (res.ok) { setStep('payment'); }
    } catch { alert('حدث خطأ، حاول مجدداً'); }
    finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo,sans-serif', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#0A7EB5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8' }}>جاري التحميل...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (notFound || !service) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo,sans-serif', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ color: '#0D1B4B', fontSize: '24px', fontWeight: 900 }}>الخدمة غير موجودة</h1>
        <a href="/" style={{ color: '#0A7EB5', fontWeight: 700, textDecoration: 'none' }}>العودة للرئيسية</a>
      </div>
    </div>
  );

  const c = service.color;

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl', minHeight: '100vh', background: '#f8fafc' }}>

      {/* Hero */}
      <section style={{ position: 'relative', height: '70vh', minHeight: '500px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        {service.image ? (
          <img src={service.image} alt={service.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, #0D1B4B, ${c})` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,27,75,0.95) 0%, rgba(13,27,75,0.5) 50%, transparent 100%)' }} />

        <div style={{ position: 'absolute', top: '120px', right: '2rem', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>الرئيسية</a>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>›</span>
          <a href="/#services" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>الخدمات</a>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>›</span>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{service.title}</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem 4rem', maxWidth: '900px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'white', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' }}>
            {service.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', lineHeight: 1.8, maxWidth: '600px', marginBottom: '2rem' }}>
            {service.description}
          </p>
          <a href="#inquiry" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: c, color: 'white', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
            ابدأ الآن
          </a>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>

        {/* التفاصيل والوجهات */}
        <div style={{ display: 'grid', gridTemplateColumns: service.destinations.length ? '1fr 1fr' : '1fr', gap: '2rem', padding: '4rem 0' }}>
          {service.details.length > 0 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0D1B4B', marginBottom: '1.5rem' }}>ما تشمله هذه الخدمة</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {service.details.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: i < service.details.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: c + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {service.destinations.length > 0 && (
            <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0D1B4B', marginBottom: '1.5rem' }}>الوجهات المتاحة</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {service.destinations.map((d, i) => (
                  <div key={i} style={{ background: c + '08', border: `1px solid ${c}25`, borderRadius: '12px', padding: '10px 20px', color: c, fontWeight: 700, fontSize: '14px' }}>
                    🌍 {d}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* خطوات العمل */}
        <div style={{ background: `linear-gradient(135deg, #0D1B4B, ${c})`, borderRadius: '24px', padding: '3rem 2.5rem', marginBottom: '4rem' }}>
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 900, textAlign: 'center', marginBottom: '2.5rem' }}>كيف نعمل معك؟</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <span style={{ color: 'white', fontSize: '16px', fontWeight: 900 }}>{s.n}</span>
                </div>
                <h3 style={{ color: 'white', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* نموذج الاستشارة */}
        <div id="inquiry" style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0D1B4B', marginBottom: '8px' }}>أرسل طلبك الآن</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>سيتواصل معك مستشارنا خلال أقل من 24 ساعة</p>
          </div>

          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>

            {sent ? (
              /* ✅ تم بنجاح */
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 style={{ color: '#0D1B4B', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>تم استلام طلبك بنجاح!</h3>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7 }}>تم تأكيد دفعك — سيتواصل معك مستشارنا قريباً.</p>
                <button onClick={() => { setSent(false); setStep('form'); setForm({ name: '', phone: '', message: '' }); }}
                  style={{ marginTop: '16px', background: 'none', border: `1px solid ${c}`, color: c, borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
                  إرسال طلب آخر
                </button>
              </div>

            ) : step === 'payment' ? (
              /* 💳 صفحة الدفع */
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: c + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <h3 style={{ color: '#0D1B4B', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>أكمل الدفع لتأكيد طلبك</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '1.5rem' }}>طلبك محفوظ — يتبقى فقط تأكيد الدفع</p>

                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#0D1B4B', fontWeight: 700, fontSize: '13px' }}>{service.title}</span>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>الخدمة</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#0D1B4B', fontWeight: 700, fontSize: '13px' }}>{form.name}</span>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>الاسم</span>
                  </div>
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: c, fontWeight: 900, fontSize: '18px' }}>{price} دج</span>
                    <span style={{ color: '#0D1B4B', fontWeight: 700 }}>المبلغ الإجمالي</span>
                  </div>
                </div>

                <button onClick={() => alert('نظام الدفع قيد الإعداد — سيُفعَّل قريباً')}
                  style={{ width: '100%', background: `linear-gradient(135deg, ${c}, #0D1B4B)`, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, fontFamily: 'Cairo,sans-serif', cursor: 'pointer', marginBottom: '10px' }}>
                  ادفع الآن — {price} دج
                </button>

                <button onClick={() => setStep('form')}
                  style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
                  ← تعديل البيانات
                </button>

                <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '12px' }}>🔒 الدفع آمن ومشفر عبر Chargily</p>
              </div>

            ) : (
              /* 📝 النموذج */
              <form onSubmit={submit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>الاسم الكامل *</label>
                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="أدخل اسمك"
                      style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', fontFamily: 'Cairo,sans-serif', outline: 'none', boxSizing: 'border-box', color: '#0D1B4B' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>رقم الهاتف *</label>
                    <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+213 XX XX XX XX"
                      style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', fontFamily: 'Cairo,sans-serif', outline: 'none', boxSizing: 'border-box', color: '#0D1B4B', direction: 'ltr' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px', padding: '12px 16px', background: c + '08', borderRadius: '10px', border: `1px solid ${c}20` }}>
                  <span style={{ color: '#475569', fontSize: '13px' }}>الخدمة المطلوبة: </span>
                  <span style={{ color: c, fontWeight: 800, fontSize: '13px' }}>{service.title}</span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>تفاصيل طلبك</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="اشرح وضعك بالتفصيل..."
                    rows={4}
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '13px', fontFamily: 'Cairo,sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box', color: '#0D1B4B' }}
                  />
                </div>

                <button type="submit" disabled={sending}
                  style={{ width: '100%', background: sending ? '#94a3b8' : `linear-gradient(135deg, ${c}, #0D1B4B)`, color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, fontFamily: 'Cairo,sans-serif', cursor: sending ? 'not-allowed' : 'pointer' }}>
                  {sending ? 'جاري الحفظ...' : `التالي — الدفع (${price} دج)`}
                </button>
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '11px', marginTop: '10px' }}>
                  ستنتقل لصفحة الدفع الآمن بعد ملء البيانات
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
