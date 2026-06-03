'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type SiteSettings = { agencyName: string; agencyDescription: string; phonePrimary: string; logoUrl: string; };
type Service = { id: string; title: string; slug: string; order: number; };

const headerKeyframes = `
  @keyframes navGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.15); }
    50% { box-shadow: 0 0 35px rgba(201,168,76,0.3); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes drawerIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulseBtn {
    0%, 100% { box-shadow: 0 4px 20px rgba(10,126,181,0.3); }
    50% { box-shadow: 0 4px 30px rgba(10,126,181,0.55); }
  }
  @keyframes floatContact {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
  @keyframes accentLine {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  .nav-btn:hover { color: #C9A84C !important; background: rgba(201,168,76,0.08) !important; }
  .service-item:hover { background: rgba(201,168,76,0.1) !important; color: #C9A84C !important; padding-right: 22px !important; }
  .mobile-nav-btn:hover { background: rgba(201,168,76,0.08) !important; color: #C9A84C !important; }
  .account-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(10,126,181,0.5) !important; }
  .account-btn-gold:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(201,168,76,0.5) !important; }
  .contact-float:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 36px rgba(201,168,76,0.55) !important; }
  .hamburger-btn:hover { background: rgba(201,168,76,0.18) !important; border-color: rgba(201,168,76,0.4) !important; }
  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    #hamburger-btn { display: flex !important; }
    .contact-float { display: none !important; }
  }
`;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  const [settings, setSettings] = useState<SiteSettings>({ agencyName: '', agencyDescription: '', phonePrimary: '', logoUrl: '' });
  const [services, setServices] = useState<Service[]>([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: SiteSettings & { error?: string }) => {
        if (data && !data.error) setSettings({
          agencyName: data.agencyName || '',
          agencyDescription: data.agencyDescription || '',
          phonePrimary: data.phonePrimary || '',
          logoUrl: data.logoUrl || '',
        });
        setSettingsLoaded(true);
      })
      .catch(() => { setSettingsLoaded(true); });
  }, []);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setServices((data as Service[]).filter((s: Service) => s.title && s.slug));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('sg_token'));
    setMounted(true);
    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem('sg_token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navigate = (href: string) => {
    setMobileOpen(false);
    setServicesOpen(false);
    if (href.startsWith('#')) {
      if (isHome) {
        const id = href.replace('#', '');
        if (id === '') window.scrollTo({ top: 0, behavior: 'smooth' });
        else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/' + href);
      }
    } else {
      router.push(href);
    }
  };

  const agencyName = settings.agencyName.trim();
  const nameParts = agencyName ? agencyName.split(' ') : [];
  const nameFirst = nameParts[0] ?? '';
  const nameRest = nameParts.slice(1).join(' ');
  const logoSrc = settings.logoUrl ?? '';

  const navItems = [
    { label: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629', href: '#' },
    { label: '\u0628\u0627\u0642\u0627\u062a\u0646\u0627', href: '#packages' },
    { label: '\u062d\u062c\u0632 \u0637\u064a\u0631\u0627\u0646', href: '/flights' },
    { label: '\u062d\u062c\u0632 \u0641\u0646\u062f\u0642', href: '/hotels' },
    { label: '\u0639\u0646 \u0627\u0644\u0648\u0643\u0627\u0644\u0629', href: '#about' },
  ];

  if (!settingsLoaded) return null;

  return (
    <>
      <style>{headerKeyframes}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1002,
        background: scrolled ? 'rgba(6,13,36,0.97)' : 'rgba(6,13,36,0.85)',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'blur(14px)',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(201,168,76,0.15)',
        boxShadow: scrolled ? '0 4px 50px rgba(0,0,0,0.5)' : '0 2px 20px rgba(0,0,0,0.2)',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        height: '72px', display: 'flex', alignItems: 'center', padding: '0 2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>

          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', opacity: 1, transition: 'opacity 0.3s', padding: 0 }}>
            {logoSrc ? (
              <div style={{ position: 'relative' }}>
                <img src={logoSrc} alt={agencyName || '\u0634\u0639\u0627\u0631'} style={{ width: '46px', height: '46px', objectFit: 'contain', borderRadius: '12px', border: '1px solid rgba(201,168,76,0.3)', boxShadow: '0 2px 16px rgba(201,168,76,0.2)' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
              </div>
            ) : (
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #C9A84C, #a8862e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060d24', fontSize: '18px', fontWeight: 900, boxShadow: '0 2px 16px rgba(201,168,76,0.3)' }}>
                {agencyName.charAt(0) || 'S'}
              </div>
            )}
            {agencyName && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '17px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.3px' }}>
                  <span style={{ color: '#C9A84C' }}>{nameFirst}</span>
                  {nameRest && <span style={{ color: '#fff', marginRight: '5px' }}> {nameRest}</span>}
                </div>
                <div style={{ color: 'rgba(201,168,76,0.6)', fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '2px' }}>Travel & Tourism</div>
              </div>
            )}
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }} className="desktop-nav">
            {navItems.map(item => (
              <button key={item.label} onClick={() => navigate(item.href)} className="nav-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: '13.5px', fontWeight: 600, fontFamily: 'Cairo, sans-serif', padding: '9px 15px', borderRadius: '10px', transition: 'all 0.2s', letterSpacing: '0.2px' }}>
                {item.label}
              </button>
            ))}
            {services.length > 0 && (
              <div ref={servicesRef} style={{ position: 'relative' }}>
                <button onClick={() => setServicesOpen(v => !v)} className="nav-btn" style={{ background: servicesOpen ? 'rgba(201,168,76,0.1)' : 'none', border: 'none', cursor: 'pointer', color: servicesOpen ? '#C9A84C' : 'rgba(255,255,255,0.8)', fontSize: '13.5px', fontWeight: 600, fontFamily: 'Cairo, sans-serif', padding: '9px 15px', borderRadius: '10px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {'\u062e\u062f\u0645\u0627\u062a\u0646\u0627'}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }}>
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
                {servicesOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: 'linear-gradient(145deg, #0d1a3a, #0a1530)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '18px', padding: '10px', minWidth: '230px', boxShadow: '0 24px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.06)', zIndex: 100, animation: 'slideDown 0.2s ease' }}>
                    <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)', marginBottom: '8px' }} />
                    {services.map(s => (
                      <button key={s.id} className="service-item" onClick={() => { if (isHome) { window.dispatchEvent(new CustomEvent('selectService', { detail: s.slug })); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50); setServicesOpen(false); } else { navigate('/services/' + s.slug); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600, fontFamily: 'Cairo, sans-serif', padding: '10px 16px', borderRadius: '10px', textAlign: 'right', transition: 'all 0.2s' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(201,168,76,0.5)', flexShrink: 0 }} />
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {mounted && (
              isLoggedIn ? (
                <button onClick={() => navigate('/account')} className="account-btn" style={{ background: 'linear-gradient(135deg, #0A7EB5, #065a82)', color: '#fff', padding: '9px 20px', borderRadius: '11px', fontSize: '13px', border: '1px solid rgba(10,126,181,0.3)', cursor: 'pointer', fontWeight: 700, fontFamily: 'Cairo, sans-serif', transition: 'all 0.2s', letterSpacing: '0.3px', boxShadow: '0 4px 20px rgba(10,126,181,0.3)', display: 'flex', alignItems: 'center', gap: '7px', animation: 'pulseBtn 3s ease-in-out infinite' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {'\u062d\u0633\u0627\u0628\u064a'}
                </button>
              ) : (
                <button onClick={() => navigate('/login')} className="account-btn-gold" style={{ background: 'linear-gradient(135deg, #C9A84C, #a8862e)', color: '#060d24', padding: '9px 20px', borderRadius: '11px', fontSize: '13px', border: '1px solid rgba(201,168,76,0.2)', cursor: 'pointer', fontWeight: 800, fontFamily: 'Cairo, sans-serif', transition: 'all 0.2s', letterSpacing: '0.3px', boxShadow: '0 4px 20px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  {'\u062f\u062e\u0648\u0644'}
                </button>
              )
            )}
            <button onClick={() => setMobileOpen(v => !v)} className="hamburger-btn" style={{ display: 'none', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '11px', width: '44px', height: '44px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }} id="hamburger-btn">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                <span style={{ display: 'block', width: mobileOpen ? '18px' : '20px', height: '2px', background: '#C9A84C', borderRadius: '2px', transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none', transition: 'all 0.25s' }} />
                <span style={{ display: 'block', width: '14px', height: '2px', background: '#C9A84C', borderRadius: '2px', opacity: mobileOpen ? 0 : 1, transition: 'all 0.25s' }} />
                <span style={{ display: 'block', width: mobileOpen ? '18px' : '20px', height: '2px', background: '#C9A84C', borderRadius: '2px', transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none', transition: 'all 0.25s' }} />
              </div>
            </button>
          </div>
        </div>
      </header>

      <div style={{ position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 1001, height: '2px', background: 'linear-gradient(90deg, transparent 0%, #C9A84C 20%, #E8C86A 50%, #C9A84C 80%, transparent 100%)', backgroundSize: '200% 100%', opacity: scrolled ? 1 : 0.45, transition: 'opacity 0.35s', animation: 'accentLine 4s linear infinite' }} />

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1003, background: 'rgba(0,0,0,0.65)', WebkitBackdropFilter: 'blur(6px)' }} />
      )}

      <div style={{ position: 'fixed', top: 0, right: mobileOpen ? 0 : '-100%', width: '80%', maxWidth: '320px', height: '100vh', zIndex: 1004, background: 'linear-gradient(180deg, #060d24 0%, #080e28 100%)', borderLeft: '1px solid rgba(201,168,76,0.2)', boxShadow: '-20px 0 80px rgba(0,0,0,0.7)', transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(201,168,76,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {logoSrc ? (
              <img src={logoSrc} alt="logo" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(201,168,76,0.3)' }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #C9A84C, #a8862e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060d24', fontSize: '14px', fontWeight: 900 }}>
                {agencyName.charAt(0) || 'S'}
              </div>
            )}
            <div>
              <div style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 800 }}>{agencyName}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px' }}>Travel & Tourism</div>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: '1rem', flex: 1 }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ color: 'rgba(201,168,76,0.5)', fontSize: '9px', fontWeight: 800, letterSpacing: '2.5px', padding: '8px 14px', textTransform: 'uppercase' }}>
              {'\u0627\u0644\u0635\u0641\u062d\u0627\u062a'}
            </div>
            {navItems.map(item => (
              <button key={item.label} onClick={() => navigate(item.href)} className="mobile-nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: '15px', fontWeight: 600, fontFamily: 'Cairo, sans-serif', padding: '12px 16px', borderRadius: '10px', textAlign: 'right', transition: 'all 0.2s', animation: 'drawerIn 0.3s ease' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(201,168,76,0.4)', flexShrink: 0 }} />
                {item.label}
              </button>
            ))}
          </div>
          {services.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ color: 'rgba(201,168,76,0.5)', fontSize: '9px', fontWeight: 800, letterSpacing: '2.5px', padding: '8px 14px', textTransform: 'uppercase' }}>
                {'\u062e\u062f\u0645\u0627\u062a\u0646\u0627'}
              </div>
              {services.map(s => (
                <button key={s.id} onClick={() => { if (isHome) { window.dispatchEvent(new CustomEvent('selectService', { detail: s.slug })); setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50); setMobileOpen(false); } else { navigate('/services/' + s.slug); } }} className="mobile-nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 600, fontFamily: 'Cairo, sans-serif', padding: '11px 16px', borderRadius: '10px', textAlign: 'right', transition: 'all 0.2s' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0, boxShadow: '0 0 6px rgba(201,168,76,0.5)' }} />
                  {s.title}
                </button>
              ))}
            </div>
          )}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => navigate('/flights')} style={{ background: 'rgba(10,126,181,0.1)', border: '1px solid rgba(10,126,181,0.25)', color: '#0A7EB5', padding: '13px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', transition: 'all 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              {'\u062d\u062c\u0632 \u0637\u064a\u0631\u0627\u0646'}
            </button>
            <button onClick={() => navigate('/hotels')} style={{ background: 'rgba(10,126,181,0.1)', border: '1px solid rgba(10,126,181,0.25)', color: '#0A7EB5', padding: '13px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', transition: 'all 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>
              {'\u062d\u062c\u0632 \u0641\u0646\u062f\u0642'}
            </button>
          </div>
        </div>
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
          {mounted && (
            isLoggedIn ? (
              <button onClick={() => navigate('/account')} style={{ width: '100%', background: 'linear-gradient(135deg, #0A7EB5, #065a82)', color: '#fff', padding: '14px', borderRadius: '13px', fontSize: '14px', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(10,126,181,0.3)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {'\u062d\u0633\u0627\u0628\u064a'}
              </button>
            ) : (
              <button onClick={() => navigate('/login')} style={{ width: '100%', background: 'linear-gradient(135deg, #C9A84C, #a8862e)', color: '#060d24', padding: '14px', borderRadius: '13px', fontSize: '14px', border: 'none', cursor: 'pointer', fontWeight: 800, fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                {'\u062f\u062e\u0648\u0644 \u0627\u0644\u062d\u0633\u0627\u0628'}
              </button>
            )
          )}
          <button onClick={() => navigate('#contact')} style={{ width: '100%', marginTop: '10px', background: 'none', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', padding: '13px', borderRadius: '13px', fontSize: '14px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {'\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627'}
          </button>
        </div>
      </div>

      <button onClick={() => navigate('#contact')} className="contact-float" style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 999, background: 'linear-gradient(135deg, #C9A84C, #a8862e)', color: '#060d24', padding: '13px 26px', borderRadius: '50px', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: 800, fontFamily: 'Cairo, sans-serif', boxShadow: '0 6px 28px rgba(201,168,76,0.45)', letterSpacing: '0.3px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '8px', animation: 'floatContact 3s ease-in-out infinite' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        {'\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627'}
      </button>
    </>
  );
}