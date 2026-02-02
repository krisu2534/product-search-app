@echo off
echo Setting up HTTPS certificates with mkcert...
echo.

cd backend
call npm run setup-https

echo.
echo Press any key to exit...
pause >nul
