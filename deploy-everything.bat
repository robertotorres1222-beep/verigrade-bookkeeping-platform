@echo off
echo 🚀 Deploying VeriGrade Bookkeeping Platform to Production...
echo.

echo 📦 Installing Railway CLI...
npm install -g @railway/cli

echo 📦 Installing Vercel CLI...
npm install -g vercel

echo.
echo 🚀 Deploying Backend to Railway...
cd backend
railway login
railway deploy
cd ..

echo.
echo 🌐 Deploying Frontend to Vercel...
cd frontend
vercel login
vercel deploy --prod
cd ..

echo.
echo 📱 Building Mobile App for Production...
cd mobile-app
npx expo build:android
npx expo build:ios
cd ..

echo.
echo ✅ Deployment Complete!
echo.
echo 🎯 Your Production URLs:
echo Backend API: https://your-backend.railway.app
echo Frontend App: https://your-frontend.vercel.app
echo Mobile App: Ready for app stores
echo.
echo 🎉 Your VeriGrade Platform is now live in production!
pause






