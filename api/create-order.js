const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, email, userId, name } = req.body;
    
    if (!amount || !email || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const APP_ID = process.env.APP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!APP_ID || !SECRET_KEY) {
      console.error('Missing API credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const orderId = "order_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    const orderData = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: email,
        customer_phone: "9999999999",
        customer_name: name || "Customer"
      },
      order_meta: {
        return_url: `https://manmoon-4.vercel.app/success.html?userId=${userId}&orderId=${orderId}`,
        notify_url: `https://manmoon-4.vercel.app/api/webhook`
      }
    };

    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
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
    console.error('Payment error:', error.message);
    return res.status(500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
}
