'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';

type StaffMember = {
  id: string; name: string; email: string; phone: string;
  active: boolean; permissions: string[]; createdAt: string;
};

type Service = { id: string; title: string; slug: string; color: string; icon: string; };

const FIXED_PERMISSIONS = [
  { slug: 'consultations',  label: 'طلبات الاستشارة', color: '#f5a623' },
  { slug: 'messages',       label: 'رسائل التواصل',   color: '#0A7EB5' },
  { slug: 'packages',       label: 'الباقات السياحية', color: '#10b981' },
  { slug: 'flights',        label: 'حجز الطيران',      color: '#6366f1' },
  { slug: 'hotels',         label: 'حجز الفنادق',      color: '#ec4899' },
];

const emptyForm = () => ({
  name: '', email: '', password: '', phone: '', permissions: [] as string[], active: true,
});

export default function AdminStaffPage() {
  const [staff, setStaff]         = useState<StaffMember[]>([]);
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState(emptyForm());

  const allPermissions = [
    ...FIXED_PERMISSIONS,
    ...services.map(s => ({ slug: s.slug, label: s.title, color: s.color })),
  ];

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/staff').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([s, sv]) => {
      if (Array.isArray(s)) setStaff(s);
      if (Array.isArray(sv)) setServices(sv);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditId(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (s: StaffMember) => {
    setEditId(s.id);
    setForm({ name: s.name, email: s.email, password: '', phone: s.phone || '', permissions: s.permissions, active: s.active });
    setShowModal(true);
  };

  const togglePermission = (slug: string) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(slug)
        ? p.permissions.filter(x => x !== slug)
        : [...p.permissions, slug],
    }));
  };

  const toggleAll = () => {
    const all = allPermissions.map(p => p.slug);
    setForm(p => ({
      ...p,
      permissions: p.permissions.length === all.length ? [] : all,
    }));
  };

  const save = async () => {
    if (!form.name || !form.email) return alert('الاسم والإيميل مطلوبان');
    if (!editId && !form.password) return alert('كلمة المرور مطلوبة');
    setSaving(true);
    try {
      const url    = editId ? `/api/admin/staff/${editId}` : '/api/admin/staff';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'حدث خطأ');
      setShowModal(false);
      load();
    } catch { alert('حدث خطأ'); }
    finally { setSaving(false); }
  };

  const deleteStaff = async (id: string) => {
    if (!confirm('حذف هذا العامل نهائياً؟')) return;
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleActive = async (s: StaffMember) => {
    await fetch(`/api/admin/staff/${s.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: s.name, phone: s.phone, permissions: s.permissions, active: !s.active }),
    });
    load();
  };

  const getPermLabel = (slug: string) => {
    const fixed = FIXED_PERMISSIONS.find(p => p.slug === slug);
    if (fixed) return { label: fixed.label, color: fixed.color };
    const svc = services.find(s => s.slug === slug);
    return svc ? { label: svc.title, color: svc.color } : null;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: 0 }}>إدارة العمال</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0 0' }}>
            {staff.length} عامل — {staff.filter(s => s.active).length} نشط
          </p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#0A7EB5', color: 'white', border: 'none',
          borderRadius: '10px', padding: '10px 20px', fontSize: '14px',
          fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة عامل
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', height: '180px', border: '1px solid rgba(255,255,255,0.06)' }} />)}
        </div>
      ) : staff.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 16px', display: 'block' }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>لا يوجد عمال — أضف أول عامل</p>
          <button onClick={openAdd} style={{ background: '#0A7EB5', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
            إضافة عامل
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1rem' }}>
          {staff.map(s => (
            <div key={s.id} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
              border: `1px solid ${s.active ? 'rgba(10,126,181,0.3)' : 'rgba(255,255,255,0.06)'}`,
              padding: '1.25rem', opacity: s.active ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(10,126,181,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A7EB5', fontWeight: 900, fontSize: '18px' }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '15px' }}>{s.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => toggleActive(s)}
                    style={{ background: s.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: s.active ? '#10b981' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button onClick={() => openEdit(s)}
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#60A5FA', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => deleteStaff(s.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>

              {s.phone && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '10px' }}>{s.phone}</div>
              )}

              <div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                  الصلاحيات ({s.permissions.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {s.permissions.length === 0 ? (
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>لا توجد صلاحيات</span>
                  ) : s.permissions.length === allPermissions.length ? (
                    <span style={{ background: 'rgba(245,166,35,0.2)', color: '#f5a623', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>
                      صلاحيات كاملة
                    </span>
                  ) : (
                    s.permissions.map(p => {
                      const info = getPermLabel(p);
                      return info ? (
                        <span key={p} style={{ background: info.color + '20', color: info.color, border: `1px solid ${info.color}30`, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
                          {info.label}
                        </span>
                      ) : null;
                    })
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '640px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 800, margin: 0 }}>
                {editId ? 'تعديل العامل' : 'إضافة عامل جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>الاسم *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="اسم العامل"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>الإيميل *</label>
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@example.com" type="email" disabled={!!editId}
                  style={{ width: '100%', background: editId ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: editId ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: '13px', fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>رقم الهاتف</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+213 XX XX XX XX"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', direction: 'ltr' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                  {editId ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور *'}
                </label>
                <input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••" type="password"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>صلاحيات الوصول</label>
                <button type="button" onClick={toggleAll}
                  style={{ background: 'rgba(10,126,181,0.2)', color: '#60A5FA', border: 'none', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
                  {form.permissions.length === allPermissions.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </button>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,215,0,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>الأقسام العامة</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {FIXED_PERMISSIONS.map(perm => (
                    <button key={perm.slug} type="button" onClick={() => togglePermission(perm.slug)}
                      style={{
                        background: form.permissions.includes(perm.slug) ? perm.color + '20' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${form.permissions.includes(perm.slug) ? perm.color + '50' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${form.permissions.includes(perm.slug) ? perm.color : 'rgba(255,255,255,0.2)'}`, background: form.permissions.includes(perm.slug) ? perm.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {form.permissions.includes(perm.slug) && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                      <span style={{ color: form.permissions.includes(perm.slug) ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, fontFamily: 'Cairo, sans-serif' }}>
                        {perm.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {services.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,215,0,0.4)', marginBottom: '8px', letterSpacing: '1px' }}>الخدمات</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {services.map(svc => (
                      <button key={svc.slug} type="button" onClick={() => togglePermission(svc.slug)}
                        style={{
                          background: form.permissions.includes(svc.slug) ? svc.color + '20' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${form.permissions.includes(svc.slug) ? svc.color + '50' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${form.permissions.includes(svc.slug) ? svc.color : 'rgba(255,255,255,0.2)'}`, background: form.permissions.includes(svc.slug) ? svc.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {form.permissions.includes(svc.slug) && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                        <span style={{ color: form.permissions.includes(svc.slug) ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, fontFamily: 'Cairo, sans-serif' }}>
                          {svc.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <button type="button" onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.active ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', right: form.active ? '3px' : '23px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'right 0.2s' }} />
              </button>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600 }}>
                {form.active ? 'العامل نشط ويمكنه تسجيل الدخول' : 'العامل معطل'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
                إلغاء
              </button>
              <button onClick={save} disabled={saving}
                style={{ background: saving ? '#64748b' : '#0A7EB5', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif' }}>
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة العامل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
