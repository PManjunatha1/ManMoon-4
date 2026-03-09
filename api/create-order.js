const axios = require('axios');
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // We ignore amount from body for security
    const { email, userId, name } = req.body;
    
    if (!email || !userId) {
      return res.status(400).json({ error: 'Missing required fields: email, userId' });
    }

    const APP_ID = process.env.APP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!APP_ID || !SECRET_KEY) {
      console.error('Missing API credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const orderId = `order_${uuidv4()}`;
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const orderData = {
      order_id: orderId,
      order_amount: 100, // Enforce price on the backend
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: email,
        customer_name: name || "Customer" // Phone number removed
      },
      order_meta: {
        return_url: `${baseUrl}/success.html?userId=${userId}&orderId=${orderId}`,
        notify_url: `${baseUrl}/api/webhook`
      }
    };

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders", // Using sandbox for safety
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01",
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY
        }
      }
    );

    if (response.data && response.data.payment_session_id) {
      return res.status(200).json(response.data);
    } else {
      return res.status(500).json({ 
        error: 'Invalid response from payment gateway',
        details: response.data
      });
    }
  } catch (error) {
    console.error('Payment error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    return res.status(500).json({ 
      error: error.response?.data?.message || 'An unexpected error occurred',
      details: error.response?.data
    });
  }
}
