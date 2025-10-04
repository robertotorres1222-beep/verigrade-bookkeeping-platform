# 👀 VISUAL GUIDE - EXACT BUTTONS TO CLICK

## **🎯 FOLLOW THIS EXACT PATH:**

### **1. STRIPE DASHBOARD HOME**
- **URL**: `https://dashboard.stripe.com`
- **Look for**: Left sidebar with menu items
- **Click**: `Developers` (in the left sidebar)

### **2. DEVELOPERS PAGE**
- **You'll see**: Menu with options like "API keys", "Webhooks", "Events"
- **Click**: `Webhooks` (in the left sidebar under Developers)

### **3. WEBHOOKS PAGE**
- **You'll see**: 
  - Title: "Webhook endpoints"
  - Text: "No webhook endpoints found"
  - Blue button: `+ Add endpoint`
- **Click**: `+ Add endpoint` (blue button, top right)

### **4. ADD ENDPOINT FORM**
- **You'll see a form with these fields:**

**Endpoint URL field:**
```
Type exactly: https://yourdomain.com/api/v1/stripe/webhook
```

**Description field:**
```
Type exactly: VeriGrade Bookkeeping Platform Webhooks
```

**Events section:**
- **Click**: `Select events` (button/link)
- **You'll see**: List of event categories

### **5. SELECT EVENTS POPUP/MODAL**
**You'll see categories like:**
- Payments
- Invoices  
- Customers
- Subscriptions
- etc.

**Click these checkboxes:**

**Under "Payments":**
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.canceled`
- ✅ `payment_intent.requires_action`

**Under "Invoices":**
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `invoice.created`
- ✅ `invoice.updated`

**Under "Customers":**
- ✅ `customer.created`
- ✅ `customer.updated`
- ✅ `customer.deleted`

**Under "Subscriptions":**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

**Under "Checkout":**
- ✅ `checkout.session.completed`
- ✅ `checkout.session.expired`

**Under "Setup intents":**
- ✅ `setup_intent.succeeded`
- ✅ `setup_intent.setup_failed`

**After selecting all events:**
- **Click**: `Add events` (button to confirm selection)

### **6. CREATE ENDPOINT**
- **Click**: `Add endpoint` (blue button at bottom of form)
- **You'll see**: Success message or redirect to webhook details

### **7. WEBHOOK DETAILS PAGE**
**You'll see:**
- **Endpoint URL**: `https://yourdomain.com/api/v1/stripe/webhook`
- **Signing secret**: `Click to reveal` or `Reveal`
- **Events**: List of selected events

**To get your secret:**
- **Click**: `Click to reveal` or `Reveal` (next to Signing secret)
- **Copy**: The secret that appears (starts with `whsec_`)

---

## **📋 EXACT TEXT TO LOOK FOR:**

### **Navigation Path:**
```
Dashboard → Developers → Webhooks → Add endpoint
```

### **Button Text:**
- `Developers` (sidebar)
- `Webhooks` (sidebar)
- `+ Add endpoint` (blue button)
- `Select events` (link/button)
- `Add events` (after selecting)
- `Add endpoint` (final button)
- `Click to reveal` (for secret)

### **Form Fields:**
- **Endpoint URL**: `https://yourdomain.com/api/v1/stripe/webhook`
- **Description**: `VeriGrade Bookkeeping Platform Webhooks`

---

## **🔍 WHAT YOU'LL SEE AFTER CREATION:**

### **Webhook Details Page:**
```
Endpoint URL: https://yourdomain.com/api/v1/stripe/webhook
Description: VeriGrade Bookkeeping Platform Webhooks
Signing secret: whsec_1234567890abcdef... (click to reveal)
Status: Enabled
Events: 16 events selected
```

### **Back in Webhooks List:**
```
Webhook endpoints (1)
✅ https://yourdomain.com/api/v1/stripe/webhook
   VeriGrade Bookkeeping Platform Webhooks
   Enabled • 16 events
```

---

## **⚡ QUICK REFERENCE:**

**URL to visit**: `dashboard.stripe.com`
**Path**: Developers → Webhooks → Add endpoint
**Events to select**: 16 total events
**Secret to copy**: Starts with `whsec_`
**File to update**: `backend/.env`

---

## **🎯 SUCCESS INDICATORS:**

You'll know you did it right when:
- ✅ You see "1 webhook endpoint" in the list
- ✅ The endpoint URL matches: `https://yourdomain.com/api/v1/stripe/webhook`
- ✅ You have a secret that starts with `whsec_`
- ✅ You can see "16 events" or similar count
- ✅ The status shows "Enabled"

**That's it! Your webhook is ready!** 🎉
