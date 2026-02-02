@echo off
echo Installing Frontend Dependencies...
cd /d %~dp0frontend
call npm install
echo.
echo Frontend dependencies installed!
echo You can now run start-frontend.bat or start-all.bat
pause
