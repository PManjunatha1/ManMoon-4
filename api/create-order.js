const axios = require('axios');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, email, userId, name } = req.body;
    
    if (!amount || !email || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = "order_" + Date.now();
    const APP_ID = process.env.APP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!APP_ID || !SECRET_KEY) {
      return res.status(500).json({ error: 'API credentials not configured' });
    }

    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_email: email,
          customer_phone: "9999999999"
        },
        order_meta: {
          return_url: `${req.headers.origin || req.headers.host}/subscribe.html`
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01",
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Cashfree Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
}