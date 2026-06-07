const fs = require('fs');
let c = fs.readFileSync('src/app/api/payment/create/route.ts', 'utf8');
c = c.replace(
`    let allowedMethods: string[] = ['cash'];
    if (paymentConfig?.value) {
      try {
        const parsed: unknown = JSON.parse(paymentConfig.value);
        if (Array.isArray(parsed) && parsed.every(x => typeof x === 'string')) {
          allowedMethods = parsed as string[];
        }
      } catch {
        allowedMethods = ['cash'];
      }
    }`,
`    let allowedMethods: string[] = ['cash'];
    if (paymentConfig?.value && paymentConfig.value.trim().length > 0) {
      allowedMethods = paymentConfig.value
        .split(',')
        .map((m: string) => m.trim())
        .filter(Boolean);
    }`
);
fs.writeFileSync('src/app/api/payment/create/route.ts', c, 'utf8');
console.log('done');
