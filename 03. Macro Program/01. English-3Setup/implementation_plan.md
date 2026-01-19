# English Study Manager Unified Plan

Combine `OpenTheEnglish.py` and `CloseTheEnglish.py` into a single background application `EnglishStudyManager.py`. This application will listen for global hotkeys to either set up the study environment or clean it up.

## User Review Required

> [!IMPORTANT]
> The application will run in the background. I will add a system tray icon (if possible) or a simple console window that can be minimized to the tray to ensure you can see that it's running.
> You will be able to customize the hotkeys at the top of the `EnglishStudyManager.py` file.

## Proposed Changes

### Study Manager Component

#### [NEW] [EnglishStudyManager.py](file:///d:/07.%20Antigravity/04.%20Macro%20Program/01.%20OpenTheEnglish/EnglishStudyManager.py)
A new script that:
1. Imports logic from both `OpenTheEnglish.py` and `CloseTheEnglish.py`.
2. Uses the native Windows API (`RegisterHotKey`) via `pywin32` to listen for global hotkeys.
3. Provides a configuration section for hotkeys.
4. **[NEW]** Integrates a system tray icon using `pystray` and `pillow` for easy monitoring and graceful exit.
5. Runs setup/cleanup logic based on hotkey inputs.

#### [NEW] [RunStudyManager.bat](file:///d:/07.%20Antigravity/04.%20Macro%20Program/01.%20OpenTheEnglish/RunStudyManager.bat)
A batch file to launch the manager using `pythonw.exe` to hide the console window.

## Verification Plan

### Automated Tests
- None (manual verification required for global hotkeys).

### Manual Verification
1. Run `EnglishStudyManager.py`.
2. Press the "Open" hotkey and verify all apps launch and tile correctly.
3. Press the "Close" hotkey and verify all apps are forcefully closed.
4. Verify that changing the hotkey configuration in the script works as expected.
