const fs = require('fs');

// admin/dashboard
let c = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>",
  "<div className='adm-dash-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>"
);
c = c.replace(
  "padding: '2rem', direction: 'rtl' }}>",
  "padding: '2rem', direction: 'rtl' }}><style>{'@media(max-width:640px){.adm-dash-grid{grid-template-columns:1fr !important;}}'}</style>"
);
fs.writeFileSync('src/app/admin/dashboard/page.tsx', c, 'utf8');

// admin/settings
c = fs.readFileSync('src/app/admin/settings/page.tsx', 'utf8');
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>",
  "<div className='adm-set-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>"
);
c = c.replace(
  "maxWidth: '860px' }}>",
  "maxWidth: '860px' }}><style>{'@media(max-width:640px){.adm-set-grid{grid-template-columns:1fr !important;}}'}</style>"
);
fs.writeFileSync('src/app/admin/settings/page.tsx', c, 'utf8');

// admin/flights
c = fs.readFileSync('src/app/admin/flights/page.tsx', 'utf8');
c = c.replace(
  "<div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>",
  "<div className='adm-fl-filters' style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>"
);
c = c.replace(
  "direction:'rtl' }}>",
  "direction:'rtl' }}><style>{'@media(max-width:640px){.adm-fl-filters{grid-template-columns:1fr 1fr !important;}}'}</style>"
);
fs.writeFileSync('src/app/admin/flights/page.tsx', c, 'utf8');

// admin/hotels
c = fs.readFileSync('src/app/admin/hotels/page.tsx', 'utf8');
c = c.replace(
  "<div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>",
  "<div className='adm-ht-filters' style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>"
);
c = c.replace(
  "direction:'rtl' }}>",
  "direction:'rtl' }}><style>{'@media(max-width:640px){.adm-ht-filters{grid-template-columns:1fr 1fr !important;}}'}</style>"
);
fs.writeFileSync('src/app/admin/hotels/page.tsx', c, 'utf8');

// staff/dashboard
c = fs.readFileSync('src/app/staff/dashboard/page.tsx', 'utf8');
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>",
  "<div className='staff-stats-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>"
);
c = c.replace(
  "fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}>",
  "fontFamily: 'Cairo,sans-serif', direction: 'rtl' }}><style>{'@media(max-width:640px){.staff-stats-grid{grid-template-columns:1fr !important;}}'}</style>"
);
fs.writeFileSync('src/app/staff/dashboard/page.tsx', c, 'utf8');

console.log('done');
