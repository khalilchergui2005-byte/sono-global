'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type AmadeusHotel = {
  hotelId: string; name: string; city: string;
  offerId?: string; room: string; beds: number;
  price: number; currency: string; source: 'amadeus';
};
type DBHotel = {
  id: string; name: string; city: string; country: string;
  stars: number; pricePerNight: number; currency: string;
  images: string[]; amenities: string[]; description: string;
  source: 'db';
};
type Hotel = AmadeusHotel | DBHotel;

const METHOD_LABELS: Record<string, string> = {
  cash: '\u062f\u0641\u0639 \u0646\u0642\u062f\u064a',
  chargily: '\u062f\u0641\u0639 \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a (Chargily)',
  bank_transfer: '\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a',
  ccp: '\u0628\u0631\u064a\u062f \u0627\u0644\u062c\u0632\u0627\u0626\u0631 (CCP)',
  cib: '\u0628\u0637\u0627\u0642\u0629 CIB',
  dahabia: 'Dahabia',
};

const AMENITY_ICONS: Record<string, string> = {
  wifi: 'WiFi', pool: '\u0645\u0633\u0628\u062d', gym: '\u0646\u0627\u062f\u064a \u0631\u064a\u0627\u0636\u064a',
  restaurant: '\u0645\u0637\u0639\u0645', parking: '\u0645\u0648\u0642\u0641', spa: 'Spa',
  bar: '\u0628\u0627\u0631', laundry: '\u063a\u0633\u064a\u0644', ac: '\u062a\u0643\u064a\u064a\u0641',
  tv: 'TV', breakfast: '\u0625\u0641\u0637\u0627\u0631 \u0645\u062c\u0627\u0646\u064a', airport: '\u0646\u0642\u0644 \u0645\u0637\u0627\u0631',
};

const STARS_UNICODE = '\u2605';

const INPUT: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px',
  padding: '14px 18px', color: 'white', fontSize: '14px',
  fontFamily: 'Cairo,sans-serif', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
const DARK_INP: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
  padding: '12px 16px', color: 'white', fontSize: '14px',
  fontFamily: 'Cairo,sans-serif', outline: 'none', boxSizing: 'border-box',
};

export default function HotelsPage() {
  const [cityCode, setCityCode] = useState('');
  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults]     = useState(2);
  const [rooms, setRooms]       = useState(1);
  const [hotels, setHotels]           = useState<Hotel[]>([]);
  const [searching, setSearching]     = useState(false);
  const [searched, setSearched]       = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected]     = useState<Hotel|null>(null);
  const [activeImg, setActiveImg]   = useState(0);
  const [form, setForm]             = useState({ name: '', phone: '', email: '', notes: '' });
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);
  const [bookError, setBookError]   = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [heroVisible, setHeroVisible] = useState(false);
  const [hoveredHotel, setHoveredHotel] = useState<number|null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);

  useEffect(() => {
    fetch('/api/siteconfig')
      .then(r => r.json())
      .then((d: { payment_methods?: string }) => {
        if (d.payment_methods) {
          const methods = d.payment_methods.split(',').map(m => m.trim()).filter(Boolean);
          setPaymentMethods(methods);
          if (methods.length > 0) setSelectedMethod(methods[0]);
        }
      })
      .catch(() => {});
  }, []);

  const search = async () => {
    if (!cityCode || !checkIn || !checkOut) { setSearchError('\u064a\u0631\u062c\u0649 \u062a\u0639\u0628\u0626\u0629 \u0643\u0648\u062f \u0627\u0644\u0645\u062f\u064a\u0646\u0629 \u0648\u062a\u0627\u0631\u064a\u062e\u064a \u0627\u0644\u062f\u062e\u0648\u0644 \u0648\u0627\u0644\u062e\u0631\u0648\u062c'); return; }
    setSearching(true); setSearchError(''); setHotels([]); setSearched(false);
    try {
      const [amadeusRes, dbRes] = await Promise.allSettled([
        fetch(`/api/amadeus/hotels/search?cityCode=${cityCode.trim()}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&rooms=${rooms}`),
        fetch('/api/admin/hotels-catalog'),
      ]);
      const combined: Hotel[] = [];
      if (amadeusRes.status==='fulfilled' && amadeusRes.value.ok) {
        const data = await amadeusRes.value.json() as { hotels?: AmadeusHotel[] };
        (data.hotels ?? []).forEach(h => combined.push({ ...h, source: 'amadeus' }));
      }
      if (dbRes.status==='fulfilled' && dbRes.value.ok) {
        const data = await dbRes.value.json() as (DBHotel & { visible: boolean })[];
        (Array.isArray(data) ? data : []).filter(h => h.visible).forEach(h => combined.push({ ...h, source: 'db' }));
      }
      setHotels(combined); setSearched(true);
      if (combined.length===0) setSearchError('\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0646\u0627\u062f\u0642 \u0645\u062a\u0627\u062d\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0628\u062d\u062b');
    } catch { setSearchError('\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b'); }
    finally { setSearching(false); }
  };

  const getPrice = (h: Hotel) => h.source==='amadeus' ? h.price : (h as DBHotel).pricePerNight;
  const getCity = (h: Hotel) => h.source==='db' ? h.city + ' \u2014 ' + (h as DBHotel).country : h.city;
  const nights = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000)) : 1;

  const openDetail = (h: Hotel) => { setSelected(h); setActiveImg(0); setSent(false); setForm({ name:'', phone:'', email:'', notes:'' }); setBookError(''); };

  const book = async () => {
    if (!form.name || !form.phone) { setBookError('\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0647\u0627\u062a\u0641 \u0645\u0637\u0644\u0648\u0628\u0627\u0646'); return; }
    if (!selectedMethod) { setBookError('\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639'); return; }
    setSending(true); setBookError('');
    try {
      const h = selected!;
      await fetch('/api/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotelName: h.name, city: getCity(h), checkIn, checkOut, adults, rooms, name: form.name, phone: form.phone, email: form.email, notes: form.notes, price: getPrice(h), source: h.source, paymentMethod: selectedMethod }) });
      setSent(true);
    } catch { setBookError('\u062d\u062f\u062b \u062e\u0637\u0623\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b'); }
    finally { setSending(false); }
  };

  const dbHotel = selected?.source==='db' ? (selected as DBHotel) : null;
  const amHotel = selected?.source==='amadeus' ? (selected as AmadeusHotel) : null;

  const FEAT_ITEMS = [
    { icon: '\u2605', label: '\u0641\u0646\u0627\u062f\u0642 \u0641\u0627\u062e\u0631\u0629' },
    { icon: '\u26a1', label: '\u062d\u062c\u0632 \u0641\u0648\u0631\u064a' },
    { icon: '\u2714', label: '\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631' },
    { icon: '\u2709', label: '\u062f\u0639\u0645 24/7' },
  ];

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#060d24 0%,#0a1628 50%,#060d24 100%)', fontFamily: 'Cairo,sans-serif', direction: 'rtl', paddingTop: '101px' }}>

        {/* ===== CINEMATIC HERO ===== */}
        <div ref={heroRef} style={{ position: 'relative', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4rem 2rem' }}>

          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 30%', opacity: 0.2 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(6,13,36,0.4) 0%,rgba(6,13,36,0.75) 60%,#060d24 100%)' }} />
          </div>

          <div style={{ position: 'absolute', top: '8%', left: '8%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.1) 0%,transparent 70%)', animation: 'pulse 7s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '8%', right: '5%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(10,126,181,0.1) 0%,transparent 70%)', animation: 'pulse 5s ease-in-out infinite 1s' }} />

          {[...Array(10)].map((_,i) => (
            <div key={i} style={{ position: 'absolute', width: '2px', height: '2px', borderRadius: '50%', background: i%2===0 ? 'rgba(201,168,76,0.7)' : 'rgba(10,126,181,0.6)', top: `${10+i*8}%`, left: `${(i*10.1)%90}%`, opacity: heroVisible ? 1 : 0, transition: `opacity ${1+i*0.2}s ease` }} />
          ))}

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '780px' }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '50px', padding: '8px 20px', marginBottom: '1.5rem', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.8s ease' }}>
              <span style={{ color: '#C9A84C', fontSize: '16px' }}>{'\u2605'}</span>
              <span style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>{'\u0641\u0646\u0627\u062f\u0642 \u0641\u0627\u062e\u0631\u0629 \u0628\u0623\u0633\u0639\u0627\u0631 \u062d\u0635\u0631\u064a\u0629'}</span>
            </div>

            <h1 style={{ color: 'white', fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 1rem', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s ease 0.1s' }}>
              {'\u0625\u0642\u0627\u0645\u0629 '}<span style={{ background: 'linear-gradient(135deg,#C9A84C,#0A7EB5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{'\u0644\u0627 \u062a\u064f\u0646\u0633\u0649'}</span>{' \u0628\u062a\u062c\u0631\u0628\u0629 \u0641\u0646\u062f\u0642\u064a\u0629 \u0631\u0627\u0642\u064a\u0629'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px,2vw,16px)', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 2.5rem', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.9s ease 0.2s' }}>
              {'\u0645\u0646 \u0627\u0644\u0641\u0646\u0627\u062f\u0642 \u0627\u0644\u0641\u0627\u062e\u0631\u0629 \u0625\u0644\u0649 \u0627\u0644\u0625\u0642\u0627\u0645\u0627\u062a \u0627\u0644\u0639\u0627\u0626\u0644\u064a\u0629 \u2014 \u0646\u062c\u062f \u0644\u0643 \u0627\u0644\u062e\u064a\u0627\u0631 \u0627\u0644\u0645\u062b\u0627\u0644\u064a \u0628\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', opacity: heroVisible ? 1 : 0, transition: 'all 0.9s ease 0.3s' }}>
              {FEAT_ITEMS.map((f,i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 22px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{f.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== SEARCH SECTION ===== */}
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u0643\u0648\u062f \u0627\u0644\u0645\u062f\u064a\u0646\u0629 (IATA) \u2014 \u0645\u062b\u0627\u0644: PAR, LON, DXB, ALG'}</label>
              <div style={{ position: 'relative' }}>
                <input value={cityCode} onChange={e => setCityCode(e.target.value.toUpperCase())} placeholder='ALG'
                  style={{ ...INPUT, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '20px', fontWeight: 900, textAlign: 'center' }} />
              </div>
            </div>

            <div className='hotels-dates-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062f\u062e\u0648\u0644'}</label>
                <input type='date' value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ ...INPUT, colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062e\u0631\u0648\u062c'}</label>
                <input type='date' value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ ...INPUT, colorScheme: 'dark' }} />
              </div>
            </div>

            <div className='hotels-pax-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u0639\u062f\u062f \u0627\u0644\u0628\u0627\u0644\u063a\u064a\u0646'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '8px 14px', height: '52px' }}>
                  <button onClick={() => setAdults(Math.max(1,adults-1))} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>-</button>
                  <span style={{ color: 'white', fontWeight: 900, flex: 1, textAlign: 'center', fontSize: '18px' }}>{adults}</span>
                  <button onClick={() => setAdults(adults+1)} style={{ background: 'rgba(201,168,76,0.3)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u0639\u062f\u062f \u0627\u0644\u063a\u0631\u0641'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '8px 14px', height: '52px' }}>
                  <button onClick={() => setRooms(Math.max(1,rooms-1))} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>-</button>
                  <span style={{ color: 'white', fontWeight: 900, flex: 1, textAlign: 'center', fontSize: '18px' }}>{rooms}</span>
                  <button onClick={() => setRooms(rooms+1)} style={{ background: 'rgba(201,168,76,0.3)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                </div>
              </div>
            </div>

            {searchError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', color: '#f87171', fontSize: '13px', marginBottom: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#f87171' strokeWidth='2'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>
                {searchError}
              </div>
            )}

            <button onClick={() => void search()} disabled={searching}
              style={{ width: '100%', background: searching ? 'rgba(71,85,105,0.8)' : 'linear-gradient(135deg,#C9A84C 0%,#a8873a 50%,#0A7EB5 100%)', backgroundSize: '200% auto', color: searching ? 'white' : '#060d24', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '16px', fontWeight: 900, cursor: searching ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.3s', boxShadow: searching ? 'none' : '0 8px 30px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {searching ? (
                <>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' style={{ animation: 'spin 1s linear infinite' }}><path d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' opacity='.3'/><path d='M21 12a9 9 0 00-9-9'/></svg>
                  {'\u062c\u0627\u0631\u064a \u0627\u0644\u0628\u062d\u062b...'}
                </>
              ) : (
                <>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#060d24' strokeWidth='2.5'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/></svg>
                  {'\u0628\u062d\u062b \u0639\u0646 \u0641\u0646\u0627\u062f\u0642'}
                </>
              )}
            </button>
          </div>

          {/* ===== RESULTS ===== */}
          {searched && hotels.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ color: 'white', fontSize: '17px', fontWeight: 900, margin: 0 }}>
                  <span style={{ color: '#C9A84C' }}>{hotels.length}</span> {'\u0641\u0646\u062f\u0642 \u0645\u062a\u0627\u062d'}
                </h3>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{cityCode} | {nights} {'\u0644\u064a\u0644\u0629'}</span>
              </div>
              {hotels.map((h,i) => (
                <div key={i}
                  onClick={() => openDetail(h)}
                  onMouseEnter={() => setHoveredHotel(i)}
                  onMouseLeave={() => setHoveredHotel(null)}
                  style={{ background: hoveredHotel===i ? 'rgba(201,168,76,0.06)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (hoveredHotel===i ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'), borderRadius: '18px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s', transform: hoveredHotel===i ? 'translateY(-2px)' : 'none', boxShadow: hoveredHotel===i ? '0 12px 40px rgba(201,168,76,0.12)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'white', fontSize: '17px', fontWeight: 800 }}>{h.name}</span>
                        <span style={{ background: h.source==='amadeus' ? 'rgba(10,126,181,0.15)' : 'rgba(16,185,129,0.15)', color: h.source==='amadeus' ? '#0A7EB5' : '#10b981', border: '1px solid ' + (h.source==='amadeus' ? 'rgba(10,126,181,0.3)' : 'rgba(16,185,129,0.3)'), borderRadius: '6px', padding: '2px 10px', fontSize: '10px', fontWeight: 700 }}>
                          {h.source==='amadeus' ? 'Amadeus' : '\u0648\u0643\u0627\u0644\u062a\u0646\u0627'}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '6px' }}>{getCity(h)}</div>
                      {h.source==='db' && (h as DBHotel).stars > 0 && (
                        <div style={{ color: '#C9A84C', fontSize: '16px', marginBottom: '8px', letterSpacing: '2px' }}>
                          {STARS_UNICODE.repeat((h as DBHotel).stars)}
                        </div>
                      )}
                      {h.source==='db' && (h as DBHotel).amenities?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(h as DBHotel).amenities.slice(0,4).map((a,ai) => (
                            <span key={ai} style={{ background: 'rgba(10,126,181,0.08)', color: '#0A7EB5', border: '1px solid rgba(10,126,181,0.15)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' }}>
                              {AMENITY_ICONS[a] ?? a}
                            </span>
                          ))}
                          {(h as DBHotel).amenities.length > 4 && (
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', padding: '2px 4px' }}>+{(h as DBHotel).amenities.length-4}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'left', flexShrink: 0 }}>
                      <div style={{ color: '#C9A84C', fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{getPrice(h).toLocaleString()}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginBottom: '12px' }}>DZD / {'\u0644\u064a\u0644\u0629'}</div>
                      <div style={{ background: 'linear-gradient(135deg,#C9A84C,#a8873a)', color: '#060d24', borderRadius: '10px', padding: '9px 20px', fontSize: '13px', fontWeight: 900, textAlign: 'center', boxShadow: '0 4px 15px rgba(201,168,76,0.25)' }}>
                        {'\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== MODAL ===== */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={() => setSelected(null)}>
            <div style={{ background: 'linear-gradient(160deg,#0d1530,#0a1225)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto', direction: 'rtl', fontFamily: 'Cairo,sans-serif', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}>

              {dbHotel && dbHotel.images?.length > 0 ? (
                <div style={{ position: 'relative', height: '240px', overflow: 'hidden', borderRadius: '24px 24px 0 0' }}>
                  <img src={dbHotel.images[activeImg]} alt={dbHotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(13,21,48,0.6) 0%,transparent 50%)' }} />
                  {dbHotel.images.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                      {dbHotel.images.map((_,ii) => (
                        <button key={ii} onClick={() => setActiveImg(ii)} style={{ width: activeImg===ii ? '24px' : '8px', height: '8px', borderRadius: '4px', background: activeImg===ii ? 'white' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
                      ))}
                    </div>
                  )}
                  <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                </div>
              ) : (
                <div style={{ background: 'linear-gradient(135deg,rgba(10,126,181,0.3),rgba(201,168,76,0.2))', padding: '1.75rem', borderRadius: '24px 24px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>{selected.name}</div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
                </div>
              )}

              <div style={{ padding: '1.75rem' }}>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
                      <svg width='30' height='30' viewBox='0 0 24 24' fill='none' stroke='#10b981' strokeWidth='2.5' strokeLinecap='round'><polyline points='20 6 9 17 4 12'/></svg>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginBottom: '8px' }}>{'\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628\u0643 \u0628\u0646\u062c\u0627\u062d'}</p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '24px' }}>{'\u0633\u0646\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0642\u0631\u064a\u0628\u0627\u064b \u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632'}</p>
                    <button style={{ background: 'linear-gradient(135deg,#C9A84C,#a8873a)', color: '#060d24', border: 'none', borderRadius: '12px', padding: '12px 32px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Cairo,sans-serif', fontSize: '14px' }} onClick={() => setSelected(null)}>
                      {'\u0625\u063a\u0644\u0627\u0642'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 4px' }}>{selected.name}</h2>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '6px' }}>{getCity(selected)}</div>
                          {dbHotel && dbHotel.stars > 0 && (
                            <div style={{ color: '#C9A84C', fontSize: '20px', letterSpacing: '3px' }}>{STARS_UNICODE.repeat(dbHotel.stars)}</div>
                          )}
                          {amHotel && (
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{amHotel.room} | {amHotel.beds} {'\u0633\u0631\u064a\u0631'}</div>
                          )}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ color: '#C9A84C', fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>{getPrice(selected).toLocaleString()}</div>
                          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>DZD / {'\u0644\u064a\u0644\u0629'}</div>
                        </div>
                      </div>
                    </div>

                    {dbHotel?.description && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1rem', marginBottom: '1rem' }}>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '6px' }}>{'\u0639\u0646 \u0627\u0644\u0641\u0646\u062f\u0642'}</div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, lineHeight: 1.8 }}>{dbHotel.description}</p>
                      </div>
                    )}

                    {(dbHotel?.amenities ?? []).length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '8px' }}>{'\u0627\u0644\u0645\u0631\u0627\u0641\u0642 \u0648\u0627\u0644\u062e\u062f\u0645\u0627\u062a'}</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(dbHotel?.amenities ?? []).map((a,ai) => (
                            <span key={ai} style={{ background: 'rgba(10,126,181,0.08)', color: '#0A7EB5', border: '1px solid rgba(10,126,181,0.2)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px' }}>
                              {AMENITY_ICONS[a] ?? a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className='hotels-summary-grid' style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { label: '\u0627\u0644\u062f\u062e\u0648\u0644', value: checkIn || '\u2014' },
                        { label: '\u0627\u0644\u062e\u0631\u0648\u062c', value: checkOut || '\u2014' },
                        { label: '\u0639\u062f\u062f \u0627\u0644\u0644\u064a\u0627\u0644\u064a', value: nights + ' \u0644\u064a\u0644\u0629' },
                        { label: '\u0627\u0644\u0628\u0627\u0644\u063a\u0648\u0646', value: adults + ' \u0628\u0627\u0644\u063a' },
                        { label: '\u0639\u062f\u062f \u0627\u0644\u063a\u0631\u0641', value: rooms + ' \u063a\u0631\u0641\u0629' },
                        { label: '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a', value: (getPrice(selected)*nights*rooms).toLocaleString() + ' DZD' },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{row.label}</span>
                          <span style={{ color: row.label==='\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a' ? '#C9A84C' : 'white', fontSize: '13px', fontWeight: row.label==='\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a' ? 900 : 600 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '1rem' }}>{'\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u062c\u0632'}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className='hotels-book-names' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>{'\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 *'}</label>
                            <input style={DARK_INP} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={'\u0627\u0633\u0645\u0643 \u0627\u0644\u0643\u0627\u0645\u0644'} />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>{'\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 *'}</label>
                            <input style={{ ...DARK_INP, direction: 'ltr' }} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder='+213...' />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>{'\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a'}</label>
                          <input style={{ ...DARK_INP, direction: 'ltr' }} type='email' value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder='email@example.com' />
                        </div>
                        <div>
                          <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>{'\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629'}</label>
                          <textarea style={{ ...DARK_INP, height: '72px', resize: 'none' } as React.CSSProperties} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder={'\u0637\u0644\u0628\u0627\u062a \u062e\u0627\u0635\u0629...'} />
                        </div>
                        {paymentMethods.length > 0 && (
                          <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 *'}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {paymentMethods.map(method => (
                                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: selectedMethod===method ? '2px solid rgba(201,168,76,0.6)' : '1px solid rgba(255,255,255,0.1)', background: selectedMethod===method ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                  <input type='radio' name='hotelPayment' value={method} checked={selectedMethod===method} onChange={() => setSelectedMethod(method)} style={{ accentColor: '#C9A84C', width: '16px', height: '16px' }} />
                                  <span style={{ color: 'white', fontSize: '14px', fontWeight: selectedMethod===method ? 700 : 400 }}>{METHOD_LABELS[method] ?? method}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {bookError && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px', marginTop: '12px' }}>{bookError}</div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                        <button style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontWeight: 600 }} onClick={() => setSelected(null)}>
                          {'\u0625\u0644\u063a\u0627\u0621'}
                        </button>
                        <button style={{ flex: 2, padding: '12px', background: sending ? 'rgba(71,85,105,0.8)' : 'linear-gradient(135deg,#C9A84C,#a8873a)', color: sending ? 'white' : '#060d24', border: 'none', borderRadius: '12px', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', fontWeight: 900, fontSize: '15px', boxShadow: sending ? 'none' : '0 6px 20px rgba(201,168,76,0.25)' }} onClick={() => void book()} disabled={sending}>
                          {sending ? '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644...' : '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{'@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.06)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@media(max-width:640px){.hotels-dates-grid{grid-template-columns:1fr !important;}.hotels-pax-grid{grid-template-columns:1fr !important;}.hotels-book-names{grid-template-columns:1fr !important;}.hotels-summary-grid{grid-template-columns:1fr !important;}}'}</style>
      </main>
      <Footer />
    </>
  );
}