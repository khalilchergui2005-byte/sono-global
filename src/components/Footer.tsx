'use client';
import { useEffect, useState, useRef } from 'react';

type SiteSettings = {
  agencyName: string;
  logoUrl: string;
  phones: string[];
  whatsapp: string[];
  emails: string[];
  facebook: string[];
  instagram: string[];
  tiktok: string[];
  youtube: string[];
  address: string;
  mapsUrl: string;
  workingHours: string;
  agencyDescription: string;
};

type Service = {
  id: string;
  title: string;
  slug: string;
  visible: boolean;
  order: number;
};

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return visible;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [email, setEmail] = useState('');
  const [subDone, setSubDone] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: SiteSettings & { error?: string }) => { if (data && !data.error) setSettings(data as SiteSettings); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setServices((data as Service[]).filter((s: Service) => s.visible).sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => {});
  }, []);

  const agencyName = settings?.agencyName?.trim() || '';
  const logoSrc    = settings?.logoUrl?.trim()    || '';
  const desc       = settings?.agencyDescription?.trim() || '';
  const nameParts  = agencyName ? agencyName.split(' ') : [];
  const nameFirst  = nameParts[0] || '';
  const nameRest   = nameParts.slice(1).join(' ') || '';
  const phones     = settings?.phones?.filter(Boolean)    || [];
  const emails     = settings?.emails?.filter(Boolean)    || [];
  const whatsapps  = settings?.whatsapp?.filter(Boolean)  || [];
  const facebooks  = settings?.facebook?.filter(Boolean)  || [];
  const instagrams = settings?.instagram?.filter(Boolean) || [];
  const tiktoks    = settings?.tiktok?.filter(Boolean)    || [];
  const youtubes   = settings?.youtube?.filter(Boolean)   || [];
  const address    = settings?.address      || '';
  const mapsUrl    = settings?.mapsUrl      || '';
  const hours      = settings?.workingHours || '';

  const quickLinks = [
    { label: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629', href: '/' },
    { label: '\u0627\u0644\u0628\u0627\u0642\u0627\u062a', href: '/#packages' },
    { label: '\u0627\u0644\u0637\u064a\u0631\u0627\u0646', href: '/flights' },
    { label: '\u0627\u0644\u0641\u0646\u0627\u062f\u0642', href: '/hotels' },
    { label: '\u0639\u0646 \u0627\u0644\u0648\u0643\u0627\u0644\u0629', href: '/#about' },
    { label: '\u0627\u062a\u0635\u0644 \u0628\u0646\u0627', href: '/#contact' },
  ];

  const socialLinks = [
    ...facebooks.map(url => ({ url, icon: 'fb', bg: '#1877F2', label: 'Facebook' })),
    ...instagrams.map(url => ({ url, icon: 'ig', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', label: 'Instagram' })),
    ...whatsapps.map(num => ({ url: 'https://wa.me/' + num.replace(/\D/g,''), icon: 'wa', bg: '#25D366', label: 'WhatsApp' })),
    ...tiktoks.map(url => ({ url, icon: 'tt', bg: '#000', label: 'TikTok' })),
    ...youtubes.map(url => ({ url, icon: 'yt', bg: '#FF0000', label: 'YouTube' })),
  ];

  const subscribe = async () => {
    if (!email.includes('@')) return;
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setSubDone(true);
    } catch { setSubDone(true); }
  };

  return (
    <footer ref={ref} style={{ background: 'linear-gradient(180deg,#060d24 0%,#040a1a 100%)', fontFamily: 'Cairo,Arial,sans-serif', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(10,126,181,0.06) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.04) 0%,transparent 70%)' }} />
        {[...Array(20)].map((_,i) => (
          <div key={i} style={{ position: 'absolute', width: '1px', height: '1px', borderRadius: '50%', background: 'rgba(201,168,76,0.4)', top: `${Math.sin(i*7.3)*40+50}%`, left: `${(i*5.1)%100}%`, opacity: visible ? 1 : 0, transition: `opacity ${0.5+i*0.1}s ease`, boxShadow: '0 0 3px rgba(201,168,76,0.6)' }} />
        ))}
      </div>

      <div style={{ borderBottom: '1px solid rgba(10,126,181,0.15)', padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 900, margin: '0 0 8px' }}>
              {'\u0627\u0634\u062a\u0631\u0643 \u0641\u064a '}<span style={{ color: '#C9A84C' }}>{'\u0646\u0634\u0631\u062a\u0646\u0627'}</span>
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
              {'\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0623\u062d\u062f\u062b \u0627\u0644\u0639\u0631\u0648\u0636 \u0648\u0627\u0644\u0628\u0627\u0642\u0627\u062a \u0627\u0644\u062d\u0635\u0631\u064a\u0629'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', maxWidth: '480px' }}>
            {subDone ? (
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '14px 20px', color: '#10b981', fontWeight: 700, textAlign: 'center', fontSize: '14px' }}>
                {'\u2713 \u062a\u0645 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0646\u062c\u0627\u062d!'}
              </div>
            ) : (
              <>
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void subscribe()}
                  placeholder={'\u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a...'}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 18px', color: 'white', fontSize: '14px', fontFamily: 'Cairo,sans-serif', outline: 'none', direction: 'ltr' }}
                />
                <button
                  onClick={() => void subscribe()}
                  style={{ background: 'linear-gradient(135deg,#C9A84C,#a8873a)', color: '#060d24', border: 'none', borderRadius: '14px', padding: '14px 24px', fontSize: '14px', fontWeight: 900, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', whiteSpace: 'nowrap' }}
                >
                  {'\u0627\u0634\u062a\u0631\u0643'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{'@media(max-width:900px){.footer-grid{grid-template-columns:1fr 1fr !important;gap:2rem !important;}}@media(max-width:560px){.footer-grid{grid-template-columns:1fr !important;}}'}</style>
      <div className='footer-grid' style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem 3rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr', gap: '3rem' }}>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            {logoSrc && (
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.3)', flexShrink: 0, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={logoSrc} alt='' style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
              </div>
            )}
            {agencyName && (
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                  {nameFirst}{nameRest && <span style={{ color: '#C9A84C' }}> {nameRest}</span>}
                </div>
                <div style={{ color: 'rgba(201,168,76,0.5)', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '2px' }}>Travel & Tourism</div>
              </div>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 2, marginBottom: '2rem', maxWidth: '280px' }}>
            {desc || '\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631 \u0645\u062a\u062e\u0635\u0635\u0629 \u062a\u0642\u062f\u0645 \u062e\u062f\u0645\u0627\u062a \u0634\u0627\u0645\u0644\u0629 \u0645\u0646 \u062a\u0630\u0627\u0643\u0631 \u0648\u0641\u0646\u0627\u062f\u0642 \u0648\u0628\u0627\u0642\u0627\u062a \u0645\u0646\u0638\u0645\u0629 \u0648\u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a \u0647\u0627\u062f\u0641\u0629.'}
          </p>
          {socialLinks.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target='_blank' rel='noreferrer'
                  title={s.label}
                  onMouseEnter={() => setHovered('s'+i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s,box-shadow 0.2s', transform: hovered==='s'+i ? 'translateY(-4px) scale(1.1)' : 'none', boxShadow: hovered==='s'+i ? '0 8px 20px rgba(0,0,0,0.4)' : 'none', textDecoration: 'none' }}>
                  {s.icon==='fb' && <svg width='16' height='16' viewBox='0 0 24 24' fill='white'><path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/></svg>}
                  {s.icon==='ig' && <svg width='16' height='16' viewBox='0 0 24 24' fill='white'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'/></svg>}
                  {s.icon==='wa' && <svg width='16' height='16' viewBox='0 0 24 24' fill='white'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/></svg>}
                  {s.icon==='tt' && <svg width='16' height='16' viewBox='0 0 24 24' fill='white'><path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z'/></svg>}
                  {s.icon==='yt' && <svg width='16' height='16' viewBox='0 0 24 24' fill='white'><path d='M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>}
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <div style={{ width: '3px', height: '18px', background: 'linear-gradient(180deg,#0A7EB5,#C9A84C)', borderRadius: '2px' }} />
            <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 800, margin: 0 }}>{'\u0631\u0648\u0627\u0628\u0637 \u0633\u0631\u064a\u0639\u0629'}</h4>
          </div>
          {quickLinks.map(link => (
            <a key={link.href} href={link.href}
              onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.paddingRight='20px'; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.paddingRight='0'; }}
              style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '12px', textDecoration: 'none', transition: 'all 0.2s', paddingRight: '0' }}>
              {'\u2022 '}{link.label}
            </a>
          ))}
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <div style={{ width: '3px', height: '18px', background: 'linear-gradient(180deg,#0A7EB5,#C9A84C)', borderRadius: '2px' }} />
            <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 800, margin: 0 }}>{'\u062e\u062f\u0645\u0627\u062a\u0646\u0627'}</h4>
          </div>
          {services.map(s => (
            <a key={s.id} href={'/services/'+s.slug}
              onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.paddingRight='20px'; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.5)'; e.currentTarget.style.paddingRight='0'; }}
              style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '12px', textDecoration: 'none', transition: 'all 0.2s', paddingRight: '0' }}>
              {'\u2022 '}{s.title}
            </a>
          ))}
        </div>

        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <div style={{ width: '3px', height: '18px', background: 'linear-gradient(180deg,#0A7EB5,#C9A84C)', borderRadius: '2px' }} />
            <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 800, margin: 0 }}>{'\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627'}</h4>
          </div>
          {phones.map((p,i) => (
            <a key={i} href={'tel:'+p}
              style={{ display: 'flex', gap: '12px', marginBottom: '14px', textDecoration: 'none', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='#25D366'><path d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{p}</span>
            </a>
          ))}
          {emails.map((e,i) => (
            <a key={i} href={'mailto:'+e}
              style={{ display: 'flex', gap: '12px', marginBottom: '14px', textDecoration: 'none', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(234,67,53,0.12)', border: '1px solid rgba(234,67,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='#EA4335'><path d='M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{e}</span>
            </a>
          ))}
          {whatsapps.map((w,i) => (
            <a key={i} href={'https://wa.me/'+w.replace(/\D/g,'')} target='_blank' rel='noreferrer'
              style={{ display: 'flex', gap: '12px', marginBottom: '14px', textDecoration: 'none', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='#25D366'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{w}</span>
            </a>
          ))}
          {address && (
            <a href={mapsUrl||'#'} target={mapsUrl?'_blank':'_self'} rel='noreferrer'
              style={{ display: 'flex', gap: '12px', marginBottom: '14px', textDecoration: 'none', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='#C9A84C'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.7 }}>{address}</span>
            </a>
          )}
          {hours && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(10,126,181,0.12)', border: '1px solid rgba(10,126,181,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width='14' height='14' viewBox='0 0 24 24' fill='#0A7EB5'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z'/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{hours}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.4),rgba(10,126,181,0.4),transparent)' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
            {(agencyName ? '\u00a9 ' + currentYear + ' ' + agencyName : '\u00a9 ' + currentYear) + ' \u2014 \u062c\u0645\u064a\u0639 \u0627\u0644\u062d\u0642\u0648\u0642 \u0645\u062d\u0641\u0648\u0638\u0629'}
          </span>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { l: '\u0633\u064a\u0627\u0633\u0629 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629', h: '#' },
              { l: '\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645', h: '#' },
              { l: '\u0627\u062a\u0635\u0644 \u0628\u0646\u0627', h: '/#contact' },
            ].map(link => (
              <a key={link.h+link.l} href={link.h}
                onMouseEnter={e => (e.currentTarget.style.color='rgba(201,168,76,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.25)')}
                style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textDecoration: 'none', transition: 'color 0.2s' }}>
                {link.l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
