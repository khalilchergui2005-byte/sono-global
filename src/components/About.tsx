'use client';
import { useEffect, useState } from 'react';

type Service = { id: string; title: string; slug: string; description: string; icon: string; visible: boolean; order: number; };
type SiteSettings = { agencyName: string; agencyDescription: string; };

const whyUs = [
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'موثوقية كاملة', desc: 'نضمن لك رحلة آمنة ومنظمة من أول خطوة حتى العودة', color: '#0A7EB5' },
  { icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', title: 'جودة لا تقبل المساومة', desc: 'نختار أفضل الخدمات لضمان تجربة استثنائية في كل رحلة', color: '#C9A84C' },
  { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: 'دعم مستمر', desc: 'فريقنا متاح دائماً لمساعدتك في أي وقت تحتاجه', color: '#10b981' },
  { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'أسعار تنافسية', desc: 'أفضل الأسعار في السوق مع ضمان الجودة والاحترافية التامة', color: '#f59e0b' },
];

const aboutKeyframes = `
  @keyframes aboutFadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes imgReveal {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0% 0 0); }
  }
  @keyframes counterUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes glowCard {
    0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    50% { box-shadow: 0 8px 40px rgba(10,126,181,0.12); }
  }
  .why-card:hover { transform: translateY(-6px) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.12) !important; }
  .about-btn-primary:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(10,126,181,0.45) !important; }
  .about-btn-outline:hover { background: rgba(10,126,181,0.08) !important; transform: translateY(-3px) !important; }
  .srv-mini-card:hover { transform: translateY(-4px) !important; border-color: #0A7EB5 !important; background: rgba(10,126,181,0.04) !important; }
  @media(max-width:768px){.about-main-grid{grid-template-columns:1fr !important;gap:2rem !important;}}
`;

export default function About() {
  const [settings, setSettings] = useState<SiteSettings>({ agencyName: '', agencyDescription: '' });
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: SiteSettings & { error?: string }) => {
        if (data && !data.error) setSettings({ agencyName: data.agencyName || '', agencyDescription: data.agencyDescription || '' });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setServices((data as Service[]).filter((s: Service) => s.visible).sort((a, b) => a.order - b.order));
      })
      .catch(() => {});
  }, []);

  const agencyName = settings.agencyName.trim();
  const agencyDescription = settings.agencyDescription.trim();

  return (
    <section id='about' style={{ fontFamily: 'Cairo, Arial, sans-serif', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease', direction: 'rtl' }}>
      <style>{aboutKeyframes}</style>

      <div style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #f8fafc 50%, #eef4fb 100%)', padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,126,181,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className='about-main-grid' style={{ maxWidth: '1150px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100%', height: '100%', border: '2px solid rgba(10,126,181,0.12)', borderRadius: '24px', zIndex: 0 }} />
            <img
              src='https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80'
              alt={'عن الوكالة'}
              style={{ width: '100%', borderRadius: '20px', objectFit: 'cover', height: '480px', position: 'relative', zIndex: 1, boxShadow: '0 24px 80px rgba(0,0,0,0.15)' }}
            />
            <div style={{ position: 'absolute', bottom: '-1.75rem', left: '-1.75rem', zIndex: 2, background: 'linear-gradient(135deg, #060d24, #0d1a3a)', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', border: '1px solid rgba(10,126,181,0.25)', minWidth: '210px' }}>
              <div style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 800, marginBottom: '10px', letterSpacing: '0.5px' }}>{'خدماتنا'}</div>
              {services.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {services.slice(0, 5).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0A7EB5', flexShrink: 0, boxShadow: '0 0 6px rgba(10,126,181,0.6)' }} />
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12.5px', fontWeight: 500 }}>{s.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {['تأشيرات سفر', 'رحلات منظمة', 'حجز طيران', 'حجز فنادق'].map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0A7EB5', flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'absolute', top: '1.5rem', left: '-2rem', zIndex: 2, background: 'linear-gradient(135deg, #C9A84C, #a8862e)', borderRadius: '16px', padding: '1rem 1.25rem', boxShadow: '0 8px 28px rgba(201,168,76,0.4)', textAlign: 'center', minWidth: '90px' }}>
              <div style={{ color: '#fff', fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>+10</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', fontWeight: 600, marginTop: '3px', letterSpacing: '0.5px' }}>{'سنوات خبرة'}</div>
            </div>
          </div>

          <div style={{ animation: 'aboutFadeIn 0.7s ease 0.2s both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(10,126,181,0.08)', border: '1px solid rgba(10,126,181,0.2)', color: '#0A7EB5', padding: '6px 18px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '1.25rem' }}>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><circle cx='12' cy='12' r='10'/><path d='M12 8v4l3 3'/></svg>
              {'من نحن'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: '#0D1B4B', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              {'وكالة سفر متكاملة'}<br />
              <span style={{ background: 'linear-gradient(135deg, #0A7EB5, #065a82)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {'تحت سقف واحد'}
              </span>
            </h2>
            {agencyName && (
              <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.9, marginBottom: '1rem' }}>
                <strong style={{ color: '#0D1B4B', fontWeight: 800 }}>{agencyName}</strong>
                {' '}{agencyDescription || 'وكالة سفر وسياحة متخصصة تقدم خدمات شاملة ومتكاملة.'}
              </p>
            )}
            <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.9, marginBottom: '2rem' }}>
              {'نؤمن بأن كل عميل يستحق خدمة شخصية متميزة. فريقنا المتخصص يتابع معك خطوة بخطوة حتى تحقيق هدفك، بشفافية تامة وبدون تعقيدات.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href='#contact' className='about-btn-primary' style={{ background: 'linear-gradient(135deg, #0A7EB5, #065a82)', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 24px rgba(10,126,181,0.35)', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.56 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z'/></svg>
                {'تواصل معنا'}
              </a>
              <a href='#packages' className='about-btn-outline' style={{ background: 'transparent', border: '2px solid rgba(10,126,181,0.35)', color: '#0A7EB5', padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/></svg>
                {'اكتشف باقاتنا'}
              </a>
            </div>
          </div>
        </div>
      </div>

      {services.length > 0 && (
        <div style={{ background: '#fff', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #0A7EB5, #C9A84C, #0A7EB5)', backgroundSize: '200% 100%' }} />
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(10,126,181,0.07)', border: '1px solid rgba(10,126,181,0.18)', color: '#0A7EB5', padding: '6px 18px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '1rem' }}>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>
              {'تخصصاتنا'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#0D1B4B', fontWeight: 900, marginBottom: '0.75rem' }}>
              {'خدمات متميزة في كل مجال'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
              {'كل خدمة يقدمها مبنية على خبرة عميقة واهتمام حقيقي بتيجاتك'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: '1150px', margin: '0 auto' }}>
            {services.map((s, i) => (
              <a key={s.id} href={'/services/' + s.slug} className='srv-mini-card' style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer', textDecoration: 'none', animation: 'aboutFadeIn 0.5s ease ' + (i * 0.08) + 's both' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(10,126,181,0.12), rgba(10,126,181,0.06))', border: '1px solid rgba(10,126,181,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>{s.icon || '✈️'}</div>
                <div>
                  <h3 style={{ color: '#0D1B4B', fontSize: '15px', fontWeight: 700, marginBottom: '5px' }}>{s.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{s.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'linear-gradient(135deg, #060d24 0%, #0a1628 100%)', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '6px 18px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '1rem' }}>
              <svg width='12' height='12' viewBox='0 0 24 24' fill='currentColor'><path d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'/></svg>
              {'لماذا نحن'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', fontWeight: 900 }}>
              {'ما يجعلنا الخيار الأول'}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem' }}>
            {whyUs.map((v, i) => (
              <div key={i} className='why-card' style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2rem', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', animation: 'aboutFadeIn 0.5s ease ' + (i * 0.1) + 's both' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: v.color + '18', border: '1.5px solid ' + v.color + '35', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 4px 16px ' + v.color + '25' }}>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke={v.color} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d={v.icon}/></svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>{v.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}