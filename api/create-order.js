import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, userId, name, amount } = req.body;
    
    if (!email || !userId) {
      return res.status(400).json({ error: 'Missing required fields: email, userId' });
    }

    const APP_ID = process.env.APP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!APP_ID || !SECRET_KEY) {
      console.error('Missing API credentials');
      return res.status(500).json({ error: 'Server configuration error: Missing API keys' });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderData = {
      order_id: orderId,
      order_amount: parseFloat(amount || 100),
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: email,
        customer_phone: "9999999999",
        customer_name: name || "Customer"
      },
      order_meta: {
        return_url: `https://manmoon-4.vercel.app/success.html?userId=${userId}&orderId=${orderId}`
      }
    };

    console.log('Creating order:', orderId);
    console.log('Sending to Cashfree API...');

    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01",
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY
        },
        timeout: 10000
      }
    );

    console.log('Cashfree response status:', response.status);
    console.log('Cashfree response data:', JSON.stringify(response.data));

    if (response.data && response.data.payment_session_id) {
      console.log('Success! Session ID:', response.data.payment_session_id);
      return res.status(200).json({
        ...response.data,
        appId: APP_ID
      });
    } else {
      console.error('No payment_session_id in response:', response.data);
      return res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('Payment error:', error.message);
    
    if (error.response) {
      console.error('Cashfree error status:', error.response.status);
      console.error('Cashfree error data:', JSON.stringify(error.response.data));
      return res.status(error.response.status || 500).json({ 
        error: error.response.data?.message || error.message,
        details: error.response.data
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout - Cashfree API not responding' });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Unknown error occurred',
      type: error.code
    });
  }
}
