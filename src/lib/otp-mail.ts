import nodemailer from "nodemailer";

interface OtpSendResult {
  success: boolean;
  error?: string;
  mock?: boolean;
  maskedEmail: string;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "****@****";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
}

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendViaSmtp(toEmail: string, otp: string): Promise<OtpSendResult> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Portal RT" <${from}>`,
    to: toEmail,
    subject: "Kode OTP Login Admin - Portal RT",
    text: `Kode verifikasi Anda: ${otp}\n\nKode berlaku 5 menit. Jangan bagikan kode ini kepada siapapun.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#059669">Portal RT - Verifikasi OTP</h2>
        <p>Masukkan kode berikut untuk menyelesaikan login admin:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#0f172a">${otp}</p>
        <p style="color:#64748b;font-size:14px">Kode berlaku 5 menit. Jangan bagikan kode ini kepada siapapun.</p>
      </div>
    `,
  });

  return { success: true, maskedEmail: maskEmail(toEmail) };
}

export async function sendOtpEmail(toEmail: string, otp: string): Promise<OtpSendResult> {
  const maskedEmail = maskEmail(toEmail);

  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV === "development" || process.env.OTP_MOCK === "true") {
      console.log(`[OTP Mock] Kode untuk ${toEmail}: ${otp}`);
      return { success: true, mock: true, maskedEmail };
    }
    return {
      success: false,
      error: "SMTP belum dikonfigurasi. Atur SMTP_HOST, SMTP_USER, dan SMTP_PASS.",
      maskedEmail,
    };
  }

  try {
    return await sendViaSmtp(toEmail, otp);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal mengirim email OTP";
    return { success: false, error: message, maskedEmail };
  }
}
