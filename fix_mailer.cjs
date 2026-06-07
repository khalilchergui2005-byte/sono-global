const fs = require('fs');
let c = fs.readFileSync('src/lib/mailer.ts', 'utf8');

c = c.replace(
  `  if (cfg.adminEmail) {
    transporter.sendMail({`,
  `  if (cfg.adminEmail) {
    await transporter.sendMail({`
);

c = c.replace(
  `  if (data.customerEmail) {
    transporter.sendMail({`,
  `  if (data.customerEmail) {
    await transporter.sendMail({`
);

fs.writeFileSync('src/lib/mailer.ts', c, 'utf8');
console.log('done');
