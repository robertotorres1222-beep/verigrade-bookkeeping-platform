@echo off
echo 🚀 VERIGRADE RAILWAY DEPLOYMENT
echo ================================
echo.

echo 📦 Installing Railway CLI...
call npm install -g @railway/cli
echo.

echo 🔐 Please login to Railway (this will open your browser)...
call railway login
echo.

echo 📁 Navigating to backend directory...
cd backend
echo.

echo 🏗️ Initializing Railway project...
call railway init
echo.

echo 🔧 Setting environment variables...
call railway variables set NODE_ENV=production
call railway variables set DATABASE_URL="postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"
call railway variables set JWT_SECRET="verigrade-super-secure-jwt-secret-key-2024-production"
call railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"
call railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"
call railway variables set SMTP_USER="verigradebookkeeping@gmail.com"
call railway variables set SMTP_PASS="jxxy spfm ejyk nxxh"
call railway variables set SMTP_HOST="smtp.gmail.com"
call railway variables set SMTP_PORT="587"
call railway variables set FROM_EMAIL="verigradebookkeeping+noreply@gmail.com"
call railway variables set PORT="3001"
echo.

echo 🚀 Deploying to Railway...
call railway up
echo.

echo 📊 Getting deployment status...
call railway status
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo ======================
echo Your VeriGrade backend is now live on Railway!
echo Copy the URL from the status above and update your frontend.
echo.

pause
