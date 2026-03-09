const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;

if (!APP_ID || !SECRET_KEY) {
  console.error('Error: CASHFREE_APP_ID and CASHFREE_SECRET_KEY must be set in .env file');
  process.exit(1);
}

app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, email, userId, name } = req.body;
    
    if (!amount || !email || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = "order_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    console.log('Creating order with credentials:', { 
      orderId, 
      amount, 
      email, 
      userId, 
      APP_ID: APP_ID ? 'SET' : 'NOT SET', 
      SECRET_KEY: SECRET_KEY ? 'SET' : 'NOT SET' 
    });

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
        notify_url: `https://manmoon-4.vercel.app/webhook`
      }
    };

    console.log('Sending order data:', JSON.stringify(orderData, null, 2));

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

    console.log('Cashfree Response Status:', response.status);
    console.log('Cashfree Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.payment_session_id) {
      res.json(response.data);
    } else {
      console.error('No payment_session_id in response');
      res.status(500).json({ 
        error: 'Invalid response from payment gateway',
        details: response.data
      });
    }
  } catch (error) {
    console.error('Cashfree Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    
    res.status(500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server running',
    timestamp: new Date().toISOString(),
    env_check: {
      APP_ID: APP_ID ? 'SET' : 'MISSING',
      SECRET_KEY: SECRET_KEY ? 'SET' : 'MISSING'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Test at: http://localhost:${PORT}/health`);
  console.log(`✓ APP_ID: ${APP_ID ? 'Configured' : 'Missing'}`);
  console.log(`✓ SECRET_KEY: ${SECRET_KEY ? 'Configured' : 'Missing'}`);
});
