# Telegram Bot Integration - Testing Guide

## 📋 Pre-Testing Checklist

Before testing the integration, ensure:
- ✅ Telegram Bot created and token available
- ✅ `.env.local` file exists with `TELEGRAM_BOT_TOKEN`
- ✅ Telegram Bot started (sent `/start` to @yardimshop_order_bot)
- ✅ Next.js dev server running (`npm run dev`)

---

## Step 1: Find Your Telegram Chat ID

### Method A: Using Bot Response
1. Open Telegram
2. Search for **@yardimshop_order_bot**
3. Send any message to the bot
4. Bot will respond with your Chat ID

### Method B: Using getMe Method
1. Open browser and visit:
   ```
   https://api.telegram.org/bot8812002018:AAEuLhT2gellmWP4FT8U25el9bO1nIsFebc/getMe
   ```
   (Replace token if needed)
2. Note your Chat ID from bot info

### Method C: Test Endpoint
1. Start server: `npm run dev`
2. Open browser to: `http://localhost:3000/api/telegram/test`
3. Read the response - it will show Chat ID in the error message initially

---

## Step 2: Add Chat ID to .env.local

1. Open `.env.local` file
2. Find the line: `TELEGRAM_CHAT_ID=`
3. Add your Chat ID:
   ```
   TELEGRAM_CHAT_ID=123456789
   ```
   ✅ Make sure there's no space after `=`
4. Save file
5. **IMPORTANT: Restart Next.js dev server** (Ctrl+C then `npm run dev`)

---

## Step 3: Test Telegram Connection

### Using curl or browser:

```bash
curl http://localhost:3000/api/telegram/test
```

Or visit in browser: `http://localhost:3000/api/telegram/test`

### Expected Successful Response:
```json
{
  "success": true,
  "message": "✅ Telegram connection test successful! Message sent to chat.",
  "details": {
    "botToken": "8812002018...",
    "chatId": "123456789"
  }
}
```

✅ You should also receive a test message in your Telegram Chat!

### If you see an error:

**Error: "TELEGRAM_BOT_TOKEN is not configured"**
- Check `.env.local` file exists in project root
- Verify `TELEGRAM_BOT_TOKEN` is set
- Restart dev server

**Error: "TELEGRAM_CHAT_ID is not configured"**
- Add Chat ID to `.env.local`
- Restart dev server

**Error: "Telegram API Error"**
- Verify token is correct
- Verify Chat ID is correct
- Check bot is running (@yardimshop_order_bot)
- Ensure bot has permission to send messages

---

## Step 4: Test with a Real Order

### Prerequisites:
- ✅ Telegram test passed
- ✅ Next.js dev server running
- ✅ Have a product added to cart (can use existing products)

### Steps:

1. **Navigate to Checkout**
   - Go to `http://localhost:3000/checkout`
   - Add products if cart is empty
   - Click "Proceed to Checkout"

2. **Fill Order Information**
   - **First Name**: test
   - **Last Name**: user
   - **Phone**: 09123456789
   - **Province**: تهران
   - **City**: تهران
   - **Address**: خیابان نمونه، پلاک 123
   - **Postal Code**: 1234567890

3. **Select Shipping**
   - Choose any shipping method (e.g., Courier)

4. **Select Payment Method**
   - Choose **"Online Payment"** (NOT Cash on Delivery)

5. **Complete Payment**
   - Click "Complete Order"
   - You'll be redirected to Zibal payment gateway
   - Use Zibal test card:
     - **Card Number**: 9999999999999999 (test card)
     - **Expiry**: Any future date
     - **CVV**: Any 3 digits
   - Click "Pay" or "Confirm"

6. **Check Telegram**
   - Within a few seconds, you should receive a message:
   ```
   🛒 سفارش جدید
   
   ━━━━━━━━━━━━━━━━━━━━
   📦 شماره سفارش: #XXXXXXXX
   
   👤 مشتری:
   test user
   
   📱 شماره موبایل:
   09123456789
   
   💰 مبلغ:
   X,XXX تومان
   
   💳 وضعیت پرداخت:
   ✅ پرداخت موفق
   
   📦 محصولات:
   - Product Name × 1
   
   ⏰ تاریخ سفارش:
   [Date and Time]
   ━━━━━━━━━━━━━━━━━━━━
   
   [View Order Button]
   ```

7. **Verify Button**
   - Click "View Order" button (🔎 مشاهده سفارش)
   - Should take you to admin panel with orders
   - Order should appear in the list with "paid" status

---

## Step 5: Verify Error Handling

### Simulate Telegram Failure:

1. **Temporarily disable Telegram**
   - Change `TELEGRAM_CHAT_ID` to invalid value
   - Restart dev server

2. **Create another order**
   - Repeat the order process above
   - Complete payment on Zibal

3. **Verify Order Still Succeeds**
   - ✅ You should still see success page
   - ✅ Order should be in database with "paid" status
   - ✅ No error shown to customer
   - ✅ Error logged in server console (without token)

4. **Check Server Logs**
   - Terminal running `npm run dev` should show:
   ```
   ❌ Failed to send Telegram notification for order XXXXXXXX: ...
   Telegram notification failed for order XXXXXXXX, but order payment is complete
   ```

5. **Restore Telegram Configuration**
   - Set correct `TELEGRAM_CHAT_ID`
   - Restart dev server

---

## Step 6: Test Console Logging (Security Check)

1. Create an order and complete payment
2. Check server terminal logs
3. Verify:
   - ✅ Token is **NOT** shown in logs
   - ✅ Error messages don't expose token
   - ✅ Order ID is logged
   - ✅ Chat ID may be visible (not sensitive)

### Good Log Example:
```
✅ Telegram notification sent for order 12ab34cd
```

### BAD Log Example (Should NOT appear):
```
❌ Token: 8812002018:AAEuLhT2gellmWP4FT8U25el9bO1nIsFebc in error log
```

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Test endpoint returns 500 error | Restart dev server after updating `.env.local` |
| "TELEGRAM_BOT_TOKEN is not configured" | Ensure `.env.local` exists in project root with correct token |
| "TELEGRAM_CHAT_ID is not configured" | Add Chat ID to `.env.local` and restart server |
| Message not received in Telegram | Check Chat ID is correct, verify bot isn't muted in Telegram |
| Order shows success but no Telegram | Check server logs for errors, verify Chat ID, test connection |
| Button link doesn't work | Verify `APP_URL` is set in `.env.local` (should be `http://localhost:3000` for dev) |

---

## 📝 Production Checklist

Before deploying to production:

- [ ] Set `TELEGRAM_BOT_TOKEN` in production environment variables
- [ ] Set `TELEGRAM_CHAT_ID` in production environment variables
- [ ] Set `APP_URL` to production domain in environment variables
- [ ] Remove `.env.local` from server (should only exist locally)
- [ ] Test with one real order in production
- [ ] Verify notifications arrive without delay
- [ ] Monitor server logs for any Telegram errors
- [ ] Set up log monitoring/alerting for Telegram failures

---

## 📞 Support

If you encounter issues:

1. **Check server logs** - Look for error messages about Telegram
2. **Verify .env.local** - Ensure all values are correct and no spaces
3. **Test endpoint** - Call `/api/telegram/test` to diagnose issues
4. **Restart server** - Always restart after `.env.local` changes
5. **Check Telegram** - Ensure bot is running and chat isn't blocked

---

**Last Updated**: 2026-08-31
