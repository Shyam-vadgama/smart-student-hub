
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendMail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('SMTP server connection verified');
  } catch (error) {
    console.error('SMTP server connection error:', error);
    throw new Error('Error connecting to SMTP server');
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SERVER_NAME}" <${process.env.SMTP_USER}>`,
      ...options,
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};
