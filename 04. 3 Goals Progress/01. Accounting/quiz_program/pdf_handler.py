import pypdf
import os

def extract_text_from_pdf(pdf_path, max_pages=None):
    """
    Extracts text from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file.
        max_pages (int, optional): Maximum number of pages to read. Defaults to None (all pages).
    
    Returns:
        str: Extracted text.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at: {pdf_path}")

    text_content = []
    try:
        reader = pypdf.PdfReader(pdf_path)
        num_pages = len(reader.pages)
        if max_pages:
            num_pages = min(num_pages, max_pages)

        print(f"Reading {num_pages} pages from PDF...")
        for i in range(num_pages):
            page = reader.pages[i]
            text = page.extract_text()
            if text:
                text_content.append(text)
        
        return "\n".join(text_content)
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

if __name__ == "__main__":
    # Test block
    test_path = r"d:\00. WorkSpace\02. Creat\01. Antigravity\2026\04. 3 Goals Progress\01. Accounting\PDF(ocr)\02.계정과목별 정리_01.유동(당좌자산)-현금및현금성자산 회계처리.pdf"
    content = extract_text_from_pdf(test_path, max_pages=2)
    print(content[:500])
