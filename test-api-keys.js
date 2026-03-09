const axios = require('axios');
require('dotenv').config();

const APP_ID = process.env.APP_ID;
const SECRET_KEY = process.env.SECRET_KEY;

console.log('Testing Cashfree API Keys...');
console.log('APP_ID:', APP_ID ? 'SET' : 'NOT SET');
console.log('SECRET_KEY:', SECRET_KEY ? 'SET' : 'NOT SET');

async function testCashfreeAPI() {
  try {
    const orderId = "test_order_" + Date.now();
    
    const orderData = {
      order_id: orderId,
      order_amount: 1,
      order_currency: "INR",
      customer_details: {
        customer_id: "test_customer",
        customer_email: "test@example.com",
        customer_phone: "9999999999",
        customer_name: "Test Customer"
      },
      order_meta: {
        return_url: "https://example.com/success"
      }
    };

    console.log('\nSending test order to Cashfree...');
    
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

    console.log('✅ SUCCESS! API Keys are working');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.payment_session_id) {
      console.log('✅ Payment session ID received:', response.data.payment_session_id);
    } else {
      console.log('❌ No payment_session_id in response');
    }

  } catch (error) {
    console.log('❌ ERROR! API Keys failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.log('\n🔑 SOLUTION: Your API keys are invalid or expired');
      console.log('1. Check your Cashfree merchant dashboard');
      console.log('2. Verify the APP_ID and SECRET_KEY are correct');
      console.log('3. Make sure they are production keys for production API');
    }
  }
}

testCashfreeAPI();