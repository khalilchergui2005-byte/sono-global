const fs = require('fs');
let c = fs.readFileSync('src/components/Contact.tsx', 'utf8');
c = c.replace(
  "  .feature-chip:hover { background: rgba(10,126,181,0.12) !important; transform: translateY(-2px) !important; }",
  "  .feature-chip:hover { background: rgba(10,126,181,0.12) !important; transform: translateY(-2px) !important; }\n  @media(max-width:640px){.contact-features-grid{grid-template-columns:1fr !important;}.contact-form-names{grid-template-columns:1fr !important;}}"
);
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>",
  "<div className='contact-features-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>"
);
c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>",
  "<div className='contact-form-names' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>"
);
fs.writeFileSync('src/components/Contact.tsx', c, 'utf8');
console.log('done');
