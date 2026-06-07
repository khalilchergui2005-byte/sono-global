'use client';
import { useEffect, useState, useRef } from 'react';

const slides = [
  { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80', label: 'باريس', city: 'Paris', country: 'France' },
  { url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80', label: 'دبي', city: 'Dubai', country: 'UAE' },
  { url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&q=80', label: 'إسطنبول', city: 'Istanbul', country: 'Turkey' },
  { url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&q=80', label: 'مكة المكرمة', city: 'Makkah', country: 'KSA' },
  { url: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1920&q=80', label: 'روما', city: 'Roma', country: 'Italy' },
];

type SiteSettings = { agencyName: string; agencyDescription: string; };

const heroKeyframes = `
  @keyframes heroFadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes heroBadge {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes float-card {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes slideCountry {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes dotsGrow {
    0%, 100% { transform: scaleX(1); }
    50% { transform: scaleX(1.3); }
  }
  .hero-btn-primary:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 16px 48px rgba(10,126,181,0.65) !important;
  }
  .hero-btn-secondary:hover {
    background: rgba(255,255,255,0.18) !important;
    transform: translateY(-3px) !important;
    border-color: rgba(255,255,255,0.55) !important;
  }
  .hero-stat-card:hover {
    transform: translateY(-4px) !important;
    border-color: rgba(201,168,76,0.5) !important;
  }
  .slide-dot:hover { transform: scaleX(1.4) !important; }
  @media(max-width:640px){.hero-country-badge{display:none !important;}.hero-stat-card{padding:0.75rem 1.25rem !important;}.hero-content{padding:0 1rem !important;}}
`;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({ agencyName: '', agencyDescription: '' });
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    setPrev(current);
    setCurrent(idx);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => {
        setPrev(prev);
        return (prev + 1) % slides.length;
      });
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: SiteSettings & { error?: string }) => {
        if (data && !data.error) setSettings({ agencyName: data.agencyName || '', agencyDescription: data.agencyDescription || '' });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const agencyName = settings.agencyName.trim();
  const nameParts = agencyName ? agencyName.split(' ') : [];
  const nameFirst = nameParts[0] || '';
  const nameRest = nameParts.slice(1).join(' ') || '';
  const description = settings.agencyDescription.trim();

  const stats = [
    { value: '+500', label: 'عميل راضي' },
    { value: '+50', label: 'وجهة سياحية' },
    { value: '+10', label: 'سنوات خبرة' },
  ];

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: '680px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, Arial, sans-serif' }}>
      <style>{heroKeyframes}</style>

      {slides.map((slide, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, transition: 'opacity 1.8s cubic-bezier(0.4,0,0.2,1)', opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : (i === prev ? 0 : 0) }}>
          <img src={slide.url} alt={slide.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: i === current ? 'scale(1.04)' : 'scale(1)', transition: 'transform 6s ease-out' }} />
        </div>
      ))}

      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(6,13,36,0.45) 0%, rgba(6,13,36,0.2) 35%, rgba(6,13,36,0.75) 75%, rgba(6,13,36,0.97) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse at 30% 50%, rgba(10,126,181,0.12) 0%, transparent 65%)' }} />

      <div style={{ position: 'absolute', top: '15%', left: '5%', zIndex: 3, width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,126,181,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '3%', zIndex: 3, width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className='hero-content' style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '0 1.5rem', maxWidth: '900px', width: '100%', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease', direction: 'rtl' }}>

        <div style={{ animation: 'heroBadge 0.6s ease forwards', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(10,126,181,0.15)', border: '1px solid rgba(10,126,181,0.4)', color: '#7dd3fc', padding: '7px 22px', borderRadius: '50px', fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.5px', WebkitBackdropFilter: 'blur(10px)' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0A7EB5', boxShadow: '0 0 10px rgba(10,126,181,0.8)', animation: 'pulse-ring 1.5s ease-out infinite' }} />
            {'وكالة سفر وسياحة معتمدة'}
          </div>
        </div>

        {agencyName && (
          <h1 style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', color: '#fff', fontWeight: 900, lineHeight: 1.05, marginBottom: '1rem', textShadow: '0 4px 40px rgba(0,0,0,0.5)', animation: 'heroFadeIn 0.8s ease 0.2s both' }}>
            <span style={{ color: '#fff' }}>{nameFirst}</span>
            {nameRest && (
              <>
                {' '}
                <span style={{ background: 'linear-gradient(135deg, #0A7EB5, #38bdf8, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', animation: 'gradientShift 4s linear infinite' }}>{nameRest}</span>
              </>
            )}
          </h1>
        )}

        {description && (
          <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', color: 'rgba(255,255,255,0.82)', marginBottom: '2.5rem', lineHeight: 1.8, maxWidth: '620px', margin: '0 auto 2.5rem', textShadow: '0 2px 12px rgba(0,0,0,0.4)', animation: 'heroFadeIn 0.8s ease 0.4s both' }}>
            {description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'heroFadeIn 0.8s ease 0.6s both', marginBottom: '3.5rem' }}>
          <a href='#services' className='hero-btn-primary' style={{ background: 'linear-gradient(135deg, #0A7EB5 0%, #065a82 100%)', color: '#fff', padding: '15px 38px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 8px 32px rgba(10,126,181,0.5)', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.3px' }}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>
            {'اكتشف خدماتنا'}
          </a>
          <a href='#consultation' className='hero-btn-secondary' style={{ background: 'rgba(255,255,255,0.08)', WebkitBackdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.3)', color: '#fff', padding: '15px 38px', borderRadius: '12px', fontSize: '15px', textDecoration: 'none', fontWeight: 700, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'/></svg>
            {'احجز استشارة'}
          </a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'heroFadeIn 0.8s ease 0.8s both' }}>
          {stats.map((stat, i) => (
            <div key={i} className='hero-stat-card' style={{ background: 'rgba(255,255,255,0.06)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1rem 1.75rem', textAlign: 'center', transition: 'all 0.3s ease', cursor: 'default', animation: 'float-card 4s ease-in-out ' + (i * 0.5) + 's infinite' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', fontWeight: 600, letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 5, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {slides.map((slide, i) => (
          <button key={i} className='slide-dot' onClick={() => goTo(i)} style={{ width: i === current ? '32px' : '8px', height: '8px', borderRadius: '4px', background: i === current ? '#C9A84C' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)', padding: 0, boxShadow: i === current ? '0 0 12px rgba(201,168,76,0.6)' : 'none' }} />
        ))}
      </div>

      <div className='hero-country-badge' style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 5, animation: 'slideCountry 0.5s ease forwards' }} key={current}>
        <div style={{ background: 'rgba(0,0,0,0.45)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', boxShadow: '0 0 8px rgba(201,168,76,0.8)' }} />
          <div>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{slides[current].label}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>{slides[current].country}</div>
          </div>
        </div>
      </div>
    </section>
  );
}