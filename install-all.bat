@echo off
echo Installing all dependencies...
echo.

echo Installing Backend Dependencies...
cd /d %~dp0backend
call npm install
echo.

echo Installing Frontend Dependencies...
cd /d %~dp0frontend
call npm install
echo.

echo All dependencies installed!
echo You can now run start-all.bat to start the servers.
pause
