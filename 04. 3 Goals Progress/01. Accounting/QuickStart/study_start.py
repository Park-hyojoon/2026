import os
import time
import subprocess
import webbrowser
import ctypes
from ctypes import wintypes

# --- Settings ---
# PDF Path (Corrected based on search result)
PDF_PATH = r"d:\00. WorkSpace\02. Creat\01. Antigravity\2026\04. 3 Goals Progress\01. Accounting\PDF(ocr)\02.계정과목별 정리_01.유동(당좌자산)-현금및현금성자산 회계처리.pdf"
PAGE_NUMBER = 3
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe" # Common path, will try to detect or use generic command

# --- Window Management Functions (using ctypes for native Windows API) ---
user32 = ctypes.windll.user32
user32.SetProcessDPIAware() # Handle High DPI screens

def get_screen_resolution():
    width = user32.GetSystemMetrics(0)
    height = user32.GetSystemMetrics(1)
    return width, height

def move_window(hwnd, x, y, width, height):
    user32.MoveWindow(hwnd, x, y, width, height, True)

def enum_windows_callback(hwnd, found_windows):
    length = user32.GetWindowTextLengthW(hwnd)
    buff = ctypes.create_unicode_buffer(length + 1)
    user32.GetWindowTextW(hwnd, buff, length + 1)
    title = buff.value
    if user32.IsWindowVisible(hwnd) and length > 0:
        # Filter for Chrome windows
        if "Chrome" in title or "Google Chrome" in title:
            found_windows.append((hwnd, title))
    return True

def find_chrome_windows():
    found_windows = []
    EnumWindowsProc = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int)) # Adjusted signature
    # Actually simpler:
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, ctypes.POINTER(ctypes.py_object))
    
    def callback(hwnd, windows_list_ref):
        windows_list = windows_list_ref[0]
        length = user32.GetWindowTextLengthW(hwnd)
        if length == 0: return True
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value
        if user32.IsWindowVisible(hwnd):
             if "- Google Chrome" in title: # Standard Chrome title suffix
                windows_list.append((hwnd, title))
        return True

    windows_container = []
    proc = WNDENUMPROC(callback)
    # Pass pointer to python list
    # ctypes is tricky with callbacks and python objects, let's stick to global or simple filtering if possible, 
    # OR better yet, iterate all windows and filter in python.
    
    titles = []
    def foreach_window(hwnd, lParam):
        length = user32.GetWindowTextLengthW(hwnd)
        if length == 0: return True
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value
        if user32.IsWindowVisible(hwnd):
            if "Google Chrome" in title:
                titles.append((hwnd, title))
        return True
    
    user32.EnumWindows(WNDENUMPROC(foreach_window), 0)
    return titles

def launch_study_environment():
    print("Starting Study Environment...")

    # 기존 Chrome 창 목록 저장
    existing_windows = set(hwnd for hwnd, _ in find_chrome_windows())
    print(f"Existing Chrome windows: {len(existing_windows)}")

    # 1. Open PDF in Chrome at Page 3
    pdf_url = f"file:///{PDF_PATH.replace(os.sep, '/')}#page={PAGE_NUMBER}"
    print(f"Opening PDF: {pdf_url}")

    if os.path.exists(CHROME_PATH):
        subprocess.Popen([CHROME_PATH, "--new-window", pdf_url])
    else:
        try:
            subprocess.Popen(f'start chrome --new-window "{pdf_url}"', shell=True)
        except:
             webbrowser.open(pdf_url, new=1)

    print("Waiting for PDF window (3s)...")
    time.sleep(3)

    # 첫 번째 새 창 찾기
    pdf_window = None
    current_windows = find_chrome_windows()
    for hwnd, title in current_windows:
        if hwnd not in existing_windows:
            pdf_window = hwnd
            existing_windows.add(hwnd)
            print(f"Found PDF window: {title}")
            break

    # 2. Open a general Chrome Browser
    print("Opening Google Chrome...")
    if os.path.exists(CHROME_PATH):
        subprocess.Popen([CHROME_PATH, "--new-window", "https://www.google.com"])
    else:
        subprocess.Popen('start chrome --new-window "https://www.google.com"', shell=True)

    print("Waiting for Browser window (3s)...")
    time.sleep(3)

    # 두 번째 새 창 찾기
    browser_window = None
    current_windows = find_chrome_windows()
    for hwnd, title in current_windows:
        if hwnd not in existing_windows:
            browser_window = hwnd
            print(f"Found Browser window: {title}")
            break

    # 3. Arrange Windows
    screen_width, screen_height = get_screen_resolution()
    half_width = screen_width // 2

    print(f"Screen resolution: {screen_width}x{screen_height}")

    # Apply positions
    if pdf_window:
        print(f"Moving PDF Window to LEFT (0, 0, {half_width}, {screen_height})")
        user32.ShowWindow(pdf_window, 9)  # SW_RESTORE
        move_window(pdf_window, 0, 0, half_width, screen_height)
    else:
        print("Could not find PDF window.")

    if browser_window:
        print(f"Moving Browser Window to RIGHT ({half_width}, 0, {half_width}, {screen_height})")
        user32.ShowWindow(browser_window, 9)  # SW_RESTORE
        move_window(browser_window, half_width, 0, half_width, screen_height)
    else:
        print("Could not find Browser window.")

    print("Done!")

if __name__ == "__main__":
    launch_study_environment()
