'use client';
import { useState, useEffect, useRef } from 'react';

type Service = { id: string; title: string; slug: string; icon: string; color: string; image: string; imageLabel: string; description: string; details: string[]; destinations: string[]; };

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
  const d = ICON_PATHS[iconKey] || ICON_PATHS['plane'];
  return <svg width={size} height={size} viewBox='0 0 24 24' fill={color}><path d={d} /></svg>;
};

const servicesKeyframes = `
  @keyframes tabSlide {
    from { opacity: 0; transform: translateX(10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes contentFade {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes imgZoom {
    from { transform: scale(1.06); }
    to { transform: scale(1); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(10,126,181,0.2); }
    50% { box-shadow: 0 0 40px rgba(10,126,181,0.5); }
  }
  .srv-tab:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important; }
  .srv-cta:hover { transform: translateY(-3px) !important; filter: brightness(1.1); box-shadow: inherit; }
  .srv-detail-item:hover { transform: translateX(-4px) !important; }
  .srv-dest-tag:hover { transform: scale(1.05) !important; }
  @media (max-width: 640px) {
    .srv-grid { grid-template-columns: 1fr !important; min-height: auto !important; }
    .srv-img-col { min-height: 260px; }
    .srv-text-col { padding: 1.75rem !important; border-right: none !important; border-top: 1px solid rgba(255,255,255,0.04) !important; }
  }
`;

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      const idx = services.findIndex(s => s.slug === slug);
      if (idx !== -1) { setSelected(idx); setAnimKey(k => k + 1); }
    };
    window.addEventListener('selectService', handler);
    return () => window.removeEventListener('selectService', handler);
  }, [services]);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setServices(data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    setAnimKey(k => k + 1);
  };

  if (loading) return (
    <section id='services' style={{ background: '#060d24', padding: '5rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ height: '48px', width: '140px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </section>
  );

  if (services.length === 0) return null;

  const s = services[selected] || services[0];
  const baseColor = s.color || '#0A7EB5';

  return (
    <section id='services' style={{ background: '#060d24', padding: '5rem 0 0', fontFamily: 'Cairo, Arial, sans-serif', direction: 'rtl', overflow: 'hidden' }}>
      <style>{servicesKeyframes}</style>

      <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '0 2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '6px 20px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.5px' }}>
          <svg width='13' height='13' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>
          {'خدماتنا'}
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff', fontWeight: 900, marginBottom: '0.75rem', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
          {'كل ما تحتاجه في مكان واحد'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.8 }}>
          {'اضغط على أي خدمة لرؤية تفاصيلها'}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', padding: '0 2rem', marginBottom: '0' }}>
        {services.map((srv, idx) => (
          <button key={srv.id} onClick={() => handleSelect(idx)} className='srv-tab'
            style={{
              background: selected === idx
                ? 'linear-gradient(135deg, ' + srv.color + ', ' + srv.color + 'cc)'
                : 'rgba(255,255,255,0.05)',
              color: selected === idx ? '#fff' : 'rgba(255,255,255,0.6)',
              border: selected === idx ? '1.5px solid ' + srv.color : '1.5px solid rgba(255,255,255,0.1)',
              padding: '11px 22px', borderRadius: '50px', fontSize: '13.5px', fontWeight: 700,
              fontFamily: 'Cairo, Arial, sans-serif', cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: selected === idx ? '0 4px 20px ' + srv.color + '50' : 'none',
            }}>
            <SvgIcon iconKey={srv.icon} size={15} color={selected === idx ? '#fff' : 'rgba(255,255,255,0.5)'} />
            {srv.title}
          </button>
        ))}
      </div>

      <div ref={contentRef} key={animKey} className='srv-grid' style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '520px', animation: 'contentFade 0.4s ease forwards' }}>

        <div className='srv-img-col' style={{ position: 'relative', overflow: 'hidden' }}>
          {s.image ? (
            <>
              <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'imgZoom 0.6s ease forwards' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, ' + baseColor + '55 0%, transparent 55%), linear-gradient(to top, rgba(6,13,36,0.7) 0%, transparent 50%)' }} />
              {s.imageLabel && (
                <div style={{ position: 'absolute', bottom: '1.75rem', right: '1.75rem', background: 'rgba(0,0,0,0.55)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <svg width='10' height='10' viewBox='0 0 24 24' fill='#C9A84C'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>
                  {s.imageLabel}
                </div>
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #060d24, ' + baseColor + '40)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ opacity: 0.3 }}><SvgIcon iconKey={s.icon} size={100} color='#fff' /></div>
            </div>
          )}
        </div>

        <div className='srv-text-col' style={{ background: 'linear-gradient(145deg, #0a1428, #080e20)', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.04)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: baseColor + '18', border: '1.5px solid ' + baseColor + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'glowPulse 3s ease-in-out infinite', boxShadow: '0 4px 20px ' + baseColor + '25' }}>
              <SvgIcon iconKey={s.icon} size={28} color={baseColor} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>{s.title}</h3>
              <div style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, ' + baseColor + ', ' + baseColor + '40)' }} />
            </div>
          </div>

          <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: '1.75rem' }}>{s.description}</p>

          {s.details.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', marginBottom: '1rem', textTransform: 'uppercase' }}>
                {'ما يشمله'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {s.details.slice(0, 5).map((d, i) => (
                  <div key={i} className='srv-detail-item' style={{ display: 'flex', alignItems: 'center', gap: '12px', transition: 'transform 0.2s ease' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: baseColor + '20', border: '1px solid ' + baseColor + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: baseColor }}>
                      <svg width='11' height='11' viewBox='0 0 24 24' fill='currentColor'><path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/></svg>
                    </div>
                    <span style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{d}</span>
                  </div>
                ))}
                {s.details.length > 5 && (
                  <span style={{ fontSize: '12px', color: baseColor, fontWeight: 700, paddingRight: '34px' }}>+{s.details.length - 5} {'خدمات أخرى...'}</span>
                )}
              </div>
            </div>
          )}

          {s.destinations.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                {'الوجهات المتاحة'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {s.destinations.map(d => (
                  <span key={d} className='srv-dest-tag' style={{ background: baseColor + '12', border: '1px solid ' + baseColor + '35', color: baseColor, padding: '4px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 600, transition: 'transform 0.2s ease', cursor: 'default' }}>{d}</span>
                ))}
              </div>
            </div>
          )}

          <a href={'/services/' + s.slug} className='srv-cta' style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, ' + baseColor + ', ' + baseColor + 'bb)', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, textDecoration: 'none', alignSelf: 'flex-start', boxShadow: '0 8px 28px ' + baseColor + '45', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', letterSpacing: '0.3px' }}>
            <SvgIcon iconKey={s.icon} size={16} color='#fff' />
            {'اعرف المزيد واستفسر'}
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' style={{ transform: 'rotate(180deg)' }}><path d='M9 18l6-6-6-6'/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}