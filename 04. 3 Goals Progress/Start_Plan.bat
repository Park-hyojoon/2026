@echo off
chcp 65001
cls
echo.
echo ========================================================
echo   🚀 아미르님의 2026 학습 플래너를 시작합니다...
echo ========================================================
echo.
echo 잠시만 기다려주세요, 서버를 실행하고 브라우저를 엽니다.
echo.

:: 프로젝트 폴더로 이동
cd /d "d:\00. WorkSpace\02. Creat\01. Antigravity\2026\04. 3 Goals Progress\amir-learning-planner"

:: 브라우저 먼저 열기 (서버가 뜨는 시간을 고려해 3초 뒤에 열거나 바로 엶)
start http://localhost:5173

:: 개발 서버 실행
npm run dev

pause
