'use client';
import { useState, useEffect, useCallback } from 'react';

type Flight = {
  id: string; name: string; phone: string; email?: string;
  from: string; to: string; departDate: string; returnDate?: string;
  tripType: string; cabin: string; adults: number; children: number;
  infants: number; payment: string; notes?: string;
  status: string; createdAt: string;
};

const CABIN: Record<string,string> = { economy: 'اقتصادي', business: 'أعمال', first: 'أولى' };
const PAYMENT: Record<string,string> = { cash: 'كاش', cib: 'CIB / Dahabia', bank: 'تحويل بنكي', ccp: 'CCP' };
const STATUS_LABEL: Record<string,string> = { pending: 'معلق', in_progress: 'جاري', done: 'مكتمل', cancelled: 'ملغى' };
const STATUS_COLOR: Record<string,string> = { pending: '#f5a623', in_progress: '#6366f1', done: '#10b981', cancelled: '#ef4444' };

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string|null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/flights').then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setFlights(d); }).finally(()=>setLoading(false));
  }, []);

  useEffect(()=>{ load(); },[load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/flights/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) });
    load();
    setUpdating(null);
  };

  const displayed = flights.filter(f => filter==='all' || f.status===filter);

  return (
    <div style={{ fontFamily:'Cairo,sans-serif', direction:'rtl' }}>
      <div style={{ marginBottom:'2rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ color:'white', fontSize:'22px', fontWeight:900, margin:0 }}>حجوزات الطيران</h1>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'13px', margin:'4px 0 0' }}>{flights.length} طلب إجمالي</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
          {['all','pending','in_progress','done'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{ background: filter===s ? (s==='all'?'#6366f1':STATUS_COLOR[s]||'#6366f1') : 'rgba(255,255,255,0.04)', color: filter===s?'white':'rgba(255,255,255,0.5)', border:`1px solid ${filter===s?(s==='all'?'#6366f1':STATUS_COLOR[s]||'#6366f1'):'rgba(255,255,255,0.08)'}`, padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'Cairo,sans-serif', whiteSpace:'nowrap' }}>
              {s==='all'?'الكل':STATUS_LABEL[s]}
              <span style={{ marginRight:'6px', opacity:0.7 }}>({s==='all'?flights.length:flights.filter(f=>f.status===s).length})</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {[1,2,3].map(i=><div key={i} style={{ background:'rgba(255,255,255,0.02)', borderRadius:'14px', height:'120px' }}/>)}
        </div>
      ) : displayed.length===0 ? (
        <div style={{ textAlign:'center', padding:'5rem', border:'1px dashed rgba(255,255,255,0.08)', borderRadius:'18px' }}>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'14px' }}>لا توجد طلبات</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {displayed.map(f=>(
            <div key={f.id} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRight:`3px solid ${STATUS_COLOR[f.status]||'#6366f1'}`, borderRadius:'14px', overflow:'hidden' }}>
              <div style={{ padding:'1.25rem', display:'flex', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8', fontWeight:700, fontSize:'16px', flexShrink:0 }}>{f.name.charAt(0)}</div>
                    <div>
                      <div style={{ color:'white', fontSize:'14px', fontWeight:700 }}>{f.name}</div>
                      <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                        <a href={`tel:${f.phone}`} style={{ color:'#0A7EB5', fontSize:'12px', textDecoration:'none' }}>{f.phone}</a>
                        {f.email && <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px' }}>{f.email}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {[
                      `${f.from} ← ${f.to}`,
                      `ذهاب: ${f.departDate}`,
                      f.returnDate?`عودة: ${f.returnDate}`:null,
                      f.tripType==='round'?'ذهاب وإياب':'ذهاب فقط',
                      CABIN[f.cabin]||f.cabin,
                      `${f.adults} بالغ`,
                      f.children?`${f.children} طفل`:null,
                      f.infants?`${f.infants} رضيع`:null,
                      PAYMENT[f.payment]||f.payment,
                    ].filter(Boolean).map((tag,i)=>(
                      <span key={i} style={{ background:'rgba(99,102,241,0.1)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.2)', padding:'3px 10px', borderRadius:'20px', fontSize:'11px' }}>{tag}</span>
                    ))}
                  </div>
                  {f.notes && <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px', margin:'8px 0 0', lineHeight:1.6 }}>{f.notes}</p>}
                  <div style={{ color:'rgba(255,255,255,0.2)', fontSize:'11px', marginTop:'8px' }}>{new Date(f.createdAt).toLocaleString('ar-DZ')}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', alignItems:'flex-end', flexShrink:0 }}>
                  <select value={f.status} onChange={e=>updateStatus(f.id,e.target.value)} disabled={updating===f.id}
                    style={{ background:'rgba(255,255,255,0.05)', color:STATUS_COLOR[f.status]||'white', border:`1px solid ${STATUS_COLOR[f.status]||'rgba(255,255,255,0.1)'}40`, borderRadius:'8px', padding:'7px 12px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Cairo,sans-serif', outline:'none', opacity:updating===f.id?0.5:1 }}>
                    {Object.entries(STATUS_LABEL).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                  <a href={`https://wa.me/${f.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                    style={{ background:'rgba(37,211,102,0.08)', color:'#25d366', border:'1px solid rgba(37,211,102,0.15)', padding:'7px 14px', borderRadius:'8px', textDecoration:'none', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', gap:'6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.528 5.844L.057 23.625a.75.75 0 00.918.918l5.78-1.471A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.666-.5-5.203-1.373l-.371-.214-3.853.981.999-3.742-.234-.385A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    واتساب
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}