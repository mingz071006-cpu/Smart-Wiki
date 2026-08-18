@echo off
cd /d "%~dp0"
start "Smart Wiki Manager" powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File "%~dp0scripts\smart-wiki-manager.ps1"
exit /b 0
