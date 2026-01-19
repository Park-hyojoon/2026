import subprocess
import time
import win32gui
import win32con
import win32api
import os
import sys
import ctypes
from threading import Thread
import pystray
from PIL import Image, ImageDraw
import logging
import win32event
import winerror

# --- Configuration ---

HOTKEY_OPEN = {
    "id": 1,
    "modifiers": win32con.MOD_CONTROL | win32con.MOD_ALT,
    "key": ord('E'),
    "desc": "Ctrl+Alt+E"
}

HOTKEY_CLOSE = {
    "id": 2,
    "modifiers": win32con.MOD_CONTROL | win32con.MOD_ALT,
    "key": ord('X'),
    "desc": "Ctrl+Alt+X"
}

APPS = {
    "Anki": {
        "path": r"D:\Program Files (phj)\Anki\anki.exe",
        "title_keyword": "Anki",
        "position": "left"
    },
    "Logseq": {
        "path": r"C:\Users\MyPC\AppData\Local\Logseq\Logseq.exe",
        "title_keyword": "Logseq",
        "position": "center"
    },
    "Chrome": {
        "path": r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "title_keyword": "Chrome",
        "position": "right",
        "urls": [
            "https://gemini.google.com",
            "https://www.deepl.com/translator",
            "https://en.dict.naver.com/"
        ]
    }
}

MACRO_APP = {
    "name": "WindowexeAutoMacro",
    "path": r"D:\OneDrive\Desktop\Window 단축키\WindowexeAutoMacro.exe"
}

TIMEOUT_SECONDS = 30
BORDER_OFFSET = 7
APPS_TO_KILL = ["anki.exe", "Logseq.exe", "chrome.exe", "WindowexeAutoMacro.exe"]

# Global variable to control the manager loop
running = True
tray_icon = None

# --- Logic Functions ---

def get_screen_dimensions():
    rect = win32api.GetMonitorInfo(win32api.MonitorFromPoint((0,0)))['Work']
    work_width = rect[2] - rect[0]
    work_height = rect[3] - rect[1]
    return work_width, work_height, rect[0], rect[1]

def find_window_handle(keyword):
    found_hwnd = None
    def callback(hwnd, extra):
        nonlocal found_hwnd
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if keyword.lower() in title.lower():
                found_hwnd = hwnd
                return False
        return True
    try:
        win32gui.EnumWindows(callback, None)
    except Exception:
        pass
    return found_hwnd

def position_window(hwnd, position, screen_w, screen_h, screen_x, screen_y):
    unit_w = screen_w // 3
    if position == "left":
        base_x = screen_x
        base_w = unit_w
    elif position == "center":
        base_x = screen_x + unit_w
        base_w = unit_w
    elif position == "right":
        base_x = screen_x + (unit_w * 2)
        base_w = screen_w - (unit_w * 2)

    x = base_x - BORDER_OFFSET
    y = screen_y
    w = base_w + (2 * BORDER_OFFSET)
    h = screen_h + BORDER_OFFSET
    
    win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
    win32gui.SetWindowPos(hwnd, win32con.HWND_TOP, x, y, w, h, win32con.SWP_SHOWWINDOW)

    print(f"[INFO] Tiling {position} window {hwnd} to ({x}, {y}, {w}, {h}) [Offset: {BORDER_OFFSET}]")
    
    win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
    win32gui.SetWindowPos(hwnd, win32con.HWND_TOP, x, y, w, h, win32con.SWP_SHOWWINDOW)

def launch_as_admin(path):
    if not os.path.exists(path):
        return False
    try:
        ctypes.windll.shell32.ShellExecuteW(None, "runas", path, None, None, 1)
        return True
    except Exception:
        return False

def open_study_env():
    logging.info("[EVENT] Opening English Study Environment...")
    s_w, s_h, s_x, s_y = get_screen_dimensions()
    
    for name, config in APPS.items():
        if not os.path.exists(config["path"]): continue
        try:
            if name == "Chrome":
                cmd = [config["path"], "--new-window"] + config["urls"]
                subprocess.Popen(cmd)
            else:
                subprocess.Popen(config["path"])
        except Exception: pass

    launch_as_admin(MACRO_APP["path"])
    
    start_time = time.time()
    positioned = set()
    active_apps = list(APPS.keys())
    
    while time.time() - start_time < TIMEOUT_SECONDS:
        if len(positioned) == len(active_apps): break
        for name in active_apps:
            if name in positioned: continue
            hwnd = find_window_handle(APPS[name]["title_keyword"])
            if hwnd:
                position_window(hwnd, APPS[name]["position"], s_w, s_h, s_x, s_y)
                positioned.add(name)
        time.sleep(1)

def close_study_env():
    logging.info("[EVENT] Closing English Study Environment...")
    for exe in APPS_TO_KILL:
        try:
            subprocess.run(["taskkill", "/F", "/T", "/IM", exe], capture_output=True, check=False)
        except Exception: pass

# --- Tray and Hotkey Integration ---

def create_image():
    # Create a simple icon for the tray (Blue circle with 'E')
    width = 64
    height = 64
    image = Image.new('RGB', (width, height), (255, 255, 255))
    dc = ImageDraw.Draw(image)
    dc.ellipse([10, 10, 54, 54], fill=(0, 120, 215))
    # Note: adding text to PIL images requires a font file, 
    # so we'll just use a solid color for now to be safe.
    return image

def on_quit(icon, item):
    global running
    running = False
    icon.stop()
    # Post a quit message to the window thread to break GetMessage
    ctypes.windll.user32.PostQuitMessage(0)

def setup_tray():
    global tray_icon
    menu = pystray.Menu(
        pystray.MenuItem("Open (Ctrl+Alt+E)", lambda: Thread(target=open_study_env).start()),
        pystray.MenuItem("Close (Ctrl+Alt+X)", lambda: Thread(target=close_study_env).start()),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("Exit Manager", on_quit)
    )
    tray_icon = pystray.Icon("EnglishStudyManager", create_image(), "English Study Manager", menu)
    tray_icon.run()

def listen_for_hotkeys():
    user32 = ctypes.windll.user32
    # Register Hotkeys
    if not user32.RegisterHotKey(None, HOTKEY_OPEN["id"], HOTKEY_OPEN["modifiers"], HOTKEY_OPEN["key"]):
        logging.error(f"[ERROR] Could not register {HOTKEY_OPEN['desc']}")
    if not user32.RegisterHotKey(None, HOTKEY_CLOSE["id"], HOTKEY_CLOSE["modifiers"], HOTKEY_CLOSE["key"]):
        logging.error(f"[ERROR] Could not register {HOTKEY_CLOSE['desc']}")

    logging.info(f"=== English Study Manager Running (Tray Icon Active) ===")
    
    try:
        # Message Loop (Correct Usage)
        while running:
            # win32gui.GetMessage returns (int, MSG)
            # MSG is a tuple: (hwnd, message, wParam, lParam, time, pt)
            rc, msg = win32gui.GetMessage(None, 0, 0)
            
            if rc == 0: # WM_QUIT
                break
                
            if msg[1] == win32con.WM_HOTKEY:
                id_received = msg[2]
                if id_received == HOTKEY_OPEN["id"]:
                    logging.info("Hotkey Pressed: Open")
                    Thread(target=open_study_env).start()
                elif id_received == HOTKEY_CLOSE["id"]:
                    logging.info("Hotkey Pressed: Close")
                    Thread(target=close_study_env).start()
            
            win32gui.TranslateMessage(msg)
            win32gui.DispatchMessage(msg)
            
    except Exception as e:
        logging.critical(f"Crash in message loop: {e}", exc_info=True)
    finally:
        user32.UnregisterHotKey(None, HOTKEY_OPEN["id"])
        user32.UnregisterHotKey(None, HOTKEY_CLOSE["id"])
        if tray_icon:
            tray_icon.stop()

if __name__ == "__main__":
    # Setup Logging
    log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "debug.log")
    logging.basicConfig(filename=log_file, level=logging.DEBUG, 
                        format='%(asctime)s - %(levelname)s - %(message)s')
    
    # Single Instance Check
    mutex_name = "Global\\EnglishStudyManager_Mutex"
    mutex = win32event.CreateMutex(None, False, mutex_name)
    last_error = win32api.GetLastError()
    
    if last_error == winerror.ERROR_ALREADY_EXISTS:
        logging.warning("EnglishStudyManager is already running. Exiting this instance.")
        sys.exit(0)

    # Start tray icon in a separate thread
    Thread(target=setup_tray, daemon=True).start()
    
    # Auto-launch the study environment
    Thread(target=open_study_env).start()
    
    # Keep main thread for hotkey listening
    listen_for_hotkeys()
