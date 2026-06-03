'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';

type Hotel = {
  id: string; name: string; city: string; country: string;
  stars: number; pricePerNight: number; currency: string;
  source: string; images: string[]; amenities: string[];
  description: string; visible: boolean; createdAt: string;
};

const empty = () => ({
  name: '', city: '', country: 'الجزائر',
  stars: 3, pricePerNight: 0, currency: 'DZD',
  source: 'direct', images: [] as string[], amenities: [''],
  description: '', visible: true,
});

export default function HotelsCatalogPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/admin/hotels-catalog');
    const d = await r.json();
    setHotels(Array.isArray(d) ? d : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(empty()); setShowModal(true); };
  const openEdit = (h: Hotel) => {
    setEditing(h);
    setForm({
      name: h.name, city: h.city, country: h.country,
      stars: h.stars, pricePerNight: h.pricePerNight, currency: h.currency,
      source: h.source, images: h.images.length ? [...h.images] : [],
      amenities: h.amenities.length ? [...h.amenities] : [''],
      description: h.description, visible: h.visible,
    });
    setShowModal(true);
  };

  const uploadImage = async (file: File, idx: number) => {
    setUploadingIdx(idx);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await r.json();
    setUploadingIdx(null);
    if (d.url) {
      setForm(f => {
        const imgs = [...f.images];
        imgs[idx] = d.url;
        return { ...f, images: imgs };
      });
    }
  };

  const addImageSlot = () => setForm(f => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i: number) => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }));

  const save = async () => {
    setSaving(true);
    const body = { ...form, images: form.images.filter(Boolean), amenities: form.amenities.filter(Boolean) };
    const url = editing ? '/api/admin/hotels-catalog/' + editing.id : '/api/admin/hotels-catalog';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false); setShowModal(false); load();
  };

  const toggleVisible = async (h: Hotel) => {
    await fetch('/api/admin/hotels-catalog/' + h.id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !h.visible }),
    });
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await fetch('/api/admin/hotels-catalog/' + deleteId, { method: 'DELETE' });
    setDeleteId(null); load();
  };

  const S: Record<string, React.CSSProperties> = {
    page: { padding: '32px', fontFamily: 'Cairo, sans-serif', direction: 'rtl', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    title: { fontSize: 26, fontWeight: 700, color: '#f1f5f9' },
    btn: { background: '#0A7EB5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 600, fontSize: 14 },
    btnSm: { background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 13, marginLeft: 6 },
    btnDel: { background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontSize: 13, marginLeft: 6 },
    table: { width: '100%', borderCollapse: 'collapse', background: '#1e293b', borderRadius: 12, overflow: 'hidden' },
    th: { background: '#0f172a', padding: '13px 16px', textAlign: 'right', fontWeight: 700, fontSize: 13, color: '#94a3b8', borderBottom: '1px solid #334155' },
    td: { padding: '13px 16px', borderBottom: '1px solid #1e293b', fontSize: 14, color: '#cbd5e1', verticalAlign: 'middle', background: '#1e293b' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { background: '#1e293b', borderRadius: 16, padding: 32, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', direction: 'rtl', border: '1px solid #334155' },
    label: { display: 'block', fontWeight: 600, marginBottom: 6, marginTop: 16, fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { width: '100%', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', fontSize: 14, fontFamily: 'Cairo, sans-serif', boxSizing: 'border-box', background: '#0f172a', color: '#f1f5f9' },
    row: { display: 'flex', gap: 12 },
    imgBox: { border: '2px dashed #334155', borderRadius: 10, padding: 12, marginBottom: 8, background: '#0f172a', display: 'flex', gap: 12, alignItems: 'center' },
    imgPreview: { width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #334155' },
    imgPlaceholder: { width: 72, height: 72, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 28 },
    uploadBtn: { background: '#0A7EB5', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo, sans-serif' },
    addBtn: { background: '#1e3a5f', color: '#7dd3fc', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, marginTop: 8, fontFamily: 'Cairo, sans-serif' },
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <span style={S.title}>إدارة الفنادق</span>
        <button style={S.btn} onClick={openAdd}>+ إضافة فندق</button>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>جاري التحميل...</p>
      ) : hotels.length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', marginTop: 60 }}>لا توجد فنادق بعد</p>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>الفندق</th>
              <th style={S.th}>المدينة</th>
              <th style={S.th}>النجوم</th>
              <th style={S.th}>السعر / ليلة</th>
              <th style={S.th}>الصور</th>
              <th style={S.th}>الظهور</th>
              <th style={S.th}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => (
              <tr key={h.id}>
                <td style={S.td}>
                  <strong style={{ color: '#f1f5f9' }}>{h.name}</strong>
                  <br /><span style={{ fontSize: 12, color: '#475569' }}>{h.country}</span>
                </td>
                <td style={S.td}>{h.city}</td>
                <td style={S.td}>
                  <span style={{ color: '#fbbf24' }}>{'★'.repeat(h.stars)}</span>
                  <span style={{ color: '#334155' }}>{'★'.repeat(5 - h.stars)}</span>
                </td>
                <td style={S.td}>{h.pricePerNight.toLocaleString()} {h.currency}</td>
                <td style={S.td}>
                  {h.images.length > 0 ? (
                    <img src={h.images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #334155' }} />
                  ) : (
                    <span style={{ color: '#475569', fontSize: 12 }}>لا صور</span>
                  )}
                  {h.images.length > 1 && <span style={{ fontSize: 11, color: '#64748b', marginRight: 4 }}>+{h.images.length - 1}</span>}
                </td>
                <td style={S.td}>
                  <span
                    onClick={() => toggleVisible(h)}
                    style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: h.visible ? '#14532d' : '#450a0a', color: h.visible ? '#4ade80' : '#f87171' }}
                  >
                    {h.visible ? 'ظاهر' : 'مخفي'}
                  </span>
                </td>
                <td style={S.td}>
                  <button style={S.btnSm} onClick={() => openEdit(h)}>تعديل</button>
                  <button style={S.btnDel} onClick={() => setDeleteId(h.id)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9', fontSize: 20 }}>{editing ? 'تعديل فندق' : 'إضافة فندق'}</h2>

            <div style={S.row}>
              <div style={{ flex: 2 }}>
                <label style={S.label}>اسم الفندق</label>
                <input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: فندق الأوراسي" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>النجوم</label>
                <select style={S.input} value={form.stars} onChange={e => setForm(f => ({ ...f, stars: Number(e.target.value) }))}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </div>
            </div>

            <div style={S.row}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>المدينة</label>
                <input style={S.input} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="الجزائر العاصمة" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>الدولة</label>
                <input style={S.input} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
            </div>

            <div style={S.row}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>السعر / ليلة</label>
                <input style={S.input} type="number" value={form.pricePerNight} onChange={e => setForm(f => ({ ...f, pricePerNight: Number(e.target.value) }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>العملة</label>
                <select style={S.input} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                  <option value="DZD">DZD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <label style={S.label}>الوصف</label>
            <textarea style={{ ...S.input, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <label style={S.label}>الصور</label>
            {form.images.map((img, i) => (
              <div key={i} style={S.imgBox}>
                {img ? (
                  <img src={img} alt="" style={S.imgPreview} />
                ) : (
                  <div style={S.imgPlaceholder}>+</div>
                )}
                <div style={{ flex: 1 }}>
                  <input
                    ref={el => { fileRefs.current[i] = el; }}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, i); }}
                  />
                  <button
                    style={S.uploadBtn}
                    onClick={() => fileRefs.current[i]?.click()}
                    disabled={uploadingIdx === i}
                  >
                    {uploadingIdx === i ? 'جاري الرفع...' : img ? 'تغيير الصورة' : 'رفع صورة'}
                  </button>
                  {img && <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0', wordBreak: 'break-all' }}>{img.split('/').pop()}</p>}
                </div>
                <button onClick={() => removeImage(i)} style={{ background: '#7f1d1d', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#fca5a5', fontSize: 18 }}>×</button>
              </div>
            ))}
            <button style={S.addBtn} onClick={addImageSlot}>+ إضافة صورة</button>

            <label style={{ ...S.label, marginTop: 20 }}>المرافق (سطر لكل مرفق)</label>
            {form.amenities.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input style={{ ...S.input, flex: 1 }} value={a} placeholder="مثال: واي فاي مجاني" onChange={e => setForm(f => { const arr = [...f.amenities]; arr[i] = e.target.value; return { ...f, amenities: arr }; })} />
                {form.amenities.length > 1 && (
                  <button onClick={() => setForm(f => ({ ...f, amenities: f.amenities.filter((_, j) => j !== i) }))} style={{ background: '#7f1d1d', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#fca5a5' }}>×</button>
                )}
              </div>
            ))}
            <button style={S.addBtn} onClick={() => setForm(f => ({ ...f, amenities: [...f.amenities, ''] }))}>+ مرفق</button>

            <label style={{ ...S.label, marginTop: 20 }}>الظهور</label>
            <select style={S.input} value={form.visible ? '1' : '0'} onChange={e => setForm(f => ({ ...f, visible: e.target.value === '1' }))}>
              <option value="1">ظاهر للزبائن</option>
              <option value="0">مخفي</option>
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
              <button style={{ ...S.btn, background: '#334155' }} onClick={() => setShowModal(false)}>إلغاء</button>
              <button style={S.btn} onClick={save} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, maxWidth: 380, textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: '#f1f5f9' }}>هل تريد حذف هذا الفندق؟</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={{ ...S.btn, background: '#334155' }} onClick={() => setDeleteId(null)}>إلغاء</button>
              <button style={S.btnDel} onClick={confirmDelete}>حذف نهائياً</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}