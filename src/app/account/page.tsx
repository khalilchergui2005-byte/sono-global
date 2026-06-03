'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type User = { id: string; name: string | null; email: string; phone: string | null; role: string };
type Msg = { id: string; senderType: string; senderName: string; body: string; createdAt: string; isRead: boolean };
type Request = {
  id: string; status: string; createdAt: string;
  _type: 'flight' | 'hotel' | 'consultation' | 'service';
  _title: string; _subtitle: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: '\u0645\u0639\u0644\u0642',
  in_progress: '\u062c\u0627\u0631\u064a',
  done: '\u0645\u0643\u062a\u0645\u0644',
  cancelled: '\u0645\u0644\u063a\u064a',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#C9A84C',
  in_progress: '#0A7EB5',
  done: '#10b981',
  cancelled: '#ef4444',
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  flight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
    </svg>
  ),
  hotel: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  consultation: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  service: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
};

const TYPE_COLOR: Record<string, string> = {
  flight: '#0A7EB5',
  hotel: '#C9A84C',
  consultation: '#10b981',
  service: '#a78bfa',
};

const keyframesStyle = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
    33% { transform: translateY(-30px) translateX(20px); opacity: 0.7; }
    66% { transform: translateY(20px) translateX(-15px); opacity: 0.3; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(201,168,76,0.3), 0 0 40px rgba(201,168,76,0.1); }
    50% { box-shadow: 0 0 30px rgba(201,168,76,0.6), 0 0 60px rgba(201,168,76,0.2); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulseDot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.7; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .req-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.15) !important;
    border-color: rgba(201,168,76,0.2) !important;
  }
  .tab-btn:hover { background: rgba(255,255,255,0.06) !important; color: white !important; }
  .chat-btn:hover { background: rgba(10,126,181,0.25) !important; box-shadow: 0 0 20px rgba(10,126,181,0.3) !important; }
  .logout-btn:hover { background: rgba(239,68,68,0.18) !important; color: #fca5a5 !important; }
  .home-btn:hover { background: rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.85) !important; }
  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important; }
`;

function ChatPanel({ requestType, requestId, userId, userName, onClose }: {
  requestType: string; requestId: string; userId: string; userName: string; onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    const res = await fetch('/api/request-messages?requestType=' + requestType + '&requestId=' + requestId);
    if (res.ok) setMessages(await res.json());
  }, [requestType, requestId]);

  useEffect(() => {
    loadMessages();
    const t = setInterval(loadMessages, 5000);
    return () => clearInterval(t);
  }, [loadMessages]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch('/api/request-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType, requestId, senderType: 'user', senderId: userId, senderName: userName, body: text.trim() }),
    });
    setText('');
    await loadMessages();
    setSending(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', WebkitBackdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'linear-gradient(145deg, #0d1530 0%, #0a1128 100%)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '24px', width: '100%', maxWidth: '540px', maxHeight: '82vh', display: 'flex', flexDirection: 'column', fontFamily: 'Cairo,sans-serif', direction: 'rtl', boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)' }}>
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,126,181,0.05)', borderRadius: '24px 24px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0A7EB5, #065a82)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(10,126,181,0.4)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{'\u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulseDot 2s infinite' }} />
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{'\u0627\u0644\u0641\u0631\u064a\u0642 \u064a\u0631\u062f \u062e\u0644\u0627\u0644 \u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644'}</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(10,126,181,0.1)', border: '1px solid rgba(10,126,181,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(10,126,181,0.6)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>{'\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0633\u0627\u0626\u0644 \u0628\u0639\u062f'}</div>
              <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '12px' }}>{'\u0627\u0628\u062f\u0623 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0639 \u0641\u0631\u064a\u0642\u0646\u0627'}</div>
            </div>
          ) : messages.map(m => {
            const isMe = m.senderType === 'user';
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', animation: 'slideUp 0.3s ease' }}>
                <div style={{ background: isMe ? 'linear-gradient(135deg, #0A7EB5, #065a82)' : 'rgba(255,255,255,0.06)', color: 'white', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '11px 16px', maxWidth: '78%', fontSize: '13px', lineHeight: 1.7, boxShadow: isMe ? '0 4px 15px rgba(10,126,181,0.3)' : 'none', border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                  {m.body}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>{isMe ? '\u0623\u0646\u062a' : m.senderName}</span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                  <span>{new Date(m.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '0 0 24px 24px' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder='\u0627\u0643\u062a\u0628 \u0631\u0633\u0627\u0644\u062a\u0643...'
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '11px 16px', color: 'white', fontSize: '13px', outline: 'none', fontFamily: 'Cairo,sans-serif', transition: 'border-color 0.2s' }}
          />
          <button onClick={send} disabled={sending || !text.trim()} style={{ background: 'linear-gradient(135deg, #0A7EB5, #065a82)', color: 'white', border: 'none', borderRadius: '12px', padding: '11px 20px', fontSize: '13px', fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: !text.trim() ? 0.5 : 1, fontFamily: 'Cairo,sans-serif', boxShadow: '0 4px 15px rgba(10,126,181,0.3)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {'\u0625\u0631\u0633\u0627\u0644'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<{ type: string; id: string } | null>(null);
  const [tab, setTab] = useState<'all' | 'flight' | 'hotel' | 'consultation' | 'service'>('all');
  const [agencyName, setAgencyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d?.agencyName) setAgencyName(d.agencyName);
      if (d?.logoUrl) setLogoUrl(d.logoUrl);
    }).catch(() => {}).finally(() => setSettingsLoaded(true));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sg_token');
    const userData = localStorage.getItem('sg_user');
    if (!token || !userData) { router.push('/login'); return; }
    setUser(JSON.parse(userData));

    const fetchAll = async () => {
      const headers: Record<string, string> = { 'Authorization': 'Bearer ' + token };
      const me = await fetch('/api/auth/me', { headers });
      if (!me.ok) { localStorage.removeItem('sg_token'); router.push('/login'); return; }
      const meData = await me.json();
      setUser(meData);

      const [flights, hotels, consultations, services] = await Promise.all([
        fetch('/api/flights', { headers }).then(r => r.json()),
        fetch('/api/hotels', { headers }).then(r => r.json()),
        fetch('/api/admin/consultations', { headers }).then(r => r.json()),
        fetch('/api/admin/service-requests', { headers }).then(r => r.json()),
      ]);

      const all: Request[] = [
        ...(Array.isArray(flights) ? flights.filter((f: { email: string }) => f.email === meData.email) : []).map((f: { id: string; status: string; createdAt: string; from: string; to: string; cabin: string }) => ({
          id: f.id, status: f.status, createdAt: f.createdAt,
          _type: 'flight' as const,
          _title: '\u0637\u064a\u0631\u0627\u0646: ' + f.from + ' \u2190 ' + f.to,
          _subtitle: '\u062f\u0631\u062c\u0629 ' + f.cabin,
        })),
        ...(Array.isArray(hotels) ? hotels.filter((h: { email: string }) => h.email === meData.email) : []).map((h: { id: string; status: string; createdAt: string; city: string; checkIn: string; checkOut: string }) => ({
          id: h.id, status: h.status, createdAt: h.createdAt,
          _type: 'hotel' as const,
          _title: '\u0641\u0646\u062f\u0642: ' + h.city,
          _subtitle: h.checkIn + ' \u2192 ' + h.checkOut,
        })),
        ...(Array.isArray(consultations) ? consultations.filter((c: { phone: string; userId: string }) => c.phone === meData.phone || c.userId === meData.id) : []).map((c: { id: string; status: string; createdAt: string; service: string; message?: string }) => ({
          id: c.id, status: c.status, createdAt: c.createdAt,
          _type: 'consultation' as const,
          _title: '\u0627\u0633\u062a\u0634\u0627\u0631\u0629: ' + c.service,
          _subtitle: (c.message || '').slice(0, 60),
        })),
        ...(Array.isArray(services) ? services.filter((s: { phone: string; userId: string }) => s.phone === meData.phone || s.userId === meData.id) : []).map((s: { id: string; status: string; createdAt: string; serviceTitle: string; message?: string }) => ({
          id: s.id, status: s.status, createdAt: s.createdAt,
          _type: 'service' as const,
          _title: '\u062e\u062f\u0645\u0629: ' + s.serviceTitle,
          _subtitle: (s.message || '').slice(0, 60),
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRequests(all);
      setLoading(false);
    };
    fetchAll();
  }, [router]);

  const logout = () => {
    localStorage.removeItem('sg_token');
    localStorage.removeItem('sg_user');
    router.push('/');
  };

  const displayed = tab === 'all' ? requests : requests.filter(r => r._type === tab);
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    done: requests.filter(r => r.status === 'done').length,
  };

  if (!user || !settingsLoaded) return null;

  const displayAgency = agencyName;

  const tabDefs: { key: 'all' | 'flight' | 'hotel' | 'consultation' | 'service'; label: string }[] = [
    { key: 'all', label: '\u0627\u0644\u0643\u0644' },
    { key: 'flight', label: '\u0637\u064a\u0631\u0627\u0646' },
    { key: 'hotel', label: '\u0641\u0646\u0627\u062f\u0642' },
    { key: 'consultation', label: '\u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a' },
    { key: 'service', label: '\u062e\u062f\u0645\u0627\u062a' },
  ];

  const statCards = [
    { label: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0637\u0644\u0628\u0627\u062a', value: stats.total, color: '#0A7EB5', glow: 'rgba(10,126,181,0.3)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
    )},
    { label: '\u0645\u0639\u0644\u0642', value: stats.pending, color: '#C9A84C', glow: 'rgba(201,168,76,0.3)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )},
    { label: '\u062c\u0627\u0631\u064a', value: stats.in_progress, color: '#0A7EB5', glow: 'rgba(10,126,181,0.3)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
    )},
    { label: '\u0645\u0643\u062a\u0645\u0644', value: stats.done, color: '#10b981', glow: 'rgba(16,185,129,0.3)', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>
    )},
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#060d24', fontFamily: 'Cairo,sans-serif', direction: 'rtl', position: 'relative', overflow: 'hidden' }}>
      <style>{keyframesStyle}</style>
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', animation: 'floatOrb 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,126,181,0.07) 0%, transparent 70%)', animation: 'floatOrb 15s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 70%)', animation: 'floatOrb 18s ease-in-out infinite 3s', pointerEvents: 'none', zIndex: 0 }} />
      {chat && user && (
        <ChatPanel requestType={chat.type} requestId={chat.id} userId={user.id} userName={user.name || user.email} onClose={() => setChat(null)} />
      )}
      <header style={{ background: 'rgba(6,13,36,0.92)', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '0 2rem', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, WebkitBackdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          {logoUrl ? (
            <img src={logoUrl} alt="logo" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 12px rgba(201,168,76,0.2)' }} />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #C9A84C, #a8862e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#060d24', fontSize: '16px', fontWeight: 900, boxShadow: '0 2px 12px rgba(201,168,76,0.3)' }}>
              {displayAgency.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '15px', letterSpacing: '0.3px' }}>{displayAgency}</div>
            <div style={{ color: 'rgba(201,168,76,0.5)', fontSize: '10px', letterSpacing: '2px' }}>TRAVEL AGENCY</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/" className="home-btn" style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', fontFamily: 'Cairo,sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', background: 'rgba(255,255,255,0.03)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {'\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629'}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6px 14px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #0A7EB5, #065a82)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: 600 }}>{user.name || user.email}</span>
          </div>
          <button onClick={logout} className="logout-btn" style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {'\u062e\u0631\u0648\u062c'}
          </button>
        </div>
      </header>
      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '2.5rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(10,126,181,0.12) 0%, rgba(201,168,76,0.08) 50%, rgba(6,13,36,0.8) 100%)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '24px', padding: '2rem 2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden', animation: 'slideUp 0.5s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), rgba(10,126,181,0.4), transparent)' }} />
          <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #0A7EB5, #065a82)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: 900, boxShadow: '0 8px 30px rgba(10,126,181,0.4)', animation: 'pulseGlow 3s ease-in-out infinite' }}>
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '6px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #060d24', boxShadow: '0 2px 8px rgba(16,185,129,0.5)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>{user.name || '\u0639\u0645\u064a\u0644\u0646\u0627 \u0627\u0644\u0643\u0631\u064a\u0645'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', padding: '8px 16px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 700 }}>{'\u0639\u0645\u064a\u0644 \u0645\u0645\u064a\u0632'}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map((s, i) => (
            <div key={i} className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderTop: '2px solid ' + s.color, borderRadius: '16px', padding: '1.25rem', cursor: 'default', transition: 'all 0.3s ease', animation: 'slideUp 0.5s ease ' + (i * 0.1) + 's both', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, boxShadow: '0 0 8px ' + s.glow }} />
              </div>
              <div style={{ color: 'white', fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: '4px', animation: 'countUp 0.6s ease ' + (i * 0.1 + 0.3) + 's both' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: 'linear-gradient(180deg, #C9A84C, #0A7EB5)' }} />
              {'\u0637\u0644\u0628\u0627\u062a\u064a'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '6px' }}>
            {tabDefs.map(t => {
              const count = t.key === 'all' ? requests.length : requests.filter(r => r._type === t.key).length;
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key)} className="tab-btn" style={{ background: active ? 'linear-gradient(135deg, #0A7EB5, #065a82)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.45)', border: 'none', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: active ? '0 4px 15px rgba(10,126,181,0.3)' : 'none' }}>
                  {t.label}
                  <span style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', color: active ? 'white' : 'rgba(255,255,255,0.3)', borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 700 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 100%)', backgroundSize: '200% 100%', borderRadius: '16px', height: '110px', animation: 'shimmer 1.5s infinite', border: '1px solid rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '20px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(10,126,181,0.08)', border: '1px solid rgba(10,126,181,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(10,126,181,0.5)" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', margin: '0 0 0.75rem' }}>{'\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0628\u0639\u062f'}</p>
            <Link href="/" style={{ color: '#0A7EB5', fontSize: '13px', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              {'\u0627\u0628\u062f\u0623 \u0628\u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayed.map((r, idx) => {
              const tc = TYPE_COLOR[r._type] || '#0A7EB5';
              const sc = STATUS_COLOR[r.status] || '#0A7EB5';
              const isHovered = hoveredCard === r.id;
              return (
                <div key={r.id} className="req-card" onMouseEnter={() => setHoveredCard(r.id)} onMouseLeave={() => setHoveredCard(null)} style={{ background: isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRight: '3px solid ' + tc, borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', transition: 'all 0.25s ease', animation: 'slideUp 0.4s ease ' + (idx * 0.06) + 's both', cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: tc + '15', border: '1px solid ' + tc + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc, flexShrink: 0 }}>
                      {TYPE_ICON[r._type]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{r._title}</div>
                      {r._subtitle && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginBottom: '8px' }}>{r._subtitle}</div>}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ background: sc + '18', color: sc, border: '1px solid ' + sc + '35', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc, display: 'inline-block', boxShadow: '0 0 6px ' + sc }} />
                          {STATUS_LABEL[r.status] || r.status}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '11px' }}>{new Date(r.createdAt).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setChat({ type: r._type, id: r.id })} className="chat-btn" style={{ background: 'rgba(10,126,181,0.1)', color: '#0A7EB5', border: '1px solid rgba(10,126,181,0.2)', borderRadius: '12px', padding: '10px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0, transition: 'all 0.2s' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {'\u0645\u062d\u0627\u062f\u062b\u0629'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}