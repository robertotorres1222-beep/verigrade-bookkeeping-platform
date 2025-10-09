# Email Forwarding Setup in Vercel

## Since you bought your domain in Vercel, here's how to set up professional emails:

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project: `verigrade-bookkeeping-platform`
3. Go to the **"Domains"** tab

### Step 2: Set Up Email Forwarding
1. **Find your domain** `verigradebookkeeping.com`
2. **Click on the domain** to open settings
3. **Look for "Email" or "Email Forwarding"** section
4. **Add email forwarding rules:**

```
hello@verigradebookkeeping.com → verigradebookkeeping@gmail.com
support@verigradebookkeeping.com → verigradebookkeeping@gmail.com
security@verigradebookkeeping.com → verigradebookkeeping@gmail.com
sales@verigradebookkeeping.com → verigradebookkeeping@gmail.com
billing@verigradebookkeeping.com → verigradebookkeeping@gmail.com
noreply@verigradebookkeeping.com → verigradebookkeeping@gmail.com
```

### Step 3: Alternative - Use Vercel CLI
If you can't find email forwarding in the dashboard, use the CLI:

```bash
# Check your domains
vercel domains ls

# Set up email forwarding (if available)
vercel domains add-email-forwarding verigradebookkeeping.com
```

### Step 4: Update Your .env File
Once forwarding is set up, update your backend `.env` file:

```env
# Gmail Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=verigradebookkeeping@gmail.com
SMTP_PASS=your-app-password

# Professional Email Addresses (now they'll work!)
FROM_EMAIL=noreply@verigradebookkeeping.com
CONTACT_EMAIL=hello@verigradebookkeeping.com
SUPPORT_EMAIL=support@verigradebookkeeping.com
SECURITY_EMAIL=security@verigradebookkeeping.com
SALES_EMAIL=sales@verigradebookkeeping.com
BILLING_EMAIL=billing@verigradebookkeeping.com
```

### Step 5: Test Your Setup
1. **Send a test email** to `hello@verigradebookkeeping.com`
2. **Check your Gmail** inbox (`verigradebookkeeping@gmail.com`)
3. **Verify** the email arrived

## If Vercel Doesn't Have Email Forwarding:

### Option 1: Use Vercel Domains Email Service
1. In Vercel dashboard → Domains
2. Look for "Email" or "Professional Email"
3. Set up email accounts (may cost extra)

### Option 2: Transfer DNS to Another Provider
1. **Cloudflare** (free email forwarding)
2. **Namecheap** (free email forwarding)
3. **GoDaddy** (paid email forwarding)

### Option 3: Use Gmail Aliases (Current Setup)
Keep using the Gmail alias format we set up:
- `verigradebookkeeping+hello@gmail.com`
- `verigradebookkeeping+support@gmail.com`

## Quick Check:
Let me help you check what's available in your Vercel domain settings:

```bash
# Check your domain configuration
vercel domains inspect verigradebookkeeping.com
```

## Next Steps:
1. **Check Vercel dashboard** for email forwarding options
2. **Set up forwarding** if available
3. **Update .env file** with professional addresses
4. **Test** the setup
5. **Deploy** your application

Would you like me to help you check your domain settings or set up the email forwarding?

