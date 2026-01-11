# QR-to-Kakao Automation Implementation Plan

The goal is to create a Python script that automates the process of scanning a QR code, downloading the linked mp4 file, and sending it to a KakaoTalk friend.

## Proposed Workflow

1.  **Input**: The user provides an image containing a QR code and text.
2.  **Vision Engine**:
    *   **QR Scanner**: Extracts the mp4 download URL.
    *   **OCR Extractor**: Extracts text from a defined region.
3.  **Text Processing**: 
    *   Summarize or truncate the extracted text to **exactly 267 characters (including spaces)**.
4.  **Downloader**: Securely downloads the mp4 file.
5.  **KakaoTalk Automation**:
    *   Search for the friend.
    *   Send the processed 267-character message.
    *   Attach and send the mp4 file.

## Safety & Security Protocols
- **Local OCR**: We will use Tesseract (local engine) so your image data never leaves your computer.
- **Secure Downloads**: SSL verification and file type validation to prevent malicious downloads.
- **Non-Invasive UI Automation**: Use `pywinauto` to interact only with the KakaoTalk window, ensuring no mouse/keyboard-stealing outside the intended app.
- **No Data Persistence**: The program will not save your friend lists or downloaded content after the process is complete.

## Proposed Tools & Libraries
- `pyzbar` / `opencv-python`: For QR code decoding.
- `pytesseract`: For local OCR (Safest approach).
- `requests`: For secure downloads.
- `pywinauto`: For KakaoTalk UI automation.

## Verification Plan
- Test file download with a sample mp4 URL.
- Test searching for a friend in KakaoTalk and opening the chat.
- Test file attachment and sending.
