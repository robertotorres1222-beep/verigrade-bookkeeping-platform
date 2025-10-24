# N8N Startup Script for VeriGrade
Write-Host "🚀 Starting N8N for VeriGrade Bookkeeping Platform..." -ForegroundColor Green
Write-Host ""
Write-Host "N8N will be available at: http://localhost:5678" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop N8N" -ForegroundColor Yellow
Write-Host ""

# Load environment variables
Get-Content .env.n8n | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

# Start N8N
n8n start
