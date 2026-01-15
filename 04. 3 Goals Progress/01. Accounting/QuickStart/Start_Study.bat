@echo off
cd /d "%~dp0"
echo Study Environment Setup...
python study_start.py
if %errorlevel% neq 0 (
    echo.
    echo [Error] Script failed with error code %errorlevel%.
    pause
) else (
    echo [Success] Environment Ready!
    timeout /t 3 >nul
)
