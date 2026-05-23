@echo off
setlocal enabledelayedexpansion
title Mid-Autumn Festival Website

echo.
echo ===========================================
echo   Mid-Autumn Festival Website
echo   yue man zhong hua - qing xi zhong qiu
echo ===========================================
echo.

REM Check if already running
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') DO (
    echo [WARN] Port 3000 is already in use (PID: %%P^)
    echo        Please run stop.bat first
    echo.
    pause
    exit /b 1
)

REM Check node_modules
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

echo [INFO] Starting server...
echo [INFO] First run will auto-initialize database
echo.
echo   URL:      http://localhost:3000
echo   Admin:    admin / admin123
echo   Stop:     Double-click stop.bat
echo.
echo   Press Ctrl+C to stop the server
echo ===========================================
echo.

node server.js

echo.
echo ===========================================
echo   Server stopped
echo ===========================================
echo.
pause
