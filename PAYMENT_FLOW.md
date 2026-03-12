# Cashfree Payment Flow - ManMoon

## Complete Payment Journey

### 1. Subscribe Page (`subscribe.html`)
- User clicks "Pay ₹100 with Cashfree" button
- Frontend calls `/api/create-order` with:
  - amount: 100
  - email: user email
  - userId: Firebase user ID
  - name: user name

### 2. Create Order API (`/api/create-order`)
- Creates Cashfree order with ₹100 amount
- Sets return URL: `success.html?userId={userId}&orderId={orderId}`
- Returns `payment_session_id`
- User is redirected to Cashfree payment page

### 3. Cashfree Payment Page (External)
- User enters payment details
- Completes ₹100 payment
- Cashfree redirects back to return URL

### 4. Success Page (`success.html`)
- Receives `userId` and `orderId` from URL params
- Shows "Verifying Payment..." with loader
- Calls `/api/verify-payment` with orderId

### 5. Verify Payment API (`/api/verify-payment`)
- Queries Cashfree API for order status
- STRICT CHECK: Both must be true:
  - `order_status === 'PAID'`
  - `payment_status === 'SUCCESS'`
- Returns `isPaid: true/false`

### 6. Success Page (After Verification)
If payment verified:
- ✅ Shows "Payment Successful!"
- Updates Firebase user document:
  - subscribed: true
  - paymentStatus: 'paid'
  - amountPaid: 100
  - paymentDate: timestamp
  - orderId: order ID
- Shows "Go to Dashboard" button
- Auto-redirects to `dashboard.html` after 3 seconds

If payment failed:
- ❌ Shows "Payment Not Completed"
- Redirects to `subscribe.html` after 2 seconds

### 7. Dashboard Page (`dashboard.html`)
- User can now access all premium content
- Subscription status: Active

## Key Features
✅ Secure payment verification
✅ Strict dual-status check (PAID + SUCCESS)
✅ Firebase subscription update
✅ Manual "Go to Dashboard" button
✅ Auto-redirect with 3-second delay
✅ Error handling and retry flow
