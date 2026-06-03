import { db } from '@/lib/db';

const packagesKeyframes = `
  @keyframes pkgFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerCard {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes tagPulse {
    0%, 100% { box-shadow: 0 0 8px rgba(201,168,76,0.4); }
    50% { box-shadow: 0 0 20px rgba(201,168,76,0.8); }
  }
  .pkg-card:hover .pkg-img { transform: scale(1.07) !important; }
  .pkg-card:hover { transform: translateY(-8px) !important; box-shadow: 0 24px 60px rgba(0,0,0,0.4) !important; border-color: rgba(201,168,76,0.35) !important; }
  .pkg-btn:hover { background: linear-gradient(135deg, #0A7EB5, #065a82) !important; color: #fff !important; transform: scale(1.04) !important; }
`;

export default async function Packages() {
  const [packages, siteSettings] = await Promise.all([
    db.package.findMany({
      where: { visible: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, country: true, duration: true, price: true, image: true, tag: true, description: true },
    }),
    db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { currency: true },
    }),
  ]);

  const currency = siteSettings?.currency ?? 'DZD';

  return (
    <section id='packages' style={{ background: 'linear-gradient(180deg, #060d24 0%, #080f28 60%, #060d24 100%)', padding: '6rem 2rem', fontFamily: 'Cairo, Arial, sans-serif', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>
      <style>{packagesKeyframes}</style>

      <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,126,181,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '7px 22px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.5px' }}>
          <svg width='13' height='13' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg>
          {'رحلاتنا المنظمة'}
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff', fontWeight: 900, marginBottom: '0.75rem', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
          {'اكتشف وجهاتنا المميزة'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.8 }}>
          {'باقات سياحية متكاملة بأفضل الأسعار وأعلى مستويات الجودة'}
        </p>
      </div>

      {packages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>
          {'لا توجد باقات متاحة حالياً'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {packages.map((pkg, idx) => (
            <div key={pkg.id} className='pkg-card' style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer', animation: 'pkgFadeUp 0.5s ease ' + (idx * 0.1) + 's both', backdropFilter: 'blur(4px)' }}>
              <div style={{ position: 'relative', overflow: 'hidden', height: '220px' }}>
                {pkg.image ? (
                  <img className='pkg-img' src={pkg.image} alt={pkg.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0A7EB5 0%, #060d24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width='56' height='56' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.2)' strokeWidth='1'>
                      <path d='M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'/>
                      <polyline points='9,22 9,12 15,12 15,22'/>
                    </svg>
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,13,36,0.85) 0%, rgba(6,13,36,0.1) 50%, transparent 100%)' }} />
                {pkg.tag && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'linear-gradient(135deg, #C9A84C, #a8862e)', color: '#060d24', padding: '5px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: 800, animation: 'tagPulse 2s ease-in-out infinite', letterSpacing: '0.3px' }}>{pkg.tag}</div>
                )}
                <div style={{ position: 'absolute', bottom: '14px', right: '14px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50px', padding: '5px 12px', backdropFilter: 'blur(8px)' }}>
                  <svg width='10' height='10' viewBox='0 0 24 24' fill='#C9A84C'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: 600 }}>{pkg.country}</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(10,126,181,0.1)', border: '1px solid rgba(10,126,181,0.2)', borderRadius: '50px', padding: '3px 10px' }}>
                    <svg width='10' height='10' viewBox='0 0 24 24' fill='#0A7EB5'><path d='M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z'/></svg>
                    <span style={{ color: '#0A7EB5', fontSize: '11px', fontWeight: 700 }}>{pkg.duration}</span>
                  </div>
                </div>
                <h3 style={{ color: '#fff', fontSize: '17px', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.3 }}>{pkg.title}</h3>
                {pkg.description && (
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    {pkg.description.length > 90 ? pkg.description.slice(0, 90) + '...' : pkg.description}
                  </p>
                )}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.25rem' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '2px' }}>{'ابتداءاً من'}</div>
                    <div style={{ color: '#C9A84C', fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>
                      {pkg.price.toLocaleString('ar-DZ')}
                      <span style={{ fontSize: '12px', color: 'rgba(201,168,76,0.6)', marginRight: '4px', fontWeight: 600 }}>{' '}{currency}</span>
                    </div>
                  </div>
                  <a href={'/packages/' + pkg.id} className='pkg-btn' style={{ background: 'rgba(10,126,181,0.12)', border: '1.5px solid rgba(10,126,181,0.35)', color: '#0A7EB5', padding: '10px 22px', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 700, transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {'احجز الآن'}
                    <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' style={{ transform: 'rotate(180deg)' }}><path d='M9 18l6-6-6-6'/></svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}