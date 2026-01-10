import subprocess
import time
import win32gui
import win32con
import win32api
import os
import sys
import ctypes

# --- Configuration ---
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

# Macro program that requires Admin rights
MACRO_APP = {
    "name": "WindowexeAutoMacro",
    "path": r"D:\OneDrive\Desktop\Window 단축키\WindowexeAutoMacro.exe"
}

TIMEOUT_SECONDS = 30 # Increased timeout for slow launches
BORDER_OFFSET = 7    # Compensation for Windows 10/11 invisible borders (pixels)

def get_screen_dimensions():
    """Get the primary monitor's work area dimensions."""
    rect = win32api.GetMonitorInfo(win32api.MonitorFromPoint((0,0)))['Work']
    work_width = rect[2] - rect[0]
    work_height = rect[3] - rect[1]
    return work_width, work_height, rect[0], rect[1]

def launch_app(app_name, config):
    """Launch the application."""
    path = config["path"]
    if not os.path.exists(path):
        print(f"[ERROR] Could not find executable for {app_name} at: {path}")
        return False
    
    print(f"[INFO] Launching {app_name}...")
    try:
        if app_name == "Chrome":
            cmd = [path, "--new-window"] + config["urls"]
            subprocess.Popen(cmd)
        else:
            subprocess.Popen(path)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to launch {app_name}: {e}")
        return False

def launch_as_admin(path):
    """Launch an executable as administrator."""
    if not os.path.exists(path):
        print(f"[ERROR] Could not find macro executable at: {path}")
        return False
    
    print(f"[INFO] Launching macro as Admin: {os.path.basename(path)}...")
    try:
        # 'runas' verb triggers the UAC prompt
        ctypes.windll.shell32.ShellExecuteW(None, "runas", path, None, None, 1)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to launch as admin: {e}")
        return False

def find_window_handle(keyword):
    """Find a window handle containing the keyword in its title."""
    found_hwnd = None
    
    def callback(hwnd, extra):
        nonlocal found_hwnd
        if win32gui.IsWindowVisible(hwnd):
            title = win32gui.GetWindowText(hwnd)
            if keyword.lower() in title.lower():
                found_hwnd = hwnd
                return False # Stop enumerating
        return True

    try:
        win32gui.EnumWindows(callback, None)
    except Exception:
        pass # EnumWindows stops by raising exception if we return False
        
    return found_hwnd

def position_window(hwnd, position, screen_w, screen_h, screen_x, screen_y):
    """Move the window to the text-specified position (left, center, right) with border compensation."""
    unit_w = screen_w // 3
    
    # Calculate base coordinates
    if position == "left":
        base_x = screen_x
        base_w = unit_w
    elif position == "center":
        base_x = screen_x + unit_w
        base_w = unit_w
    elif position == "right":
        base_x = screen_x + (unit_w * 2)
        base_w = screen_w - (unit_w * 2)

    # Apply Border Offset Compensation
    x = base_x - BORDER_OFFSET
    y = screen_y
    w = base_w + (2 * BORDER_OFFSET)
    h = screen_h + BORDER_OFFSET

    print(f"[INFO] Tiling {position} window {hwnd} to ({x}, {y}, {w}, {h}) [Offset: {BORDER_OFFSET}]")
    
    win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
    win32gui.SetWindowPos(hwnd, win32con.HWND_TOP, x, y, w, h, win32con.SWP_SHOWWINDOW)

def main():
    print("=== English Study Environment Setup ===")
    
    # 1. Get Screen Info
    s_w, s_h, s_x, s_y = get_screen_dimensions()
    print(f"[INFO] Screen Work Area: {s_w}x{s_h} at ({s_x},{s_y})")
    
    # 2. Launch Basic Apps
    for name, config in APPS.items():
        if launch_app(name, config):
            time.sleep(1) 
    
    # 3. Launch Admin Macro Program
    launch_as_admin(MACRO_APP["path"])
    
    print("[INFO] Waiting for applications to initialize...")
    
    # 4. Wait and Position
    active_apps = [name for name in APPS.keys()]
    start_time = time.time()
    positioned = set()
    
    while time.time() - start_time < TIMEOUT_SECONDS:
        if len(positioned) == len(active_apps):
            break
            
        for name in active_apps:
            if name in positioned:
                continue
                
            hwnd = find_window_handle(APPS[name]["title_keyword"])
            if hwnd:
                position_window(hwnd, APPS[name]["position"], s_w, s_h, s_x, s_y)
                positioned.add(name)
        
        time.sleep(1)
        
    # Final Report
    print("\n=== Summary ===")
    for name in active_apps:
        if name in positioned:
            print(f"[OK] {name} launched and positioned.")
        else:
            print(f"[WARN] {name} launched but window could not be found/positioned (Timeout).")
            
    if len(positioned) == len(active_apps):
        print("\n[SUCCESS] All Done! Ready to study.")
    else:
        print("\n[PARTIAL SUCCESS] Some windows might need manual adjustment.")

if __name__ == "__main__":
    main()
