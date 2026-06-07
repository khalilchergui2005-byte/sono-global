const fs = require('fs');
let c = fs.readFileSync('src/app/admin/settings/page.tsx', 'utf8');

// 1. إضافة eur_to_dzd_rate لـ Type
c = c.replace(
  `  payment_methods: string;\n  logoUrl: string;`,
  `  payment_methods: string;\n  eur_to_dzd_rate: string;\n  logoUrl: string;`
);

// 2. إضافة القيمة الافتراضية في EMPTY
c = c.replace(
  `  payment_methods: 'cash,cib,bank_transfer,ccp',\n  logoUrl: '',`,
  `  payment_methods: 'cash,cib,bank_transfer,ccp',\n  eur_to_dzd_rate: '260',\n  logoUrl: '',`
);

// 3. قراءة القيمة من API في useEffect
c = c.replace(
  `        payment_methods:         c.payment_methods         || 'cash,cib,bank_transfer,ccp',`,
  `        payment_methods:         c.payment_methods         || 'cash,cib,bank_transfer,ccp',\n        eur_to_dzd_rate:         c.eur_to_dzd_rate         || '260',`
);

// 4. إرسال القيمة في save()
c = c.replace(
  `          payment_methods:         form.payment_methods,\n        }),`,
  `          payment_methods:         form.payment_methods,\n          eur_to_dzd_rate:         form.eur_to_dzd_rate,\n        }),`
);

// 5. إضافة حقل سعر الصرف في tab integrations بعد نسبة الربح
c = c.replace(
  `            <Field label="نسبة الربح على سعر Amadeus (%)">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="number" min="0" max="100" step="0.5" value={form.amadeus_markup_percent} onChange={e => set('amadeus_markup_percent', e.target.value)} style={{ ...inp, maxWidth: '160px' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>مثال: 10 = السعر x 1.10</span>
              </div>
            </Field>`,
  `            <Field label="نسبة الربح على سعر Amadeus (%)">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="number" min="0" max="100" step="0.5" value={form.amadeus_markup_percent} onChange={e => set('amadeus_markup_percent', e.target.value)} style={{ ...inp, maxWidth: '160px' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>مثال: 10 = السعر x 1.10</span>
              </div>
            </Field>
            <Field label="سعر صرف اليورو (EUR → DZD)">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="number" min="1" step="1" value={form.eur_to_dzd_rate} onChange={e => set('eur_to_dzd_rate', e.target.value)} style={{ ...inp, maxWidth: '160px' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>مثال: 260 = 1 EUR = 260 دج</span>
              </div>
            </Field>`
);

// 6. إصلاح نص Amadeus المضلل
c = c.replace(
  `سجّل مجاناً على <span style={{ color: '#a5b4fc' }}>developers.amadeus.com</span> واحصل على Client ID و Secret من ال sandbox`,
  `أدخل Client ID و Client Secret الخاص بحساب Amadeus Enterprise الخاص بوكالتك`
);

fs.writeFileSync('src/app/admin/settings/page.tsx', c, 'utf8');
console.log('done');
