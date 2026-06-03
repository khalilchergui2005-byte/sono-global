'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type StaffSession = { id: string; name: string; email: string; permissions: string[]; };
type Item = {
  id: string; name: string; phone: string; service: string;
  serviceSlug?: string | null; message: string | null;
  status: string; createdAt: string;
  _source: 'consultation' | 'request' | 'flight' | 'hotel';
  from?: string; to?: string; departDate?: string; returnDate?: string;
  tripType?: string; cabin?: string; adults?: number; children?: number;
  infants?: number; payment?: string;
  city?: string; hotelName?: string; checkIn?: string; checkOut?: string;
  rooms?: number; stars?: string;
};
type Service = { id: string; title: string; slug: string; color: string; };
type Msg = { id: string; senderType: string; senderName: string; body: string; createdAt: string };

const FIXED_SECTIONS: Record<string, { label: string; color: string }> = {
  consultations: { label: 'طلبات الاستشارة', color: '#f5a623' },
  messages:      { label: 'رسائل التواصل',   color: '#0A7EB5' },
  packages:      { label: 'الباقات السياحية', color: '#10b981' },
  flights:       { label: 'حجز الطيران',      color: '#6366f1' },
  hotels:        { label: 'حجز الفنادق',      color: '#ec4899' },
};

function ChatPanel({
  requestType, requestId, clientName, onClose,
}: {
  requestType: string; requestId: string; clientName: string; onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/request-messages?requestType=${requestType}&requestId=${requestId}`);
    if (res.ok) setMessages(await res.json());
  }, [requestType, requestId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/request-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType,
        requestId,
        senderType: 'staff',
        senderId: 'staff',
        senderName: 'فريق SONO',
        body: text.trim(),
      }),
    });
    setText('');
    await load();
    setSending(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#0d1530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', width: '100%', maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>محادثة — {clientName}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>الردود تظهر لدى الزبون في حسابه</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '32px', height: '32px', fontSize: '16px', fontFamily: 'Cairo,sans-serif' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>لا توجد رسائل بعد</div>
          ) : messages.map(m => {
            const isStaff = m.senderType === 'staff' || m.senderType === 'admin';
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isStaff ? 'flex-end' : 'flex-start' }}>
                <div style={{ background: isStaff ? 'linear-gradient(135deg,#0A7EB5,#0369a1)' : 'rgba(255,255,255,0.06)', color: 'white', borderRadius: isStaff ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px', lineHeight: 1.6 }}>
                  {m.body}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginTop: '4px' }}>
                  {isStaff ? m.senderName : clientName} · {new Date(m.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="اكتب ردك للزبون..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'Cairo,sans-serif' }}
          />
          <button onClick={send} disabled={sending || !text.trim()}
            style={{ background: 'linear-gradient(135deg,#0A7EB5,#0369a1)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: !text.trim() ? 0.5 : 1, fontFamily: 'Cairo,sans-serif' }}>
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const router = useRouter();
  const [staff, setStaff]         = useState<StaffSession | null>(null);
  const [services, setServices]   = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [items, setItems]         = useState<Item[]>([]);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState<string | null>(null);
  const [filter, setFilter]       = useState('all');
  const [chat, setChat]           = useState<{ id: string; name: string; type: string } | null>(null);

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => { if (Array.isArray(d)) setServices(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/staff/me')
      .then(async res => {
        if (!res.ok) { router.push('/staff/login'); return; }
        const data = await res.json();
        const session: StaffSession = {
          id: data.id,
          name: data.name,
          email: data.email,
          permissions: data.permissions ?? [],
        };
        setStaff(session);
        const perms = session.permissions.filter((p: string) => p !== 'settings');
        if (perms.length > 0) setActiveTab(perms[0]);
      })
      .catch(() => router.push('/staff/login'));
  }, [router]);

  const getLabel = (slug: string) => {
    if (FIXED_SECTIONS[slug]) return FIXED_SECTIONS[slug].label;
    return services.find(s => s.slug === slug)?.title || slug;
  };
  const getColor = (slug: string) => {
    if (FIXED_SECTIONS[slug]) return FIXED_SECTIONS[slug].color;
    return services.find(s => s.slug === slug)?.color || '#0A7EB5';
  };

  const getRequestType = (source: string) => {
    if (source === 'consultation') return 'consultation';
    if (source === 'flight') return 'flight';
    if (source === 'hotel') return 'hotel';
    return 'service_request';
  };

  const loadData = useCallback(() => {
    if (!activeTab) return;
    setLoading(true);
    setFilter('all');

    if (activeTab === 'consultations') {
      fetch('/api/admin/consultations')
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          setItems(data.map((c: Record<string, unknown>) => ({
            id: c.id as string, name: c.name as string, phone: c.phone as string,
            service: c.service as string, serviceSlug: c.serviceSlug as string | null,
            message: c.message as string | null, status: c.status as string,
            createdAt: c.createdAt as string, _source: 'consultation' as const,
          })));
        }).finally(() => setLoading(false));

    } else if (activeTab === 'messages') {
      fetch('/api/admin/messages')
        .then(r => r.json())
        .then(data => {
          const msgs = data.messages || [];
          setItems(msgs.map((c: Record<string, unknown>) => ({
            id: c.id as string, name: c.name as string, phone: c.phone as string,
            service: 'رسالة تواصل',
            serviceSlug: null, message: c.message as string | null,
            status: (c.isRead as boolean) ? 'done' : 'pending',
            createdAt: c.createdAt as string, _source: 'consultation' as const,
          })));
        }).finally(() => setLoading(false));

    } else if (activeTab === 'flights') {
      fetch('/api/flights')
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          setItems(data.map((c: Record<string, unknown>) => ({
            id: c.id as string, name: c.name as string, phone: c.phone as string,
            service: 'حجز طيران', serviceSlug: null,
            message: c.notes as string | null, status: c.status as string,
            createdAt: c.createdAt as string, _source: 'flight' as const,
            from: c.from as string, to: c.to as string,
            departDate: c.departDate as string, returnDate: c.returnDate as string | undefined,
            tripType: c.tripType as string, cabin: c.cabin as string,
            adults: c.adults as number, children: c.children as number,
            infants: c.infants as number, payment: c.payment as string,
          })));
        }).finally(() => setLoading(false));

    } else if (activeTab === 'hotels') {
      fetch('/api/hotels')
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          setItems(data.map((c: Record<string, unknown>) => ({
            id: c.id as string, name: c.name as string, phone: c.phone as string,
            service: 'حجز فندق', serviceSlug: null,
            message: c.notes as string | null, status: c.status as string,
            createdAt: c.createdAt as string, _source: 'hotel' as const,
            city: c.city as string, hotelName: c.hotelName as string | undefined,
            checkIn: c.checkIn as string, checkOut: c.checkOut as string,
            rooms: c.rooms as number, adults: c.adults as number,
            children: c.children as number, stars: c.stars as string | undefined,
            payment: c.payment as string,
          })));
        }).finally(() => setLoading(false));

    } else {
      fetch(`/api/admin/service-requests?slug=${activeTab}`)
        .then(r => r.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          setItems(data.map((c: Record<string, unknown>) => ({
            id: c.id as string, name: c.name as string, phone: c.phone as string,
            service: (c.serviceTitle as string) || activeTab, serviceSlug: c.serviceSlug as string,
            message: c.message as string | null, status: c.status as string,
            createdAt: c.createdAt as string, _source: 'request' as const,
          })));
        }).finally(() => setLoading(false));
    }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStatus = async (item: Item, status: string) => {
    setUpdating(item.id);
    const endpoint =
      item._source === 'consultation' ? `/api/admin/consultations/${item.id}` :
      item._source === 'flight'       ? `/api/flights/${item.id}` :
      item._source === 'hotel'        ? `/api/hotels/${item.id}` :
      `/api/admin/service-requests/${item.id}`;
    await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
    setUpdating(null);
  };

  const logout = async () => {
    await fetch('/api/staff/logout', { method: 'POST' });
    router.push('/staff/login');
  };

  if (!staff) return null;

  const activeColor = getColor(activeTab);
  const visiblePerms = staff.permissions.filter(p => p !== 'settings');
  const displayed = items.filter(c => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'done') return c.status === 'done';
    return true;
  });

  return (
    <div translate="no" style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#060d24,#0a1628)', fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>

      {chat && (
        <ChatPanel
          requestType={chat.type}
          requestId={chat.id}
          clientName={chat.name}
          onClose={() => setChat(null)}
        />
      )}

      <header style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0.9rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `linear-gradient(135deg,${activeColor},${activeColor}90)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '17px' }}>
            {staff.name.charAt(0)}
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{staff.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{visiblePerms.length} قسم مخصص</div>
          </div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(239,68,68,0.08)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          خروج
        </button>
      </header>

      <nav style={{ padding: '0 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {visiblePerms.map(perm => {
          const active = activeTab === perm;
          const color = getColor(perm);
          return (
            <button key={perm} onClick={() => setActiveTab(perm)} style={{ background: 'transparent', color: active ? color : 'rgba(255,255,255,0.4)', border: 'none', borderBottom: active ? `2px solid ${color}` : '2px solid transparent', padding: '12px 20px', fontSize: '13px', fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
              {getLabel(perm)}
            </button>
          );
        })}
      </nav>

      <main style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '4px', height: '28px', borderRadius: '4px', background: activeColor }} />
          <div>
            <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 900, margin: 0 }}>{getLabel(activeTab)}</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '3px 0 0' }}>{items.length} طلب إجمالي</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'إجمالي', value: items.length, color: activeColor },
            { label: 'معلقة', value: items.filter(c => c.status === 'pending').length, color: '#f5a623' },
            { label: 'مكتملة', value: items.filter(c => c.status === 'done').length, color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}25`, borderTop: `3px solid ${s.color}`, borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ color: s.color, fontSize: '28px', fontWeight: 900 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '6px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {[{ key: 'all', label: 'الكل' }, { key: 'pending', label: 'معلقة' }, { key: 'done', label: 'مكتملة' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ background: filter === f.key ? activeColor : 'rgba(255,255,255,0.04)', color: filter === f.key ? 'white' : 'rgba(255,255,255,0.45)', border: `1px solid ${filter === f.key ? activeColor : 'rgba(255,255,255,0.08)'}`, padding: '7px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1,2,3].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', height: '110px' }} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '18px' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" style={{ display: 'block', margin: '0 auto 14px' }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: 0 }}>لا توجد طلبات</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayed.map(c => (
              <div key={c.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRight: `3px solid ${c.status === 'done' ? '#10b981' : '#f5a623'}`, borderRadius: '14px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${activeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeColor, fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{c.name}</div>
                        <a href={`tel:${c.phone}`} style={{ color: '#0A7EB5', fontSize: '12px', textDecoration: 'none' }}>{c.phone}</a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ background: `${activeColor}18`, color: activeColor, border: `1px solid ${activeColor}30`, padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{c.service}</span>
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', padding: '3px 0' }}>{new Date(c.createdAt).toLocaleDateString('ar-DZ')}</span>
                    </div>

                    {c._source === 'flight' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {[
                          c.from && c.to ? `${c.from} ← ${c.to}` : null,
                          c.departDate ? `ذهاب: ${c.departDate}` : null,
                          c.returnDate ? `عودة: ${c.returnDate}` : null,
                          c.tripType === 'round' ? 'ذهاب وإياب' : 'ذهاب فقط',
                          c.cabin,
                          c.adults ? `${c.adults} بالغ` : null,
                          c.children ? `${c.children} طفل` : null,
                          c.infants ? `${c.infants} رضيع` : null,
                          c.payment,
                        ].filter(Boolean).map((tag, i) => (
                          <span key={i} style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 10px', borderRadius: '20px', fontSize: '11px' }}>{tag}</span>
                        ))}
                      </div>
                    )}

                    {c._source === 'hotel' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {[
                          c.city,
                          c.hotelName || null,
                          c.stars || null,
                          c.checkIn ? `دخول: ${c.checkIn}` : null,
                          c.checkOut ? `خروج: ${c.checkOut}` : null,
                          c.rooms ? `${c.rooms} غرفة` : null,
                          c.adults ? `${c.adults} بالغ` : null,
                          c.children ? `${c.children} طفل` : null,
                          c.payment,
                        ].filter(Boolean).map((tag, i) => (
                          <span key={i} style={{ background: 'rgba(236,72,153,0.12)', color: '#f9a8d4', border: '1px solid rgba(236,72,153,0.2)', padding: '2px 10px', borderRadius: '20px', fontSize: '11px' }}>{tag}</span>
                        ))}
                      </div>
                    )}

                    {(c._source === 'consultation' || c._source === 'request') && c.message && (
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: 1.65, margin: '6px 0 0' }}>{c.message}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                    <button
                      onClick={() => updateStatus(c, c.status === 'pending' ? 'done' : 'pending')}
                      disabled={updating === c.id}
                      style={{ background: c.status === 'done' ? 'rgba(16,185,129,0.12)' : 'rgba(245,166,35,0.12)', color: c.status === 'done' ? '#10b981' : '#f5a623', border: `1px solid ${c.status === 'done' ? 'rgba(16,185,129,0.3)' : 'rgba(245,166,35,0.3)'}`, padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', opacity: updating === c.id ? 0.5 : 1, minWidth: '90px' }}>
                      {updating === c.id ? '...' : c.status === 'done' ? 'مكتمل' : 'معلق'}
                    </button>
                    <button
                      onClick={() => setChat({ id: c.id, name: c.name, type: getRequestType(c._source) })}
                      style={{ background: 'rgba(10,126,181,0.08)', color: '#38bdf8', border: '1px solid rgba(10,126,181,0.2)', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      محادثة
                    </button>
                    <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                      style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)', padding: '7px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.844L.057 23.625a.75.75 0 00.918.918l5.78-1.471A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.666-.5-5.203-1.373l-.371-.214-3.853.981.999-3.742-.234-.385A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
