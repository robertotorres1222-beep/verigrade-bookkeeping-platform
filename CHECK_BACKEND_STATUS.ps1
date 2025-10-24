# Check Railway Backend Status
# Run this to see if your backend is ready!

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHECKING BACKEND STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://verigrade-backend-production.up.railway.app/health"

Write-Host "Testing: $backendUrl" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $backendUrl -UseBasicParsing -TimeoutSec 10
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  BACKEND IS LIVE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.Content -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  NEXT STEPS:" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Add backend URL to Vercel:" -ForegroundColor Yellow
    Write-Host "   Go to: https://vercel.com/robertotos-projects/verigrade-bookkeeping-platform/settings/environment-variables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Add:" -ForegroundColor White
    Write-Host "   Name: NEXT_PUBLIC_API_URL" -ForegroundColor Gray
    Write-Host "   Value: https://verigrade-backend-production.up.railway.app" -ForegroundColor Gray
    Write-Host "   Environment: Production" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Disable deployment protection:" -ForegroundColor Yellow
    Write-Host "   Go to: https://vercel.com/robertotos-projects/verigrade-bookkeeping-platform/settings/deployment-protection" -ForegroundColor Cyan
    Write-Host "   Select: Disabled" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Wait 2-3 minutes for Vercel to redeploy" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Visit your site:" -ForegroundColor Yellow
    Write-Host "   https://verigrade-bookkeeping-platform.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening Vercel settings for you..." -ForegroundColor Green
    Start-Process "https://vercel.com/robertotos-projects/verigrade-bookkeeping-platform/settings/environment-variables"
    
} catch {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  STILL DEPLOYING..." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Status: Not ready yet" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "This is NORMAL! Railway deployment takes 5-10 minutes." -ForegroundColor White
    Write-Host ""
    Write-Host "What to do:" -ForegroundColor Cyan
    Write-Host "  1. Wait 2-3 more minutes" -ForegroundColor White
    Write-Host "  2. Run this script again: .\CHECK_BACKEND_STATUS.ps1" -ForegroundColor White
    Write-Host "  3. Or check Railway dashboard for deployment status" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening Railway dashboard..." -ForegroundColor Yellow
    Start-Process "https://railway.app/project/8c3e811e-39c1-4631-be6f-8662f01c08f3"
    Write-Host ""
    Write-Host "Expected ready time: 2-5 more minutes ⏱️" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan








