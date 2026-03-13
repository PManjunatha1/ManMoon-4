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
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    const APP_ID = process.env.APP_ID;
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!APP_ID || !SECRET_KEY) {
      console.error('Missing API credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('Verifying payment for order:', orderId);

    const response = await axios.get(
      `https://api.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY
        },
        timeout: 10000
      }
    );

    console.log('Cashfree verification response:', response.data);

    const orderData = response.data;
    const isPaid = orderData.order_status === 'PAID';

    return res.status(200).json({
      isPaid: isPaid,
      status: orderData.order_status,
      paymentStatus: orderData.payment_status,
      orderId: orderData.order_id,
      amount: orderData.order_amount,
      currency: orderData.order_currency
    });

  } catch (error) {
    console.error('Verification error:', error.message);
    
    if (error.response) {
      console.error('Cashfree error:', error.response.data);
      return res.status(error.response.status || 500).json({ 
        error: error.response.data?.message || error.message,
        isPaid: false
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Verification failed',
      isPaid: false
    });
  }
}
