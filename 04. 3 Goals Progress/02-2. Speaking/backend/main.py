from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from typing import List, Dict, Optional

# Import Services
from services.ollama_client import ollama_service
from services.material_service import material_service, Material
from services.expression_service import expression_service, Expression
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
    ai_role: str = "Tutor"
    user_role: str = "Student"
    target_phrases: List[str] = []
    
class MaterialUpdate(BaseModel):
    progress: Dict

class MaterialDetailsUpdate(BaseModel):
    title: str
    content: str
    ai_role: str
    user_role: str
    target_phrases: List[str]

class ExpressionCreate(BaseModel):
    expression: str
    meaning: str
    example: str = ""
    category: str = "expression"

class ExpressionUpdate(BaseModel):
    expression: str
    meaning: str
    example: str = ""
    category: str = "expression"

class MasteryUpdate(BaseModel):
    correct: bool

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
    return material_service.add_material(
        material.title, 
        material.content,
        material.ai_role,
        material.user_role,
        material.target_phrases
    )

@app.get("/materials/{material_id}", response_model=Material)
def get_material(material_id: str):
    material = material_service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@app.put("/materials/{material_id}")
def update_material_details(material_id: str, update: MaterialDetailsUpdate):
    material = material_service.update_material_details(
        material_id,
        update.title,
        update.content,
        update.ai_role,
        update.user_role,
        update.target_phrases
    )
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

# --- Expression Endpoints ---

@app.get("/expressions", response_model=List[Expression])
def get_expressions():
    return expression_service.get_all_expressions()

@app.post("/expressions", response_model=Expression)
def create_expression(expr: ExpressionCreate):
    return expression_service.add_expression(
        expr.expression, expr.meaning, expr.example, expr.category
    )

@app.get("/expressions/due", response_model=List[Expression])
def get_due_expressions():
    """오늘 복습해야 할 표현 목록"""
    return expression_service.get_due_expressions()

@app.get("/expressions/stats")
def get_expression_stats():
    """학습 통계"""
    return expression_service.get_stats()

@app.get("/expressions/{expr_id}", response_model=Expression)
def get_expression(expr_id: str):
    expr = expression_service.get_expression(expr_id)
    if not expr:
        raise HTTPException(status_code=404, detail="Expression not found")
    return expr

@app.put("/expressions/{expr_id}", response_model=Expression)
def update_expression(expr_id: str, update: ExpressionUpdate):
    expr = expression_service.update_expression(
        expr_id, update.expression, update.meaning, update.example, update.category
    )
    if not expr:
        raise HTTPException(status_code=404, detail="Expression not found")
    return expr

@app.put("/expressions/{expr_id}/mastery", response_model=Expression)
def update_mastery(expr_id: str, update: MasteryUpdate):
    """퀴즈 결과에 따라 습득 수준 업데이트"""
    expr = expression_service.update_mastery(expr_id, update.correct)
    if not expr:
        raise HTTPException(status_code=404, detail="Expression not found")
    return expr

@app.delete("/expressions/{expr_id}")
def delete_expression(expr_id: str):
    success = expression_service.delete_expression(expr_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expression not found")
    return {"status": "success"}

# History Endpoint
@app.get("/history")
def get_history():
    return history_service.get_history()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
