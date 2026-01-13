import os
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext, ttk
from dotenv import load_dotenv
import anthropic
import requests
import pyperclip
from PIL import Image, ImageTk
import threading
import base64
import json
import time

# Load environment variables
load_dotenv()

class QRProcessorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("QR Code & Text Processor (AI Vision)")
        self.root.geometry("800x700")

        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = None
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)

        self.setup_ui()

    def setup_ui(self):
        # API Key Section
        api_frame = tk.Frame(self.root)
        api_frame.pack(fill="x", padx=10, pady=5)
        
        tk.Label(api_frame, text="Anthropic API Key:").pack(side="left")
        self.api_entry = tk.Entry(api_frame, width=50, show="*")
        if self.api_key:
            self.api_entry.insert(0, self.api_key)
        self.api_entry.pack(side="left", padx=5)
        tk.Button(api_frame, text="Update Key", command=self.update_api_key).pack(side="left")

        # Image Selection
        img_frame = tk.Frame(self.root)
        img_frame.pack(fill="x", padx=10, pady=10)
        
        self.img_label = tk.Label(img_frame, text="No Image Selected", bg="lightgray", width=40, height=10)
        self.img_label.pack(side="left", padx=10)
        
        btn_frame = tk.Frame(img_frame)
        btn_frame.pack(side="left", padx=10)
        tk.Button(btn_frame, text="Select Image", command=self.select_image, height=2, width=15).pack(pady=5)
        self.process_btn = tk.Button(btn_frame, text="Process Image (AI)", command=self.process_image, height=2, width=15, state="disabled", bg="#dddddd")
        self.process_btn.pack(pady=5)

        # Output Section
        output_frame = tk.LabelFrame(self.root, text="Results", padx=10, pady=10)
        output_frame.pack(fill="both", expand=True, padx=10, pady=5)

        # 267-char Summary
        tk.Label(output_frame, text="Summarized Text (267 chars):").pack(anchor="w")
        self.summary_text = scrolledtext.ScrolledText(output_frame, height=8)
        self.summary_text.pack(fill="x", pady=5)
        
        tk.Button(output_frame, text="Copy to Clipboard", command=self.copy_to_clipboard).pack(anchor="e")

        # Download Section
        dl_frame = tk.Frame(output_frame)
        dl_frame.pack(fill="x", pady=10)
        
        tk.Label(dl_frame, text="QR Video URL:").pack(anchor="w")
        self.url_entry = tk.Entry(dl_frame)
        self.url_entry.pack(fill="x", pady=5)
        
        self.download_btn = tk.Button(dl_frame, text="Download MP4", command=self.start_download, state="disabled")
        self.download_btn.pack(anchor="e")

        self.progress = ttk.Progressbar(output_frame, orient="horizontal", length=100, mode="determinate")
        self.progress.pack(fill="x", pady=5)
        
        self.status_label = tk.Label(output_frame, text="Ready", fg="blue")
        self.status_label.pack(pady=5)

    def update_api_key(self):
        key = self.api_entry.get().strip()
        if not key:
            messagebox.showwarning("Warning", "API Key cannot be empty")
            return
        self.api_key = key
        self.client = anthropic.Anthropic(api_key=self.api_key)
        # Save to .env logic could be added here
        messagebox.showinfo("Success", "API Key updated successfully!")

    def select_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.bmp")])
        if file_path:
            self.image_path = file_path
            self.show_preview(file_path)
            self.process_btn.config(state="normal", bg="#4CAF50", fg="white")
            self.status_label.config(text=f"Selected: {os.path.basename(file_path)}")

    def show_preview(self, path):
        try:
            img = Image.open(path)
            img.thumbnail((250, 200)) # Resize for thumbnail
            photo = ImageTk.PhotoImage(img)
            self.img_label.config(image=photo, text="", width=0, height=0)
            self.img_label.image = photo # Keep reference
        except Exception as e:
            self.status_label.config(text=f"Error previewing image: {e}")

    def process_image(self):
        if not self.client:
            messagebox.showerror("Error", "Please set Anthropic API Key first.")
            return

        self.status_label.config(text="Sending to Claude Vision... Please wait.")
        self.process_btn.config(state="disabled")
        self.summary_text.delete(1.0, tk.END)
        self.url_entry.delete(0, tk.END)
        
        # Run in thread to not freeze GUI
        threading.Thread(target=self._call_claude_api).start()

    def _call_claude_api(self):
        try:
            with open(self.image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

            media_type = "image/jpeg" if self.image_path.lower().endswith((".jpg", ".jpeg")) else "image/png"

            prompt = """
            Analyze this image carefully. It contains educational content, usually a Bible story for children.
            Your task is to extracting specific information:
            
            1. **QR Code URL**: Find any QR code in the image and extract the URL it points to. It usually links to an .mp4 video.
            2. **Text Content**: Extract all readable text from the image. 
               - Look for the main story text (often in a box titled "본문 이해" or similar).
               - Look for the title and "Today's Word" (오늘의 말씀).
               - Ignore minor instructional text like "Find hidden pictures".
            3. **Summary**: Summarize the extracted text into **EXACTLY 267 characters** (including spaces). 
               - The summary is for a KakaoTalk message to parents/students.
               - It should capture the main spiritual lesson or story summary.
               - It MUST end with a complete sentence.
            
            Return the result in this valid JSON format ONLY:
            {
                "qr_url": "extracted_url_or_null",
                "summary": "your_267_char_summary_here"
            }
            """

            message = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": encoded_string,
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ],
                    }
                ],
            )
            
            # Parse response
            response_text = message.content[0].text
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                data = json.loads(response_text[json_start:json_end])
                
                self.root.after(0, self._update_ui_with_results, data)
            else:
                raise ValueError("Could not find JSON in Claude's response")

        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("API Error", str(e)))
            self.root.after(0, lambda: self.status_label.config(text="Processing Failed"))
            self.root.after(0, lambda: self.process_btn.config(state="normal"))

    def _update_ui_with_results(self, data):
        summary = data.get("summary", "")
        url = data.get("qr_url", "")
        
        self.summary_text.insert(tk.END, summary)
        if url:
            self.url_entry.insert(0, url)
            self.download_btn.config(state="normal")
            self.status_label.config(text="Processing Complete! URL found.")
        else:
            self.status_label.config(text="Processing Complete! No QR URL found.")
            
        self.process_btn.config(state="normal")
        
        # Check summary length
        length = len(summary)
        if length != 267:
            self.status_label.config(text=f"Warning: Summary is {length} chars (Target: 267)", fg="orange")

    def copy_to_clipboard(self):
        text = self.summary_text.get("1.0", tk.END).strip()
        if text:
            pyperclip.copy(text)
            messagebox.showinfo("Copied", "Summary copied to clipboard!")

    def start_download(self):
        url = self.url_entry.get().strip()
        if not url:
            return
            
        save_dir = "downloads"
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
            
        filename = f"video_{int(time.time())}.mp4"
        save_path = os.path.join(save_dir, filename)
        
        self.status_label.config(text="Downloading...")
        self.download_btn.config(state="disabled")
        self.progress["value"] = 0
        
        threading.Thread(target=self._download_file, args=(url, save_path)).start()

    def _download_file(self, url, save_path):
        try:
            # Basic validation
            if not url.startswith("http"):
                raise ValueError("Invalid URL scheme")

            response = requests.get(url, stream=True, timeout=60)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            block_size = 1024 # 1 Kibibyte
            wrote = 0
            
            with open(save_path, 'wb') as f:
                for data in response.iter_content(block_size):
                    wrote = wrote + len(data)
                    f.write(data)
                    if total_size != 0:
                        progress = int((wrote / total_size) * 100)
                        self.root.after(0, lambda p=progress: self.progress.configure(value=p))

            self.root.after(0, lambda: self.status_label.config(text=f"Downloaded: {save_path}", fg="green"))
            self.root.after(0, lambda: messagebox.showinfo("Success", f"File saved to:\n{os.path.abspath(save_path)}"))
            self.root.after(0, lambda: os.startfile(os.path.dirname(os.path.abspath(save_path)))) # Open folder

        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Download Error", str(e)))
            self.root.after(0, lambda: self.status_label.config(text="Download Failed"))
        finally:
            self.root.after(0, lambda: self.download_btn.config(state="normal"))

if __name__ == "__main__":
    root = tk.Tk()
    app = QRProcessorApp(root)
    root.mainloop()
