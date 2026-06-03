import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingCard from './BookingCard';

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [pkg, siteSettings] = await Promise.all([
    db.package.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        country: true,
        duration: true,
        price: true,
        image: true,
        tag: true,
        description: true,
        startDate: true,
        endDate: true,
        visible: true,
      },
    }),
    db.siteSettings.findUnique({
      where: { id: 'main' },
      select: { currency: true },
    }),
  ]);

  if (!pkg) notFound();

  const currency = siteSettings?.currency ?? 'DZD';

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: '#060d24', fontFamily: 'Cairo, Arial, sans-serif', direction: 'rtl' }}>

        <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
          {pkg.image ? (
            <img
              src={pkg.image}
              alt={pkg.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0A7EB5 0%, #060d24 100%)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,13,36,0.97) 0%, rgba(6,13,36,0.45) 55%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: '2.5rem', right: '2rem', left: '2rem' }}>
            {pkg.tag && (
              <span style={{ background: '#f5a623', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-block', marginBottom: '0.75rem' }}>
                {pkg.tag}
              </span>
            )}
            <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.2 }}>
              {pkg.title}
            </h1>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'flex', gap: '1.5rem' }}>
              <span>{pkg.country}</span>
              <span>{pkg.duration}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>

          <div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {'عن هذه الباقة'}
            </h2>

            {pkg.description ? (
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 2, whiteSpace: 'pre-line' }}>
                {pkg.description}
              </p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
                {'لا يوجد وصف لهذه الباقة حاليا.'}
              </p>
            )}

            {(pkg.startDate ?? pkg.endDate) && (
              <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1.25rem' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {'مواعيد الرحلة'}
                </h3>
                <div style={{ display: 'flex', gap: '2.5rem' }}>
                  {pkg.startDate && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px' }}>
                        {'تاريخ الانطلاق'}
                      </div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
                        {new Date(pkg.startDate).toLocaleDateString('ar-DZ')}
                      </div>
                    </div>
                  )}
                  {pkg.endDate && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px' }}>
                        {'تاريخ العودة'}
                      </div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
                        {new Date(pkg.endDate).toLocaleDateString('ar-DZ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: '2.5rem', background: 'rgba(10,126,181,0.06)', border: '1px solid rgba(10,126,181,0.2)', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A7EB5" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.8, margin: 0 }}>
                {'السعر المعروض لكل شخص. سيتواصل معك فريقنا بعد تأكيد الحجز لإتمام جميع التفاصيل.'}
              </p>
            </div>
          </div>

          <BookingCard
            packageId={pkg.id}
            packageTitle={pkg.title}
            country={pkg.country}
            duration={pkg.duration}
            price={pkg.price}
            currency={currency}
            startDate={pkg.startDate ? pkg.startDate.toISOString() : null}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
