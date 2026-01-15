import json
import os
import uuid
from typing import List, Optional, Dict
from pydantic import BaseModel

DATA_DIR = "data"
MATERIALS_FILE = os.path.join(DATA_DIR, "materials.json")

class Material(BaseModel):
    id: str
    title: str
    content: str
    progress: Dict = {} # To store marked words/sentences and mastery status

class MaterialService:
    def __init__(self):
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
        if not os.path.exists(MATERIALS_FILE):
            self._save_data([])

    def _load_data(self) -> List[Dict]:
        try:
            with open(MATERIALS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def _save_data(self, data: List[Dict]):
        with open(MATERIALS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def add_material(self, title: str, content: str) -> Material:
        materials = self._load_data()
        new_material = Material(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            progress={}
        )
        materials.append(new_material.model_dump())
        self._save_data(materials)
        return new_material

    def get_materials(self) -> List[Material]:
        data = self._load_data()
        return [Material(**item) for item in data]

    def get_material(self, material_id: str) -> Optional[Material]:
        materials = self._load_data()
        for item in materials:
            if item["id"] == material_id:
                return Material(**item)
        return None

    def update_material_progress(self, material_id: str, progress: Dict) -> bool:
        materials = self._load_data()
        for item in materials:
            if item["id"] == material_id:
                item["progress"] = progress
                self._save_data(materials)
                return True
        return False

    def delete_material(self, material_id: str) -> bool:
        materials = self._load_data()
        initial_len = len(materials)
        materials = [item for item in materials if item["id"] != material_id]
        if len(materials) < initial_len:
            self._save_data(materials)
            return True
        return False
    
    def export_all(self):
        return self._load_data()
    
    def import_all(self, data: List[Dict]):
        # Validate or clean data here if necessary
        self._save_data(data)

material_service = MaterialService()
