# 📋 EXACT STEPS TO CREATE YOUR STRIPE WEBHOOK

## **🎯 FOLLOW THESE EXACT STEPS:**

### **STEP 1: Open Stripe Dashboard**
1. Go to: **https://dashboard.stripe.com**
2. Login with your Stripe account
3. You should see your dashboard

### **STEP 2: Navigate to Webhooks**
1. Look at the **left sidebar**
2. Find and click **"Developers"**
3. In the Developers menu, click **"Webhooks"**
4. You'll see: **"No webhook endpoints found"**

### **STEP 3: Create New Webhook Endpoint**
1. Click the **"Add endpoint"** button (blue button, top right)
2. You'll see a form to create a new webhook

### **STEP 4: Fill Out the Webhook Form**

**Endpoint URL:**
```
https://yourdomain.com/api/v1/stripe/webhook
```
*Note: Replace `yourdomain.com` with your actual domain when you deploy*

**Description:**
```
VeriGrade Bookkeeping Platform Webhooks
```

### **STEP 5: Select Events (IMPORTANT)**

**Click "Select events" and check these boxes:**

**Payment Events:**
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.canceled`
- ✅ `payment_intent.requires_action`

**Invoice Events:**
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `invoice.created`
- ✅ `invoice.updated`

**Subscription Events:**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

**Customer Events:**
- ✅ `customer.created`
- ✅ `customer.updated`
- ✅ `customer.deleted`

**Checkout Events:**
- ✅ `checkout.session.completed`
- ✅ `checkout.session.expired`

**Setup Events:**
- ✅ `setup_intent.succeeded`
- ✅ `setup_intent.setup_failed`

### **STEP 6: Create the Endpoint**
1. After selecting all events, click **"Add endpoint"**
2. Stripe will create your webhook endpoint
3. You'll see a success message

### **STEP 7: Copy Your Webhook Secret**
1. On the webhook details page, find **"Signing secret"**
2. Click **"Reveal"** or **"Click to reveal"**
3. Copy the secret (it starts with `whsec_...`)
4. **IMPORTANT**: Save this secret somewhere safe!

---

## **🔧 UPDATE YOUR ENVIRONMENT FILE:**

### **Open your backend/.env file and update this line:**
```bash
STRIPE_WEBHOOK_SECRET="whsec_YOUR_COPIED_SECRET_HERE"
```

**Replace `YOUR_COPIED_SECRET_HERE` with the actual secret you copied.**

### **Example:**
If your secret is `whsec_1234567890abcdef`, then your line should be:
```bash
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdef"
```

---

## **✅ VERIFY YOUR SETUP:**

### **Check Your Webhook Endpoint:**
1. Go back to **Developers → Webhooks**
2. You should now see **1 webhook endpoint**
3. Click on your webhook to see details
4. Verify the URL and events are correct

### **Test Your Webhook (Optional):**
1. On your webhook details page, click **"Send test webhook"**
2. Select **"payment_intent.succeeded"**
3. Click **"Send test webhook"**
4. Check if your server receives it (when running locally)

---

## **🚀 WHEN YOU DEPLOY:**

### **Update the Webhook URL:**
1. After deploying your app, go back to your webhook
2. Click **"Edit"** or **"Update endpoint"**
3. Change the URL from:
   ```
   https://yourdomain.com/api/v1/stripe/webhook
   ```
   To your actual domain:
   ```
   https://your-actual-domain.com/api/v1/stripe/webhook
   ```

---

## **📱 MOBILE-FRIENDLY STEPS:**

If you're on mobile:
1. Open **dashboard.stripe.com** in your browser
2. Tap the **menu button** (three lines) to access sidebar
3. Tap **"Developers"**
4. Tap **"Webhooks"**
5. Tap **"Add endpoint"**
6. Follow the same steps above

---

## **🎯 QUICK CHECKLIST:**

- [ ] Opened Stripe dashboard
- [ ] Navigated to Developers → Webhooks
- [ ] Clicked "Add endpoint"
- [ ] Entered endpoint URL: `https://yourdomain.com/api/v1/stripe/webhook`
- [ ] Added description: "VeriGrade Bookkeeping Platform Webhooks"
- [ ] Selected all required events (16 events total)
- [ ] Clicked "Add endpoint"
- [ ] Copied the webhook secret
- [ ] Updated backend/.env with the secret
- [ ] Verified webhook endpoint exists

---

## **❓ TROUBLESHOOTING:**

### **Can't find "Developers" in sidebar?**
- Make sure you're logged into the correct Stripe account
- Try refreshing the page
- Check if you have the right permissions

### **Can't see "Add endpoint" button?**
- Make sure you're on the Webhooks page
- Try refreshing the page
- Check if you have webhook creation permissions

### **Events not showing up?**
- Make sure you clicked "Select events"
- Check that you selected all 16 events listed above
- Try refreshing the events list

### **Can't copy the webhook secret?**
- Make sure you clicked "Reveal" or "Click to reveal"
- Try right-clicking and "Copy"
- The secret should start with `whsec_`

---

## **🎉 YOU'RE DONE!**

Once you complete these steps:
1. ✅ Your webhook endpoint will be created
2. ✅ Your environment will be configured
3. ✅ Your VeriGrade platform will handle Stripe events automatically

**Your payment processing is now 100% complete!** 🚀
