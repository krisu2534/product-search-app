@echo off
setlocal enabledelayedexpansion
REM Quick start script - Double-click to start both servers and open browser
title Product Search App - Starting Servers...

echo ========================================
echo   Product Search ^& Copy App
echo ========================================
echo.

REM Check if HTTPS certificates exist
set USE_HTTPS=0
if exist "certs\cert.pem" (
    echo [HTTPS] Certificates found - Using secure connection
    set USE_HTTPS=1
    echo.
) else (
    echo [WARNING] HTTPS certificates not found!
    echo           Clipboard copy may not work over network.
    echo           Run setup-https.bat to enable HTTPS.
    echo.
)

REM Detect local IP address - get first IPv4 that's not 127.0.0.1 or 169.254.x.x (APIPA)
REM Use PowerShell to reliably get the IP, excluding APIPA addresses
for /f "tokens=*" %%i in ('powershell -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*'} | Select-Object -First 1 -ExpandProperty IPAddress"') do set LOCAL_IP=%%i

REM If PowerShell method failed, try ipconfig method
if "%LOCAL_IP%"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i /c:"IPv4"') do (
        set IP_TEMP=%%a
        set IP_TEMP=!IP_TEMP: =!
        REM Skip localhost and APIPA addresses (169.254.x.x)
        if not "!IP_TEMP!"=="127.0.0.1" (
            echo !IP_TEMP! | findstr /r "^169\.254\." >nul
            if errorlevel 1 (
                if not "!IP_TEMP!"=="" (
                    set LOCAL_IP=!IP_TEMP!
                    goto :ip_found
                )
            )
        )
    )
)

:ip_found
REM Default fallback to localhost if detection failed
if "%LOCAL_IP%"=="" set LOCAL_IP=localhost

echo Starting servers...
echo.

REM Start Backend in new CMD window
start "Backend Server (Port 3001)" cmd /k "cd /d %~dp0backend && echo [Backend] Starting on port 3001... && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in new CMD window
start "Frontend Server (Port 3000)" cmd /k "cd /d %~dp0frontend && echo [Frontend] Starting on port 3000... && npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.

REM Wait for servers to be ready (give them time to start)
echo Waiting for servers to be ready...
timeout /t 5 /nobreak >nul

REM Determine URL based on HTTPS availability
if %USE_HTTPS%==1 (
    set PROTOCOL=https://
    set URL=%PROTOCOL%%LOCAL_IP%:3000
    echo Backend:  https://localhost:3001
    echo Frontend: https://localhost:3000
    echo Network:  %URL%
) else (
    set PROTOCOL=http://
    set URL=%PROTOCOL%%LOCAL_IP%:3000
    echo Backend:  http://localhost:3001
    echo Frontend: http://localhost:3000
    echo Network:  %URL%
)

echo.
echo Opening browser automatically...
REM Use start command with proper URL format - ensure protocol is included
REM Use msedge explicitly or let Windows use default browser
if %USE_HTTPS%==1 (
    start msedge.exe "https://%LOCAL_IP%:3000" 2>nul || start "" "https://%LOCAL_IP%:3000"
) else (
    start msedge.exe "http://%LOCAL_IP%:3000" 2>nul || start "" "http://%LOCAL_IP%:3000"
)

echo.
echo ========================================
echo   App Started Successfully!
echo ========================================
echo.
echo Browser opened automatically at: %URL%
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
echo This window will close in 3 seconds...
timeout /t 3 /nobreak >nul
