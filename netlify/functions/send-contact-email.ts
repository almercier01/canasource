import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // 👈 Force load of .env


const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, email, message } = JSON.parse(event.body || '{}');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'gdrive@renotrend.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: 'gdrive@renotrend.com',
    to: 'contact@canasource.ca',
    replyTo: email,
    subject: `📬 Contact from ${name}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
  };
  

  try {
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Contact form submission sent successfully' }),
    };
  } catch (error) {
    console.error('Send email failed:', error);
  
    const message =
      error instanceof Error ? error.message : 'Unknown error';
  
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send email', error: message }),
    };
  }
};

export { handler };
