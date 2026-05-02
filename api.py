from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from final_assessment import PregaCareFinalAssessment
from pregacare_engine import PregaCareAIEngine

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PregaCare REST API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PregaCare Components
assessor = PregaCareFinalAssessment()
engine = PregaCareAIEngine()

# --- Request/Response Models ---
class PatientVitals(BaseModel):
    Age: float
    SystolicBP: float
    DiastolicBP: float
    BS: float
    BodyTemp: float
    HeartRate: float

class AssessmentRequest(BaseModel):
    vitals: PatientVitals
    district: str
    state: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_query: str
    assessment_report: dict
    chat_history: Optional[List[ChatMessage]] = []

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": assessor.clinical_pipeline.model is not None}

@app.post("/assess")
def get_assessment(data: AssessmentRequest):
    try:
        # Use model_dump() for Pydantic v2 compatibility
        vitals_dict = data.vitals.model_dump()
        report = assessor.perform_assessment(vitals_dict, data.district, data.state)
        if "error" in report:
            raise HTTPException(status_code=400, detail=report["error"])
        return report
    except Exception as e:
        print(f"ASSESS ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat_with_ai(data: ChatRequest):
    try:
        # Convert Pydantic models to dicts for the engine
        history = [msg.model_dump() for msg in data.chat_history] if data.chat_history else []
        response = engine.generate_response(data.user_query, data.assessment_report, history)
        return {"response": response}
    except Exception as e:
        print(f"CHAT ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
