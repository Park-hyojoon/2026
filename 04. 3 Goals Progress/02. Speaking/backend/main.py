from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from typing import List, Dict, Optional

# Import Services
from services.ollama_client import ollama_service
from services.material_service import material_service, Material
from services.history_service import history_service

# Create the app
app = FastAPI(title="AI English Tutor Backend")

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Requests ---
class ChatRequest(BaseModel):
    model: str
    messages: List[Dict[str, str]]

class MaterialCreate(BaseModel):
    title: str
    content: str
    
class MaterialUpdate(BaseModel):
    progress: Dict

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "AI English Tutor Backend is running"}

@app.get("/health")
def health_check():
    ollama_status = ollama_service.check_connection()
    return {"status": "ok", "ollama_connected": ollama_status}

# Chat Endpoint
@app.post("/chat")
def chat(request: ChatRequest):
    history_service.log_activity() # Log study activity
    response = ollama_service.chat(request.model, request.messages)
    if not response:
        raise HTTPException(status_code=500, detail="Failed to communicate with Ollama")
    return response

# Material Endpoints
@app.get("/materials", response_model=List[Material])
def get_materials():
    return material_service.get_materials()

@app.post("/materials", response_model=Material)
def create_material(material: MaterialCreate):
    return material_service.add_material(material.title, material.content)

@app.get("/materials/{material_id}", response_model=Material)
def get_material(material_id: str):
    material = material_service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@app.put("/materials/{material_id}/progress")
def update_progress(material_id: str, update: MaterialUpdate):
    success = material_service.update_material_progress(material_id, update.progress)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"status": "success"}

@app.delete("/materials/{material_id}")
def delete_material(material_id: str):
    success = material_service.delete_material(material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"status": "success"}

# Import/Export
@app.get("/export")
def export_data():
    return material_service.export_all()

@app.post("/import")
def import_data(data: List[Dict] = Body(...)):
    material_service.import_all(data)
    return {"status": "success", "count": len(data)}

# History Endpoint
@app.get("/history")
def get_history():
    return history_service.get_history()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
