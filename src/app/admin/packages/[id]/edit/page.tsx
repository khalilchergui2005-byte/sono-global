'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPackage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '', country: '', duration: '', price: '',
    description: '', image: '', tag: '', visible: true,
    hasDateRange: false, startDate: '', endDate: '',
  });

  useEffect(() => {
    fetch(`/api/admin/packages/${id}`)
      .then(r => r.json())
      .then((pkg) => {
        if (pkg && pkg.id) setForm({
          title: pkg.title || '',
          country: pkg.country || '',
          duration: pkg.duration || '',
          price: pkg.price?.toString() || '',
          description: pkg.description || '',
          image: pkg.image || '',
          tag: pkg.tag || '',
          visible: pkg.visible ?? true,
          hasDateRange: !!(pkg.startDate || pkg.endDate),
          startDate: pkg.startDate ? new Date(pkg.startDate).toISOString().split('T')[0] : '',
          endDate: pkg.endDate ? new Date(pkg.endDate).toISOString().split('T')[0] : '',
        });
      });
  }, [id]);

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await r.json();
    setUploading(false);
    if (d.url) setForm(f => ({ ...f, image: d.url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          country: form.country,
          duration: form.duration,
          price: parseFloat(form.price),
          description: form.description,
          image: form.image,
          tag: form.tag,
          visible: form.visible,
          startDate: form.hasDateRange && form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate: form.hasDateRange && form.endDate ? new Date(form.endDate).toISOString() : null,
        }),
      });
      if (res.ok) router.push('/admin/packages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
    setDeleting(true);
    await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
    router.push('/admin/packages');
  };

  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
    padding: '11px 14px', color: 'white', fontSize: '13px',
    fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    color: 'rgba(255,255,255,0.6)', fontSize: '12px',
    fontWeight: 700, display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/admin/packages" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>← الباقات</a>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>تعديل الباقة</h1>
        </div>
        <button onClick={handleDelete} disabled={deleting} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
          {deleting ? 'جاري الحذف...' : 'حذف الباقة'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={lbl}>اسم الباقة *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>الدولة *</label>
              <input required value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>المدة *</label>
              <input required value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>السعر (دج) *</label>
              <input required type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>التاغ</label>
              <input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="مثال: الأكثر طلباً" style={inp} />
            </div>
            <div>
              <label style={lbl}>الحالة</label>
              <select value={form.visible ? 'true' : 'false'} onChange={e => setForm({ ...form, visible: e.target.value === 'true' })} style={{ ...inp, background: '#0d1530' }}>
                <option value="true">ظاهر في الموقع</option>
                <option value="false">مخفي</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>تاريخ العرض</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: form.hasDateRange ? '1rem' : 0 }}>
                <div onClick={() => setForm({ ...form, hasDateRange: !form.hasDateRange })} style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.hasDateRange ? '#f5a623' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '3px', right: form.hasDateRange ? '3px' : '23px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'all 0.2s' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{form.hasDateRange ? 'مفعّل' : 'بدون تاريخ محدد'}</span>
              </div>
              {form.hasDateRange && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={lbl}>يبدأ من</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} style={{ ...inp, colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label style={lbl}>ينتهي في</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} style={{ ...inp, colorScheme: 'dark' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={lbl}>صورة الباقة</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: '#0A7EB5', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>
                {uploading ? 'جاري الرفع...' : form.image ? 'تغيير الصورة' : 'رفع صورة'}
              </button>
              {form.image && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all' }}>{form.image.split('/').pop()}</span>}
            </div>
            {form.image && <img src={form.image} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '10px', marginTop: 12 }} />}
          </div>

          <div>
            <label style={lbl}>وصف الباقة</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inp, resize: 'none' }} />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #f5a623, #c47d0e)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 32px', fontSize: '14px', fontWeight: 700, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
      </form>
    </div>
  );
}