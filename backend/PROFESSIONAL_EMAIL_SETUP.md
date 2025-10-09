# Professional Email Setup for VeriGrade

## Your Professional Email Addresses (Zeni AI Style):

- **General Contact:** `hello@verigrade.com`
- **Support:** `support@verigrade.com`
- **Security:** `security@verigrade.com`
- **Sales:** `sales@verigrade.com`
- **Billing:** `billing@verigrade.com`

## Setup Options:

### Option 1: Email Forwarding (FREE - Recommended)

#### Step 1: Set up Email Forwarding
1. Go to your domain registrar (where you bought `verigradebookkeeping.com`)
2. Look for "Email Forwarding" or "Email Management"
3. Set up forwarding rules:
   - `hello@verigradebookkeeping.com` → `verigradebookkeeping@gmail.com`
   - `support@verigradebookkeeping.com` → `verigradebookkeeping@gmail.com`
   - `security@verigradebookkeeping.com` → `verigradebookkeeping@gmail.com`

#### Step 2: Update Your .env File
```env
# Gmail Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=verigradebookkeeping@gmail.com
SMTP_PASS=your-app-password

# Professional Email Addresses (for display)
FROM_EMAIL=noreply@verigradebookkeeping.com
CONTACT_EMAIL=hello@verigradebookkeeping.com
SUPPORT_EMAIL=support@verigradebookkeeping.com
SECURITY_EMAIL=security@verigradebookkeeping.com
```

### Option 2: Google Workspace (Professional - $6/month)

#### Benefits:
- Real `hello@verigradebookkeeping.com` emails
- Professional appearance like Zeni AI
- Better deliverability
- Custom domain emails

#### Setup:
1. Sign up for Google Workspace
2. Verify your domain `verigradebookkeeping.com`
3. Create user accounts or aliases
4. Use professional email addresses

### Option 3: Custom Domain with Gmail (Advanced)

#### If you own `verigrade.com`:
1. Set up email forwarding from `verigrade.com`
2. Forward to `verigradebookkeeping@gmail.com`
3. Use `hello@verigrade.com` format

## Recommended Approach:

**Start with Option 1 (Email Forwarding)** because:
- ✅ FREE
- ✅ Professional appearance
- ✅ Works immediately
- ✅ All emails go to your Gmail inbox
- ✅ Can upgrade later

## Your Current Setup:

**Website shows:** `hello@verigrade.com` (professional)
**Emails go to:** `verigradebookkeeping@gmail.com` (your inbox)
**SMTP uses:** `verigradebookkeeping@gmail.com` (for sending)

## Next Steps:

1. **Set up email forwarding** in your domain registrar
2. **Update .env file** with professional addresses
3. **Test** by sending emails to `hello@verigradebookkeeping.com`
4. **Deploy** your application

This gives you the professional look of Zeni AI while keeping your Gmail inbox!

