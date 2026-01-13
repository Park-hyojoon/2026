# QR Code Image Processor with AI Vision (REVISED)

**SCOPE CHANGE**: This program will NO LONGER automate KakaoTalk directly. Instead, it will process images and prepare outputs for the user to review and manually send.

The goal is to create a Python script that uses Claude's Vision AI to extract information from images containing QR codes and text, download linked files, and present results for user review before manual transmission.

## User Requirements & Analysis

### User's Key Request (2026-01-11)
> "카카오톡에 직접 접근하지 말자. 모든 결과물을 사용자가 검토할 수 있게 하는 걸 최종 목표로 하자."
> "Option A (Full AI)를 해보고 싶어."

### Analysis of Requirement Change

#### Advantages of Removing KakaoTalk Automation
1. **Safety & Control**: User maintains full control over what gets sent and to whom
2. **No UI Automation Risks**: Eliminates `pywinauto` dependency and potential window interaction failures
3. **Prevents Costly Mistakes**: No risk of accidentally sending to wrong person
4. **Simpler Architecture**: Fewer moving parts, easier to debug and maintain
5. **Cross-Platform Potential**: Without KakaoTalk automation, could work on Mac/Linux in future
6. **Legal/Ethical Clarity**: No automated messaging, just content preparation

#### Trade-offs
- **Manual Step Required**: User must copy/paste results into KakaoTalk manually
- **Not "Fully Automated"**: But this is actually a FEATURE for safety

#### AI Consultant's Recommendation
**STRONGLY SUPPORT** this approach. Automation that interacts with messaging apps carries significant risks:
- Wrong recipient selection
- Unintended message sending
- App UI changes breaking automation
- User unable to review before sending

**This revised approach is safer, more maintainable, and actually more practical.**

## Revised Workflow (Option A: Full AI)

1.  **Input**: User provides an image file (PNG/JPG) containing QR code and text
2.  **AI Vision Processing** (Claude API):
    *   Single API call analyzes entire image.
    *   **Dynamic Extraction**: Intelligently identifies QR codes, Chapter Titles, "Today's Word" (오늘의 말씀), and "Understanding the Text" (본문 이해) regardless of their position.
    *   **Contextual Summarization**: Combines all extracted content and summarizes it to **exactly 267 characters**.
3.  **Secure Download**:
    *   Validates extracted URL (HTTPS, file type, size)
    *   Downloads mp4 file to designated folder
4.  **Result Presentation**:
    *   Display 267-character summary with [Copy to Clipboard] button
    *   Display download file path with [Open Folder] button
    *   Show extraction confidence/warnings if any
5.  **User Action**: User reviews and manually sends via KakaoTalk

## Safety & Security Protocols (REVISED)
- **AI Vision Privacy**: Image sent to Anthropic Claude API via HTTPS (encrypted), not stored per Anthropic's policy
- **User Review Gate**: ALL outputs displayed to user before any action (no auto-sending)
- **Secure Downloads**: SSL verification, file type validation, size limits
- **No Automation Risk**: No UI automation = no risk of unintended actions
- **No Data Persistence**: Program doesn't save API keys, images, or download history after session ends

## Required Tools & Libraries (REVISED)
- **`anthropic`**: Official Python SDK for Claude API (Vision + Text processing)
- **`requests`**: For secure mp4 file downloads
- **`tkinter`**: Built-in GUI library (file picker, result display)
- **`pyperclip`**: For clipboard operations (copy summary text)
- **`Pillow (PIL)`**: For image loading and validation

### Removed Dependencies
- ~~`pyzbar`~~: Not needed (Claude Vision handles QR codes)
- ~~`pytesseract`~~: Not needed (Claude Vision handles OCR)
- ~~`pywinauto`~~: Not needed (no KakaoTalk automation)

## AI Integration Strategy

### SELECTED: Option C - Fully Local (No API Key Required) ✓
**Decision made by user on 2026-01-12**

To avoid costs and the need for an Anthropic API key, we will use local libraries for all processing.

#### Implementation Details
- **QR Decoding**: Use `pyzbar` and `OpenCV` to detect and decode QR codes locally.
- **OCR (Text Extraction)**: If needed, use `pytesseract` (requires Tesseract-OCR installation on Windows).
- **Summarization**: Note that without AI, "smart summarization" is not possible. We will provide the raw text or handle it based on fixed rules.

## Revised Workflow (Option C: Local)

1.  **Input**: User selected image (PNG/JPG).
2.  **Vision Engine (Local)**:
    *   **QR Scanner (`pyzbar`)**: Automatically scans for QR codes and extracts the URL.
    *   **Text Extractor (Optional)**: Can read text if Tesseract is installed.
3.  **Secure Download**:
    *   Directly download the mp4 file from the extracted URL.
4.  **Result Presentation**:
    *   Show download progress and open the file location.

## Required Tools & Libraries (REVISED)
- **`pyzbar`**: QR code scanning library.
- **`opencv-python`**: For image preprocessing (helping QR recognition).
- **`requests`**: For downloading files.
- **`tkinter`**: For GUI.
- **`Pillow`**: For image handling.

## Enhanced Security Protocols

### File Download Safety
1. **URL Validation**:
   - Whitelist allowed domains (if known) or validate URL format
   - Check file extension matches `.mp4`
   - Set maximum file size limit (e.g., 500MB)

2. **Network Security**:
   - Enforce HTTPS URLs only (reject HTTP)
   - Set download timeout (e.g., 60 seconds)
   - Verify content-type header is `video/mp4`

3. **Malware Prevention**:
   - Use `requests` with `stream=True` to check headers before downloading full file
   - Scan file size in headers before download
   - Optional: Hash verification if source provides checksums

### API Key Management
1. **Secure Storage**:
   - Load API key from environment variable or config file (not hardcoded)
   - Support `.env` file for local development
   - Clear instructions for users on obtaining Anthropic API key

2. **Cost Awareness**:
   - Estimate API cost before processing (based on image size)
   - Display running total of API usage in session
   - Warn if image is very large (higher cost)

### Input Validation
- Verify image file exists and is readable
- Check image format (PNG, JPG, BMP)
- Handle cases where QR code or text is not found in image

## Revised Implementation Architecture

```
┌──────────────────────┐
│   User Interface     │  (tkinter)
│  - Image file picker │
│  - API key input     │
│  - Process button    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Image Validator     │
│  - Check file exists │
│  - Verify format     │
│  - Load with Pillow  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Claude Vision API   │  (anthropic SDK)
│  - Send image        │
│  - Extract QR URL    │
│  - Extract text      │
│  - Summarize (267ch) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   URL Validator      │
│  - Check HTTPS       │
│  - Verify .mp4       │
│  - Size limit check  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  File Downloader     │  (requests)
│  - Stream download   │
│  - Progress bar      │
│  - Save to folder    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Results Display    │  (tkinter)
│  - Show 267ch text   │ ──[Copy]──> Clipboard
│  - Show file path    │ ──[Open]──> File Explorer
│  - Show warnings     │
│  - [Done] button     │
└──────────────────────┘
           │
           ▼
  User manually sends via KakaoTalk
```

## Error Handling Strategy (REVISED)

```python
# Pseudocode for revised error handling flow
try:
    # Load and validate image
    image = load_image_file(user_selected_path)
    validate_image_format(image)  # PNG, JPG, etc.

    # Call Claude Vision API
    api_response = call_claude_vision_api(
        image=image,
        prompt="Extract QR code URL and all text. Summarize text to exactly 267 chars."
    )

    qr_url = api_response.get("qr_url")
    summary_text = api_response.get("summary")  # 267 chars

    if not qr_url:
        raise ValueError("No QR code detected in image")
    if len(summary_text) != 267:
        warn_user(f"Summary length is {len(summary_text)}, expected 267")

    # Validate URL
    if not validate_url(qr_url):
        raise ValueError(f"Invalid or unsafe URL: {qr_url}")

    # Download file
    file_path = download_mp4(qr_url, timeout=60, max_size_mb=500)

    # Display results (not sending!)
    display_results_window(
        summary=summary_text,
        file_path=file_path,
        original_url=qr_url
    )

except FileNotFoundError:
    show_error("Image file not found or inaccessible")
except anthropic.APIError as e:
    show_error(f"Claude API error: {e}")
    suggest_user_check_api_key()
except ValueError as e:
    show_error(f"Validation error: {e}")
except requests.Timeout:
    show_error("Download timeout - file too large or slow connection")
except requests.RequestException as e:
    show_error(f"Download failed: {e}")
except Exception as e:
    log_error(e)
    show_error("Unexpected error occurred")
finally:
    # No auto-cleanup: user may want to access downloaded file
    pass
```

## Verification Plan (REVISED)
1. **Claude Vision API Testing**:
   - Test with clear QR code + text image
   - Test with low quality/blurry images
   - Test with images containing no QR code (error handling)
   - Test with images containing no text (error handling)
   - Verify 267-character summary accuracy and intelligence

2. **Download Testing**:
   - Test with valid HTTPS mp4 URL
   - Test with HTTP URL (should reject)
   - Test with non-mp4 URL (should reject)
   - Test with very large file (timeout/size limit)
   - Test with invalid/dead URLs

3. **UI Testing**:
   - Test clipboard copy functionality
   - Test "Open Folder" button
   - Test with various screen resolutions
   - Test error message displays

4. **Integration Testing**:
   - Full workflow: Image → API → Download → Display
   - Verify no data persistence after program closes
   - Test API key loading from .env file

## AI Consultant's Additional Recommendations

### Immediate Implementation Priorities
1. **Start with minimal MVP**:
   - Single-file Python script first
   - Basic tkinter UI (can polish later)
   - Focus on Claude API integration working correctly

2. **Claude API Prompt Engineering** (Most Critical):
   ```
   Example prompt to Claude Vision:
   "Analyze this image and extract the following in JSON format:
   1. 'qr_url': The URL from any QR code present (or null if none)
   2. 'full_text': All readable text in the image
   3. 'summary': Intelligently summarize the text to EXACTLY 267 characters including spaces.
      Preserve the most important information. Do not truncate mid-sentence if possible.

   Return only valid JSON."
   ```

3. **Cost Estimation**:
   - Average image (2MB) costs ~$0.01-0.03 per API call
   - Consider adding usage counter in UI
   - Warn user if processing many images in batch

4. **Future Enhancements** (not for MVP):
   - Batch processing (multiple images)
   - History log (optional, user-controlled)
   - Multiple export formats (JSON, TXT)
   - Configurable character limit (not just 267)

### Security Best Practices for API Key
```python
# Recommended approach
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file
api_key = os.getenv("ANTHROPIC_API_KEY")

if not api_key:
    # Show GUI popup asking user to enter API key
    # Save to .env for future use (with user consent)
```

### Why This Approach is Superior
- **User remains in control**: They see what's being sent before sending
- **Debuggable**: User can verify extracted text and URL before action
- **Flexible**: User can edit the 267-char text before copying if needed
- **Safer**: No risk of UI automation bugs causing wrong sends
- **Maintainable**: KakaoTalk UI changes won't break this program
- **Auditable**: User has full record of what was processed

### Next Steps
1. Set up Python virtual environment
2. Install dependencies: `anthropic`, `requests`, `pyperclip`, `Pillow`, `python-dotenv`
3. Obtain Anthropic API key from https://console.anthropic.com
4. Start with basic image → Claude API → print results (no GUI yet)
5. Add download functionality
6. Build tkinter GUI last
