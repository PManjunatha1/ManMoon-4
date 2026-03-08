# Environment Variables for Deployment

## For Netlify:
Add these in Netlify Dashboard > Site Settings > Environment Variables:
CASHFREE_APP_ID=your_cashfree_app_id_here
CASHFREE_SECRET_KEY=your_cashfree_secret_key_here

## For Vercel:
Add these in Vercel Dashboard > Project Settings > Environment Variables:
CASHFREE_APP_ID=your_cashfree_app_id_here
CASHFREE_SECRET_KEY=your_cashfree_secret_key_here

## For Firebase:
Run these commands:
firebase functions:config:set cashfree.app_id="your_cashfree_app_id_here"
firebase functions:config:set cashfree.secret_key="your_cashfree_secret_key_here"

## For Local Development:
Add these to your .env file:
CASHFREE_APP_ID=your_cashfree_app_id_here
CASHFREE_SECRET_KEY=your_cashfree_secret_key_here