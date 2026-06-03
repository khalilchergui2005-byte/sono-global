import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
});

const FROM = `"${process.env.SMTP_FROM_NAME ?? 'Sono Global Travel'}" <${process.env.SMTP_USER ?? ''}>`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? '';

export async function sendBookingNotification(data: {
  customerName: string;
  customerEmail: string;
  packageTitle: string;
  total: number;
  bookingId: string;
}): Promise<void> {
  if (!ADMIN_EMAIL) return;
  try {
    await transporter.sendMail({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `حجز جديد — ${data.packageTitle}`,
      html: `
        <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
          <h2 style="color:#f5a623;margin-bottom:1rem;">حجز جديد</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:140px;">رقم الحجز</td><td style="color:white;font-weight:700;">${data.bookingId}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">العميل</td><td style="color:white;">${data.customerName}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">البريد</td><td style="color:white;">${data.customerEmail}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الباقة</td><td style="color:white;">${data.packageTitle}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">المبلغ</td><td style="color:#f5a623;font-weight:900;">${data.total.toLocaleString('ar-DZ')} دج</td></tr>
          </table>
        </div>
      `,
    });
    await transporter.sendMail({
      from: FROM,
      to: data.customerEmail,
      subject: `تأكيد حجزك — ${data.packageTitle}`,
      html: `
        <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
          <h2 style="color:#10b981;margin-bottom:1rem;">تم استلام حجزك</h2>
          <p style="color:rgba(255,255,255,0.7);">مرحباً ${data.customerName}،</p>
          <p style="color:rgba(255,255,255,0.7);">تم استلام حجزك بنجاح وسيتواصل معك فريقنا قريباً.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:1rem;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:140px;">رقم الحجز</td><td style="color:white;font-weight:700;">${data.bookingId}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الباقة</td><td style="color:white;">${data.packageTitle}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">المبلغ</td><td style="color:#f5a623;font-weight:900;">${data.total.toLocaleString('ar-DZ')} دج</td></tr>
          </table>
        </div>
      `,
    });
  } catch {
    // silent fail — لا نوقف العملية بسبب الإيميل
  }
}

export async function sendConsultationNotification(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  consultationId: string;
}): Promise<void> {
  if (!ADMIN_EMAIL) return;
  try {
    await transporter.sendMail({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `استشارة جديدة — ${data.subject}`,
      html: `
        <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
          <h2 style="color:#0A7EB5;margin-bottom:1rem;">طلب استشارة جديد</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:140px;">رقم الطلب</td><td style="color:white;font-weight:700;">${data.consultationId}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الاسم</td><td style="color:white;">${data.customerName}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">البريد</td><td style="color:white;">${data.customerEmail}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الهاتف</td><td style="color:white;">${data.customerPhone}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الموضوع</td><td style="color:white;">${data.subject}</td></tr>
          </table>
        </div>
      `,
    });
  } catch {
    // silent fail
  }
}
