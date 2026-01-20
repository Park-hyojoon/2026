import json
import os
from datetime import datetime
from typing import List

DATA_DIR = "data"
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")

class HistoryService:
    def __init__(self):
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
        if not os.path.exists(HISTORY_FILE):
            self._save_data([])

    def _load_data(self) -> List[str]:
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def _save_data(self, data: List[str]):
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def log_activity(self):
        """Log today's date if not already logged."""
        today = datetime.now().strftime("%Y-%m-%d")
        history = self._load_data()
        if today not in history:
            history.append(today)
            self._save_data(history)

    def get_history(self) -> List[str]:
        return self._load_data()

history_service = HistoryService()
