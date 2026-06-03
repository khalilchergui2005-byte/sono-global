'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

type HotelReq = {
  id: string; name: string; phone: string; email?: string;
  city: string; hotelName?: string; checkIn: string; checkOut: string;
  rooms: number; adults: number; children: number; stars?: string;
  payment: string; notes?: string; status: string; createdAt: string;
  isRead: boolean;
};
type Msg = { id: string; senderType: string; senderName: string; body: string; createdAt: string };

const PAYMENT: Record<string, string> = { cash: 'كاش', cib: 'CIB / Dahabia', bank: 'تحويل بنكي', ccp: 'CCP' };
const STATUS_LABEL: Record<string, string> = { pending: 'معلق', in_progress: 'جاري', done: 'مكتمل', cancelled: 'ملغى' };
const STATUS_COLOR: Record<string, string> = { pending: '#f5a623', in_progress: '#ec4899', done: '#10b981', cancelled: '#ef4444' };

const inp: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', padding: '10px 14px',
  color: 'white', fontSize: '13px', outline: 'none',
  fontFamily: 'Cairo,sans-serif', width: '100%', boxSizing: 'border-box',
};

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [hotel, setHotel] = useState<HotelReq | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/hotels/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setHotel(d);
          setStatus(d.status);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/request-messages?requestType=hotel&requestId=${id}`);
    if (res.ok) setMessages(await res.json());
  }, [id]);

  useEffect(() => {
    loadMessages();
    const t = setInterval(loadMessages, 5000);
    return () => clearInterval(t);
  }, [loadMessages]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    await fetch(`/api/hotels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatus(newStatus);
    setUpdating(false);
  };

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/request-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'hotel', requestId: id,
        senderType: 'staff', senderId: 'admin',
        senderName: 'فريق الوكالة', body: text.trim(),
      }),
    });
    setText('');
    await loadMessages();
    setSending(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Cairo,sans-serif' }}>جاري التحميل...</div>
    </div>
  );

  if (!hotel) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
      <div style={{ color: '#ef4444', fontFamily: 'Cairo,sans-serif' }}>الطلب غير موجود</div>
    </div>
  );

  const nights = Math.max(1, Math.round(
    (new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <div style={{ fontFamily: 'Cairo,sans-serif', direction: 'rtl', maxWidth: '900px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/admin/hotels')}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          رجوع
        </button>
        <div>
          <h1 style={{ color: 'white', fontSize: '20px', fontWeight: 900, margin: 0 }}>تفاصيل طلب فندق</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '2px 0 0' }}>#{hotel.id.slice(-8).toUpperCase()}</p>
        </div>
        <div style={{ marginRight: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ background: `${STATUS_COLOR[status]}20`, color: STATUS_COLOR[status], border: `1px solid ${STATUS_COLOR[status]}40`, borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}>
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>بيانات الزبون</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236,72,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f9a8d4', fontWeight: 700, fontSize: '20px', flexShrink: 0 }}>
              {hotel.name.charAt(0)}
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>{hotel.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{new Date(hotel.createdAt).toLocaleString('ar-DZ')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a href={`tel:${hotel.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.56 5.56l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {hotel.phone}
            </a>
            {hotel.email && (
              <a href={`mailto:${hotel.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontSize: '13px', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {hotel.email}
              </a>
            )}
            <a href={`https://wa.me/${hotel.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#25d366', fontSize: '13px', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52z"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
              واتساب
            </a>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>تفاصيل الحجز</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'المدينة', value: hotel.city },
              { label: 'اسم الفندق', value: hotel.hotelName || 'غير محدد' },
              { label: 'التصنيف', value: hotel.stars ? `${hotel.stars} نجوم` : 'غير محدد' },
              { label: 'تاريخ الدخول', value: hotel.checkIn },
              { label: 'تاريخ الخروج', value: hotel.checkOut },
              { label: 'عدد الليالي', value: `${nights} ليلة` },
              { label: 'الغرف', value: `${hotel.rooms} غرفة` },
              { label: 'البالغون', value: `${hotel.adults} بالغ` },
              { label: 'الأطفال', value: hotel.children ? `${hotel.children} طفل` : 'لا يوجد' },
              { label: 'طريقة الدفع', value: PAYMENT[hotel.payment] || hotel.payment },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{row.label}</span>
                <span style={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hotel.notes && (
        <div style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ color: '#f5a623', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>ملاحظات الزبون</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, lineHeight: 1.7 }}>{hotel.notes}</p>
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', marginBottom: '1rem' }}>تحديث الحالة</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_LABEL).map(([val, label]) => (
            <button
              key={val}
              onClick={() => updateStatus(val)}
              disabled={updating || status === val}
              style={{ background: status === val ? `${STATUS_COLOR[val]}20` : 'rgba(255,255,255,0.04)', color: status === val ? STATUS_COLOR[val] : 'rgba(255,255,255,0.4)', border: `1px solid ${status === val ? STATUS_COLOR[val] + '40' : 'rgba(255,255,255,0.08)'}`, padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: updating || status === val ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', opacity: updating ? 0.6 : 1 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>المحادثة مع الزبون</div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>الردود تظهر في حساب الزبون</div>
        </div>
        <div style={{ minHeight: '200px', maxHeight: '360px', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>لا توجد رسائل بعد</div>
          ) : messages.map(m => {
            const isStaff = m.senderType === 'staff' || m.senderType === 'admin';
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isStaff ? 'flex-end' : 'flex-start' }}>
                <div style={{ background: isStaff ? 'linear-gradient(135deg,#ec4899,#be185d)' : 'rgba(255,255,255,0.06)', color: 'white', borderRadius: isStaff ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', maxWidth: '75%', fontSize: '13px', lineHeight: 1.6 }}>
                  {m.body}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', marginTop: '4px' }}>
                  {m.senderName} · {new Date(m.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="اكتب ردك للزبون..."
            style={inp}
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: sending || !text.trim() ? 'not-allowed' : 'pointer', opacity: !text.trim() ? 0.5 : 1, fontFamily: 'Cairo,sans-serif', whiteSpace: 'nowrap' }}
          >
            إرسال
          </button>
        </div>
      </div>

    </div>
  );
}