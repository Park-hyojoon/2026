import os
import sys
import shutil
from win32com.client import Dispatch

def create_shortcut():
    # 1. Define Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    target_script = os.path.join(base_dir, "gui.py")
    icon_path = os.path.join(base_dir, "makeppt001_1.ico")
    
    # Get Python executable (pythonw.exe for no console)
    python_dir = os.path.dirname(sys.executable)
    pythonw_exe = os.path.join(python_dir, "pythonw.exe")
    
    if not os.path.exists(pythonw_exe):
        pythonw_exe = sys.executable

    # 2. Create Shortcut
    try:
        shell = Dispatch('WScript.Shell')
        # Get Desktop folder path
        desktop = shell.SpecialFolders("Desktop")
        shortcut_path = os.path.join(desktop, "MyPPT 2.5 (Live).lnk")
        
        print(f"Creating shortcut at: {shortcut_path}")
        
        shortcut = shell.CreateShortCut(shortcut_path)
        shortcut.Targetpath = pythonw_exe
        shortcut.Arguments = f'"{target_script}"'
        shortcut.WorkingDirectory = base_dir
        if os.path.exists(icon_path):
            shortcut.IconLocation = icon_path
        shortcut.save()
        print("Shortcut created successfully on Desktop.")
    except Exception as e:
        print(f"Failed to create shortcut: {e}")

def cleanup_files():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Directories to remove
    dirs_to_remove = ["build", "dist"]
    
    for d in dirs_to_remove:
        path = os.path.join(base_dir, d)
        if os.path.exists(path):
            print(f"Removing directory: {path}")
            try:
                shutil.rmtree(path)
            except Exception as e:
                print(f"Error removing {path}: {e}")
        else:
            print(f"Directory {d} not found (already clean).")

    # Files to remove (*.spec)
    files = [f for f in os.listdir(base_dir) if f.endswith(".spec")]
    for f in files:
        path = os.path.join(base_dir, f)
        print(f"Removing file: {path}")
        try:
            os.remove(path)
        except Exception as e:
            print(f"Error removing {path}: {e}")

if __name__ == "__main__":
    try:
        create_shortcut()
        print("-" * 20)
        cleanup_files()
        print("-" * 20)
        print("All operations completed.")
    except Exception as e:
        print(f"An error occurred: {e}")
    
    # Keep window open briefly if run via double-click
    # input("Press Enter to exit...") 
