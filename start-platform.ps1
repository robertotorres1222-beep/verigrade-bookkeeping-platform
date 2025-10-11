# Simple VeriGrade Platform Starter
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  VERIGRADE PLATFORM - STARTING..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend API (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\verigrade-bookkeeping-platform\backend; npm run start:ai-features"
Start-Sleep -Seconds 3

Write-Host "Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\verigrade-bookkeeping-platform\frontend-new; npm run dev"
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Platform Started Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Start-Process "http://localhost:3000/test"
Start-Process "YOUR_PLATFORM_IS_READY.html"

Write-Host ""
Write-Host "Done! Your platform is ready!" -ForegroundColor Green




