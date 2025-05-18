import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { businessEmail, businessName, cart, shippingAddress, language } = JSON.parse(event.body || '{}');

  const itemsHtml = cart.map((item: any) =>
    `<li>${item.quantity} × ${item.name} (${item.price} ${item.currency})</li>`
  ).join('');

  const html = `
    <h2>New Order from ${shippingAddress.firstName} ${shippingAddress.lastName}</h2>
    <p><strong>Shipping Address:</strong><br>
    ${shippingAddress.address}<br>
    ${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}<br>
    ${shippingAddress.country}<br>
    Phone: ${shippingAddress.phone}</p>
    <h3>Order:</h3>
    <ul>${itemsHtml}</ul>
  `;

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
    from: 'contact@canasource.ca', // <-- This will show as the sender
    to: businessEmail,
    subject: `🛒 New Order for ${businessName}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order email sent successfully' }),
    };
  } catch (error) {
    console.error('Send order email failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send order email', error: message }),
    };
  }
};

export { handler };