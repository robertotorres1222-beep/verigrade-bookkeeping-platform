@echo off
echo 🚀 Starting N8N for VeriGrade Bookkeeping Platform...
echo.
echo N8N will be available at: http://localhost:5678
echo.
echo Press Ctrl+C to stop N8N
echo.

REM Load N8N environment variables
for /f "delims=" %%i in (.env.n8n) do set %%i

REM Start N8N
n8n start

pause
