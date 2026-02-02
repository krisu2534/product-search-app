@echo off
echo Starting Frontend Server...
cd /d %~dp0frontend
call npm run dev
pause
