import axios from 'axios';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('Verifying order:', orderId);
    
    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY
        }
      }
    );

    const orderData = response.data;
    console.log('Cashfree order response:', JSON.stringify(orderData));
    
    // STRICT VERIFICATION: Both conditions must be true
    const isPaid = 
      orderData.order_status === 'PAID' && 
      orderData.payment_status === 'SUCCESS';
    
    console.log('Order status:', orderData.order_status);
    console.log('Payment status:', orderData.payment_status);
    console.log('Is paid (STRICT):', isPaid);
    
    return res.status(200).json({
      orderId: orderData.order_id,
      status: orderData.order_status,
      paymentStatus: orderData.payment_status,
      amount: orderData.order_amount,
      isPaid: isPaid
    });

  } catch (error) {
    console.error('Verification error:', error.message);
    if (error.response) {
      console.error('Cashfree error:', error.response.status, error.response.data);
    }
    return res.status(500).json({ 
      error: 'Failed to verify payment',
      isPaid: false,
      details: error.message
    });
  }
}
