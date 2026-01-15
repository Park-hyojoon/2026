@echo off
chcp 65001 > nul
echo ====================================
echo Google Gemini API 테스트
echo ====================================
echo.
echo 이 스크립트로 API가 제대로 작동하는지 확인합니다.
echo.

cd quiz_program
python test_api_simple.py

pause
