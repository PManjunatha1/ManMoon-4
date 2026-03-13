export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const firebaseConfig = {
      apiKey: "AIzaSyCfM85FQhBDmonkh4w57rAfpwNB9afXLdQ",
      authDomain: "manmoon-12.firebaseapp.com",
      projectId: "manmoon-12",
      storageBucket: "manmoon-12.firebasestorage.app",
      messagingSenderId: "484001203292",
      appId: "1:484001203292:web:f136fedfb8cb0b4c3a9299",
      measurementId: "G-6YEJJ98KVM"
    };

    return res.status(200).json(firebaseConfig);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to get Firebase config' });
  }
}
