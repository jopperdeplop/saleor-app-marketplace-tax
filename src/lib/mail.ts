import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'Saleor Marketplace <info@salp.shop>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://hub.salp.shop';

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Admin Hub - Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #3b82f6; font-family: serif;">Password Reset Request</h1>
        <p>A password reset was requested for your Saleor Admin Hub account.</p>
        <p>Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">Saleor Admin Hub Security</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function send2FAAlertEmail(email: string, enabled: boolean) {
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: `Security Alert: 2FA ${enabled ? 'Enabled' : 'Disabled'}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: ${enabled ? '#10b981' : '#f43f5e'}; font-family: serif;">Security Update</h1>
        <p>Two-Factor Authentication (2FA) has been <strong>${enabled ? 'enabled' : 'disabled'}</strong> for your account.</p>
        <p>If you did not perform this action, please contact support immediately.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999;">Saleor Marketplace Security</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending 2FA alert email:', error);
  }
}
