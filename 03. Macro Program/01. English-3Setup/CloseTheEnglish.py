import subprocess

# --- Configuration ---
# Executable names for taskkill
APPS_TO_KILL = ["anki.exe", "Logseq.exe", "chrome.exe", "WindowexeAutoMacro.exe"]

def force_close(exe_name):
    """Forcefully terminate the process by image name."""
    print(f"[INFO] Forcefully closing: {exe_name}...")
    try:
        # /F: Forcefully terminate the process
        # /IM: Image name
        # /T: Terminate child processes as well (useful for Chrome/Logseq)
        subprocess.run(["taskkill", "/F", "/T", "/IM", exe_name], 
                       capture_output=True, check=False)
    except Exception as e:
        print(f"[ERROR] Failed to close {exe_name}: {e}")

def main():
    print("=== English Study Environment Force Cleanup ===")
    
    for exe in APPS_TO_KILL:
        force_close(exe)

    print("\n[SUCCESS] Cleanup attempt finished.")
    print("Note: Applications have been forcefully closed without prompts.")

if __name__ == "__main__":
    main()
