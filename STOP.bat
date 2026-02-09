@echo off
REM Quick stop script - Stops both servers
title Product Search App - Stopping Servers...

echo ========================================
echo   Stopping Product Search App Servers
echo ========================================
echo.

echo Stopping Node.js processes on ports 3000 and 3001...
echo.

REM Kill processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping Frontend (Port 3000) - PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 3001 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping Backend (Port 3001) - PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Servers stopped!
echo.
timeout /t 3 /nobreak >nul
