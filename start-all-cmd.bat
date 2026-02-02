@echo off
echo Starting Product Search ^& Copy App...
echo.

REM Check if HTTPS certificates exist
if exist "certs\cert.pem" (
    echo HTTPS certificates found - servers will use HTTPS
    echo.
) else (
    echo WARNING: HTTPS certificates not found!
    echo Clipboard copy may not work over network.
    echo Run setup-https.bat to enable HTTPS.
    echo.
)

REM Start Backend in new CMD window
start "Backend Server" cmd /k "cd /d %~dp0backend && call npm start"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Frontend in new CMD window
start "Frontend Server" cmd /k "cd /d %~dp0frontend && call npm run dev"

echo.
echo Both servers are starting in separate windows.
if exist "certs\cert.pem" (
    echo Backend: https://localhost:3001
    echo Frontend: https://localhost:3000
    echo Network: https://192.168.1.145:3000
) else (
    echo Backend: http://localhost:3001
    echo Frontend: http://localhost:3000
    echo Network: http://192.168.1.145:3000
)
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
