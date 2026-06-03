'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';

type Message = {
  id: string; name: string; email: string; phone?: string;
  subject?: string; message: string; isRead: boolean; createdAt: string;
};
type Stats = { total: number; unread: number; today: number };

const IconInbox = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='22 12 16 12 14 15 10 15 8 12 2 12'/>
    <path d='M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z'/>
  </svg>
);
const IconUnread = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='18' cy='5' r='3' fill='currentColor' stroke='none'/>
    <path d='M4 4h16v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4z'/>
    <polyline points='4 4 12 13 20 4'/>
  </svg>
);
const IconToday = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
    <rect x='3' y='4' width='18' height='18' rx='2'/>
    <line x1='16' y1='2' x2='16' y2='6'/>
    <line x1='8' y1='2' x2='8' y2='6'/>
    <line x1='3' y1='10' x2='21' y2='10'/>
    <line x1='8' y1='14' x2='16' y2='14'/>
  </svg>
);
const IconPhone = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z'/>
  </svg>
);
const IconClock = () => (
  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <circle cx='12' cy='12' r='10'/>
    <polyline points='12 6 12 12 16 14'/>
  </svg>
);
const IconMail = () => (
  <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z'/>
    <polyline points='22,6 12,13 2,6'/>
  </svg>
);
const IconWhatsapp = () => (
  <svg width='15' height='15' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'/>
  </svg>
);
const IconTrash = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='3 6 5 6 21 6'/>
    <path d='M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6'/>
    <path d='M10 11v6M14 11v6'/>
    <path d='M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2'/>
  </svg>
);
const IconCheck = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
    <polyline points='20 6 9 17 4 12'/>
  </svg>
);
const IconClose = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <line x1='18' y1='6' x2='6' y2='18'/>
    <line x1='6' y1='6' x2='18' y2='18'/>
  </svg>
);
const IconEmpty = () => (
  <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#cbd5e1' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z'/>
    <polyline points='22 12 16 12 14 15 10 15 8 12 2 12'/>
  </svg>
);
const IconCursor = () => (
  <svg width='44' height='44' viewBox='0 0 24 24' fill='none' stroke='#cbd5e1' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M4 4l7.07 17 2.51-7.39L21 11.07z'/>
  </svg>
);

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('ar-DZ', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const initials = (name: string) =>
  name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

const avatarColor = (name: string) => {
  const colors = ['#0A7EB5','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats]       = useState<Stats>({ total: 0, unread: 0, today: 0 });
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/admin/messages?status=' + filter)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setMessages(data.messages); setStats(data.stats); } })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filter]);

  const markRead = async (id: string, isRead: boolean) => {
    await fetch('/api/admin/messages/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, isRead } : null);
    setStats(prev => ({ ...prev, unread: isRead ? Math.max(0, prev.unread - 1) : prev.unread + 1 }));
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('حذف هذه الرسالة نهائيا؟')) return;
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setMessages(prev => prev.filter(m => m.id !== id));
    setSelected(null);
    setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
  };

  const statCards = [
    { label: 'إجمالي الرسائل', value: stats.total,  accent: '#0A7EB5', bg: '#eff6ff', Icon: IconInbox  },
    { label: 'غير مقروءة',                     value: stats.unread, accent: '#ef4444', bg: '#fff1f2', Icon: IconUnread },
    { label: 'رسائل اليوم',               value: stats.today,  accent: '#10b981', bg: '#ecfdf5', Icon: IconToday  },
  ];

  const filters = [
    { key: 'all',    label: 'الكل' },
    { key: 'unread', label: 'غير مقروءة' },
    { key: 'read',   label: 'مقروءة' },
  ];

  return (
    <div style={{ padding: '2rem 2rem 3rem', fontFamily: 'Cairo, sans-serif', direction: 'rtl', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ color: '#0A7EB5' }}><IconInbox /></div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: 0 }}>{'رسائل التواصل'}</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>{'جميع الرسائل الواردة من نموذج التواصل'}</p>
        </div>
        {stats.unread > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>{stats.unread}{' غير مقروءة'}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {statCards.map(({ label, value, accent, bg, Icon }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '1.25rem 1.5rem',
            border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '12px', background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0,
            }}>
              <Icon />
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '7px 20px', borderRadius: '8px', border: 'none',
            background: filter === f.key ? '#0A7EB5' : 'transparent',
            color: filter === f.key ? 'white' : 'rgba(255,255,255,0.5)',
            fontSize: '13px', fontWeight: 700, fontFamily: 'Cairo, sans-serif',
            cursor: 'pointer',
          }}>
            {f.label}
            {f.key === 'unread' && stats.unread > 0 && (
              <span style={{
                marginRight: '6px', background: filter === 'unread' ? 'rgba(255,255,255,0.25)' : '#ef4444',
                color: 'white', fontSize: '10px', fontWeight: 800,
                borderRadius: '10px', padding: '1px 6px',
              }}>{stats.unread}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.25rem', alignItems: 'flex-start' }}>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
              {loading ? 'جاري التحميل...' : (messages.length + ' رسالة')}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '8px', width: '40%' }} />
                      <div style={{ height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', width: '70%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><IconEmpty /></div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>{'لا توجد رسائل'}</p>
            </div>
          ) : messages.map(m => (
            <div key={m.id}
              onClick={() => { setSelected(m); if (!m.isRead) markRead(m.id, true); }}
              style={{
                padding: '14px 20px', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: selected?.id === m.id
                  ? 'rgba(10,126,181,0.12)'
                  : m.isRead ? 'transparent' : 'rgba(10,126,181,0.05)',
                borderRight: selected?.id === m.id
                  ? '3px solid #0A7EB5'
                  : m.isRead ? '3px solid transparent' : '3px solid rgba(10,126,181,0.4)',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: avatarColor(m.name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 800, color: 'white',
                flexShrink: 0, letterSpacing: '0.5px',
              }}>
                {initials(m.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: m.isRead ? 600 : 800, fontSize: '14px', color: 'white' }}>
                    {m.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconClock /> {fmt(m.createdAt)}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#0A7EB5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconMail /> {m.email}
                </div>
                <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.message}
                </div>
              </div>
              {!m.isRead && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: '8px' }} />
              )}
            </div>
          ))}
        </div>

        {selected ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden', position: 'sticky', top: '1rem',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>{'تفاصيل الرسالة'}</span>
              <button onClick={() => setSelected(null)} style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              }}>
                <IconClose />
              </button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: avatarColor(selected.name),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {initials(selected.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'white' }}>{selected.name}</div>
                    <div style={{ fontSize: '12px', color: '#0A7EB5', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <IconMail /> {selected.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selected.phone && (
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}><IconPhone /></span>
                      <span style={{ direction: 'ltr' }}>{selected.phone}</span>
                    </div>
                  )}
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconClock /> {fmt(selected.createdAt)}
                  </div>
                </div>
              </div>
              {selected.subject && (
                <div style={{ marginBottom: '10px', padding: '8px 12px', background: 'rgba(10,126,181,0.1)', borderRadius: '8px', border: '1px solid rgba(10,126,181,0.2)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{'الموضوع '}</span>
                  <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700 }}>{selected.subject}</span>
                </div>
              )}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.5px' }}>{'نص الرسالة'}</div>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem',
                  fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.9,
                  whiteSpace: 'pre-wrap', border: '1px solid rgba(255,255,255,0.06)',
                  minHeight: '100px',
                }}>
                  {selected.message}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={'mailto:' + selected.email + '?subject=' + encodeURIComponent('رد على رسالتك') + '&body=' + encodeURIComponent('السلام عليكم ' + selected.name + '،')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: '#0A7EB5', color: 'white', padding: '11px',
                    borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700,
                    fontFamily: 'Cairo, sans-serif',
                  }}>
                  <IconMail /> {'رد بالبريد الإلكتروني'}
                </a>
                {selected.phone && (
                  <a href={'https://wa.me/' + selected.phone.replace(/\D/g, '') + '?text=' + encodeURIComponent('السلام عليكم ' + selected.name + '، بخصوص رسالتكم...')}
                    target='_blank' rel='noreferrer'
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: '#22c55e', color: 'white', padding: '11px',
                      borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 700,
                      fontFamily: 'Cairo, sans-serif',
                    }}>
                    <IconWhatsapp /> {'رد على واتساب'}
                  </a>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => markRead(selected.id, !selected.isRead)} style={{
                    padding: '10px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                    color: selected.isRead ? '#ef4444' : '#10b981',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'Cairo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <IconCheck />
                    {selected.isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                  </button>
                  <button onClick={() => deleteMsg(selected.id)} style={{
                    padding: '10px', borderRadius: '10px',
                    border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.08)',
                    color: '#ef4444', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                    <IconTrash /> {'حذف الرسالة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)',
            padding: '4rem 2rem', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}><IconCursor /></div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
              {'اختر رسالة من القائمة'}<br />
              {'لعرض تفاصيلها'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}