# Deploy Mobile App to Expo
Write-Host "📱 Deploying VeriGrade Mobile App to Expo..." -ForegroundColor Green

# Install Expo CLI if not installed
if (!(Get-Command expo -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Expo CLI..." -ForegroundColor Yellow
    npm install -g @expo/cli
}

# Login to Expo
Write-Host "🔐 Logging into Expo..." -ForegroundColor Yellow
expo login

# Build for production
Write-Host "🏗️ Building mobile app for production..." -ForegroundColor Yellow
cd mobile-app

# Build for Android
Write-Host "🤖 Building for Android..." -ForegroundColor Yellow
npx expo build:android

# Build for iOS
Write-Host "🍎 Building for iOS..." -ForegroundColor Yellow
npx expo build:ios

Write-Host "✅ Mobile app built for production!" -ForegroundColor Green
Write-Host "📱 Your mobile app is ready for app stores!" -ForegroundColor Cyan
