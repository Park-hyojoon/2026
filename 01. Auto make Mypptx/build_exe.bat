@echo off
echo ===================================
echo MyPPT 2.5 EXE Builder
echo ===================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Clean previous build
if exist "dist" (
    echo Cleaning previous build...
    rmdir /s /q dist
)
if exist "build" (
    rmdir /s /q build
)
if exist "*.spec" (
    del /q *.spec
)

echo.
echo Building EXE with PyInstaller...
echo.

pyinstaller --onefile ^
    --windowed ^
    --name "MyPPT_2.5" ^
    --icon="makeppt001_1.ico" ^
    --add-data "makeppt001_1.ico;." ^
    --add-data "work-plane;work-plane" ^
    --hidden-import=win32com ^
    --hidden-import=win32com.client ^
    --hidden-import=pythoncom ^
    --hidden-import=pywintypes ^
    --hidden-import=song_search ^
    --hidden-import=song_downloader ^
    --hidden-import=bible_search ^
    --collect-all=pptx ^
    gui.py

echo.
if exist "dist\MyPPT_2.5.exe" (
    echo ===================================
    echo Build completed successfully!
    echo Output: dist\MyPPT_2.5.exe
    echo ===================================
    echo.
    echo Opening output folder...
    start "" "dist"
) else (
    echo ===================================
    echo Build failed!
    echo ===================================
)

pause
