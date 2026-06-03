'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface PackageData {
  id: string;
  title: string;
  country: string;
  duration: string;
  price: number;
  image: string | null;
}

interface SiteConfigData {
  payment_methods: string;
  currency: string;
}

interface UserMe {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'دفع نقدي',
  chargily: 'دفع إلكتروني (Chargily)',
  bank_transfer: 'تحويل بنكي',
  ccp: 'بريد الجزائر (CCP)',
  cib: 'بطاقة CIB',
  dahabia: 'بطاقة ذهبية',
  virement: 'تحويل بنكي (Virement)',
};

const METHOD_DESCRIPTIONS: Record<string, string> = {
  cash: 'ستدفع نقداً عند زيارتك لمكتبنا أو عند تسليم التذكرة. سيتواصل معك فريقنا لتحديد الموعد.',
  chargily: 'ستنتقل فوراً إلى بوابة Chargily الآمنة لإتمام الدفع إلكترونياً. يدعم بطاقات CIB و ذهبية و Dahabia.',
  bank_transfer: 'قم بتحويل المبلغ إلى حسابنا البنكي ثم أرسل وصل التحويل. سيتواصل معك فريقنا بالتفاصيل.',
  ccp: 'قم بتحويل المبلغ عبر حساب بريد الجزائر CCP ثم أرسل وصل التحويل. سيتواصل معك فريقنا بالتفاصيل.',
  cib: 'ادفع عبر بطاقت CIB الخاصة بك. سيتواصل معك فريقنا بتفاصيل الدفع.',
  dahabia: 'ادفع عبر بطاقت ذهبية الخاصة بك. سيتواصل معك فريقنا بتفاصيل الدفع.',
  virement: 'قم بتحويل بنكي من حسابك إلى حسابنا. سيتواصل معك فريقنا بالتفاصيل.',
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const packageId = searchParams.get('packageId') ?? '';
  const passengersRaw = parseInt(searchParams.get('passengers') ?? '1', 10);
  const passengers = isNaN(passengersRaw) || passengersRaw < 1 ? 1 : passengersRaw;

  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [config, setConfig] = useState<SiteConfigData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isGuest, setIsGuest] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchData = useCallback(async () => {
    if (!packageId) {
      setError('معرف الباقة مفقود');
      setLoading(false);
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sg_token') : null;

      const requests: Promise<Response>[] = [
        fetch(`/api/admin/packages/${packageId}`),
        fetch('/api/siteconfig'),
      ];

      if (token) {
        requests.push(
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
        );
      }

      const results = await Promise.all(requests);
      const [pkgRes, configRes] = results;
      const meRes = results[2];

      if (!pkgRes.ok) {
        setError('الباقة غير موجودة');
        setLoading(false);
        return;
      }

      const pkgData = (await pkgRes.json()) as PackageData;
      const configData = (await configRes.json()) as SiteConfigData;

      setPkg(pkgData);
      setConfig(configData);

      const methods = configData.payment_methods
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      if (methods.length > 0) {
        setSelectedMethod(methods[0]);
      }

      if (meRes && meRes.ok) {
        const meData = (await meRes.json()) as UserMe;
        setUserName(meData.name ?? '');
        setUserPhone(meData.phone ?? '');
        setUserEmail(meData.email ?? '');
        setIsGuest(false);
        setIsLoggedIn(true);
      } else {
        setIsGuest(true);
        setIsLoggedIn(false);
      }
    } catch {
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!selectedMethod || !pkg) return;

    if (!userName.trim()) {
      setError('الاسم مطلوب');
      return;
    }

    if (!userPhone.trim()) {
      setError('رقم الهاتف مطلوب');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sg_token') : null;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          packageId: pkg.id,
          paymentMethod: selectedMethod,
          passengers,
          guestName: userName.trim(),
          guestPhone: userPhone.trim(),
        }),
      });

      const data = (await res.json()) as {
        bookingId?: string;
        checkoutUrl?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? 'حدث خطأ في إنشاء الحجز');
        return;
      }

      if (selectedMethod === 'chargily' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setSuccess(true);
    } catch {
      setError('تعذر الاتصال بالخادم. حاول مجددا.');
    } finally {
      setSubmitting(false);
    }
  };

  const currency = config?.currency ?? 'DZD';
  const total = pkg ? pkg.price * passengers : 0;

  const enabledMethods = config
    ? config.payment_methods
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m.length > 0)
    : [];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060d24' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #0A7EB5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontSize: '16px', fontFamily: 'Cairo, Arial, sans-serif' }}>
            {'جاري التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060d24' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: '#f87171', fontSize: '18px', fontFamily: 'Cairo, Arial, sans-serif' }}>{error}</p>
          <button onClick={() => router.push('/')} style={{ marginTop: '24px', backgroundColor: '#0A7EB5', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '15px', cursor: 'pointer', fontFamily: 'Cairo, Arial, sans-serif' }}>
            {'العودة للرئيسية'}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060d24', fontFamily: 'Cairo, Arial, sans-serif' }}>
        <div style={{ backgroundColor: '#0f1a35', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ width: '72px', height: '72px', backgroundColor: '#064e3b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#34d399">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '12px' }}>
            {'تم الحجز بنجاح'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '12px', lineHeight: '1.7' }}>
            {'سيتواصل معك فريقنا قريباً لتأكيد حجزك وإتمام الإجراءات.'}
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '32px' }}>
            {'رقم هاتفك: '}{userPhone}
          </p>
          <button onClick={() => router.push('/')} style={{ backgroundColor: '#0A7EB5', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 40px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo, Arial, sans-serif', width: '100%' }}>
            {'العودة للرئيسية'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060d24', fontFamily: 'Cairo, Arial, sans-serif', direction: 'rtl', padding: '40px 16px' }}>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '32px', textAlign: 'center' }}>
          {'إتمام الحجز'}
        </h1>

        {pkg && (
          <div style={{ backgroundColor: '#0f1a35', border: '1px solid #1e3a5f', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {'ملخص الباقة'}
            </h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {pkg.image && (
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  style={{ width: '96px', height: '68px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 'bold', fontSize: '17px', color: '#f1f5f9', marginBottom: '6px' }}>{pkg.title}</p>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>{pkg.country} &bull; {pkg.duration}</p>
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  {'عدد المسافرين: '}{passengers}
                </p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #1e3a5f', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', color: '#94a3b8' }}>
                {'المجموع الكلي:'}
              </span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0A7EB5' }}>
                {total.toLocaleString('ar-DZ')} {currency}
              </span>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#0f1a35', border: '1px solid #1e3a5f', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {'بياناتك'}
          </h2>

          {isLoggedIn && (
            <div style={{ backgroundColor: '#0c2340', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#34d399">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span style={{ color: '#34d399', fontSize: '13px' }}>
                {'مسجل الدخول — تم تعبئة بياناتك تلقائياً'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                {'الاسم الكامل'} <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => { if (!isLoggedIn) setUserName(e.target.value); }}
                readOnly={isLoggedIn}
                placeholder={'ادخل اسمك الكامل'}
                style={{ width: '100%', backgroundColor: isLoggedIn ? '#0c1f3a' : '#0a1628', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '12px 14px', color: isLoggedIn ? '#64748b' : '#f1f5f9', fontSize: '15px', fontFamily: 'Cairo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box', cursor: isLoggedIn ? 'default' : 'text' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                {'رقم الهاتف'} <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => { if (!isLoggedIn) setUserPhone(e.target.value); }}
                readOnly={isLoggedIn}
                placeholder={'0555 123 456'}
                style={{ width: '100%', backgroundColor: isLoggedIn ? '#0c1f3a' : '#0a1628', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '12px 14px', color: isLoggedIn ? '#64748b' : '#f1f5f9', fontSize: '15px', fontFamily: 'Cairo, Arial, sans-serif', outline: 'none', boxSizing: 'border-box', cursor: isLoggedIn ? 'default' : 'text', direction: 'ltr', textAlign: 'right' }}
              />
            </div>

            {!isLoggedIn && (
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                {'لديك حساب؟ '}
                <span
                  onClick={() => router.push(`/login?redirect=/checkout?packageId=${packageId}&passengers=${passengers}`)}
                  style={{ color: '#0A7EB5', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {'سجل الدخول'}
                </span>
                {' لتعبئة بياناتك تلقائياً'}
              </p>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: '#0f1a35', border: '1px solid #1e3a5f', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {'طريقة الدفع'}
          </h2>

          {enabledMethods.length === 0 ? (
            <p style={{ color: '#475569', fontSize: '14px' }}>
              {'لا توجد طرق دفع مفعلة حالياً.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {enabledMethods.map((method) => (
                <label
                  key={method}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: selectedMethod === method ? '2px solid #0A7EB5' : '2px solid #1e3a5f', backgroundColor: selectedMethod === method ? '#0c2340' : '#0a1628', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={selectedMethod === method}
                    onChange={() => setSelectedMethod(method)}
                    style={{ width: '18px', height: '18px', accentColor: '#0A7EB5', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '15px', color: '#f1f5f9', fontWeight: selectedMethod === method ? 'bold' : 'normal' }}>
                    {METHOD_LABELS[method] ?? method}
                  </span>
                </label>
              ))}
            </div>
          )}

          {selectedMethod && METHOD_DESCRIPTIONS[selectedMethod] && (
            <div style={{ marginTop: '16px', backgroundColor: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A7EB5" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                {METHOD_DESCRIPTIONS[selectedMethod]}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: '#2d0f0f', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f87171" style={{ flexShrink: 0 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={() => { void handleSubmit(); }}
          disabled={submitting || !selectedMethod || enabledMethods.length === 0}
          style={{ width: '100%', backgroundColor: submitting || !selectedMethod ? '#1e3a5f' : '#0A7EB5', color: submitting || !selectedMethod ? '#475569' : '#fff', border: 'none', borderRadius: '12px', padding: '18px', fontSize: '17px', fontWeight: 'bold', cursor: submitting || !selectedMethod ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, Arial, sans-serif', transition: 'background-color 0.2s', letterSpacing: '0.02em' }}
        >
          {submitting ? 'جاري المعالجة...' : 'تأكيد الحجز'}
        </button>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '12px', marginTop: '16px' }}>
          {'بالضغط على تأكيد الحجز فأنت توافق على شروط الخدمة'}
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060d24' }}>
        <p style={{ color: '#94a3b8', fontSize: '16px', fontFamily: 'Cairo, Arial, sans-serif' }}>
          {'جاري التحميل...'}
        </p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
