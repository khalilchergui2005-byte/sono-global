'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function FailureContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const bookingId    = searchParams.get('bookingId') ?? '';
  const [animate, setAnimate] = useState(false);
  const [packageId, setPackageId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { package?: { id: string } } | null) => {
        if (data?.package?.id) setPackageId(data.package.id);
      })
      .catch(() => {});
  }, [bookingId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060d24', fontFamily: 'Cairo, Arial, sans-serif', direction: 'rtl', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); } }
      `}</style>

      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)' }}>

        {/* أيقونة الفشل */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '96px', height: '96px', background: 'linear-gradient(135deg,#dc2626,#ef4444)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: animate ? 'scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.2s both, pulse 2s ease 1s infinite' : 'none' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        </div>

        {/* العنوان */}
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#f1f5f9', margin: '0 0 12px' }}>فشلت عملية الدفع</h1>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.7, margin: '0 0 32px' }}>
          لم يتم إتمام الدفع. لم يُخصم أي مبلغ من حسابك. يمكنك المحاولة مجدداً أو اختيار طريقة دفع أخرى.
        </p>

        {/* بطاقة الأسباب الشائعة */}
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '16px', padding: '20px 24px', marginBottom: '28px', textAlign: 'right' }}>
          <p style={{ color: '#fca5a5', fontSize: '13px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.5px' }}>أسباب شائعة لفشل الدفع</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'رصيد غير كافٍ في البطاقة',
              'انتهاء صلاحية البطاقة أو بيانات خاطئة',
              'تجاوز الحد اليومي للمعاملات',
              'انقطاع الاتصال بالإنترنت أثناء الدفع',
            ].map((reason, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* أزرار */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {packageId && (
            <button
              onClick={() => router.push(`/checkout?packageId=${packageId}`)}
              style={{ width: '100%', background: 'linear-gradient(135deg,#0A7EB5,#0369a1)', color: 'white', border: 'none', borderRadius: '12px', padding: '15px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,Arial,sans-serif' }}
            >
              المحاولة مجدداً
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '15px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,Arial,sans-serif' }}
          >
            العودة للرئيسية
          </button>
        </div>

        {/* رقم الدعم */}
        <p style={{ color: '#334155', fontSize: '12px', marginTop: '24px' }}>
          هل تواجه مشكلة؟ تواصل معنا عبر واتساب أو اختر الدفع النقدي عند الحجز
        </p>

      </div>
    </div>
  );
}

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060d24' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
