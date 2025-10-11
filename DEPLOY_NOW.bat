@echo off
echo ========================================
echo   VeriGrade Platform - Quick Deploy
echo ========================================
echo.
echo This will deploy your platform to Vercel!
echo.
pause

echo.
echo Installing Vercel CLI...
call npm install -g vercel

echo.
echo Logging in to Vercel...
echo (A browser will open for authentication)
call vercel login

echo.
echo Deploying to production...
cd /d C:\verigrade-bookkeeping-platform
call vercel --prod --yes

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo IMPORTANT: Add these environment variables in Vercel:
echo   - DATABASE_URL
echo   - JWT_SECRET  
echo   - NODE_ENV
echo.
echo Opening Vercel dashboard...
start https://vercel.com/robertotos-projects/verigrade-bookkeeping-platform
echo.
echo Press any key to exit...
pause >nul


