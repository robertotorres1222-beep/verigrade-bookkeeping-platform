# Deploy VeriGrade Backend to Render
Write-Host "🚀 Deploying VeriGrade Backend to Render..." -ForegroundColor Green

# Copy simple files to root
Copy-Item "deploy-simple.js" "server.js" -Force
Copy-Item "package-simple.json" "package.json" -Force

Write-Host "✅ Files prepared for deployment" -ForegroundColor Green

# Create render.yaml
$renderConfig = @"
services:
  - type: web
    name: verigrade-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
"@

$renderConfig | Out-File -FilePath "render.yaml" -Encoding UTF8

Write-Host "✅ Render configuration created" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://render.com" -ForegroundColor White
Write-Host "2. Create new Web Service" -ForegroundColor White
Write-Host "3. Connect your GitHub repository" -ForegroundColor White
Write-Host "4. Use these settings:" -ForegroundColor White
Write-Host "   - Root Directory: /" -ForegroundColor White
Write-Host "   - Build Command: npm install" -ForegroundColor White
Write-Host "   - Start Command: node server.js" -ForegroundColor White
Write-Host "   - Health Check Path: /health" -ForegroundColor White

