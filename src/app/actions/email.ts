'use server';

import { sendMail } from '@/lib/email';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

/**
 * @fileOverview Server actions to securely send automated emails and log them for administration.
 */

async function logEmail(data: {
  type: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  status: 'Success' | 'Failed';
  reason?: string;
}) {
  try {
    const { firestore } = initializeFirebase();
    await addDoc(collection(firestore, 'email_logs'), {
      ...data,
      admin: 'System',
      sentAt: new Date().toISOString()
    });
  } catch (err) {
    // Log to server console if Firestore logging fails
    console.error('[Action: EmailLog] Failed to log communication to Firestore:', err);
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  const subject = 'Your Wallet Tally Verification Code';
  try {
    await sendMail({
      to: email,
      subject,
      text: `Your verification code is: ${otp}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #23414d; text-align: center;">Welcome to Wallet Tally!</h2>
          <p>Please use the following 6-digit code to verify your email address:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background: #f4f7f8; display: block; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">This code was requested for your account registration. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Sent by Wallet Tally Secure Verification System</p>
        </div>
      `,
    });
    await logEmail({ type: 'OTP Verification', recipientEmail: email, recipientName: 'New User', subject, status: 'Success' });
    return { success: true };
  } catch (error: any) {
    console.error('[SMTP] OTP Error:', error);
    await logEmail({ type: 'OTP Verification', recipientEmail: email, recipientName: 'New User', subject, status: 'Failed', reason: error.message });
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetOtpEmail(email: string, otp: string, userName: string) {
  const subject = 'Wallet Tally: Password Reset Request';
  try {
    await sendMail({
      to: email,
      subject,
      text: `Your password reset code is: ${otp}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We received a request to reset your password. Use the following 6-digit code to proceed:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background: #f8fafc; display: block; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; color: #1e3a8a;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Wallet Tally Secure Account Services</p>
        </div>
      `,
    });
    await logEmail({ type: 'Password Reset', recipientEmail: email, recipientName: userName, subject, status: 'Success' });
    return { success: true };
  } catch (error: any) {
    console.error('[SMTP] Reset OTP Error:', error);
    await logEmail({ type: 'Password Reset', recipientEmail: email, recipientName: userName, subject, status: 'Failed', reason: error.message });
    return { success: false, error: error.message };
  }
}

export async function sendTestEmail(email: string, userName: string) {
  const subject = 'Wallet Tally: System Connection Test';
  try {
    await sendMail({
      to: email,
      subject,
      text: `This is a test email dispatched from the Wallet Tally administrative tools.`,
      html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a8a; text-align: center;">Connection Test Success</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>This email confirms that your SMTP configuration is operational and Wallet Tally can successfully dispatch communications.</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #dcfce7; color: #166534;">
            <strong>Test Details:</strong><br/>
            Timestamp: ${new Date().toLocaleString()}<br/>
            Source: Administrative Tools
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Wallet Tally Diagnostic Services</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error: any) {
    console.error('[SMTP] Test Error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendFeedbackApprovalEmail(email: string, userName: string) {
  const subject = 'Your feedback has been featured on Wallet Tally!';
  try {
    await sendMail({
      to: email,
      subject,
      text: `Hi ${userName}, thank you for your wonderful feedback. We have selected your review to be featured as a testimonial on our home page!`,
      html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations, ${userName}!</h2>
          <p>We are thrilled to inform you that your feedback has been selected to be featured as a <strong>Testimonial</strong> on the Wallet Tally home page.</p>
          <p>We truly appreciate the time you took to share your experience.</p>
          <p>Thank you for being a valued member of Wallet Tally.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent with ❤️ from the Wallet Tally Team</p>
        </div>
      `,
    });
    await logEmail({ type: 'Appreciation', recipientEmail: email, recipientName: userName, subject, status: 'Success' });
    return { success: true };
  } catch (error: any) {
    console.error('[SMTP] Approval Email Error:', error);
    await logEmail({ type: 'Appreciation', recipientEmail: email, recipientName: userName, subject, status: 'Failed', reason: error.message });
    return { success: false, error: error.message };
  }
}

export async function sendFeedbackDeletionEmail(email: string, userName: string, reason: string) {
  const subject = 'Update regarding your feedback on Wallet Tally';
  try {
    await sendMail({
      to: email,
      subject,
      text: `Hi ${userName}, we are reaching out to inform you that your recent feedback has been removed. Reason: ${reason}`,
      html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Feedback Status Update</h2>
          <p>Hi ${userName},</p>
          <p>We are writing to inform you that your recently submitted feedback has been removed from our system.</p>
          <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #fee2e2;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">Reason for removal:</p>
            <p style="margin: 8px 0 0 0; color: #b91c1c;">${reason}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Wallet Tally Moderation Service</p>
        </div>
      `,
    });
    await logEmail({ type: 'Feedback Deletion', recipientEmail: email, recipientName: userName, subject, status: 'Success', reason });
    return { success: true };
  } catch (error: any) {
    console.error('[SMTP] Deletion Email Error:', error);
    await logEmail({ type: 'Feedback Deletion', recipientEmail: email, recipientName: userName, subject, status: 'Failed', reason: error.message });
    return { success: false, error: error.message };
  }
}

export async function sendUserWarningEmail(email: string, userName: string, violationType: string, detailedReason?: string) {
  const subject = 'Important: Official Account Warning - Wallet Tally';
  try {
    await sendMail({
      to: email,
      subject,
      text: `Hi ${userName}, this is an official warning regarding your account activity on Wallet Tally. Violation: ${violationType}`,
      html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; text-align: center;">⚠️ Account Warning</h1>
          <p>Hi <strong>${userName}</strong>,</p>
          <div style="background: #fffbeb; padding: 24px; border-radius: 16px; margin: 24px 0; border: 1px solid #fef3c7;">
            <p style="margin: 0; font-weight: bold; color: #92400e; text-transform: uppercase; font-size: 12px;">Violation Type:</p>
            <p style="margin: 8px 0 0 0; color: #b45309; font-size: 18px; font-weight: bold;">${violationType}</p>
            ${detailedReason ? `
              <p style="margin: 16px 0 0 0; font-weight: bold; color: #92400e; text-transform: uppercase; font-size: 12px;">Administrative Note:</p>
              <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px; line-height: 1.6; font-style: italic;">"${detailedReason}"</p>
            ` : ''}
          </div>
          <p>Please review our Terms of Service to ensure your future activity remains in compliance.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">OFFICIAL NOTICE FROM WALLET TALLY ADMINISTRATION</p>
        </div>
      `,
    });
    await logEmail({ type: 'Warning', recipientEmail: email, recipientName: userName, subject, status: 'Success', reason: detailedReason ? `${violationType}: ${detailedReason}` : violationType });
    return { success: true };
  } catch (error: any) {
    console.error('[SMTP] Warning Error:', error);
    await logEmail({ type: 'Warning', recipientEmail: email, recipientName: userName, subject, status: 'Failed', reason: error.message });
    return { success: false, error: error.message };
  }
}

export async function sendAccountDeletionEmail(email: string, userName: string, reason: string) {
  const subject = 'Your Wallet Tally account has been terminated';
  try {
    await sendMail({
      to: email,
      subject,
      text: `Hi ${userName}, your account has been terminated by an administrator. Reason: ${reason}`,
      html: `
        <div style="font-family: sans-serif; color: #1a2e3a; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Account Termination Notice</h2>
          <p>Hi ${userName},</p>
          <p>We are writing to inform you that your Wallet Tally account associated with this email has been permanently terminated by our administration team.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-weight: bold; color: #475569;">Official Reason:</p>
            <p style="margin: 8px 0 0 0; color: #64748b; font-style: italic;">"${reason}"</p>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">If you believe this was a mistake, please contact our support team.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">WALLET TALLY ADMINISTRATIVE SERVICES</p>
        </div>
      `,
    });
    await logEmail({ type: 'Account Deletion', recipientEmail: email, recipientName: userName, subject, status: 'Success', reason });
    return { success: true };
  } catch (error: any) {
    console.error('[SMTP] Termination Error:', error);
    await logEmail({ type: 'Account Deletion', recipientEmail: email, recipientName: userName, subject, status: 'Failed', reason: error.message });
    return { success: false, error: error.message };
  }
}
