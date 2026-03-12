export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const APP_ID = process.env.APP_ID;
  const SECRET_KEY = process.env.SECRET_KEY;
  
  res.status(200).json({
    APP_ID_SET: !!APP_ID,
    SECRET_KEY_SET: !!SECRET_KEY,
    APP_ID_LENGTH: APP_ID ? APP_ID.length : 0,
    SECRET_KEY_LENGTH: SECRET_KEY ? SECRET_KEY.length : 0,
    timestamp: new Date().toISOString()
  });
}
