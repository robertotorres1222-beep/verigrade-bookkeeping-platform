@echo off
echo 🧪 Testing VeriGrade Backend...
echo.

echo 🔍 Testing health endpoint...
powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3001/health' -UseBasicParsing | Select-Object StatusCode, Content"

echo.
echo 🔍 Testing registration endpoint...
powershell -Command "$body = @{email='test@example.com'; password='testpass'; firstName='John'; lastName='Doe'; organizationName='Test Company'} | ConvertTo-Json; Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/register' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object StatusCode"

echo.
echo 🔍 Testing login endpoint...
powershell -Command "$body = @{email='test@example.com'; password='testpass'} | ConvertTo-Json; Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object StatusCode"

echo.
echo ✅ Backend testing complete!
pause
