require('dotenv').config();
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
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables for sending email: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log('--- Environment Variables for Nodemailer ---');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '[SET]' : '[NOT SET]'); // Don't log the actual password
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  console.log('-------------------------------------------');

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
