'use client';
import { useEffect, useState } from 'react';

type SiteSettings = { phones: string[]; whatsapp: string[]; emails: string[]; facebook: string[]; instagram: string[]; tiktok: string[]; youtube: string[]; address: string; mapsUrl: string; workingHours: string; consultationPrice: string; currency: string; };
type Service = { id: string; title: string; slug: string; };

const contactKeyframes = `
  @keyframes contactFadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes contactCardGlow {
    0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
    50% { box-shadow: 0 8px 40px rgba(10,126,181,0.2); }
  }
  @keyframes gradientBorder {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes checkBounce {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  .contact-card:hover { transform: translateY(-6px) !important; border-color: rgba(255,255,255,0.35) !important; box-shadow: 0 20px 60px rgba(0,0,0,0.25) !important; }
  .social-btn:hover { transform: translateY(-3px) scale(1.04) !important; filter: brightness(1.1) !important; }
  .consult-submit:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 36px rgba(10,126,181,0.5) !important; filter: brightness(1.05); }
  .consult-input:focus { border-color: rgba(10,126,181,0.6) !important; box-shadow: 0 0 0 3px rgba(10,126,181,0.12) !important; }
  .feature-chip:hover { background: rgba(10,126,181,0.12) !important; transform: translateY(-2px) !important; }
`;

const SUCCESS_SVG = (
  <svg width='52' height='52' viewBox='0 0 24 24' fill='none' style={{ animation: 'checkBounce 0.5s ease forwards' }}>
    <circle cx='12' cy='12' r='11' fill='rgba(16,185,129,0.15)' stroke='#10b981' strokeWidth='1.5'/>
    <path d='M7 12.5l3.5 3.5 6.5-7' stroke='#10b981' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'/>
  </svg>
);

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => { if (data && !data.error) setSettings(data); }).catch(() => {});
    fetch('/api/services').then(r => r.json()).then(data => { if (Array.isArray(data)) setServices(data); }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError('');
    try {
      const res = await fetch('/api/consultation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setSent(true); setForm({ name: '', phone: '', service: '', message: '' }); setTimeout(() => setSent(false), 6000); }
      else setFormError('حدث خطأ، حاول مجدداً');
    } catch { setFormError('تعذر الاتصال بالخادم. حاول مجدداً'); }
    finally { setSending(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontSize: '14px', fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '7px', letterSpacing: '0.3px' };

  const validPhones = settings?.phones.filter(p => p.trim()) ?? [];
  const validWhatsapp = settings?.whatsapp.filter(w => w.trim()) ?? [];
  const validEmails = settings?.emails.filter(e => e.trim()) ?? [];
  const hasSocials = settings?.facebook[0] || settings?.instagram[0] || settings?.tiktok[0] || settings?.youtube[0];
  const price = settings?.consultationPrice ?? '2500';
  const currency = settings?.currency ?? 'DZD';

  const consultFeatures = [
    { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'تحليل كامل لوضعك' },
    { icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', label: 'خطة عمل واضحة' },
    { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'إجابة على كل أسئلتك' },
    { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: 'متابعة ما بعد الاستشارة' },
  ];

  const contactCards = [
    ...(validPhones.length > 0 ? [{ type: 'phone', href: 'tel:' + validPhones[0], gradient: 'linear-gradient(135deg, #25D366, #128C7E)', icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', label: 'الهاتف', values: validPhones, sub: settings?.workingHours ?? '' }] : []),
    ...(validWhatsapp.length > 0 ? [{ type: 'whatsapp', href: 'https://wa.me/' + validWhatsapp[0].replace(/\D/g, ''), gradient: 'linear-gradient(135deg, #25D366, #1da851)', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z', label: 'WhatsApp', values: validWhatsapp, sub: 'رد فوري على مدار اليوم' }] : []),
    ...(validEmails.length > 0 ? [{ type: 'email', href: 'mailto:' + validEmails[0], gradient: 'linear-gradient(135deg, #EA4335, #FBBC05)', icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', label: 'البريد الإلكتروني', values: validEmails, sub: 'رد خلال 24 ساعة' }] : []),
    ...(settings?.address ? [{ type: 'location', href: settings.mapsUrl || '#', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', label: 'موقعنا', values: [settings.address], sub: 'انقر لعرض على الخريطة' }] : []),
  ];

  return (
    <>
      <style>{contactKeyframes}</style>

      <section id='consultation' style={{ background: 'linear-gradient(180deg, #060d24 0%, #0a1628 100%)', padding: '6rem 2rem', fontFamily: 'Cairo, sans-serif', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,126,181,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '7px 20px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '1.25rem' }}>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>
              {'خدمة مدفوعة'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', fontWeight: 900, marginBottom: '0.75rem' }}>
              {'احجز '}<span style={{ background: 'linear-gradient(135deg, #0A7EB5, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{'استشارتك'}</span>{' الآن'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14.5px', lineHeight: 1.8, maxWidth: '500px', margin: '0 auto' }}>
              {'استشارة شخصية مع أحد خبرائنا لتحليل وضعك ورسم لك خطة واضحة للوصول لهدفك'}
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '2.5rem', backdropFilter: 'blur(10px)' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
              {consultFeatures.map((f, i) => (
                <div key={i} className='feature-chip' style={{ background: 'rgba(10,126,181,0.07)', border: '1px solid rgba(10,126,181,0.15)', borderRadius: '12px', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '9px', transition: 'all 0.2s ease', cursor: 'default' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(10,126,181,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#0A7EB5' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d={f.icon}/></svg>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600 }}>{f.label}</span>
                </div>
              ))}
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', animation: 'contactFadeUp 0.5s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>{SUCCESS_SVG}</div>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {'تم إرسال طلبك!'}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7 }}>
                  {'سيتواصل معك أحد مستشارينا خلال 24 ساعة'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>{'الاسم الكامل *'}</label>
                    <input required className='consult-input' value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={'أدخل اسمك'} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{'رقم الهاتف *'}</label>
                    <input required className='consult-input' value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder='+213 XX XX XX XX' style={{ ...inputStyle, direction: 'ltr' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>{'موضوع الاستشارة *'}</label>
                  <select required className='consult-input' value={form.service} onChange={e => setForm({...form, service: e.target.value})} style={{ ...inputStyle, background: 'rgba(255,255,255,0.07)', cursor: 'pointer' }}>
                    <option value='' style={{ background: '#0d1530' }}>{'اختر موضوع الاستشارة...'}</option>
                    {services.map(s => <option key={s.id} value={s.title} style={{ background: '#0d1530' }}>{s.title}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={labelStyle}>{'تفاصيل وضعك'}</label>
                  <textarea className='consult-input' value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder={'اشرح وضعك بالتفصيل...'} rows={4} style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '3px' }}>{'رسوم الاستشارة'}</div>
                    <div style={{ color: '#C9A84C', fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>{Number(price).toLocaleString('ar-DZ')} <span style={{ fontSize: '13px', fontWeight: 600 }}>{currency}</span></div>
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#C9A84C' strokeWidth='2' strokeLinecap='round'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>
                  </div>
                </div>
                {formError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem', color: '#f87171', fontSize: '13px' }}>{formError}</div>
                )}
                <button type='submit' disabled={sending} className='consult-submit' style={{ width: '100%', background: sending ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #0A7EB5, #065a82)', color: '#fff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: 800, fontFamily: 'Cairo, sans-serif', cursor: sending ? 'not-allowed' : 'pointer', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(10,126,181,0.35)', letterSpacing: '0.3px' }}>
                  {sending ? (
                    <>
                      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' style={{ animation: 'spin 1s linear infinite' }}><path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/></svg>
                      {'جاري الإرسال...'}
                    </>
                  ) : (
                    <>
                      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.56 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z'/></svg>
                      {'احجز استشارتي الآن'}
                    </>
                  )}
                </button>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '12px' }}>
                  {'سيتم تأكيد الموعد وتفاصيل الدفع عبر الهاتف'}
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section id='contact' style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, #060d24 0%, #0A7EB5 70%, #065a82 100%)', fontFamily: 'Cairo, sans-serif', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: '1150px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '7px 20px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '1.25rem' }}>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.56 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z'/></svg>
              {'تواصل معنا'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#fff', fontWeight: 900, marginBottom: '0.75rem', textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
              {'نحن هنا '}<span style={{ color: '#C9A84C' }}>{'دائماً'}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.8 }}>
              {'تواصل معنا عبر أي قناة تفضلها وسنرد عليك في أقرب وقت'}
            </p>
          </div>

          {contactCards.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              {contactCards.map((card, i) => (
                <a key={i} href={card.href} target={card.type !== 'phone' ? '_blank' : undefined} rel='noreferrer' className='contact-card'
                  style={{ background: 'rgba(255,255,255,0.1)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '20px', padding: '1.75rem 1.25rem', border: '1px solid rgba(255,255,255,0.18)', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', animation: 'contactFadeUp 0.5s ease ' + (i * 0.1) + 's both' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }}>
                    <svg width='26' height='26' viewBox='0 0 24 24' fill='white'><path d={card.icon}/></svg>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }}>{card.label}</div>
                  {card.values.map((v, vi) => (
                    <div key={vi} style={{ color: '#fff', fontSize: '14px', fontWeight: 700, marginBottom: '2px', direction: 'ltr' }}>{v}</div>
                  ))}
                  {card.sub && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginTop: '5px' }}>{card.sub}</div>}
                </a>
              ))}
            </div>
          )}

          {hasSocials && (
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
              <h3 style={{ fontSize: '17px', marginBottom: '1.5rem', color: '#fff', fontWeight: 700 }}>
                {'تابعنا على الشبكات الاجتماعية'}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {settings?.facebook[0] && (
                  <a href={settings.facebook[0]} target='_blank' rel='noreferrer' className='social-btn' style={{ background: '#1877F2', color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(24,119,242,0.35)' }}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='white'><path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/></svg>
                    {'فيسبوك'}
                  </a>
                )}
                {settings?.instagram[0] && (
                  <a href={settings.instagram[0]} target='_blank' rel='noreferrer' className='social-btn' style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(220,39,67,0.35)' }}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='white'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'/></svg>
                    {'إنستغرام'}
                  </a>
                )}
                {settings?.tiktok[0] && (
                  <a href={settings.tiktok[0]} target='_blank' rel='noreferrer' className='social-btn' style={{ background: '#010101', color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='white'><path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.06a8.16 8.16 0 004.77 1.52V7.14a4.85 4.85 0 01-1-.45z'/></svg>
                    {'تيك توك'}
                  </a>
                )}
                {settings?.youtube[0] && (
                  <a href={settings.youtube[0]} target='_blank' rel='noreferrer' className='social-btn' style={{ background: '#FF0000', color: '#fff', textDecoration: 'none', padding: '11px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 16px rgba(255,0,0,0.35)' }}>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='white'><path d='M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602-6.264 3.591z'/></svg>
                    {'يوتيوب'}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}