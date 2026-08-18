@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\smart-wiki-service.ps1" -Action stop
echo Smart Wiki has stopped.
timeout /t 2 /nobreak >nul
exit /b 0
