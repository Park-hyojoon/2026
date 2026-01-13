# Task: QR Code Image Processor with AI Vision (REVISED)

**SCOPE CHANGE**: No KakaoTalk automation. Results presented to user for manual review and sending.

- [ ] Planning & Design [x]
    - [x] Research QR code scanning (Using image files)
    - [x] Research OCR for text extraction (DECISION: Use Claude Vision API)
    - [x] Design the download logic (with safety checks)
    - [x] ~~Research KakaoTalk automation~~ **REMOVED** - User will send manually
    - [x] Analyze user requirements and revise implementation plan
    - [x] Analyze provided image samples (textbook pages)
- [ ] Implementation [/]
    - [x] Setup virtual environment and dependencies (`pyzbar`, `opencv-python`, `requests`, `pyperclip`, `Pillow`)
    - [ ] Implement Local QR Decoder (`pyzbar`)
    - [ ] (Optional) Implement Local OCR (`pytesseract`)
    - [ ] Implement secure mp4 downloader
    - [ ] Build tkinter GUI
        - [ ] Image file picker
        - [ ] Results display
        - [ ] Copy URL button
        - [ ] Open Folder button
- [ ] Verification
    - [ ] Test Claude Vision API with various image qualities
    - [ ] Test 267-character summarization accuracy
    - [ ] Test URL validation and download with edge cases
    - [ ] Test full workflow: Image → API → Download → Display
    - [ ] Test clipboard and file explorer integration
