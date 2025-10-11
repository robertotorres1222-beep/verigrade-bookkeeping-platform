# VeriGrade Platform Manager
# Easy script to manage your bookkeeping platform

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'test', 'open', 'help')]
    [string]$Action = 'help'
)

function Show-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         VERIGRADE PLATFORM MANAGER                       ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Start-Platform {
    Show-Banner
    Write-Host "🚀 Starting VeriGrade Platform..." -ForegroundColor Green
    Write-Host ""
    
    # Start Backend
    Write-Host "Starting Backend API (Port 3001)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:ai-features"
    Start-Sleep -Seconds 3
    
    # Start Frontend
    Write-Host "Starting Frontend (Port 3000)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend-new; npm run dev"
    Start-Sleep -Seconds 5
    
    Write-Host ""
    Write-Host "✅ Platform Started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔌 Backend:  http://localhost:3001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening browser in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000/test"
}

function Stop-Platform {
    Show-Banner
    Write-Host "🛑 Stopping VeriGrade Platform..." -ForegroundColor Red
    
    # Find and kill processes on ports 3000 and 3001
    $ports = @(3000, 3001)
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Stopping process on port $port (PID: $($process.Id))..." -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    Write-Host ""
    Write-Host "✅ Platform Stopped!" -ForegroundColor Green
}

function Restart-Platform {
    Stop-Platform
    Start-Sleep -Seconds 2
    Start-Platform
}

function Show-Status {
    Show-Banner
    Write-Host "📊 Platform Status Check..." -ForegroundColor Cyan
    Write-Host ""
    
    # Check Frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Frontend (Port 3000): " -NoNewline -ForegroundColor Green
        Write-Host "RUNNING" -ForegroundColor Green
    } catch {
        Write-Host "❌ Frontend (Port 3000): " -NoNewline -ForegroundColor Red
        Write-Host "NOT RUNNING" -ForegroundColor Red
    }
    
    # Check Backend
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Backend (Port 3001): " -NoNewline -ForegroundColor Green
        Write-Host "RUNNING" -ForegroundColor Green
        
        $healthData = $backendResponse.Content | ConvertFrom-Json
        Write-Host ""
        Write-Host "   Environment: $($healthData.environment)" -ForegroundColor Yellow
        Write-Host "   AI Categorization: $(if($healthData.features.aiCategorization) {'Enabled'} else {'Mock Mode'})" -ForegroundColor Yellow
        Write-Host "   PDF Generation: $($healthData.features.pdfGeneration)" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Backend (Port 3001): " -NoNewline -ForegroundColor Red
        Write-Host "NOT RUNNING" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Test-Platform {
    Show-Banner
    Write-Host "🧪 Testing Platform Features..." -ForegroundColor Cyan
    Write-Host ""
    
    # Test AI Categorization
    Write-Host "Testing AI Categorization..." -ForegroundColor Yellow
    try {
        $testData = @{
            description = "Office Supplies Test"
            amount = 25.99
        } | ConvertTo-Json
        
        $aiResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/transactions/categorize" -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        $aiData = $aiResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ AI Categorization: " -NoNewline -ForegroundColor Green
        Write-Host "WORKING" -ForegroundColor Green
        Write-Host "   Category: $($aiData.data.category)" -ForegroundColor Cyan
        Write-Host "   Confidence: $([math]::Round($aiData.data.confidence * 100, 0))%" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ AI Categorization: " -NoNewline -ForegroundColor Red
        Write-Host "FAILED" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test Invoice API
    Write-Host "Testing Invoice API..." -ForegroundColor Yellow
    try {
        $invoiceResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/invoices" -Method GET -TimeoutSec 5 -ErrorAction Stop
        $invoiceData = $invoiceResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ Invoice API: " -NoNewline -ForegroundColor Green
        Write-Host "WORKING" -ForegroundColor Green
        Write-Host "   Mock Invoices: $($invoiceData.data.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Invoice API: " -NoNewline -ForegroundColor Red
        Write-Host "FAILED" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Open-Platform {
    Show-Banner
    Write-Host "🌐 Opening VeriGrade Platform..." -ForegroundColor Cyan
    Write-Host ""
    
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:3000/test"
    Start-Process "http://localhost:3001/api"
    Start-Process "YOUR_PLATFORM_IS_READY.html"
    
    Write-Host "✅ Opened 4 browser tabs!" -ForegroundColor Green
}

function Show-Help {
    Show-Banner
    Write-Host "Available Commands:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  .\manage-platform.ps1 start    " -NoNewline -ForegroundColor Green
    Write-Host "- Start the platform"
    Write-Host "  .\manage-platform.ps1 stop     " -NoNewline -ForegroundColor Red
    Write-Host "- Stop the platform"
    Write-Host "  .\manage-platform.ps1 restart  " -NoNewline -ForegroundColor Yellow
    Write-Host "- Restart the platform"
    Write-Host "  .\manage-platform.ps1 status   " -NoNewline -ForegroundColor Cyan
    Write-Host "- Check platform status"
    Write-Host "  .\manage-platform.ps1 test     " -NoNewline -ForegroundColor Magenta
    Write-Host "- Test platform features"
    Write-Host "  .\manage-platform.ps1 open     " -NoNewline -ForegroundColor Blue
    Write-Host "- Open platform in browser"
    Write-Host "  .\manage-platform.ps1 help     " -NoNewline -ForegroundColor White
    Write-Host "- Show this help"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\manage-platform.ps1 start" -ForegroundColor Yellow
    Write-Host "  .\manage-platform.ps1 status" -ForegroundColor Yellow
    Write-Host ""
}

# Main execution
switch ($Action) {
    'start'   { Start-Platform }
    'stop'    { Stop-Platform }
    'restart' { Restart-Platform }
    'status'  { Show-Status }
    'test'    { Test-Platform }
    'open'    { Open-Platform }
    'help'    { Show-Help }
    default   { Show-Help }
}




