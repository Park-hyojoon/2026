@echo off
chcp 65001 > nul
echo ====================================
echo AI 회계 학습 도우미 시작
echo ====================================
echo.

cd quiz_program
python gui_app.py

if errorlevel 1 (
    echo.
    echo 오류가 발생했습니다.
    echo 필요한 패키지가 설치되어 있는지 확인해주세요.
    echo.
    echo 설치 명령어:
    echo pip install -r ..\requirements.txt
    echo.
    pause
)
