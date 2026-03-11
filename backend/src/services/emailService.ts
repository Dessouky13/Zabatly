/**
 * Email Service — sends transactional emails via Resend.
 */

import { Resend } from 'resend';

const RESEND_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'Zabatly <hello@zabatly.com>';

function emailDisabled(fn: string): void {
  console.log(`[emailService] ${fn} skipped — RESEND_API_KEY not configured`);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!resend) { emailDisabled('sendWelcomeEmail'); return; }
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Zabatly ظبطلي 🏡',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
        <div style="background: #C9704A; padding: 40px; border-radius: 24px 24px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Zabatly | ظبطلي</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Design your home before you furnish it</p>
        </div>
        <div style="background: #F5EFE6; padding: 40px; border-radius: 0 0 24px 24px;">
          <h2 style="color: #1A1A1A;">Welcome, ${name}! 👋</h2>
          <p style="color: #666; line-height: 1.7;">
            Your Zabatly account is ready. Start designing your dream home with AI-powered mood boards and room redesigns.
          </p>
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="display: inline-block; background: #C9704A; color: white; padding: 16px 32px;
                    border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Start Designing →
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            Questions? Reply to this email and we'll help you out.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  if (!resend) { emailDisabled('sendPasswordResetEmail'); return; }
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Zabatly password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
        <div style="background: #C9704A; padding: 40px; border-radius: 24px 24px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Reset your password</h1>
        </div>
        <div style="background: #F5EFE6; padding: 40px; border-radius: 0 0 24px 24px;">
          <h2 style="color: #1A1A1A;">Hi ${name},</h2>
          <p style="color: #666; line-height: 1.7;">
            We received a request to reset your password. Click the button below within 1 hour.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #C9704A; color: white; padding: 16px 32px;
                    border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Reset Password →
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            If you did not request this, ignore this email. Your password will remain unchanged.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  amount: number
): Promise<void> {
  if (!resend) { emailDisabled('sendPaymentConfirmationEmail'); return; }
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Payment Confirmed — ${plan} Plan Activated ✓`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
        <div style="background: #C9704A; padding: 40px; border-radius: 24px 24px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Payment Confirmed ✓</h1>
        </div>
        <div style="background: #F5EFE6; padding: 40px; border-radius: 0 0 24px 24px;">
          <h2 style="color: #1A1A1A;">Your ${plan} plan is now active!</h2>
          <div style="background: white; border-radius: 16px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0; color: #666;">Amount paid</p>
            <p style="margin: 4px 0 0; font-size: 32px; font-weight: 900; color: #C9704A;">${amount} EGP</p>
          </div>
          <p style="color: #666; line-height: 1.7;">
            Hi ${name}, your ${plan} subscription is now active. Enjoy unlimited creativity!
          </p>
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="display: inline-block; background: #C9704A; color: white; padding: 16px 32px;
                    border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Go to Dashboard →
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendSubscriptionExpiryWarning(
  to: string,
  name: string,
  expiresAt: string,
  daysLeft: number
): Promise<void> {
  if (!resend) { emailDisabled('sendSubscriptionExpiryWarning'); return; }
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your Zabatly subscription expires in ${daysLeft} days`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
        <div style="background: #F5EFE6; padding: 40px; border-radius: 24px;">
          <h2>Hi ${name},</h2>
          <p style="color: #666; line-height: 1.7;">
            Your Zabatly subscription expires on <strong>${expiresAt}</strong> (in ${daysLeft} days).
            Renew now to keep your designs and access uninterrupted.
          </p>
          <a href="${process.env.FRONTEND_URL}/pricing"
             style="display: inline-block; background: #C9704A; color: white; padding: 16px 32px;
                    border-radius: 12px; text-decoration: none; font-weight: bold;">
            Renew Subscription →
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendManualReviewAlert(
  paymentId: string,
  userId: string,
  screenshotPath: string,
  ocrResult: object
): Promise<void> {
  if (!resend) { emailDisabled('sendManualReviewAlert'); return; }
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@zabatly.com';
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[Manual Review Required] Payment ${paymentId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C9704A;">Payment Requires Manual Review</h2>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Screenshot:</strong> ${screenshotPath}</p>
        <h3>OCR Result:</h3>
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto;">
${JSON.stringify(ocrResult, null, 2)}
        </pre>
        <p>Please review the payment screenshot in Supabase Storage and activate or reject manually.</p>
      </div>
    `,
  });
}
