'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingCardProps {
  packageId: string;
  packageTitle: string;
  country: string;
  duration: string;
  price: number;
  currency: string;
  startDate: string | null;
}

export default function BookingCard({
  packageId,
  packageTitle,
  country,
  duration,
  price,
  currency,
  startDate,
}: BookingCardProps) {
  const router = useRouter();
  const [passengers, setPassengers] = useState(1);

  const total = price * passengers;
  const atMin = passengers <= 1;
  const atMax = passengers >= 20;
  const showTotal = passengers > 1;

  const decrement = () => setPassengers((p) => Math.max(1, p - 1));
  const increment = () => setPassengers((p) => Math.min(20, p + 1));

  const handleBook = () => {
    router.push('/checkout?packageId=' + packageId + '&passengers=' + passengers);
  };

  const btnStyleDec: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    background: atMin ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
    color: atMin ? 'rgba(255,255,255,0.2)' : '#fff',
    border: 'none',
    cursor: atMin ? 'not-allowed' : 'pointer',
    fontSize: '20px',
    fontWeight: 300,
    lineHeight: 1,
    transition: 'background 0.15s',
  };

  const btnStyleInc: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    background: atMax ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
    color: atMax ? 'rgba(255,255,255,0.2)' : '#fff',
    border: 'none',
    cursor: atMax ? 'not-allowed' : 'pointer',
    fontSize: '20px',
    fontWeight: 300,
    lineHeight: 1,
    transition: 'background 0.15s',
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.75rem', position: 'sticky', top: '2rem', fontFamily: 'Cairo, Arial, sans-serif' }}>

      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {'\u0627\u0644\u0633\u0639\u0631 \u0644\u0643\u0644 \u0634\u062e\u0635'}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '1.5rem' }}>
        <span style={{ color: '#f5a623', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>
          {price.toLocaleString('ar-DZ')}
        </span>
        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
          {currency}
        </span>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            {'\u0627\u0644\u062f\u0648\u0644\u0629'}
          </span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{country}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            {'\u0627\u0644\u0645\u062f\u0629'}
          </span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{duration}</span>
        </div>
        {startDate && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>
              {'\u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642'}
            </span>
            <span style={{ color: '#fff', fontWeight: 600 }}>
              {new Date(startDate).toLocaleDateString('ar-DZ')}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '10px' }}>
          {'\u0639\u062f\u062f \u0627\u0644\u0645\u0633\u0627\u0641\u0631\u064a\u0646'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <button onClick={decrement} disabled={atMin} style={btnStyleDec}>
            -
          </button>
          <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontSize: '18px', fontWeight: 700, padding: '12px 0', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            {passengers}
          </div>
          <button onClick={increment} disabled={atMax} style={btnStyleInc}>
            +
          </button>
        </div>
      </div>

      {showTotal && (
        <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            {'\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0627\u0644\u0643\u0644\u064a'}
          </span>
          <span style={{ color: '#f5a623', fontSize: '18px', fontWeight: 800 }}>
            {total.toLocaleString('ar-DZ')} {currency}
          </span>
        </div>
      )}

      <button
        onClick={handleBook}
        style={{ display: 'block', width: '100%', background: 'linear-gradient(135deg, #f5a623, #c47d0e)', color: '#fff', padding: '15px', borderRadius: '12px', border: 'none', textAlign: 'center', fontSize: '15px', fontWeight: 700, marginBottom: '0.75rem', cursor: 'pointer', fontFamily: 'Cairo, Arial, sans-serif', transition: 'opacity 0.2s' }}
      >
        {'\u0627\u062d\u062c\u0632 \u0627\u0644\u0622\u0646'}
      </button>

      <a
        href={'/consultation?package=' + packageId + '&title=' + encodeURIComponent(packageTitle)}
        style={{ display: 'block', background: 'rgba(10,126,181,0.12)', border: '1px solid rgba(10,126,181,0.35)', color: '#0A7EB5', padding: '12px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', fontSize: '13px', fontWeight: 600, marginBottom: '0.75rem' }}
      >
        {'\u0637\u0644\u0628 \u0627\u0633\u062a\u0634\u0627\u0631\u0629'}
      </a>

      <a
        href='/packages'
        style={{ display: 'block', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', padding: '12px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', fontSize: '13px' }}
      >
        {'\u0639\u0648\u062f\u0629 \u0644\u0644\u0628\u0627\u0642\u0627\u062a'}
      </a>
    </div>
  );
}