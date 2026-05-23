@echo off
setlocal enabledelayedexpansion
echo.
echo ===========================================
echo   Mid-Autumn Festival Site - STOP
echo   Stopping all web services...
echo ===========================================
echo.
set FOUND=0
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') DO (
    set FOUND=1
    echo [DETECT] Port 3000 - PID: %%P
    taskkill /PID %%P /F >nul 2>&1
    IF !ERRORLEVEL! EQU 0 (
        echo [OK]     Process %%P stopped
    ) ELSE (
        echo [FAIL]   Cannot stop PID %%P - run as Administrator
    )
)
IF !FOUND! EQU 0 (
    echo [INFO]  Port 3000 is not in use
    echo [INFO]  No Mid-Autumn Festival service running
)
ping -n 2 127.0.0.1 >nul
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING" 2^>nul') DO (
    echo [WARN]  Port 3000 still occupied by PID %%P
    echo         Please run this script as Administrator
    goto END
)
IF !FOUND! EQU 1 (
    echo.
    echo ===========================================
    echo   All services stopped successfully!
    echo   Port 3000 is now released.
    echo ===========================================
)
:END
echo.
pause
