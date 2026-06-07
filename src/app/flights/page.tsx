'use client';
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Flight = {
  id: string; airline: string; flightNumber: string;
  from: string; to: string; departure: string; arrival: string;
  duration: number; price: number; currency: string;
  cabin: string; seats: number;
};

const CABINS = [
  { value: 'economy', label: '\u0627\u0642\u062a\u0635\u0627\u062f' },
  { value: 'business', label: '\u0623\u0639\u0645\u0627\u0644' },
  { value: 'first', label: '\u0623\u0648\u0644\u0649' },
];

const PAYMENT_LABELS: Record<string, string> = {
  cash: '\u0646\u0642\u062f\u064b\u0627',
  ccp: '\u062d\u0633\u0627\u0628 \u0628\u0631\u064a\u062f\u064a CCP',
  baridimob: '\u0628\u0631\u064a\u062f\u064a\u0645\u0648\u0628',
  chargily: '\u0628\u0637\u0627\u0642\u0629 \u0628\u0646\u0643\u064a\u0629 Chargily',
  virement: '\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a',
};

const INPUT: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px',
  padding: '14px 18px', color: 'white', fontSize: '14px',
  fontFamily: 'Cairo,sans-serif', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatDuration(min: number) {
  const h = Math.floor(min / 60), m = min % 60;
  return h + '\u0633' + (m ? ' ' + m + '\u062f' : '');
}

export default function FlightsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [depart, setDepart] = useState('');
  const [ret, setRet] = useState('');
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState('economy');
  const [tripType, setTripType] = useState<'round'|'one'>('round');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState<Flight|null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookError, setBookError] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualFrom, setManualFrom] = useState('');
  const [manualTo, setManualTo] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualSent, setManualSent] = useState(false);
  const [manualSending, setManualSending] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [manualPayment, setManualPayment] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);
  const [hoveredFlight, setHoveredFlight] = useState<string|null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);

  useEffect(() => {
    fetch('/api/siteconfig')
      .then(r => r.json())
      .then((data: { payment_methods?: string }) => {
        const raw = data.payment_methods ?? '';
        const methods = raw.split(',').map((s:string) => s.trim()).filter(Boolean);
        setPaymentMethods(methods);
        if (methods.length > 0) { setSelectedPayment(methods[0]); setManualPayment(methods[0]); }
      })
      .catch(() => {});
  }, []);

  const search = async () => {
    if (!from || !to || !depart) { setSearchError('\u064a\u0631\u062c\u0649 \u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0645\u0637\u0627\u0631 \u0648\u0627\u0644\u062a\u0627\u0631\u064a\u062e'); return; }
    setSearching(true); setSearchError(''); setFlights([]); setSearched(false); setSelected(null);
    try {
      const res = await fetch(`/api/amadeus/flights/search?origin=${from.trim()}&destination=${to.trim()}&date=${depart}&adults=${adults}&cabin=${cabin}`);
      const data = await res.json() as { flights?: Flight[]; error?: { detail?: string } | string };
      if (!res.ok) {
        const errMsg = typeof data.error === 'string' ? data.error : (data.error as { detail?: string })?.detail ?? '';
        if (errMsg.includes('not configured') || errMsg.includes('credentials')) {
          setManualMode(true); setManualFrom(from); setManualTo(to);
        } else {
          setSearchError(errMsg || '\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631 \u0639\u0644\u0649 \u0631\u062d\u0644\u0627\u062a');
        }
      } else {
        setFlights(data.flights ?? []); setSearched(true);
        if ((data.flights ?? []).length === 0) setSearchError('\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u062d\u0644\u0627\u062a \u0645\u062a\u0627\u062d\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631');
      }
    } catch { setSearchError('\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b'); }
    finally { setSearching(false); }
  };

  const book = async () => {
    if (!selected || !name || !phone) { setBookError('\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0647\u0627\u062a\u0641 \u0645\u0637\u0644\u0648\u0628\u0627\u0646'); return; }
    if (!selectedPayment) { setBookError('\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639'); return; }
    setBooking(true); setBookError('');
    try {
      const res = await fetch('/api/flights', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripType, cabin, from: selected.from, to: selected.to, departDate: depart, returnDate: ret, adults, children: 0, infants: 0, name, phone, email, payment: selectedPayment, notes: '\u0631\u062d\u0644\u0629: ' + selected.flightNumber + ' | \u0633\u0639\u0631: ' + selected.price + ' ' + selected.currency + '\n' + notes, amadeusOfferId: selected.id }),
      });
      if (res.ok) setBooked(true);
      else setBookError('\u062d\u062f\u062b \u062e\u0637\u0623\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b');
    } catch { setBookError('\u062d\u062f\u062b \u062e\u0637\u0623\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b'); }
    finally { setBooking(false); }
  };

  const manualSubmit = async () => {
    if (!manualFrom || !manualTo || !manualName || !manualPhone || !manualPayment) return;
    setManualSending(true);
    try {
      await fetch('/api/flights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripType, cabin, from: manualFrom, to: manualTo, departDate: depart, returnDate: ret, adults, children: 0, infants: 0, name: manualName, phone: manualPhone, email: manualEmail, payment: manualPayment, notes: manualNotes }) });
      setManualSent(true);
    } catch {} finally { setManualSending(false); }
  };

  const STAT_ITEMS = [
    { n: '150+', l: '\u0648\u062c\u0647\u0629 \u0639\u0627\u0644\u0645\u064a\u0629' },
    { n: '50+', l: '\u0634\u0631\u0643\u0629 \u0637\u064a\u0631\u0627\u0646' },
    { n: '24/7', l: '\u062f\u0639\u0645 \u0645\u062a\u0648\u0627\u0635\u0644' },
    { n: '99%', l: '\u0631\u0636\u0627 \u0627\u0644\u0639\u0645\u0644\u0627\u0621' },
  ];

  if (manualMode) return (
    <>
      <Header />
      <main style={{ paddingTop: '101px', minHeight: '100vh', background: 'linear-gradient(160deg,#060d24,#0a1628)', fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '4rem 1.5rem' }}>
          {manualSent ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(10,126,181,0.08)', border: '1px solid rgba(10,126,181,0.3)', borderRadius: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#10b981' strokeWidth='2.5' strokeLinecap='round'><polyline points='20 6 9 17 4 12'/></svg>
              </div>
              <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 900, marginBottom: '10px' }}>{'\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628\u0643'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>{'\u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0641\u0631\u064a\u0642\u0646\u0627 \u062e\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629'}</p>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,rgba(10,126,181,0.3),rgba(201,168,76,0.2))', border: '1px solid rgba(10,126,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#0A7EB5' strokeWidth='1.8'><path d='M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z'/></svg>
                </div>
                <div>
                  <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 900, margin: 0 }}>{'\u0637\u0644\u0628 \u062d\u062c\u0632 \u0637\u064a\u0631\u0627\u0646'}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>{'\u0633\u064a\u0628\u062d\u062b \u0641\u0631\u064a\u0642\u0646\u0627 \u0639\u0646 \u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input value={manualFrom} onChange={e => setManualFrom(e.target.value)} placeholder={'\u0645\u0646 (\u0645\u062f\u064a\u0646\u0629 \u0623\u0648 \u0645\u0637\u0627\u0631)'} style={INPUT} />
                <input value={manualTo} onChange={e => setManualTo(e.target.value)} placeholder={'\u0625\u0644\u0649 (\u0645\u062f\u064a\u0646\u0629 \u0623\u0648 \u0645\u0637\u0627\u0631)'} style={INPUT} />
                <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder={'\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 *'} style={INPUT} />
                <input value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder={'\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 *'} style={{ ...INPUT, direction: 'ltr' }} />
                <input value={manualEmail} onChange={e => setManualEmail(e.target.value)} placeholder={'\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a'} type='email' style={{ ...INPUT, direction: 'ltr' }} />
                <textarea value={manualNotes} onChange={e => setManualNotes(e.target.value)} placeholder={'\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629...'} rows={3} style={{ ...INPUT, resize: 'none' }} />
                {paymentMethods.length > 0 && (
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>{'\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 *'}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {paymentMethods.map(method => (
                        <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', background: manualPayment===method ? 'rgba(10,126,181,0.15)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (manualPayment===method ? 'rgba(10,126,181,0.5)' : 'rgba(255,255,255,0.1)'), transition: 'all 0.2s' }}>
                          <input type='radio' name='manualPayment' value={method} checked={manualPayment===method} onChange={() => setManualPayment(method)} style={{ accentColor: '#0A7EB5', width: '16px', height: '16px' }} />
                          <span style={{ color: manualPayment===method ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600 }}>{PAYMENT_LABELS[method] ?? method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => void manualSubmit()} disabled={manualSending} style={{ background: manualSending ? '#475569' : 'linear-gradient(135deg,#0A7EB5,#0d96d4)', color: 'white', border: 'none', borderRadius: '14px', padding: '16px', fontSize: '15px', fontWeight: 900, cursor: manualSending ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'opacity 0.2s' }}>
                  {manualSending ? '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644...' : '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );

  if (booked) return (
    <>
      <Header />
      <main style={{ paddingTop: '101px', minHeight: '100vh', background: 'linear-gradient(160deg,#060d24,#0a1628)', fontFamily: 'Cairo,sans-serif', direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(10,126,181,0.08)', border: '1px solid rgba(10,126,181,0.3)', borderRadius: '24px', maxWidth: '500px', width: '100%' }}>
          <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>
            <svg width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='#10b981' strokeWidth='2.5' strokeLinecap='round'><polyline points='20 6 9 17 4 12'/></svg>
          </div>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>{'\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u062d\u062c\u0632'}</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', marginBottom: '2rem' }}>{'\u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0641\u0631\u064a\u0642\u0646\u0627 \u062e\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629 \u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632'}</p>
          <button onClick={() => { setBooked(false); setSelected(null); setSearched(false); setFlights([]); setSelectedPayment(paymentMethods[0] ?? ''); }}
            style={{ background: 'linear-gradient(135deg,#0A7EB5,#0d96d4)', color: 'white', border: 'none', borderRadius: '14px', padding: '14px 40px', fontSize: '15px', fontWeight: 900, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
            {'\u0628\u062d\u062b \u062c\u062f\u064a\u062f'}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#060d24 0%,#0a1628 50%,#060d24 100%)', fontFamily: 'Cairo,sans-serif', direction: 'rtl', paddingTop: '101px' }}>

        <div ref={heroRef} style={{ position: 'relative', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '4rem 2rem' }}>

          <div style={{ position: 'absolute', inset: 0 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center 40%', opacity: 0.18 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(6,13,36,0.3) 0%,rgba(6,13,36,0.7) 60%,#060d24 100%)' }} />
          </div>

          <div style={{ position: 'absolute', top: '10%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(10,126,181,0.12) 0%,transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '3%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)', animation: 'pulse 8s ease-in-out infinite 2s' }} />

          {[...Array(12)].map((_,i) => (
            <div key={i} style={{ position: 'absolute', width: i%3===0?'3px':'2px', height: i%3===0?'3px':'2px', borderRadius: '50%', background: i%2===0 ? 'rgba(10,126,181,0.6)' : 'rgba(201,168,76,0.5)', top: `${15+i*6}%`, left: `${(i*8.3)%95}%`, opacity: heroVisible ? 1 : 0, transition: `opacity ${1+i*0.15}s ease, transform ${2+i*0.2}s ease`, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', boxShadow: '0 0 6px currentColor' }} />
          ))}

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px' }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(10,126,181,0.15)', border: '1px solid rgba(10,126,181,0.3)', borderRadius: '50px', padding: '8px 20px', marginBottom: '1.5rem', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.8s ease' }}>
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#0A7EB5' strokeWidth='2'><path d='M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z'/></svg>
              <span style={{ color: '#0A7EB5', fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>{'\u062d\u062c\u0632 \u0627\u0644\u0637\u064a\u0631\u0627\u0646 \u0627\u0644\u0641\u0648\u0631\u064a'}</span>
            </div>

            <h1 style={{ color: 'white', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 900, lineHeight: 1.2, margin: '0 0 1rem', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s ease 0.1s' }}>
              {'\u0633\u0627\u0641\u0631 '}<span style={{ background: 'linear-gradient(135deg,#0A7EB5,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{'\u0628\u062b\u0642\u0629'}</span>{' \u0627\u062d\u062c\u0632 \u0628\u0633\u0647\u0648\u0644\u0629'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px,2vw,17px)', lineHeight: 1.8, maxWidth: '540px', margin: '0 auto 2.5rem', opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.9s ease 0.2s' }}>
              {'\u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0644\u062c\u0645\u064a\u0639 \u0627\u0644\u0648\u062c\u0647\u0627\u062a \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629 \u2014 \u0628\u062e\u0628\u0631\u0629 \u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631 \u0645\u062a\u062e\u0635\u0635\u0629'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', opacity: heroVisible ? 1 : 0, transition: 'all 0.9s ease 0.3s' }}>
              {STAT_ITEMS.map((s,i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px 24px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                  <div style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 900 }}>{s.n}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '5px' }}>
              {[{ v: 'round', l: '\u2708 \u0630\u0647\u0627\u0628 \u0648\u0639\u0648\u062f\u0629' }, { v: 'one', l: '\u2192 \u0630\u0647\u0627\u0628 \u0641\u0642\u0637' }].map(t => (
                <button key={t.v} onClick={() => setTripType(t.v as 'round'|'one')}
                  style={{ flex: 1, background: tripType===t.v ? 'linear-gradient(135deg,rgba(10,126,181,0.4),rgba(10,126,181,0.2))' : 'transparent', color: tripType===t.v ? 'white' : 'rgba(255,255,255,0.4)', border: tripType===t.v ? '1px solid rgba(10,126,181,0.4)' : '1px solid transparent', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.25s' }}>
                  {t.l}
                </button>
              ))}
            </div>

            <div className='fl-airports' style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u0645\u0637\u0627\u0631 \u0627\u0644\u0645\u063a\u0627\u062f\u0631\u0629'}</label>
                <div style={{ position: 'relative' }}>
                  <input value={from} onChange={e => setFrom(e.target.value.toUpperCase())} placeholder='ALG'
                    style={{ ...INPUT, paddingRight: '44px', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '18px', fontWeight: 900, textAlign: 'center' }} />
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>IATA</div>
                </div>
              </div>
              <div className='fl-swap' style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(10,126,181,0.15)', border: '1px solid rgba(10,126,181,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#0A7EB5' strokeWidth='2'><path d='M7 16V4m0 0L3 8m4-4l4 4'/><path d='M17 8v12m0 0l4-4m-4 4l-4-4'/></svg>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u0645\u0637\u0627\u0631 \u0627\u0644\u0648\u0635\u0648\u0644'}</label>
                <div style={{ position: 'relative' }}>
                  <input value={to} onChange={e => setTo(e.target.value.toUpperCase())} placeholder='CDG'
                    style={{ ...INPUT, paddingRight: '44px', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '18px', fontWeight: 900, textAlign: 'center' }} />
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>IATA</div>
                </div>
              </div>
            </div>

            <div className='fl-dates' style={{ display: 'grid', gridTemplateColumns: tripType==='round' ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0630\u0647\u0627\u0628'}</label>
                <input type='date' value={depart} onChange={e => setDepart(e.target.value)} style={{ ...INPUT, colorScheme: 'dark' }} />
              </div>
              {tripType==='round' && (
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0639\u0648\u062f\u0629'}</label>
                  <input type='date' value={ret} onChange={e => setRet(e.target.value)} style={{ ...INPUT, colorScheme: 'dark' }} />
                </div>
              )}
            </div>

            <div className='fl-pax' style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u0639\u062f\u062f \u0627\u0644\u0631\u0643\u0627\u0628'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '8px 14px', height: '52px' }}>
                  <button onClick={() => setAdults(Math.max(1,adults-1))} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>-</button>
                  <span style={{ color: 'white', fontWeight: 900, flex: 1, textAlign: 'center', fontSize: '18px' }}>{adults}</span>
                  <button onClick={() => setAdults(adults+1)} style={{ background: 'rgba(10,126,181,0.3)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '8px', letterSpacing: '1px' }}>{'\u062f\u0631\u062c\u0629 \u0627\u0644\u0633\u0641\u0631'}</label>
                <div style={{ display: 'flex', gap: '8px', height: '52px', alignItems: 'center' }}>
                  {CABINS.map(c => (
                    <button key={c.value} onClick={() => setCabin(c.value)}
                      style={{ flex: 1, height: '100%', background: cabin===c.value ? 'linear-gradient(135deg,rgba(10,126,181,0.3),rgba(10,126,181,0.15))' : 'rgba(255,255,255,0.04)', color: cabin===c.value ? 'white' : 'rgba(255,255,255,0.4)', border: '1px solid ' + (cabin===c.value ? 'rgba(10,126,181,0.5)' : 'rgba(255,255,255,0.1)'), borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.2s' }}>
                      {c.label}
                    </button>
                  ))}
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
              style={{ width: '100%', background: searching ? 'rgba(71,85,105,0.8)' : 'linear-gradient(135deg,#0A7EB5 0%,#0d96d4 50%,#C9A84C 100%)', backgroundSize: '200% auto', color: 'white', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '16px', fontWeight: 900, cursor: searching ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.3s', boxShadow: searching ? 'none' : '0 8px 30px rgba(10,126,181,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {searching ? (
                <>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' style={{ animation: 'spin 1s linear infinite' }}><path d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' opacity='.3'/><path d='M21 12a9 9 0 00-9-9'/></svg>
                  {'\u062c\u0627\u0631\u064a \u0627\u0644\u0628\u062d\u062b...'}
                </>
              ) : (
                <>
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2.5'><circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/></svg>
                  {'\u0628\u062d\u062b \u0639\u0646 \u0631\u062d\u0644\u0627\u062a'}
                </>
              )}
            </button>
          </div>

          {searched && flights.length > 0 && !selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ color: 'white', fontSize: '17px', fontWeight: 900, margin: 0 }}>
                  <span style={{ color: '#C9A84C' }}>{flights.length}</span> {'\u0631\u062d\u0644\u0629 \u0645\u062a\u0627\u062d\u0629'}
                </h3>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{from} \u2192 {to}</span>
              </div>
              {flights.map(f => (
                <div key={f.id} onClick={() => setSelected(f)}
                  onMouseEnter={() => setHoveredFlight(f.id)}
                  onMouseLeave={() => setHoveredFlight(null)}
                  style={{ background: hoveredFlight===f.id ? 'rgba(10,126,181,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (hoveredFlight===f.id ? 'rgba(10,126,181,0.4)' : 'rgba(255,255,255,0.08)'), borderRadius: '18px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s', transform: hoveredFlight===f.id ? 'translateY(-2px)' : 'none', boxShadow: hoveredFlight===f.id ? '0 12px 40px rgba(10,126,181,0.15)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ background: 'linear-gradient(135deg,rgba(10,126,181,0.2),rgba(10,126,181,0.05))', border: '1px solid rgba(10,126,181,0.25)', borderRadius: '14px', padding: '10px 16px', textAlign: 'center', minWidth: '80px' }}>
                        <div style={{ color: '#0A7EB5', fontSize: '14px', fontWeight: 900 }}>{f.airline}</div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '2px' }}>{f.flightNumber}</div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'white', fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>{formatTime(f.departure)}</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '4px' }}>{f.from}</div>
                          </div>
                          <div style={{ textAlign: 'center', flex: 1, minWidth: '80px' }}>
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginBottom: '6px' }}>{formatDuration(f.duration)}</div>
                            <div style={{ position: 'relative', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#0A7EB5,#C9A84C)', borderRadius: '2px' }} />
                              <div style={{ position: 'absolute', left: '-4px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#0A7EB5', border: '2px solid #060d24' }} />
                              <div style={{ position: 'absolute', right: '-4px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#C9A84C', border: '2px solid #060d24' }} />
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'white', fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>{formatTime(f.arrival)}</div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '4px' }}>{f.to}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                          <span style={{ background: 'rgba(10,126,181,0.1)', color: '#0A7EB5', border: '1px solid rgba(10,126,181,0.2)', fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>{f.cabin}</span>
                          <span style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)', fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>{f.seats} {'\u0645\u0642\u0639\u062f \u0645\u062a\u0627\u062d'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#C9A84C', fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{f.price.toLocaleString()}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginBottom: '12px' }}>{f.currency} / {'\u0634\u062e\u0635'}</div>
                      <div style={{ background: 'linear-gradient(135deg,#0A7EB5,#0d96d4)', color: 'white', borderRadius: '10px', padding: '9px 20px', fontSize: '13px', fontWeight: 900, textAlign: 'center', boxShadow: '0 4px 15px rgba(10,126,181,0.3)' }}>
                        {'\u0627\u062d\u062c\u0632 \u0627\u0644\u0622\u0646'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected && (
            <div style={{ background: 'rgba(10,126,181,0.06)', border: '1px solid rgba(10,126,181,0.25)', borderRadius: '24px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 20px 60px rgba(10,126,181,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                  {'\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632'}
                </h3>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
                  {'\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0631\u062d\u0644\u0629'}
                </button>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ color: '#0A7EB5', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{selected.flightNumber}</div>
                  <div style={{ color: 'white', fontSize: '18px', fontWeight: 900 }}>{formatTime(selected.departure)} \u2192 {formatTime(selected.arrival)}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>{selected.from} \u2192 {selected.to} | {formatDuration(selected.duration)}</div>
                </div>
                <div style={{ color: '#C9A84C', fontSize: '28px', fontWeight: 900 }}>{selected.price.toLocaleString()} {selected.currency}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className='fl-book-names' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={'\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 *'} style={INPUT} />
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={'\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 *'} style={{ ...INPUT, direction: 'ltr' }} />
                </div>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder={'\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a'} type='email' style={{ ...INPUT, direction: 'ltr' }} />
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={'\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0625\u0636\u0627\u0641\u064a\u0629...'} rows={2} style={{ ...INPUT, resize: 'none' }} />
                {paymentMethods.length > 0 && (
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>{'\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 *'}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {paymentMethods.map(method => (
                        <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', background: selectedPayment===method ? 'rgba(10,126,181,0.15)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (selectedPayment===method ? 'rgba(10,126,181,0.5)' : 'rgba(255,255,255,0.1)'), transition: 'all 0.2s' }}>
                          <input type='radio' name='selectedPayment' value={method} checked={selectedPayment===method} onChange={() => setSelectedPayment(method)} style={{ accentColor: '#0A7EB5', width: '16px', height: '16px' }} />
                          <span style={{ color: selectedPayment===method ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: selectedPayment===method ? 700 : 400 }}>{PAYMENT_LABELS[method] ?? method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {bookError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>{bookError}</div>
                )}
                <button onClick={() => void book()} disabled={booking}
                  style={{ background: booking ? 'rgba(71,85,105,0.8)' : 'linear-gradient(135deg,#C9A84C,#a8873a)', color: '#060d24', border: 'none', borderRadius: '16px', padding: '16px', fontSize: '16px', fontWeight: 900, cursor: booking ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', boxShadow: booking ? 'none' : '0 8px 30px rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {booking ? '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644...' : '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632'}
                </button>
              </div>
            </div>
          )}
        </div>

        <style>{'@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.05)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@media(max-width:640px){.fl-airports{grid-template-columns:1fr !important;}.fl-swap{align-items:center !important;justify-content:center;padding-bottom:0 !important;}.fl-dates{grid-template-columns:1fr !important;}.fl-pax{grid-template-columns:1fr !important;}.fl-book-names{grid-template-columns:1fr !important;}}'}</style>
      </main>
      <Footer />
    </>
  );
}