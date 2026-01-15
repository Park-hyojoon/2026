@echo off
:: 파일이 있는 폴더로 이동 (경로에 한글이나 공백이 있어도 인식하도록 설정)
cd /d "%~dp0"

:: main.py 실행
python main.py

:: 실행 후 창이 바로 닫히지 않게 하려면 아래 pause를 추가 (확인용)
pause