export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import Link from 'next/link';

export default async function AdminPackages() {
  const packages = await db.package.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>الباقات السياحية</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{packages.length} باقة مسجلة</p>
        </div>
        <Link href="/admin/packages/new" style={{ background: 'linear-gradient(135deg, #f5a623, #c47d0e)', color: 'white', padding: '10px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
          + إضافة باقة جديدة
        </Link>
      </div>

      {packages.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>لا توجد باقات بعد — أضف أول باقة</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                {['الباقة', 'الدولة', 'المدة', 'السعر', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textAlign: 'right', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {pkg.image && <img src={pkg.image} alt="" style={{ width: '48px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />}
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{pkg.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{pkg.country}</td>
                  <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{pkg.duration}</td>
                  <td style={{ padding: '14px 16px', color: '#f5a623', fontSize: '13px', fontWeight: 700 }}>{pkg.price.toLocaleString()} دج</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: pkg.visible ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: pkg.visible ? '#10b981' : '#ef4444', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                      {pkg.visible ? 'ظاهر' : 'مخفي'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={'/admin/packages/' + pkg.id + '/edit'} style={{ background: 'rgba(10,126,181,0.15)', color: '#0A7EB5', padding: '5px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                      تعديل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}