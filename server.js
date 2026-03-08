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
    const { amount, email, userId } = req.body;
    
    if (!amount || !email || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = "order_" + Date.now();

    console.log('Creating order:', { orderId, amount, email, userId });

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
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
          return_url: "http://localhost:3000/subscribe.html"
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

    console.log('Cashfree Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Cashfree Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Test at: http://localhost:${PORT}/health`);
});
