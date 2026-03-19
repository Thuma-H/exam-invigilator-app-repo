@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
echo Pausing OneDrive to prevent sync conflicts...
taskkill /f /im OneDrive.exe >nul 2>&1
timeout /t 3 /nobreak >nul
if exist node_modules rmdir /s /q node_modules 2>nul
if exist package-lock.json del package-lock.json 2>nul
echo Running npm install (this may take a few minutes)...
call npm install
echo Restarting OneDrive...
start "" "C:\Program Files\Microsoft OneDrive\OneDrive.exe" /background
echo Starting React dev server on http://localhost:3000 ...
call npm start
pause
