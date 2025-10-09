# 🔧 MANUAL ENV UPDATE - QUICK SETUP

## **Your Supabase Credentials:**
- **Password:** `atCv6BFZ1YQ3bdvK`
- **Project URL:** `https://krdwxeeaxldgnhymukyb.supabase.co`

## **Step 1: Update Your .env File**

Open `backend/.env` and replace the DATABASE_URL line with:

```bash
DATABASE_URL="postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"
```

## **Step 2: Add These Lines to Your .env File**

Add these lines to your `backend/.env` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"
STRIPE_SECRET_KEY="sk_live_your_secret_key_here"

# Supabase Configuration
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"
```

## **Step 3: Run Database Setup Commands**

After updating your .env file, run these commands:

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Push database schema to Supabase
npx prisma db push

# Test database connection
node test-database-connection.js

# Start your backend
node production-start.js
```

## **Step 4: Test Everything**

From the root directory:
```bash
node test-complete-platform.js
```

---

## 🎉 **WHAT HAPPENS NEXT:**

Once you complete these steps, your VeriGrade platform will have:

- ✅ **Real database connection** to Supabase
- ✅ **All tables created** (users, invoices, expenses, taxes, files, etc.)
- ✅ **User authentication** with database storage
- ✅ **Invoice management** with real data persistence
- ✅ **Expense tracking** with categories and tax-deductible flags
- ✅ **Tax calculations** and quarterly reports
- ✅ **File upload system** for receipt processing
- ✅ **Email notifications** for business communications

## 🚀 **YOUR PLATFORM WILL BE FULLY OPERATIONAL!**

**Update your .env file with the DATABASE_URL above, then run the setup commands. Your VeriGrade bookkeeping platform will be ready to serve real customers!** 🎉


