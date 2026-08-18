@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\smart-wiki-service.ps1" -Action start
echo Smart Wiki has started in the background.
echo Address: http://127.0.0.1:3000/
timeout /t 2 /nobreak >nul
exit /b 0
