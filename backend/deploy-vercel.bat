@echo off
echo 🚀 Deploying VeriGrade Backend to Vercel...
echo.

cd /d "C:\verigrade-bookkeeping-platform\backend"

echo 📁 Current directory: %CD%
echo.

echo 🔧 Building backend...
npm run build

echo.
echo 🚀 Deploying to Vercel...
npx vercel --prod

echo.
echo ✅ Deployment complete!
pause
