@echo off
echo Starting Product Search ^& Copy App...
echo.

REM Start Backend in new window - Use PowerShell-compatible syntax
start "Backend Server" powershell -NoExit -Command "Set-Location '%~dp0backend'; npm start"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Frontend in new window - Use PowerShell-compatible syntax
start "Frontend Server" powershell -NoExit -Command "Set-Location '%~dp0frontend'; npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
