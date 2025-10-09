# Gmail Setup Guide for VeriGrade

## Option 1: Gmail Aliases (FREE - Recommended for Starting)

### Step 1: Use Your Main Gmail Account
- Keep using your existing Gmail account (e.g., `yourname@gmail.com`)

### Step 2: Update Email Configuration
In your `.env` file, use these settings:

```env
# Your main Gmail account
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourname@gmail.com
SMTP_PASS=your-app-password

# Email addresses using Gmail aliases
FROM_EMAIL=noreply+verigrade@gmail.com
CONTACT_EMAIL=hello+verigrade@gmail.com
SUPPORT_EMAIL=support+verigrade@gmail.com
SECURITY_EMAIL=security+verigrade@gmail.com
SALES_EMAIL=sales+verigrade@gmail.com
BILLING_EMAIL=billing+verigrade@gmail.com
```

### Step 3: Set Up App Password
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate a password for "Mail"
5. Use that 16-character password in SMTP_PASS

### Step 4: Test
All emails will arrive in your main Gmail inbox with labels like:
- `hello+verigrade@gmail.com`
- `support+verigrade@gmail.com`
- etc.

## Option 2: Google Workspace (Professional - $6/month)

### Benefits:
- Real emails like `hello@verigradebookkeeping.com`
- Professional appearance
- Better deliverability
- Custom domain emails

### Setup:
1. Sign up for Google Workspace
2. Verify your domain `verigradebookkeeping.com`
3. Create user accounts or aliases
4. Use professional email addresses

## Option 3: Email Forwarding (Free Alternative)

### Setup:
1. Keep your Gmail account
2. Set up email forwarding in your domain registrar
3. Forward `hello@verigradebookkeeping.com` → `yourname@gmail.com`
4. Forward `support@verigradebookkeeping.com` → `yourname@gmail.com`

## Recommendation for You:

**Start with Option 1 (Gmail Aliases)** because:
- ✅ FREE
- ✅ Works immediately
- ✅ All emails go to one inbox
- ✅ Easy to manage
- ✅ Can upgrade later

**Upgrade to Option 2 (Google Workspace)** when:
- You have paying customers
- You want professional appearance
- You need better email deliverability
- You're ready to invest $6/month

## Quick Start Instructions:

1. **Use your existing Gmail account**
2. **Enable 2FA and generate app password**
3. **Update the .env file with Gmail aliases**
4. **Deploy and test**

That's it! You'll receive all emails in your main Gmail inbox.

