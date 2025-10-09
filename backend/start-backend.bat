@echo off
echo 🚀 Starting VeriGrade Backend...
echo.

cd /d "C:\verigrade-bookkeeping-platform\backend"

echo 📁 Current directory: %CD%
echo.

echo 🔧 Starting backend server...
node test-backend-no-db.js

pause
