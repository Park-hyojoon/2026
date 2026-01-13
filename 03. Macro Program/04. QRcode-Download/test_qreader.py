from qreader import QReader
import cv2
import sys
import os

def test_qreader(image_path):
    print(f"Testing QReader for: {image_path}")
    if not os.path.exists(image_path):
        print("File not found.")
        return
        
    try:
        qreader = QReader()
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        decoded_text = qreader.detect_and_decode(image=image)
        
        if decoded_text:
            for i, text in enumerate(decoded_text):
                print(f"Result {i+1}: {text}")
        else:
            print("QReader could not find any QR code.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_qreader(sys.argv[1])
