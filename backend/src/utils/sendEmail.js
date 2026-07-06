export const sendEmail = async (options) => {
  // Mock fallback to console logging during development when SMTP env variables are not present
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('--- [MOCK EMAIL DISPATCH] ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.message}`);
    console.log('-----------------------------');
    return { success: true, messageId: 'mock-id-12345' };
  }

  // Real nodemailer dispatch logic would reside here:
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: `"${process.env.FROM_NAME || 'QuickServe.lk'}" <${process.env.FROM_EMAIL || 'noreply@quickserve.lk'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(message);
    return info;
  } catch (err) {
    console.error('Email delivery error:', err.message);
    // Return mock success in non-production environments to avoid blocker crashes
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, messageId: 'mock-fail-fallback-id' };
    }
    throw err;
  }
};

export default sendEmail;
