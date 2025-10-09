# 🗄️ SUPABASE DATABASE SETUP

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Create a new project or select existing project
3. Go to Settings → Database
4. Copy your database URL (it looks like: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres)

## Step 2: Update Your .env File

Replace the DATABASE_URL in backend/.env with your Supabase URL:

```bash
DATABASE_URL="postgresql://postgres:[your-password]@db.[project-ref].supabase.co:5432/postgres"
```

## Step 3: Run Database Migrations

```bash
cd backend
npx prisma db push
npx prisma generate
```

## Step 4: Verify Connection

```bash
node test-database-connection.js
```

Your Supabase database will be ready for production use!
