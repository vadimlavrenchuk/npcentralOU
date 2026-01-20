@echo off
echo ========================================
echo   MechanicPro - Starting Application
echo ========================================
echo.

REM Start Backend Server
echo Starting Backend Server...
start "MechanicPro Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend
echo Starting Frontend...
start "MechanicPro Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo   Backend:  http://localhost:5001
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to close this window...
pause > nul
