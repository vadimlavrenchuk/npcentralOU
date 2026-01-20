# MechanicPro - Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MechanicPro - Starting Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait 3 seconds for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Both servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
