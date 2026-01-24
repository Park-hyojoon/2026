@echo off
echo [1/3] Installing/Updating PyInstaller and Pillow...
pip install pyinstaller pillow

echo [2/3] Building EXE file...
:: --noconfirm: Overwrite output directory without asking
:: --onefile: Create a single executable file
:: --windowed: Do not provide a console window for standard i/o
:: --icon: Use the specified icon for the executable
:: --add-data: Bundles assets. Format: "source;destination"
pyinstaller --noconfirm --onefile --windowed --add-data "img;img" --add-data "main_icon.png;." --icon="main_icon.ico" "main.py"

echo [3/3] Done! You can find the EXE in the 'dist' folder.
pause
