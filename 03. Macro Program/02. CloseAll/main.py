import os
import time
import win32gui
import win32con
import win32process
import psutil

def get_visible_windows():
    """Returns a list of handles for visible, top-level windows."""
    windows = []
    def enum_handler(hwnd, lparam):
        if win32gui.IsWindowVisible(hwnd) and win32gui.GetWindowText(hwnd):
            # Skip common system windows that shouldn't be closed this way
            style = win32gui.GetWindowLong(hwnd, win32con.GWL_STYLE)
            if not (style & win32con.WS_CHILD):
                windows.append(hwnd)
    win32gui.EnumWindows(enum_handler, None)
    return windows

def close_windows_gracefully():
    """Sends WM_CLOSE to all visible windows."""
    print("사전 작업: 열려 있는 프로그램들을 안전하게 종료합니다...")
    
    # Get initial list of windows
    initial_windows = get_visible_windows()
    
    # Get current process ID to avoid closing itself
    current_pid = os.getpid()
    
    for hwnd in initial_windows:
        try:
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            if pid == current_pid:
                continue
                
            title = win32gui.GetWindowText(hwnd)
            if title:
                print(f"종료 요청 중: {title}")
                # Send WM_CLOSE (equivalent to clicking 'X')
                win32gui.PostMessage(hwnd, win32con.WM_CLOSE, 0, 0)
        except Exception as e:
            print(f"오류 발생 (윈도우 종료 시도 중): {e}")

    # Wait a bit for programs to close or show save dialogs
    print("\n프로그램들이 종료될 때까지 잠시 대기합니다 (10초)...")
    print("저장이 필요한 프로그램은 지금 저장해 주세요.")
    time.sleep(10)

def shutdown_system():
    """Executes the Windows shutdown command."""
    print("\n시스템을 종료합니다...")
    # /s = shutdown, /t 0 = timeout 0 seconds
    os.system("shutdown /s /t 60") 
    print("60초 후에 시스템이 종료됩니다. (취소하려면 'shutdown /a'를 입력하세요)")

if __name__ == "__main__":
    try:
        close_windows_gracefully()
        
        # Ask user for confirmation
        answer = input("\n모든 프로그램을 종료했습니다. 컴퓨터를 종료할까요? (y/n): ").strip().lower()
        if answer == 'y':
            shutdown_system()
        else:
            print("시스템 종료를 취소했습니다.")
            
    except KeyboardInterrupt:
        print("\n작업이 중단되었습니다.")
    except Exception as e:
        print(f"\n치명적 오류: {e}")
