'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  {
    section: '\u0639\u0627\u0645',
    items: [
      {
        label: '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645',
        href: '/admin/dashboard',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>),
      },
    ],
  },
  {
    section: '\u0627\u0644\u0645\u062d\u062a\u0648\u0649',
    items: [
      {
        label: '\u0627\u0644\u0628\u0627\u0642\u0627\u062a \u0627\u0644\u0633\u064a\u0627\u062d\u064a\u0629',
        href: '/admin/packages',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>),
      },
      {
        label: '\u0627\u0644\u062e\u062f\u0645\u0627\u062a',
        href: '/admin/services',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>),
      },
      {
        label: '\u0643\u062a\u0627\u0644\u0648\u062c \u0627\u0644\u0641\u0646\u0627\u062f\u0642',
        href: '/admin/hotels-catalog',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
      },
    ],
  },
  {
    section: '\u0627\u0644\u0637\u0644\u0628\u0627\u062a',
    items: [
      {
        label: '\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062e\u062f\u0645\u0627\u062a',
        href: '/admin/service-requests',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>),
      },
      {
        label: '\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0629',
        href: '/admin/consultations',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
      },
      {
        label: '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u062a\u0648\u0627\u0635\u0644',
        href: '/admin/messages',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
      },
      {
        label: '\u062d\u062c\u0648\u0632\u0627\u062a \u0627\u0644\u0637\u064a\u0631\u0627\u0646',
        href: '/admin/flights',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>),
      },
      {
        label: '\u062d\u062c\u0648\u0632\u0627\u062a \u0627\u0644\u0641\u0646\u0627\u062f\u0642',
        href: '/admin/hotels',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>),
      },
    ],
  },
  {
    section: '\u0627\u0644\u0625\u062f\u0627\u0631\u0629',
    items: [
      {
        label: '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0627\u0644',
        href: '/admin/staff',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
      },
      {
        label: '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0648\u0642\u0639',
        href: '/admin/settings',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
      },
      {
        label: '\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645',
        href: '/admin/siteconfig',
        icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>),
      },
    ],
  },
];

const SIDEBAR_W = 260;
const SIDEBAR_COLLAPSED = 68;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [agencyName, setAgencyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d?.agencyName) setAgencyName(d.agencyName);
        if (d?.logoUrl) setLogoUrl(d.logoUrl);
      })
      .catch(() => {});
  }, []);

  if (pathname === '/admin/onboarding' || pathname === '/admin/login') {
    return <>{children}</>;
  }

  const displayName = agencyName || '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645';
  const sideW = isMobile ? SIDEBAR_W : (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_W);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch('/api/admin/auth/logout', { method: 'POST' }); } catch {}
    finally { router.push('/admin/login'); }
  };

  const currentLabel = NAV.flatMap(g => g.items).find(i =>
    pathname === i.href || pathname.startsWith(i.href + '/')
  )?.label || '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645';

  const sidebarStyle: React.CSSProperties = {
    width: SIDEBAR_W + 'px',
    background: 'linear-gradient(180deg, #060d24 0%, #080e28 60%, #060c20 100%)',
    borderLeft: '1px solid rgba(201,168,76,0.12)',
    position: 'fixed',
    top: 0,
    right: isMobile ? (mobileOpen ? '0' : `-${SIDEBAR_W}px`) : '0',
    bottom: 0,
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    transition: 'right 0.28s cubic-bezier(.4,0,.2,1), width 0.28s cubic-bezier(.4,0,.2,1)',
    overflow: 'hidden',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
    ...(!isMobile && collapsed ? { width: SIDEBAR_COLLAPSED + 'px' } : {}),
  };

  const SidebarContent = () => (
    <aside style={sidebarStyle}>
      {/* Logo area */}
      <div style={{ height: '72px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(201,168,76,0.1)', gap: '12px', flexShrink: 0, position: 'relative' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #C9A84C 0%, #a8862e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060d24', fontSize: '15px', fontWeight: 900, flexShrink: 0, boxShadow: '0 2px 12px rgba(201,168,76,0.3)', overflow: 'hidden' }}>
          {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{displayName.charAt(0)}</span>}
        </div>
        {(!collapsed || isMobile) && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
            <div style={{ color: 'rgba(201,168,76,0.5)', fontSize: '10px', letterSpacing: '2px', marginTop: '2px', whiteSpace: 'nowrap' }}>ADMIN PANEL</div>
          </div>
        )}
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', color: 'rgba(201,168,76,0.6)', cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginRight: collapsed ? 'auto' : undefined, marginLeft: collapsed ? 'auto' : undefined, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', color: 'rgba(201,168,76,0.6)', cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
            {collapsed ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(group => (
          <div key={group.section} style={{ marginBottom: '4px' }}>
            {(!collapsed || isMobile) && (
              <div style={{ color: 'rgba(201,168,76,0.35)', fontSize: '9px', fontWeight: 800, letterSpacing: '2px', padding: '14px 20px 5px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{group.section}</div>
            )}
            {group.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              const hovered = hoveredHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={(collapsed && !isMobile) ? item.label : ''}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onMouseLeave={() => setHoveredHref(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '11px',
                    padding: (collapsed && !isMobile) ? '12px 0' : '10px 20px',
                    justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start',
                    background: active ? 'linear-gradient(90deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.04) 100%)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                    borderRight: active ? '3px solid #C9A84C' : '3px solid transparent',
                    color: active ? '#C9A84C' : hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.42)',
                    textDecoration: 'none', fontSize: '13px', fontWeight: active ? 700 : 500,
                    transition: 'all 0.15s ease', whiteSpace: 'nowrap', position: 'relative',
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : hovered ? 0.85 : 0.55, transition: 'opacity 0.15s' }}>{item.icon}</span>
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                  {active && (!collapsed || isMobile) && (
                    <span style={{ marginRight: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', boxShadow: '0 0 6px rgba(201,168,76,0.6)', flexShrink: 0 }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.28)', fontSize: '12px', textDecoration: 'none', padding: '8px 10px', borderRadius: '8px', justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start', transition: 'all 0.15s' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          {(!collapsed || isMobile) && <span>\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0645\u0648\u0642\u0639</span>}
        </Link>
        <button onClick={handleLogout} disabled={loggingOut} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(239,68,68,0.55)', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', justifyContent: (collapsed && !isMobile) ? 'center' : 'flex-start', background: 'transparent', border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer', width: '100%', fontFamily: 'Cairo, sans-serif', transition: 'all 0.15s' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {(!collapsed || isMobile) && <span>{loggingOut ? '\u062c\u0627\u0631\u064a \u0627\u0644\u062e\u0631\u0648\u062c...' : '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c'}</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060d24', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }}
        />
      )}

      <SidebarContent />

      {/* Main content */}
      <div style={{
        flex: 1,
        marginRight: isMobile ? '0' : sideW + 'px',
        transition: 'margin 0.28s cubic-bezier(.4,0,.2,1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#060d24',
        minWidth: 0,
      }}>
        {/* Header */}
        <header style={{ height: '64px', background: 'rgba(6,13,36,0.96)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0, WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile burger */}
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '8px', color: 'rgba(201,168,76,0.8)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            <div style={{ width: '3px', height: '20px', borderRadius: '2px', background: 'linear-gradient(180deg, #C9A84C, #0A7EB5)' }} />
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: isMobile ? '12px' : '14px', fontWeight: 700 }}>{currentLabel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '20px', padding: '5px 12px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.7)' }} />
                <span style={{ color: 'rgba(16,185,129,0.9)', fontSize: '11px', fontWeight: 700 }}>\u0645\u062a\u0635\u0644</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isMobile && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{displayName}</div>
                  <div style={{ color: 'rgba(201,168,76,0.5)', fontSize: '10px', letterSpacing: '1px' }}>ADMINISTRATOR</div>
                </div>
              )}
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #C9A84C, #a8862e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060d24', fontSize: '14px', fontWeight: 900, overflow: 'hidden', flexShrink: 0 }}>
                {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{displayName.charAt(0)}</span>}
              </div>
            </div>
            <button onClick={handleLogout} disabled={loggingOut} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', color: 'rgba(239,68,68,0.75)', fontSize: '12px', fontWeight: 600, padding: isMobile ? '7px 10px' : '7px 14px', cursor: loggingOut ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', transition: 'all 0.15s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {!isMobile && <span>{loggingOut ? '\u062c\u0627\u0631\u064a...' : '\u062e\u0631\u0648\u062c'}</span>}
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: isMobile ? '1rem' : '2rem', overflowY: 'auto', background: 'linear-gradient(180deg, #060d24 0%, #080e2a 100%)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}