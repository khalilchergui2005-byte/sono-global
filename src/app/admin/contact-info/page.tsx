'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';

type DynamicSettings = {
  phones: string[]; whatsapp: string[]; emails: string[];
  facebook: string[]; instagram: string[]; tiktok: string[]; youtube: string[];
  address: string; mapsUrl: string; workingHours: string;
};

const initialForm: DynamicSettings = {
  phones: [''], whatsapp: [''], emails: [''],
  facebook: [''], instagram: [''], tiktok: [''], youtube: [''],
  address: '', mapsUrl: '', workingHours: '',
};

type SectionProps = {
  title: string; icon: string; field: keyof DynamicSettings;
  placeholder: string; type?: string; list: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

function DynamicSection({ title, icon, placeholder, type = 'text', list, onChange, onAdd, onRemove }: SectionProps) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{icon} {title}</span>
        <button type="button" onClick={onAdd} style={{ background: 'rgba(59,130,246,0.2)', color: '#60A5FA', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + إضافة المزيد
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type={type}
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={`${placeholder} (${index + 1})`}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14,
                fontFamily: 'Cairo,sans-serif', outline: 'none',
              }}
            />
            <button type="button" onClick={() => onRemove(index)} style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContactSettingsPage() {
  const [form, setForm] = useState<DynamicSettings>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const setupFormData = (data: any) => {
    if (data && !data.error) {
      setForm({
        phones:      data.phones?.length      ? data.phones      : [''],
        whatsapp:    data.whatsapp?.length    ? data.whatsapp    : [''],
        emails:      data.emails?.length      ? data.emails      : [''],
        facebook:    data.facebook?.length    ? data.facebook    : [''],
        instagram:   data.instagram?.length   ? data.instagram   : [''],
        tiktok:      data.tiktok?.length      ? data.tiktok      : [''],
        youtube:     data.youtube?.length     ? data.youtube     : [''],
        address:     data.address     || '',
        mapsUrl:     data.mapsUrl     || '',
        workingHours: data.workingHours || '',
      });
    }
  };

  useEffect(() => {
    fetch('/api/admin/contact')
      .then(r => r.json())
      .then(data => {
        setupFormData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleArrayChange = useCallback((field: keyof DynamicSettings, index: number, value: string) => {
    setForm(prev => {
      const arr = [...(prev[field] as string[])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  }, []);

  const addField = useCallback((field: keyof DynamicSettings) => {
    setForm(prev => ({ ...prev, [field]: [...(prev[field] as string[]), ''] }));
  }, []);

  const removeField = useCallback((field: keyof DynamicSettings, index: number) => {
    setForm(prev => {
      const arr = [...(prev[field] as string[])];
      if (arr.length > 1) arr.splice(index, 1);
      else arr[index] = '';
      return { ...prev, [field]: arr };
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const cleanedForm = {
        phones:      form.phones.filter(p => p.trim() !== ''),
        whatsapp:    form.whatsapp.filter(w => w.trim() !== ''),
        emails:      form.emails.filter(e => e.trim() !== ''),
        facebook:    form.facebook.filter(f => f.trim() !== ''),
        instagram:   form.instagram.filter(i => i.trim() !== ''),
        tiktok:      form.tiktok.filter(t => t.trim() !== ''),
        youtube:     form.youtube.filter(y => y.trim() !== ''),
        address:     form.address.trim(),
        mapsUrl:     form.mapsUrl.trim(),
        workingHours: form.workingHours.trim(),
      };

      const res = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedForm),
      });

      const updatedData = await res.json();

      if (res.ok && !updatedData.error) {
        setupFormData(updatedData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(updatedData.error || 'حدث خطأ في الحفظ');
      }
    } catch (e) {
      console.error(e);
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.3)', fontFamily: 'Cairo,sans-serif' }}>
      جاري التحميل...
    </div>
  );

  const sections: Array<{ title: string; icon: string; field: keyof DynamicSettings; placeholder: string; type?: string }> = [
    { title: 'أرقام الهاتف',      icon: '📞', field: 'phones',   placeholder: '+213 XXX XXX XXX', type: 'tel' },
    { title: 'حسابات واتساب',     icon: '📱', field: 'whatsapp', placeholder: '+213 XXX XXX XXX', type: 'tel' },
    { title: 'البريد الإلكتروني', icon: '✉️', field: 'emails',   placeholder: 'example@sono.com', type: 'email' },
  ];

  const socialSections: Array<{ title: string; icon: string; field: keyof DynamicSettings; placeholder: string }> = [
    { title: 'روابط فيسبوك',   icon: '📘', field: 'facebook',  placeholder: 'https://facebook.com/...' },
    { title: 'روابط إنستغرام', icon: '📷', field: 'instagram', placeholder: 'https://instagram.com/...' },
    { title: 'روابط تيك توك',  icon: '🎵', field: 'tiktok',    placeholder: 'https://tiktok.com/@...' },
    { title: 'قنوات يوتيوب',   icon: '🎥', field: 'youtube',   placeholder: 'https://youtube.com/...' },
  ];

  return (
    <div style={{ padding: '32px', fontFamily: 'Cairo,sans-serif', direction: 'rtl', color: '#fff', maxWidth: 950, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>إعدادات التواصل</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>يمكنك إضافة أي عدد من وسائل التواصل والهواتف بحرية كاملة</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {error && (
            <span style={{ color: '#F87171', fontSize: 13, background: 'rgba(239,68,68,0.1)', padding: '8px 14px', borderRadius: 8 }}>
              ⚠️ {error}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: saved ? '#10B981' : '#3B82F6',
              color: '#fff', border: 'none',
              padding: '12px 28px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'جاري الحفظ...' : saved ? '✓ تم الحفظ' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>📞 أرقام الهاتف والاتصال</h3>
          {sections.map(s => (
            <DynamicSection
              key={s.field}
              {...s}
              list={form[s.field] as string[]}
              onChange={(i, v) => handleArrayChange(s.field, i, v)}
              onAdd={() => addField(s.field)}
              onRemove={(i) => removeField(s.field, i)}
            />
          ))}
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>🕐 ساعات العمل</label>
            <input
              type="text"
              value={form.workingHours}
              onChange={(e) => setForm(p => ({ ...p, workingHours: e.target.value }))}
              placeholder="مثال: الأحد — الخميس: 9ص — 6م"
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontFamily: 'Cairo,sans-serif', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>🌐 شبكات التواصل الاجتماعي والعنوان</h3>
          {socialSections.map(s => (
            <DynamicSection
              key={s.field}
              {...s}
              list={form[s.field] as string[]}
              onChange={(i, v) => handleArrayChange(s.field, i, v)}
              onAdd={() => addField(s.field)}
              onRemove={(i) => removeField(s.field, i)}
            />
          ))}
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>📍 العنوان الكامل</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="مثال: شارع الاستقلال، سطيف"
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontFamily: 'Cairo,sans-serif', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>🗺️ رابط الخريطة (Google Maps)</label>
            <input
              type="text"
              value={form.mapsUrl}
              onChange={(e) => setForm(p => ({ ...p, mapsUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontFamily: 'Cairo,sans-serif', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}