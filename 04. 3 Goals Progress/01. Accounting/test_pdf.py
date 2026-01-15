import sys
import os

try:
    import pypdf
except ImportError:
    print("pypdf not installed")
    sys.exit(1)

file_path = r"d:\00. WorkSpace\02. Creat\01. Antigravity\2026\04. 3 Goals Progress\01. Accounting\PDF(ocr)\02.계정과목별 정리_01.유동(당좌자산)-현금및현금성자산 회계처리.pdf"

try:
    reader = pypdf.PdfReader(file_path)
    print(f"Number of pages: {len(reader.pages)}")
    first_page_text = reader.pages[0].extract_text()
    print("--- First Page Text ---")
    print(first_page_text[:500]) # Print first 500 chars
    print("--- End of Text ---")
except Exception as e:
    print(f"Error reading PDF: {e}")
