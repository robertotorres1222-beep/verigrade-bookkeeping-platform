# PowerShell script to set up N8N automation
# Run this script from the project root directory

Write-Host "🤖 Setting up N8N Automation..." -ForegroundColor Green

Write-Host "📋 N8N Setup Options:" -ForegroundColor Blue
Write-Host ""
Write-Host "Option 1: Railway N8N Template (Recommended)" -ForegroundColor Yellow
Write-Host "1. Go to https://railway.app" -ForegroundColor White
Write-Host "2. Click 'New Project'" -ForegroundColor White
Write-Host "3. Choose 'Deploy from Template'" -ForegroundColor White
Write-Host "4. Search for 'N8N'" -ForegroundColor White
Write-Host "5. Deploy the template" -ForegroundColor White
Write-Host "6. Set environment variables:" -ForegroundColor White
Write-Host "   - N8N_BASIC_AUTH_ACTIVE=true" -ForegroundColor Gray
Write-Host "   - N8N_BASIC_AUTH_USER=admin" -ForegroundColor Gray
Write-Host "   - N8N_BASIC_AUTH_PASSWORD=your_password" -ForegroundColor Gray
Write-Host "   - N8N_WEBHOOK_URL=your_railway_n8n_url" -ForegroundColor Gray

Write-Host ""
Write-Host "Option 2: Docker Deployment" -ForegroundColor Yellow
Write-Host "1. Create docker-compose.yml:" -ForegroundColor White
Write-Host "2. Run: docker-compose up -d" -ForegroundColor White

Write-Host ""
Write-Host "🔧 N8N Environment Variables:" -ForegroundColor Blue
Write-Host "N8N_BASIC_AUTH_ACTIVE=true" -ForegroundColor Gray
Write-Host "N8N_BASIC_AUTH_USER=admin" -ForegroundColor Gray
Write-Host "N8N_BASIC_AUTH_PASSWORD=your_secure_password" -ForegroundColor Gray
Write-Host "N8N_WEBHOOK_URL=https://your-n8n-url.railway.app" -ForegroundColor Gray
Write-Host "N8N_HOST=0.0.0.0" -ForegroundColor Gray
Write-Host "N8N_PORT=5678" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 After N8N is deployed:" -ForegroundColor Blue
Write-Host "1. Access N8N dashboard" -ForegroundColor White
Write-Host "2. Create webhook workflows" -ForegroundColor White
Write-Host "3. Set up automation triggers" -ForegroundColor White
Write-Host "4. Configure API integrations" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Integration URLs:" -ForegroundColor Blue
Write-Host "Frontend: https://frontend-m50gmqvfz-robertotos-projects.vercel.app" -ForegroundColor Gray
Write-Host "Backend: https://your-railway-backend-url.railway.app" -ForegroundColor Gray
Write-Host "N8N: https://your-n8n-url.railway.app" -ForegroundColor Gray

Write-Host "🎉 N8N setup guide completed!" -ForegroundColor Green


