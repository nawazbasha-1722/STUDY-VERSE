import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // If credentials are not set, fall back to console logging
  const hasSMTP =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (!hasSMTP) {
    console.log('--- MOCK EMAIL SENT ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('-----------------------');
    return { success: true, mock: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.SMTP_FROM || 'noreply@studyverse.com'}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  const info = await transporter.sendMail(message);
  console.log(`Email sent: ${info.messageId}`);
  return info;
};
