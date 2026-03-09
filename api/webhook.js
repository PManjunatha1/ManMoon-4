const crypto = require('crypto');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// This expects a single environment variable FIREBASE_SERVICE_ACCOUNT as a base64 encoded JSON string
if (!admin.apps.length) {
  try {
    const serviceAccountString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.error('Failed to initialize Firebase Admin:', e.message);
  }
}

const db = admin.firestore();

// Helper to buffer the request
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', err => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SECRET_KEY = process.env.SECRET_KEY;
  if (!SECRET_KEY) {
    console.error('Webhook secret key is not configured.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const rawBody = await getRawBody(req);
    const bodyString = rawBody.toString();
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const data = JSON.parse(bodyString);
    
    if (!signature || !timestamp) {
      return res.status(400).json({ error: 'Missing webhook headers' });
    }
    
    const message = timestamp + bodyString;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(message).digest('base64');

    if (signature !== expectedSignature) {
      console.warn('Webhook signature mismatch!');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Signature is valid, process the event
    console.log('Webhook received and verified:', JSON.stringify(data, null, 2));

    const { order } = data.data;

    // We only care about successful payments for this webhook
    if (order && order.order_status === 'PAID') {
      const userId = order.customer_details.customer_id;

      if (!userId) {
        console.error('Webhook Error: No userId found in customer_details.');
        // Return 200 to acknowledge receipt and prevent retries from Cashfree
        return res.status(200).json({ message: 'Acknowledged, but no user ID found.' });
      }

      // Update user document in Firestore
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        subscribed: true,
        subscriptionTier: 'lifetime',
        paymentOrderId: order.order_id,
        subscriptionDate: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Successfully marked user ${userId} as subscribed.`);
    }

    res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
}
