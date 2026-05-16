export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--navy-900)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
      fontFamily: 'var(--font-body)',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '3rem',
        color: '#ffffff',
        textAlign: 'center',
      }}>
        SONO <span style={{ color: 'var(--sky-400)' }}>GLOBAL</span>
      </h1>
      <p style={{
        color: 'var(--gold-400)',
        letterSpacing: '4px',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
      }}>
        Travel & Tourisme
      </p>
      <p style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.8rem',
        marginTop: '0.5rem',
      }}>
        الموقع قيد البناء — سيتيف، الجزائر
      </p>
    </main>
  )
}