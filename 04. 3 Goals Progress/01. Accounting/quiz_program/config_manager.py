import json
import os
from datetime import datetime
import tkinter.messagebox as messagebox
from tkinter import filedialog

class ConfigManager:
    def __init__(self, base_path):
        self.base_path = base_path
        self.config_file = os.path.join(base_path, "config.json")
        self.history_file = os.path.join(base_path, "learning_history.json")
        self.api_key = None
        self.pdf_paths = []
        self.history = []

    def load_config(self):
        """설정 파일 로드"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    self.api_key = config.get('api_key', '')
                    # 저장된 PDF 경로 로드 (여러 파일 지원)
                    saved_pdfs = config.get('pdf_paths', [])
                    # 기존 단일 파일 호환성
                    if not saved_pdfs and config.get('last_pdf_path'):
                        saved_pdfs = [config.get('last_pdf_path')]
                    # 존재하는 파일만 로드
                    self.pdf_paths = [p for p in saved_pdfs if os.path.exists(p)]
            except:
                pass

    def save_config(self):
        """설정 파일 저장"""
        config = {
            'api_key': self.api_key,
            'pdf_paths': self.pdf_paths
        }
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

    def load_history(self):
        """학습 기록 로드"""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    self.history = json.load(f)
            except:
                self.history = []
        else:
            self.history = []
        return self.history

    def save_history(self, session_data):
        """학습 기록 저장"""
        self.history.append(session_data)
        with open(self.history_file, 'w', encoding='utf-8') as f:
            json.dump(self.history, f, ensure_ascii=False, indent=2)

    def export_data(self):
        """데이터 내보내기 (백업)"""
        if not self.history:
            messagebox.showinfo("알림", "내보낼 학습 기록이 없습니다.")
            return
            
        file_path = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
            initialfile=f"learning_history_backup_{datetime.now().strftime('%Y%m%d')}.json",
            title="학습 기록 내보내기"
        )
        
        if file_path:
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(self.history, f, ensure_ascii=False, indent=2)
                messagebox.showinfo("성공", "학습 기록이 성공적으로 저장되었습니다.")
            except Exception as e:
                messagebox.showerror("오류", f"저장 중 오류가 발생했습니다: {str(e)}")
