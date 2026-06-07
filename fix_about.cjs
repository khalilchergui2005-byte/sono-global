const fs = require('fs');
let c = fs.readFileSync('src/components/About.tsx', 'utf8');
c = c.replace(
  '  .srv-mini-card:hover { transform: translateY(-4px) !important; border-color: #0A7EB5 !important; background: rgba(10,126,181,0.04) !important; }',
  '  .srv-mini-card:hover { transform: translateY(-4px) !important; border-color: #0A7EB5 !important; background: rgba(10,126,181,0.04) !important; }\n  @media(max-width:768px){.about-main-grid{grid-template-columns:1fr !important;gap:2rem !important;}}'
);
c = c.replace(
  "<div style={{ maxWidth: '1150px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>",
  "<div className='about-main-grid' style={{ maxWidth: '1150px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>"
);
fs.writeFileSync('src/components/About.tsx', c, 'utf8');
console.log('done');
