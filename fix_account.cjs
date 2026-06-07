const fs = require('fs');
let c = fs.readFileSync('src/app/account/page.tsx', 'utf8');
c = c.replace(
  "  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important; }",
  "  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important; }\n  @media(max-width:640px){.account-stats-grid{grid-template-columns:1fr 1fr !important;gap:0.75rem !important;}.account-req-card{flex-direction:column !important;align-items:flex-start !important;}}"
);
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>",
  "<div className='account-stats-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>"
);
fs.writeFileSync('src/app/account/page.tsx', c, 'utf8');
console.log('done');
