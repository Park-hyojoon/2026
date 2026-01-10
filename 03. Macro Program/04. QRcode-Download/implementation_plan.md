# QR-to-Kakao Automation Implementation Plan

The goal is to create a Python script that automates the process of scanning a QR code, downloading the linked mp4 file, and sending it to a KakaoTalk friend.

## Proposed Workflow

1.  **Input**: The user manualy pastes the URL (obtained from a phone QR scan) into the program input.
2.  **Downloader**: The script downloads the mp4 file from the provided URL into a designated folder.
3.  **KakaoTalk Automation**:
    *   The script uses `pywinauto` to interact with the KakaoTalk Windows client.
    *   Search for a specified friend name.
    *   Attach and send the downloaded mp4 file.

> [!NOTE]
> **Privacy Information**: I do **not** have direct access to your KakaoTalk account, messages, or contact list data. The program works like a "robot" that moves the mouse and types on the screen just as you would. It only "sees" what is visible on the KakaoTalk window while it is running.

## Proposed Tools & Libraries
- `requests`: To download the mp4 file.
- `pywinauto`: For robust Windows application automation (KakaoTalk).
- `tkinter`: To create a simple GUI for URL input and friend name selection.

## Verification Plan
- Test file download with a sample mp4 URL.
- Test searching for a friend in KakaoTalk and opening the chat.
- Test file attachment and sending.
