const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');
c = c.replace(
  '  .slide-dot:hover { transform: scaleX(1.4) !important; }',
  '  .slide-dot:hover { transform: scaleX(1.4) !important; }\n  @media(max-width:640px){.hero-country-badge{display:none !important;}.hero-stat-card{padding:0.75rem 1.25rem !important;}.hero-content{padding:0 1rem !important;}}'
);
c = c.replace(
  "<div style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 5, animation: 'slideCountry 0.5s ease forwards' }} key={current}>",
  "<div className='hero-country-badge' style={{ position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 5, animation: 'slideCountry 0.5s ease forwards' }} key={current}>"
);
c = c.replace(
  "<div style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '0 1.5rem', maxWidth: '900px', width: '100%', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease', direction: 'rtl' }}>",
  "<div className='hero-content' style={{ position: 'relative', zIndex: 4, textAlign: 'center', padding: '0 1.5rem', maxWidth: '900px', width: '100%', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease', direction: 'rtl' }}>"
);
fs.writeFileSync('src/components/Hero.tsx', c, 'utf8');
console.log('done');
