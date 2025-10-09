# Gmail Setup Instructions for VeriGrade Bookkeeping

## Your Email: verigradebookkeeping@gmail.com

### Step 1: Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the setup process

### Step 2: Generate App Password
1. Go back to Security settings
2. Under "Signing in to Google", click "App passwords"
3. Select "Mail" as the app
4. Generate the password
5. **Copy the 16-character password** (like: abcd efgh ijkl mnop)

### Step 3: Update Your .env File
Add these lines to your backend `.env` file:

```env
# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=verigradebookkeeping@gmail.com
SMTP_PASS=your-16-character-app-password-here

# Email Addresses (Professional Domain Style)
FROM_EMAIL=noreply@verigrade.com
CONTACT_EMAIL=hello@verigrade.com
SUPPORT_EMAIL=support@verigrade.com
SECURITY_EMAIL=security@verigrade.com
SALES_EMAIL=sales@verigrade.com
BILLING_EMAIL=billing@verigrade.com
```

### Step 4: Test Your Setup
1. Deploy your application
2. Go to your contact form
3. Submit a test message
4. Check your `verigradebookkeeping@gmail.com` inbox

### Step 5: Organize Your Emails (Optional)
Set up Gmail filters to organize emails by alias:

1. Go to Gmail Settings → Filters and Blocked Addresses
2. Create a filter for emails to: `verigradebookkeeping+support@gmail.com`
3. Apply label: "Support"
4. Repeat for other aliases

## How It Works:

When someone emails `verigradebookkeeping+support@gmail.com`:
- ✅ Email goes to your main `verigradebookkeeping@gmail.com` inbox
- ✅ You can see it came from the "support" alias
- ✅ You can reply as `verigradebookkeeping+support@gmail.com`

## Your Professional Email Addresses:

- **General Contact:** `hello@verigrade.com`
- **Support:** `support@verigrade.com`
- **Security:** `security@verigrade.com`
- **Sales:** `sales@verigrade.com`
- **Billing:** `billing@verigrade.com`

All emails will arrive in your main `verigradebookkeeping@gmail.com` inbox!

## Troubleshooting:

**If emails don't work:**
1. Double-check your app password (16 characters, no spaces)
2. Make sure 2FA is enabled
3. Check your .env file has the correct format
4. Verify SMTP settings are correct

**Need help?** Contact me and I'll help you troubleshoot!
