import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

async function getSmtpConfig() {
  const keys = [
    'smtp_host',
    'smtp_port',
    'smtp_user',
    'smtp_pass',
    'smtp_from_name',
    'admin_email',
  ];

  const rows = await db.siteConfig.findMany({
    where: { key: { in: keys } },
  });

  const cfg: Record<string, string> = {};
  for (const row of rows) {
    cfg[row.key] = row.value;
  }

  return {
    host:         cfg.smtp_host      || 'smtp.gmail.com',
    port:         Number(cfg.smtp_port || '587'),
    user:         cfg.smtp_user      || '',
    pass:         cfg.smtp_pass      || '',
    fromName:     cfg.smtp_from_name || 'Sono Global Travel',
    adminEmail:   cfg.admin_email    || cfg.smtp_user || '',
  };
}

export async function sendConsultationNotification(data: {
  customerName:   string;
  customerPhone:  string;
  subject:        string;
  consultationId: string;
}): Promise<void> {
  try {
    const cfg = await getSmtpConfig();
    if (!cfg.user || !cfg.pass || !cfg.adminEmail) return;

    const transporter = nodemailer.createTransport({
      host:   cfg.host,
      port:   cfg.port,
      secure: false,
      auth:   { user: cfg.user, pass: cfg.pass },
    });

    const FROM = `"${cfg.fromName}" <${cfg.user}>`;

    await transporter.sendMail({
      from:    FROM,
      to:      cfg.adminEmail,
      subject: `استشارة جديدة — ${data.subject}`,
      html: `
        <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
          <h2 style="color:#0A7EB5;margin-bottom:1rem;">طلب استشارة جديد</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:140px;">رقم الطلب</td><td style="color:white;font-weight:700;">${data.consultationId}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الاسم</td><td style="color:white;">${data.customerName}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الهاتف</td><td style="color:white;">${data.customerPhone}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الموضوع</td><td style="color:white;">${data.subject}</td></tr>
          </table>
        </div>
      `,
    });
  } catch {
    // silent fail — لا نوقف العملية بسبب الإيميل
  }
}

export async function sendServiceRequestNotification(data: {
  customerName:  string;
  customerPhone: string;
  serviceTitle:  string;
  requestId:     string;
}): Promise<void> {
  try {
    const cfg = await getSmtpConfig();
    if (!cfg.user || !cfg.pass || !cfg.adminEmail) return;

    const transporter = nodemailer.createTransport({
      host:   cfg.host,
      port:   cfg.port,
      secure: false,
      auth:   { user: cfg.user, pass: cfg.pass },
    });

    const FROM = `"${cfg.fromName}" <${cfg.user}>`;

    await transporter.sendMail({
      from:    FROM,
      to:      cfg.adminEmail,
      subject: `طلب خدمة جديد — ${data.serviceTitle}`,
      html: `
        <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
          <h2 style="color:#C9A84C;margin-bottom:1rem;">طلب خدمة جديد</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:140px;">رقم الطلب</td><td style="color:white;font-weight:700;">${data.requestId}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الاسم</td><td style="color:white;">${data.customerName}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الهاتف</td><td style="color:white;">${data.customerPhone}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الخدمة</td><td style="color:white;">${data.serviceTitle}</td></tr>
          </table>
        </div>
      `,
    });
  } catch {
    // silent fail
  }
}

export async function sendPaymentConfirmation(data: {
  customerName:  string;
  customerEmail: string;
  packageTitle:  string;
  total:         number;
  bookingId:     string;
}): Promise<void> {
  try {
    const cfg = await getSmtpConfig();
    if (!cfg.user || !cfg.pass) return;

    const transporter = nodemailer.createTransport({
      host:   cfg.host,
      port:   cfg.port,
      secure: false,
      auth:   { user: cfg.user, pass: cfg.pass },
    });

    const FROM = `"${cfg.fromName}" <${cfg.user}>`;

    if (cfg.adminEmail) {
      await transporter.sendMail({
        from:    FROM,
        to:      cfg.adminEmail,
        subject: `دفع مؤكد — ${data.packageTitle}`,
        html: `
          <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
            <h2 style="color:#10b981;margin-bottom:1rem;">تم تأكيد الدفع</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:140px;">رقم الحجز</td><td style="color:white;font-weight:700;">${data.bookingId}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">العميل</td><td style="color:white;">${data.customerName}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">البريد</td><td style="color:white;">${data.customerEmail}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الباقة</td><td style="color:white;">${data.packageTitle}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">المبلغ</td><td style="color:#10b981;font-weight:900;">${data.total.toLocaleString('ar-DZ')} دج</td></tr>
            </table>
          </div>
        `,
      });
    }

    if (data.customerEmail) {
      await transporter.sendMail({
        from:    FROM,
        to:      data.customerEmail,
        subject: `تأكيد دفعك — ${data.packageTitle}`,
        html: `
          <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
            <h2 style="color:#10b981;margin-bottom:1rem;">تم تأكيد دفعك</h2>
            <p style="color:rgba(255,255,255,0.7);">مرحباً ${data.customerName}،</p>
            <p style="color:rgba(255,255,255,0.7);">تم تأكيد دفعك بنجاح وسيتواصل معك فريقنا قريباً.</p>
            <table style="width:100%;border-collapse:collapse;margin-top:1rem;">
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);width:140px;">رقم الحجز</td><td style="color:white;font-weight:700;">${data.bookingId}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">الباقة</td><td style="color:white;">${data.packageTitle}</td></tr>
              <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);">المبلغ</td><td style="color:#10b981;font-weight:900;">${data.total.toLocaleString('ar-DZ')} دج</td></tr>
            </table>
          </div>
        `,
      });
    }
  } catch {
    // silent fail
  }
}export async function sendWelcomeEmail(data: {
  customerName:  string;
  customerEmail: string;
}): Promise<void> {
  try {
    const cfg = await getSmtpConfig();
    if (!cfg.user || !cfg.pass || !data.customerEmail) return;

    const transporter = nodemailer.createTransport({
      host:   cfg.host,
      port:   cfg.port,
      secure: false,
      auth:   { user: cfg.user, pass: cfg.pass },
    });

    const FROM = `"${cfg.fromName}" <${cfg.user}>`;

    await transporter.sendMail({
      from:    FROM,
      to:      data.customerEmail,
      subject: `مرحباً بك في ${cfg.fromName}`,
      html: `
        <div dir="rtl" style="font-family:Cairo,sans-serif;max-width:600px;margin:0 auto;background:#060d26;color:white;padding:2rem;border-radius:12px;">
          <h2 style="color:#C9A84C;margin-bottom:1rem;">مرحباً بك ${data.customerName} 👋</h2>
          <p style="color:rgba(255,255,255,0.7);line-height:1.8;">
            شكراً لتسجيلك في ${cfg.fromName}.<br/>
            يمكنك الآن تصفح باقاتنا السياحية وحجز رحلتك بكل سهولة.
          </p>
          <div style="margin-top:1.5rem;padding:1rem;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:10px;">
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">
              إذا لم تقم بإنشاء هذا الحساب، يرجى تجاهل هذا البريد.
            </p>
          </div>
        </div>
      `,
    });
  } catch {
    // silent fail
  }
}