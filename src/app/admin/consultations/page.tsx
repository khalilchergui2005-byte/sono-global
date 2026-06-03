'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, useCallback } from 'react';

type Consultation = {
  id: string; name: string; phone: string; service: string;
  message: string | null; status: string; paid: boolean; createdAt: string;
};
type Msg = { id: string; senderType: string; senderName: string; body: string; createdAt: string };

const STATUS_COLOR: Record<string,string> = { pending: '#f5a623', in_progress: '#6366f1', done: '#10b981', cancelled: '#ef4444' };
const STATUS_LABEL: Record<string,string> = { pending: 'معلق', in_progress: 'جاري', done: 'مكتمل', cancelled: 'ملغى' };

function ChatPanel({ consultationId, clientName, onClose }: { consultationId: string; clientName: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/request-messages?requestType=consultation&requestId=' + consultationId);
    if (res.ok) setMessages(await res.json());
  }, [consultationId]);

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/request-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'consultation', requestId: consultationId, senderType: 'staff', senderId: 'admin', senderName: 'فريق SONO', body: text.trim() }),
    });
    setText(''); await load(); setSending(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#0d1530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', width: '100%', maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>محادثة — {clientName}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>الردود تظهر لدى الزبون في حسابه</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '32px', height: '32px', fontSize: '16px' }}>×</button>
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
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="اكتب ردك للزبون..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'Cairo,sans-serif' }} />
          <button onClick={send} disabled={sending || !text.trim()}
            style={{ background: 'linear-gradient(135deg,#0A7EB5,#0369a1)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: !text.trim() ? 0.5 : 1, fontFamily: 'Cairo,sans-serif' }}>
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string|null>(null);
  const [chat, setChat] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(() => {
    fetch('/api/admin/consultations').then(r => r.json()).then(d => { if (Array.isArray(d)) setConsultations(d); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch('/api/admin/consultations/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load(); setUpdating(null);
  };

  const deleteConsultation = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    await fetch('/api/admin/consultations/' + id, { method: 'DELETE' });
    load();
  };

  const displayed = filter === 'all' ? consultations : consultations.filter(c => c.status === filter);

  return (
    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>
      {chat && <ChatPanel consultationId={chat.id} clientName={chat.name} onClose={() => setChat(null)} />}

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: 0 }}>طلبات الاستشارة</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', margin: '4px 0 0' }}>{consultations.length} طلب إجمالي</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all','pending','in_progress','done','cancelled'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ background: filter===s?(s==='all'?'#0A7EB5':STATUS_COLOR[s]):'rgba(255,255,255,0.04)', color: filter===s?'white':'rgba(255,255,255,0.5)', border: '1px solid ' + (filter===s?(s==='all'?'#0A7EB5':STATUS_COLOR[s]):'rgba(255,255,255,0.08)'), padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', whiteSpace: 'nowrap' }}>
              {s==='all'?'الكل':STATUS_LABEL[s]} ({s==='all'?consultations.length:consultations.filter(c=>c.status===s).length})
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'إجمالي', value: consultations.length, color: '#0A7EB5' },
          { label: 'معلق', value: consultations.filter(c=>c.status==='pending').length, color: '#f5a623' },
          { label: 'جاري', value: consultations.filter(c=>c.status==='in_progress').length, color: '#6366f1' },
          { label: 'مكتمل', value: consultations.filter(c=>c.status==='done').length, color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid ' + s.color + '30', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ color: s.color, fontSize: '26px', fontWeight: 900 }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '14px', height: '120px' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '18px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>لا توجد طلبات</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayed.map(c => (
            <div key={c.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRight: '3px solid ' + (STATUS_COLOR[c.status]||'#0A7EB5'), borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(10,126,181,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: 700 }}>{c.name}</div>
                      <a href={'tel:' + c.phone} style={{ color: '#0A7EB5', fontSize: '12px', textDecoration: 'none' }}>{c.phone}</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ background: 'rgba(10,126,181,0.1)', color: '#38bdf8', border: '1px solid rgba(10,126,181,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{c.service}</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', padding: '3px 0' }}>{new Date(c.createdAt).toLocaleString('ar-DZ')}</span>
                  </div>
                  {c.message && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>{c.message}</p>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                  <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)} disabled={updating === c.id}
                    style={{ background: 'rgba(255,255,255,0.05)', color: STATUS_COLOR[c.status]||'white', border: '1px solid ' + (STATUS_COLOR[c.status]||'rgba(255,255,255,0.1)') + '40', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', outline: 'none', opacity: updating===c.id?0.5:1 }}>
                    {Object.entries(STATUS_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <button onClick={() => setChat({ id: c.id, name: c.name })}
                    style={{ background: 'rgba(10,126,181,0.08)', color: '#38bdf8', border: '1px solid rgba(10,126,181,0.2)', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    محادثة
                  </button>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a href={'https://wa.me/' + c.phone.replace(/\D/g,'')} target="_blank" rel="noreferrer"
                      style={{ background: 'rgba(37,211,102,0.08)', color: '#25d366', border: '1px solid rgba(37,211,102,0.15)', padding: '7px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                      واتساب
                    </a>
                    <button onClick={() => deleteConsultation(c.id)}
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
                      حذف
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