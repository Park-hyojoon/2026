@echo off
echo Starting AI English Tutor...
echo.

:: Start Backend
echo [1/2] Starting Backend (FastAPI on port 8000)...
start "AI Tutor Backend" cmd /c "cd /d %~dp0backend && venv\Scripts\python -m uvicorn main:app --port 8000"

:: Wait a moment for backend to initialize
timeout /t 2 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Frontend (Vite on port 5173)...
start "AI Tutor Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

:: Wait for servers to start
timeout /t 3 /nobreak >nul

:: Open browser
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================================
echo AI English Tutor is running!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo ========================================================
echo.
echo Close the terminal windows to stop the servers.
pause
