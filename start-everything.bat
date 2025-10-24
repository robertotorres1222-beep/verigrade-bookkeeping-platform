@echo off
echo 🚀 Starting VeriGrade Bookkeeping Platform...
echo.

echo 📦 Starting Backend Server...
cd backend
start "Backend Server" cmd /k "node test-server.js"
cd ..

echo 🌐 Starting Frontend Application...
cd frontend
start "Frontend App" cmd /k "npm run dev"
cd ..

echo 📱 Starting Mobile Application...
cd mobile-app
start "Mobile App" cmd /k "npx expo start"
cd ..

echo.
echo ✅ All services are starting!
echo.
echo 🎯 Your Platform URLs:
echo Backend API: http://localhost:3000
echo Frontend App: http://localhost:3001
echo Mobile App: http://localhost:19002
echo.
echo 📋 Test your platform:
echo - Backend Health: http://localhost:3000/health
echo - API Status: http://localhost:3000/api/status
echo - Documentation: http://localhost:3000/api/docs
echo - Frontend Dashboard: http://localhost:3001
echo - Mobile DevTools: http://localhost:19002
echo.
echo 🎉 Your VeriGrade Platform is starting up!
pause
