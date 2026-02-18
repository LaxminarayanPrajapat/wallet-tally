
import nodemailer from 'nodemailer';

/**
 * @fileOverview Email service configuration using nodemailer with attachment support.
 */

export type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer;
  }[];
};

export async function sendMail({ to, subject, text, html, attachments }: SendEmailOptions) {
  // Log SMTP configuration for debugging
  console.log('--- SMTP Configuration ---');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  console.log('------------------------');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
    attachments,
  };

  return transporter.sendMail(mailOptions);
}
