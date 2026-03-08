const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.createOrder = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { amount, email, userId, name } = req.body;
      
      if (!amount || !email || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const orderId = "order_" + Date.now();
      const config = functions.config();
      const APP_ID = config.cashfree?.app_id;
      const SECRET_KEY = config.cashfree?.secret_key;

      if (!APP_ID || !SECRET_KEY) {
        return res.status(500).json({ error: 'API credentials not configured' });
      }

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
            return_url: "https://manmoon3.web.app/subscribe.html"
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
});