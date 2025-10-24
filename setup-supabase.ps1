# PowerShell script to set up Supabase database
# Run this script from the project root directory

Write-Host "🗄️ Setting up Supabase Database..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "backend"

# Check if Prisma is available
try {
    $prismaVersion = npx prisma --version
    Write-Host "✅ Prisma CLI found: $prismaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma not found. Installing..." -ForegroundColor Yellow
    npm install prisma @prisma/client
}

Write-Host "📋 Supabase Setup Instructions:" -ForegroundColor Blue
Write-Host "1. Go to https://supabase.com" -ForegroundColor White
Write-Host "2. Create a new project" -ForegroundColor White
Write-Host "3. Go to Settings > Database" -ForegroundColor White
Write-Host "4. Copy your connection string" -ForegroundColor White
Write-Host "5. Set DATABASE_URL in Railway environment variables" -ForegroundColor White

Write-Host ""
Write-Host "🔧 After setting up Supabase, run these commands:" -ForegroundColor Blue
Write-Host "npx prisma db push" -ForegroundColor Yellow
Write-Host "npx prisma generate" -ForegroundColor Yellow
Write-Host "npx prisma db seed" -ForegroundColor Yellow

Write-Host ""
Write-Host "📝 Your Supabase connection string should look like:" -ForegroundColor Blue
Write-Host "postgresql://postgres:[password]@[host]:5432/postgres" -ForegroundColor Gray

# Return to project root
Set-Location ".."

Write-Host "🎉 Supabase setup guide completed!" -ForegroundColor Green


