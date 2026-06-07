const fs = require('fs');

fs.mkdirSync('src/app/checkout/success', { recursive: true });

fs.writeFileSync('src/app/checkout/success/page.tsx', `'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface BookingData {
  id:            string;
  total:         number;
  paymentMethod: string;
  paymentStatus: string;
  status:        string;
  createdAt:     string;
  guestName:     string | null;
  guestPhone:    string | null;
  guestEmail:    string | null;
  user:          { name: string | null; email: string; phone: string | null } | null;
  package:       { id: string; title: string; country: string; duration: string; image: string | null } | null;
}

const METHOD_LABELS: Record<string, string> = {
  cash:          'دفع نقدي',
  chargily:      'دفع إلكتروني (Chargily)',
  bank_transfer: 'تحويل بنكي',
  ccp:           'بريد الجزائر (CCP)',
  cib:           'بطاقة CIB',
  dahabia:       'بطاقة ذهبية',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const bookingId    = searchParams.get('bookingId') ?? '';

  const [booking, setBooking]   = useState<BookingData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [animate, setAnimate]   = useState(false);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    fetch(\`/api/bookings/\${bookingId}\`)
      .then(r => r.ok ? r.json() : null)
      .then((data: BookingData | null) => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  const customerName  = booking?.user?.name  ?? booking?.guestName  ?? 'عميل';
  const customerPhone = booking?.user?.phone ?? booking?.guestPhone ?? '';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060d24' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid #0A7EB5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060d24', fontFamily: 'Cairo, Arial, sans-serif', direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <style>{\`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes checkDraw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
      \`}</style>

      <div style={{ maxWidth: '520px', width: '100%', opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)' }}>

        {/* أيقونة النجاح */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', animation: 'ripple 2s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', animation: 'ripple 2s ease-out 0.4s infinite' }} />
            <div style={{ width: '96px', height: '96px', background: 'linear-gradient(135deg,#059669,#10b981)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(16,185,129,0.4)', position: 'relative', animation: animate ? 'scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.2s both' : 'none' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" strokeDasharray="100" strokeDashoffset={animate ? 0 : 100} style={{ transition: 'stroke-dashoffset 0.6s ease 0.6s' }} />
              </svg>
            </div>
          </div>
        </div>

        {/* العنوان */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px' }}>تم الدفع بنجاح</h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>حجزك مؤكد — سيتواصل معك فريقنا قريباً</p>
        </div>

        {/* بطاقة تفاصيل الحجز */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>

          {/* هيدر البطاقة */}
          <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))', borderBottom: '1px solid rgba(16,185,129,0.15)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}>تفاصيل الحجز</span>
            {bookingId && (
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: 'monospace', direction: 'ltr' }}>#{bookingId.slice(-8).toUpperCase()}</span>
            )}
          </div>

          <div style={{ padding: '24px' }}>

            {/* الباقة */}
            {booking?.package && (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {booking.package.image && (
                  <img src={booking.package.image} alt={booking.package.title} style={{ width: '72px', height: '52px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                )}
                <div>
                  <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>{booking.package.title}</p>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{booking.package.country} &bull; {booking.package.duration}</p>
                </div>
              </div>
            )}

            {/* تفاصيل */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'الاسم',        value: customerName },
                { label: 'الهاتف',       value: customerPhone },
                { label: 'طريقة الدفع', value: booking ? (METHOD_LABELS[booking.paymentMethod] ?? booking.paymentMethod) : '' },
                { label: 'تاريخ الحجز', value: booking ? new Date(booking.createdAt).toLocaleDateString('ar-DZ', { year:'numeric', month:'long', day:'numeric' }) : '' },
              ].map(row => row.value ? (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{row.label}</span>
                  <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 600 }}>{row.value}</span>
                </div>
              ) : null)}
            </div>

            {/* المبلغ */}
            {booking && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>المبلغ المدفوع</span>
                <span style={{ color: '#10b981', fontSize: '26px', fontWeight: 900 }}>
                  {booking.total.toLocaleString('ar-DZ')} <span style={{ fontSize: '14px', fontWeight: 600 }}>دج</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* رسالة تطمين */}
        <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
          </svg>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
            تم تسجيل حجزك بنجاح. سيتصل بك أحد أعضاء فريقنا على رقم هاتفك لتأكيد التفاصيل وإتمام الإجراءات.
          </p>
        </div>

        {/* أزرار */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/')}
            style={{ flex: 1, background: 'linear-gradient(135deg,#0A7EB5,#0369a1)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,Arial,sans-serif' }}
          >
            العودة للرئيسية
          </button>
          <button
            onClick={() => router.push('/packages')}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,Arial,sans-serif' }}
          >
            تصفح الباقات
          </button>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060d24' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #0A7EB5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
`, 'utf8');

console.log('done');
