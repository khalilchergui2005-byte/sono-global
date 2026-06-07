const fs = require('fs');
let c = fs.readFileSync('src/app/hotels/page.tsx', 'utf8');
c = c.replace(
  "@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
  "@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@media(max-width:640px){.hotels-dates-grid{grid-template-columns:1fr !important;}.hotels-pax-grid{grid-template-columns:1fr !important;}.hotels-book-names{grid-template-columns:1fr !important;}.hotels-summary-grid{grid-template-columns:1fr !important;}}"
);
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>",
  "<div className='hotels-dates-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>"
);
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>",
  "<div className='hotels-pax-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>"
);
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>",
  "<div className='hotels-book-names' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>"
);
c = c.replace(
  "<div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>",
  "<div className='hotels-summary-grid' style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>"
);
fs.writeFileSync('src/app/hotels/page.tsx', c, 'utf8');
console.log('done');
