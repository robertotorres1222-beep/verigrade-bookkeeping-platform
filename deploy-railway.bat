@echo off
echo 🚀 Deploying VeriGrade Backend to Railway...

REM Copy simple files to root
copy deploy-simple.js server.js
copy package-simple.json package.json
copy railway-simple.json railway.json

echo ✅ Files prepared for deployment

REM Deploy to Railway
echo 🚀 Deploying to Railway...
railway up --detach

echo ✅ Deployment initiated!
echo 📊 Check your Railway dashboard for deployment status
pause


