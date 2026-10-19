@echo off
title Abhinav Hospital Website Server
cls
echo =====================================================================
echo  Abhinav Hospital (Mother & Child Care Hospital) - Kuchaman City
echo  Starting Local Website Server at http://localhost:1254/ ...
echo =====================================================================
echo.
echo Website will open automatically in your browser...
echo Press Ctrl+C in this window anytime to stop the server.
echo.

start "" http://localhost:1254/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 1254 -Root "%~dp0"

pause
