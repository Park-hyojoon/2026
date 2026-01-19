# 📚 English Study Environment Manager (OpenTheEnglish)

A professional automation tool designed to streamline the setup and teardown of a focused English study environment on Windows.

## 🌟 Key Features

-   **One-Click Setup**: Automatically launches all necessary study tools.
-   **Smart Window Management**:
    -   Divides the screen into three precise vertical columns.
    -   Positions **Anki** (Left), **Logseq** (Center), and **Google Chrome** (Right).
    -   Ensures no gaps between windows for a seamless workspace.
-   **Chrome Automation**: Automatically opens essential study tabs:
    -   [Gemini](https://gemini.google.com/) (AI Assistant)
    -   [DeepL](https://www.deepl.com/) (Translation)
    -   [Naver English Dictionary](https://en.dict.naver.com/)
-   **Safe Cleanup**: Includes a script to force-close all study applications instantly when finished.

## 🛠 Tech Stack

-   **Python**: Core logic and automation.
-   **PyAutoGUI / PyGetWindow**: precise window positioning and control.
-   **Subprocess**: Managing OS-level application launches and terminations.

## 🚀 How to Use

1.  **Run Study Manager**:
    Execute `RunStudyManager.bat` to launch and arrange everything.
2.  **Finish Study**:
    Execute `CloseTheEnglish.bat` to shut down all study-related apps.

## 📝 Development History

This project was built to solve the repetitive task of manually opening and arranging multiple windows every day for English study. It focuses on maximizing productivity by reducing "setup friction."

---

*This project is part of my development portfolio built with the help of Antigravity AI.*
