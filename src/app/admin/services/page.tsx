'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';

type Service = {
  id: string; title: string; slug: string; icon: string; color: string;
  image: string; imageLabel: string; description: string;
  details: string[]; destinations: string[]; visible: boolean; order: number;
};

const emptyService = () => ({
  title: '', icon: 'plane', color: '#0A7EB5',
  image: '', imageLabel: '', description: '',
  details: [''], destinations: [''], visible: true,
});

const COLORS = ['#0A7EB5','#2563eb','#059669','#d97706','#7c3aed','#db2777','#0891b2','#dc2626'];

const ICONS: { key: string; label: string; svg: string }[] = [
  { key: 'plane',     label: 'طيران',    svg: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z' },
  { key: 'passport',  label: 'جواز',     svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
  { key: 'globe',     label: 'عالمي',    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { key: 'briefcase', label: 'عمل',      svg: 'M20 6h-2.18c.07-.44.18-.88.18-1.35C18 3.15 16.85 2 15.35 2h-6.7C7.15 2 6 3.15 6 4.65c0 .47.1.91.18 1.35H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm2.35-12h-4.7c-.35 0-.65-.3-.65-.65 0-.35.3-.65.65-.65h4.7c.35 0 .65.3.65.65 0 .35-.3.65-.65.65z' },
  { key: 'mosque',    label: 'حج/عمرة',  svg: 'M12 3L2 9v2h2v9h16v-9h2V9L12 3zm0 2.5L20 10H4l8-4.5zM10 20v-6h4v6h-4z' },
  { key: 'hotel',     label: 'فندق',     svg: 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z' },
  { key: 'student',   label: 'دراسة',    svg: 'M12 3L1 9l4 2.18V15c0 3 5 5 7 5s7-2 7-5v-3.82L23 9 12 3zm6 8.99l-6 3.01-6-3.01V10l6-3 6 3v1.99z' },
  { key: 'map',       label: 'سياحة',    svg: 'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z' },
  { key: 'migration', label: 'هجرة',     svg: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
];

const Icon = ({ path, size = 18, color = 'currentColor' }: { path: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d={path} /></svg>
);

const ICON_PATHS: Record<string, string> = Object.fromEntries(ICONS.map(i => [i.key, i.svg]));

const PlusIcon   = () => <Icon path="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" size={16} />;
const EditIcon   = () => <Icon path="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" size={15} />;
const TrashIcon  = () => <Icon path="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" size={15} />;
const EyeIcon    = () => <Icon path="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" size={15} />;
const EyeOffIcon = () => <Icon path="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" size={15} />;
const CloseIcon  = () => <Icon path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" size={18} />;

function ArrayField({ label, values, onChange, placeholder }: {
  label: string; values: string[]; placeholder: string; onChange: (v: string[]) => void;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
        <button type="button" onClick={() => onChange([...values, ''])}
          style={{ background: 'rgba(10,126,181,0.15)', color: '#60A5FA', border: '1px solid rgba(10,126,181,0.3)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <PlusIcon /> إضافة
        </button>
      </div>
      {values.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <input value={v} onChange={e => { const a = [...values]; a[i] = e.target.value; onChange(a); }}
            placeholder={`${placeholder} ${i + 1}`}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', fontFamily: 'Cairo,sans-serif', outline: 'none' }}
          />
          <button type="button"
            onClick={() => { const a = [...values]; if (a.length > 1) { a.splice(i, 1); onChange(a); } else { a[i] = ''; onChange(a); } }}
            style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>
            x
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices]   = useState<Service[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]           = useState(emptyService());
  const fileRef                   = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/services')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setServices(data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof form, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setEditId(null); setForm(emptyService()); setShowModal(true); };

  const openEdit = (s: Service) => {
    setEditId(s.id);
    setForm({
      title: s.title, icon: s.icon, color: s.color,
      image: s.image, imageLabel: s.imageLabel, description: s.description,
      details:      s.details.length      ? s.details      : [''],
      destinations: s.destinations.length ? s.destinations : [''],
      visible: s.visible,
    });
    setShowModal(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await r.json();
    setUploading(false);
    if (d.url) set('image', d.url);
  };

  const save = async () => {
    if (!form.title.trim()) return alert('عنوان الخدمة مطلوب');
    setSaving(true);
    try {
      const payload = { ...form, details: form.details.filter(d => d.trim()), destinations: form.destinations.filter(d => d.trim()) };
      const url    = editId ? `/api/admin/services/${editId}` : '/api/admin/services';
      const method = editId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setShowModal(false); load(); }
      else alert('حدث خطأ في الحفظ');
    } catch { alert('حدث خطأ'); }
    finally { setSaving(false); }
  };

  const toggleVisible = async (s: Service) => {
    await fetch(`/api/admin/services/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visible: !s.visible }) });
    load();
  };

  const deleteService = async (id: string) => {
    if (!confirm('حذف هذه الخدمة نهائياً؟')) return;
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    load();
  };

  const F = form;

  return (
    <div style={{ padding: '2rem', fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: 0 }}>إدارة الخدمات</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '4px 0 0' }}>
            {services.length} خدمة — {services.filter(s => s.visible).length} مرئية
          </p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0A7EB5', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
          <PlusIcon /> خدمة جديدة
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', height: '150px', border: '1px solid rgba(255,255,255,0.06)' }} />)}
        </div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '20px', fontSize: '14px' }}>لا توجد خدمات — أضف أول خدمة</p>
          <button onClick={openAdd} style={{ background: '#0A7EB5', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <PlusIcon /> إضافة خدمة
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1rem' }}>
          {services.map(s => (
            <div key={s.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: `1px solid ${s.visible ? s.color + '25' : 'rgba(255,255,255,0.06)'}`, overflow: 'hidden', opacity: s.visible ? 1 : 0.5 }}>
              {s.image && (
                <div style={{ height: '90px', overflow: 'hidden', position: 'relative' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))' }} />
                  {s.imageLabel && <span style={{ position: 'absolute', bottom: '8px', right: '12px', color: 'white', fontSize: '11px', fontWeight: 700 }}>{s.imageLabel}</span>}
                </div>
              )}
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: s.color + '18', border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ICON_PATHS[s.icon] && <Icon path={ICON_PATHS[s.icon]} size={18} color={s.color} />}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>{s.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>/{s.slug}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button onClick={() => toggleVisible(s)} style={{ background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '7px 0 0 7px', padding: '7px 9px', cursor: 'pointer', color: s.visible ? '#10b981' : 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>
                      {s.visible ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                    <button onClick={() => openEdit(s)} style={{ background: 'rgba(255,255,255,0.04)', border: 'none', padding: '7px 9px', cursor: 'pointer', color: '#60A5FA', display: 'flex', alignItems: 'center' }}>
                      <EditIcon />
                    </button>
                    <button onClick={() => deleteService(s.id)} style={{ background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '0 7px 7px 0', padding: '7px 9px', cursor: 'pointer', color: '#F87171', display: 'flex', alignItems: 'center' }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                {s.description && (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: 1.6, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {s.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: s.color + '12', color: s.color, border: `1px solid ${s.color}25`, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>{s.details.length} ما يشمله</span>
                  <span style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' }}>{s.destinations.length} وجهة</span>
                  {!s.visible && <span style={{ background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' }}>مخفية</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div style={{ background: '#0f172a', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '740px', padding: '2rem', margin: '0 auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 800, margin: 0 }}>{editId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '4px 0 0' }}>{editId ? 'قم بتعديل بيانات الخدمة ثم احفظ' : 'أدخل بيانات الخدمة الجديدة'}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>عنوان الخدمة *</label>
              <input value={F.title} onChange={e => set('title', e.target.value)} placeholder="مثال: فيزا دراسية"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', fontFamily: 'Cairo,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>الأيقونة</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ICONS.map(ic => (
                  <button key={ic.key} type="button" onClick={() => set('icon', ic.key)} title={ic.label}
                    style={{ width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer', background: F.icon === ic.key ? F.color + '25' : 'rgba(255,255,255,0.04)', border: F.icon === ic.key ? `2px solid ${F.color}` : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    <Icon path={ic.svg} size={18} color={F.icon === ic.key ? F.color : 'rgba(255,255,255,0.4)'} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>اللون</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set('color', c)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: F.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', boxShadow: F.color === c ? `0 0 0 2px ${c}` : 'none' }} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>وصف الخدمة</label>
              <textarea value={F.description} onChange={e => set('description', e.target.value)} placeholder="وصف تفصيلي للخدمة يظهر للزوار..." rows={3}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', fontFamily: 'Cairo,sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>صورة الخدمة</label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ background: '#0A7EB5', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Cairo,sans-serif', fontWeight: 600 }}>
                    {uploading ? 'جاري الرفع...' : F.image ? 'تغيير الصورة' : 'رفع صورة'}
                  </button>
                  {F.image && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', wordBreak: 'break-all' }}>{F.image.split('/').pop()}</span>}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>وصف الصورة</label>
                <input value={F.imageLabel} onChange={e => set('imageLabel', e.target.value)} placeholder="باريس، فرنسا"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '13px', fontFamily: 'Cairo,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {F.image && (
              <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden', height: '90px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={F.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
              <ArrayField label="ما يشمله" values={F.details} placeholder="ميزة" onChange={v => set('details', v)} />
              <ArrayField label="الوجهات المتاحة" values={F.destinations} placeholder="وجهة" onChange={v => set('destinations', v)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <button type="button" onClick={() => set('visible', !F.visible)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', background: F.visible ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', right: F.visible ? '3px' : '23px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'right 0.2s' }} />
              </button>
              <span style={{ color: F.visible ? '#10b981' : 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600 }}>
                {F.visible ? 'الخدمة مرئية للزوار' : 'الخدمة مخفية عن الزوار'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
                إلغاء
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{ background: saving ? '#475569' : '#0A7EB5', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة الخدمة'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}