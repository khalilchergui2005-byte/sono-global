export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [consultations, packages, messages, flightRequests, hotelRequests, serviceRequests, settings] = await Promise.all([
    db.consultation.count().catch(() => 0),
    db.package.count().catch(() => 0),
    db.contactMessage.count().catch(() => 0),
    db.flightRequest.count().catch(() => 0),
    db.hotelRequest.count().catch(() => 0),
    db.serviceRequest.count().catch(() => 0),
    db.siteSettings.findUnique({ where: { id: 'main' } }).catch(() => null),
  ]);

  const [recentConsultations, recentFlights, recentHotels] = await Promise.all([
    db.consultation.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }).catch(() => []),
    db.flightRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }).catch(() => []),
    db.hotelRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }).catch(() => []),
  ]);

  const agencyName = settings?.agencyName || 'وكالة سونو';
  const totalRequests = consultations + flightRequests + hotelRequests + serviceRequests;

  const stats = [
    {
      title: 'طلبات الاستشارة', value: consultations, color: '#f5a623', href: '/admin/consultations',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    },
    {
      title: 'الباقات السياحية', value: packages, color: '#0A7EB5', href: '/admin/packages',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    },
    {
      title: 'رسائل التواصل', value: messages, color: '#10b981', href: '/admin/messages',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    },
    {
      title: 'حجوزات الطيران', value: flightRequests, color: '#6366f1', href: '/admin/flights',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>,
    },
    {
      title: 'حجوزات الفنادق', value: hotelRequests, color: '#ec4899', href: '/admin/hotels',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    },
    {
      title: 'طلبات الخدمات', value: serviceRequests, color: '#14b8a6', href: '/admin/service-requests',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>,
    },
  ];

  const recentAll = [
    ...recentConsultations.map(r => ({ id: r.id, name: r.name, type: 'استشارة', date: r.createdAt, status: r.status, color: '#f5a623' })),
    ...recentFlights.map(r => ({ id: r.id, name: r.name, type: 'طيران', date: r.createdAt, status: r.status, color: '#6366f1' })),
    ...recentHotels.map(r => ({ id: r.id, name: r.name, type: 'فندق', date: r.createdAt, status: r.status, color: '#ec4899' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const quickLinks = [
    { label: 'الباقات', href: '/admin/packages', color: '#0A7EB5', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
    { label: 'الاستشارات', href: '/admin/consultations', color: '#f5a623', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: 'الرسائل', href: '/admin/messages', color: '#10b981', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: 'العمال', href: '/admin/staff', color: '#8b5cf6', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
    { label: 'الطيران', href: '/admin/flights', color: '#6366f1', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg> },
    { label: 'الإعدادات', href: '/admin/settings', color: '#94a3b8', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', fontFamily: 'Cairo, sans-serif', padding: '2rem', direction: 'rtl' }}>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 4px' }}>
          مرحباً — <span style={{ color: '#f5a623' }}>{agencyName}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>نظرة عامة على نشاط الوكالة</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.1), rgba(245,166,35,0.03))', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '16px', padding: '1.25rem 1.75rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>إجمالي الطلبات</div>
          <div style={{ color: '#f5a623', fontSize: '36px', fontWeight: 900 }}>{totalRequests}</div>
        </div>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(245,166,35,0.3)" strokeWidth="1"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(card => (
          <Link key={card.title} href={card.href} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${card.color}25`, borderTop: `3px solid ${card.color}`, borderRadius: '14px', padding: '1.25rem', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}>
            <div style={{ color: `${card.color}90`, marginBottom: '12px' }}>{card.icon}</div>
            <div style={{ color: card.color, fontSize: '32px', fontWeight: 900, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{card.title}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 700, margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            آخر الطلبات
          </h2>
          {recentAll.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>لا توجد طلبات بعد</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAll.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderRight: `3px solid ${r.color}` }}>
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{r.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{new Date(r.date).toLocaleDateString('ar-DZ')}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ background: `${r.color}20`, color: r.color, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{r.type}</span>
                    <span style={{ color: r.status === 'done' ? '#10b981' : '#f5a623', fontSize: '10px' }}>{r.status === 'done' ? 'مكتمل' : 'معلق'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ color: 'white', fontSize: '15px', fontWeight: 700, margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            إدارة سريعة
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {quickLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  background: link.color + '10',
                  border: '1px solid ' + link.color + '25',
                  borderRadius: '12px',
                  padding: '1rem',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ color: link.color + '90' }}>{link.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600 }}>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}