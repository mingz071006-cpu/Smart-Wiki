@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\smart-wiki-service.ps1" -Action restart
echo Smart Wiki has restarted in the background.
timeout /t 2 /nobreak >nul
exit /b 0
