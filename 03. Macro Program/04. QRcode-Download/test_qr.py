import cv2
import sys
import os

def crop_and_test(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return
        
    h, w = img.shape[:2]
    # QR is in the top right. Let's take the top-right 30% quadrant.
    crop = img[0:int(h*0.4), int(w*0.6):w]
    cv2.imwrite("qr_crop.jpg", crop)
    print(f"Saved crop: qr_crop.jpg ({crop.shape})")
    
    detector = cv2.QRCodeDetector()
    data, _, _ = detector.detectAndDecode(crop)
    if data:
        print(f"CROP FOUND: {data}")
    else:
        # Tweak contrast
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        alpha = 1.5 # Contrast control
        beta = 0    # Brightness control
        adjusted = cv2.convertScaleAbs(gray, alpha=alpha, beta=beta)
        cv2.imwrite("qr_crop_adj.jpg", adjusted)
        data, _, _ = detector.detectAndDecode(adjusted)
        if data:
            print(f"CROP ADJ FOUND: {data}")
        else:
            print("Crop detection failed too.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        crop_and_test(sys.argv[1])
