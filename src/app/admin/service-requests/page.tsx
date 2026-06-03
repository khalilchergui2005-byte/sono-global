'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';

type ServiceRequest = {
  id: string; name: string; phone: string;
  serviceSlug: string; serviceTitle: string;
  message: string | null; status: string;
  isRead: boolean; createdAt: string;
};
type Service = { id: string; title: string; slug: string; color: string; };
type Msg = { id: string; senderType: string; senderName: string; body: string; createdAt: string };

function ChatPanel({ requestId, clientName, onClose }: { requestId: string; clientName: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/request-messages?requestType=service_request&requestId=' + requestId);
    if (res.ok) setMessages(await res.json());
  }, [requestId]);

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/request-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'service_request',
        requestId,
        senderType: 'staff',
        senderId: 'admin',
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
            <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{'محادثة مع '}{clientName}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{'الردود تظهر لدى الزبون في حسابه'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '32px', height: '32px', fontSize: '16px', fontFamily: 'Cairo,sans-serif' }}>{'×'}</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>{'لا توجد رسائل بعد'}</div>
          ) : messages.map(m => {
            const isStaff = m.senderType === 'staff' || m.senderType === 'admin';
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isStaff ? 'flex-end' : 'flex-start' }}>
                <div style={{ background: isStaff ? 'linear-gradient(135deg,#0A7EB5,#0369a1)' : 'rgba(255,255,255,0.06)', color: 'white', borderRadius: isStaff ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', maxWidth: '80%', fontSize: '13px', lineHeight: 1.6 }}>
                  {m.body}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginTop: '4px' }}>
                  {isStaff ? m.senderName : clientName}{' · '}{new Date(m.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
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
            placeholder={'اكتب ردك للزبون...'}
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'Cairo,sans-serif' }}
          />
          <button onClick={send} disabled={sending || !text.trim()}
            style={{ background: 'linear-gradient(135deg,#0A7EB5,#0369a1)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: !text.trim() ? 0.5 : 1, fontFamily: 'Cairo,sans-serif' }}>
            {'إرسال'}
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#f5a623',
  in_progress: '#6366f1',
  done: '#10b981',
  cancelled: '#ef4444',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'معلق',
  in_progress: 'جاري',
  done: 'مكتمل',
  cancelled: 'ملغى',
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [chat, setChat] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/service-requests' + (selectedSlug !== 'all' ? '?slug=' + selectedSlug : '')).then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
    ]).then(([reqs, svcs]) => {
      if (Array.isArray(reqs)) setRequests(reqs);
      if (Array.isArray(svcs)) setServices(svcs);
    }).finally(() => setLoading(false));
  }, [selectedSlug]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch('/api/admin/service-requests/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
    setUpdating(null);
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('حذف هذا الطلب نهائيا؟')) return;
    await fetch('/api/admin/service-requests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const getColor = (slug: string) => services.find(s => s.slug === slug)?.color || '#0A7EB5';

  return (
    <div style={{ padding: '2rem', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      {chat && <ChatPanel requestId={chat.id} clientName={chat.name} onClose={() => setChat(null)} />}

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: 0 }}>{'طلبات الخدمات'}</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0 0' }}>
          {requests.length}{' طلب مسجل'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setSelectedSlug('all')} style={{
          background: selectedSlug === 'all' ? '#0A7EB5' : 'rgba(255,255,255,0.05)',
          color: selectedSlug === 'all' ? 'white' : 'rgba(255,255,255,0.5)',
          border: '1px solid ' + (selectedSlug === 'all' ? '#0A7EB5' : 'rgba(255,255,255,0.1)'),
          padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
          fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
        }}>{'الكل'}</button>
        {services.map(s => (
          <button key={s.slug} onClick={() => setSelectedSlug(s.slug)} style={{
            background: selectedSlug === s.slug ? s.color : 'rgba(255,255,255,0.05)',
            color: selectedSlug === s.slug ? 'white' : 'rgba(255,255,255,0.5)',
            border: '1px solid ' + (selectedSlug === s.slug ? s.color : 'rgba(255,255,255,0.1)'),
            padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          }}>{s.title}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', height: '120px' }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{'لا توجد طلبات'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map(r => (
            <div key={r.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRight: '3px solid ' + (STATUS_COLOR[r.status] || getColor(r.serviceSlug)),
              borderRadius: '14px', padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: getColor(r.serviceSlug) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(r.serviceSlug), fontWeight: 700, fontSize: '14px' }}>
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{r.name}</div>
                      <a href={'tel:' + r.phone} style={{ color: '#0A7EB5', fontSize: '12px', textDecoration: 'none' }}>{r.phone}</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span style={{ background: getColor(r.serviceSlug) + '20', color: getColor(r.serviceSlug), padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                      {r.serviceTitle}
                    </span>
                    <span style={{ background: (STATUS_COLOR[r.status] || '#0A7EB5') + '20', color: STATUS_COLOR[r.status] || '#0A7EB5', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', padding: '3px 0' }}>
                      {new Date(r.createdAt).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                  {r.message && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>{r.message}</p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                  <select
                    value={r.status}
                    onChange={e => updateStatus(r.id, e.target.value)}
                    disabled={updating === r.id}
                    style={{ background: 'rgba(255,255,255,0.05)', color: STATUS_COLOR[r.status] || 'white', border: '1px solid ' + (STATUS_COLOR[r.status] || '#0A7EB5') + '40', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', outline: 'none', opacity: updating === r.id ? 0.5 : 1 }}>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <button onClick={() => setChat({ id: r.id, name: r.name })}
                    style={{ background: 'rgba(10,126,181,0.08)', color: '#38bdf8', border: '1px solid rgba(10,126,181,0.2)', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg>
                    {'محادثة'}
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a href={'https://wa.me/' + r.phone.replace(/\D/g, '')} target='_blank' rel='noreferrer'
                      style={{ background: 'rgba(37,211,102,0.15)', color: '#25d366', padding: '5px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                      {'واتساب'}
                    </a>
                    <button onClick={() => deleteRequest(r.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
                      {'حذف'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}