@echo off
echo 🔧 Setting up Vercel Environment Variables

echo Installing Vercel CLI...
npm install -g vercel

echo Logging in to Vercel...
vercel login

echo Setting environment variables...
vercel env add APP_ID production
echo Enter: 12241567d36e19e62eba9e875616514221

vercel env add SECRET_KEY production  
echo Enter: cfsk_ma_prod_b8b6b8b6b8b6b8b6b8b6b8b6b8b6b8b6_b8b6b8b6

vercel env add PORT production
echo Enter: 3000

echo Deploying to production...
vercel --prod

echo ✅ Done! Your app is live with real payment keys
pause