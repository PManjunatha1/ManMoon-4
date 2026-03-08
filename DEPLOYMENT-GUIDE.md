# Universal Deployment Guide

Your payment system will now work on all platforms. Here's how to deploy:

## 1. LOCAL (localhost:3000)
```bash
npm install
node server.js
```
Visit: http://localhost:3000/subscribe.html

## 2. NETLIFY
1. Upload these files to Netlify:
   - All `public/` folder contents
   - `create-order.js` (as Netlify function)
   - `netlify.toml`
   - `functions-package.json` (rename to package.json in root)

2. In Netlify dashboard:
   - Set build command: `npm install`
   - Set publish directory: `public`
   - Functions will auto-deploy from `create-order.js`

## 3. VERCEL
1. Upload these files to Vercel:
   - All `public/` folder contents  
   - `vercel-create-order.js`
   - `vercel.json`
   - `functions-package.json` (rename to package.json in root)

2. Vercel will auto-detect and deploy the API function

## 4. FIREBASE
1. Deploy functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

2. Deploy hosting:
```bash
firebase deploy --only hosting
```

## How it works:
- The `subscribe.html` automatically detects which platform it's running on
- It calls the correct API endpoint for each platform:
  - Local: `/api/create-order`
  - Netlify: `/.netlify/functions/create-order`
  - Vercel: `/api/create-order`
  - Firebase: `https://us-central1-manmoon3.cloudfunctions.net/createOrder`

## Files created:
- `create-order.js` - Netlify function
- `vercel-create-order.js` - Vercel function  
- `vercel.json` - Vercel config
- `netlify.toml` - Updated Netlify config
- `functions/index.js` - Updated Firebase function
- `public/subscribe.html` - Updated with auto-detection

Your payment will work everywhere now!