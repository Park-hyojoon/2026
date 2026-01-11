# Task: QR-to-Kakao Automation

- [ ] Planning & Design [/]
    - [x] Research QR code scanning (Using image files instead of manual URL)
    - [ ] Research OCR for text extraction (Tesseract or EasyOCR)
    - [ ] Design the download logic (handling redirects, stream)
    - [ ] Research KakaoTalk automation (pywinauto for robust control)
- [ ] Implementation [ ]
    - [ ] Setup virtual environment and dependencies (`requests`, `pywinauto`, `pyzbar`, `pytesseract`)
    - [ ] Implement Image-based QR scanner & OCR extractor
    - [ ] Implement Text Processor (Summarize/Truncate to 267 chars)
    - [ ] Implement mp4 downloader (with safety checks)
    - [ ] Implement KakaoTalk transmission (Search friend -> Send message/file)
- [ ] Verification [ ]
    - [ ] Test QR/OCR extraction & Text summarization
    - [ ] Test downloading from a extracted URL (Check for safety/timeout)
    - [ ] Test KakaoTalk automation
