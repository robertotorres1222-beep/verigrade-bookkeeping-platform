@echo off
echo 🚀 Deploying VeriGrade Backend to Railway...
echo.

cd /d "C:\verigrade-bookkeeping-platform\backend"

echo 📁 Current directory: %CD%
echo.

echo 🔗 Linking to Railway project...
railway link

echo.
echo 🔧 Setting environment variables...

railway variables --set "NODE_ENV=production"
railway variables --set "DATABASE_URL=postgresql://postgres:atCv6BFZ1YQ3bdvK@db.krdwxeeaxldgnhymukyb.supabase.co:5432/postgres"
railway variables --set "JWT_SECRET=verigrade-super-secure-jwt-secret-key-2024-production"
railway variables --set "STRIPE_PUBLISHABLE_KEY=pk_live_51SB00GFjFAJQwUPDaTEvzGmZswYvt024Sv9yhTkWByTUw8kP5YoBLhTqJcUXdJToKQy6uUFXFRn866xKUlQTZrcd007KhHxn6K"
railway variables --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZHd4ZWVheGxkZ25oeW11a3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTUwOTYsImV4cCI6MjA3NTEzMTA5Nn0.yYj9Fvi4THZC0KBk_EdoUMLm27C_rs3B8c2PeOX6EXI"
railway variables --set "SMTP_USER=verigradebookkeeping@gmail.com"
railway variables --set "SMTP_PASS=jxxy spfm ejyk nxxh"
railway variables --set "SMTP_HOST=smtp.gmail.com"
railway variables --set "SMTP_PORT=587"
railway variables --set "FROM_EMAIL=verigradebookkeeping+noreply@gmail.com"
railway variables --set "PORT=3001"

echo.
echo 🚀 Deploying to Railway...
railway up

echo.
echo ✅ Deployment complete!
pause
