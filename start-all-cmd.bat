@echo off
setlocal enabledelayedexpansion
echo Starting Product Search ^& Copy App...
echo.

REM Check if HTTPS certificates exist
set USE_HTTPS=0
if exist "certs\cert.pem" (
    echo HTTPS certificates found - servers will use HTTPS
    set USE_HTTPS=1
    echo.
) else (
    echo WARNING: HTTPS certificates not found!
    echo Clipboard copy may not work over network.
    echo Run setup-https.bat to enable HTTPS.
    echo.
)

REM Detect local IP address - exclude APIPA addresses (169.254.x.x)
for /f "tokens=*" %%i in ('powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*'} | Select-Object -First 1 -ExpandProperty IPAddress"') do set LOCAL_IP=%%i
if "%LOCAL_IP%"=="" set LOCAL_IP=localhost

REM Start Backend in new CMD window
start "Backend Server" cmd /k "cd /d %~dp0backend && call npm start"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Frontend in new CMD window
start "Frontend Server" cmd /k "cd /d %~dp0frontend && call npm run dev"

echo.
echo Both servers are starting in separate windows.
echo.

REM Wait for servers to be ready
echo Waiting for servers to be ready...
timeout /t 5 /nobreak >nul

REM Determine URL and open browser
if %USE_HTTPS%==1 (
    echo Backend: https://localhost:3001
    echo Frontend: https://localhost:3000
    echo Network: https://%LOCAL_IP%:3000
    echo.
    echo Opening browser automatically...
    REM Ensure protocol is included when opening browser
    start "" "https://%LOCAL_IP%:3000"
) else (
    echo Backend: http://localhost:3001
    echo Frontend: http://localhost:3000
    echo Network: http://%LOCAL_IP%:3000
    echo.
    echo Opening browser automatically...
    REM Ensure protocol is included when opening browser
    start "" "http://%LOCAL_IP%:3000"
)
echo.
echo Browser opened at: %LOCAL_IP%:3000
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
