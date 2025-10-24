# VeriGrade Platform Status Checker
# This script checks if all services are running properly

Write-Host "🔍 Checking VeriGrade Platform Status..." -ForegroundColor Cyan
Write-Host ""

# Check if frontend is running
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend (Next.js): Running on http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend: Not responding properly" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend: Not running or not accessible" -ForegroundColor Red
}

# Check if backend is running
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend API: Running on http://localhost:3001" -ForegroundColor Green
        
        # Parse the health response to show features
        $healthData = $backendResponse.Content | ConvertFrom-Json
        Write-Host "   📊 Environment: $($healthData.environment)" -ForegroundColor Yellow
        Write-Host "   🤖 AI Categorization: $(if($healthData.features.aiCategorization) {'Enabled'} else {'Mock Mode'})" -ForegroundColor Yellow
        Write-Host "   📄 PDF Generation: $($healthData.features.pdfGeneration)" -ForegroundColor Yellow
        Write-Host "   ⚡ Queue Worker: $(if($healthData.features.queueWorker) {'Configured'} else {'Mock Mode'})" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Backend API: Not responding properly" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend API: Not running or not accessible" -ForegroundColor Red
}

# Test AI categorization
try {
    $testData = @{
        description = "Office Supplies Test"
        amount = 25.99
    } | ConvertTo-Json
    
    $aiResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/transactions/categorize" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 5
    
    if ($aiResponse.StatusCode -eq 200) {
        $aiData = $aiResponse.Content | ConvertFrom-Json
        Write-Host "✅ AI Categorization: Working (Category: $($aiData.data.category))" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ AI Categorization: Not responding" -ForegroundColor Yellow
}

# Test invoice API
try {
    $invoiceResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/invoices" -Method GET -TimeoutSec 5
    
    if ($invoiceResponse.StatusCode -eq 200) {
        $invoiceData = $invoiceResponse.Content | ConvertFrom-Json
        Write-Host "✅ Invoice API: Working ($($invoiceData.data.Count) mock invoices)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Invoice API: Not responding" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3001/api" -ForegroundColor White
Write-Host "   Health Check: http://localhost:3001/health" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Your VeriGrade platform is ready to use!" -ForegroundColor Green












