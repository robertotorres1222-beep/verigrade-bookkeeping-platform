@echo off
echo 🚀 Starting VeriGrade Bookkeeping Platform...
echo.

echo 📦 Starting Backend Server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "echo Starting Backend Server... && node test-server.js"
cd /d "%~dp0"

echo 🌐 Starting Frontend Application...
cd /d "%~dp0frontend"
start "Frontend App" cmd /k "echo Starting Frontend App... && npm run dev"
cd /d "%~dp0"

echo 📱 Starting Mobile Application...
cd /d "%~dp0mobile-app"
start "Mobile App" cmd /k "echo Starting Mobile App... && npx expo start"
cd /d "%~dp0"

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
echo.
echo Press any key to continue...
pause > nul


