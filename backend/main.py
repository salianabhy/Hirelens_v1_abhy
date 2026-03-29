from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import io
import traceback
from services.nlp_engine import rank_resume

app = FastAPI(title="Resumeit ATS ML Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoreRequest(BaseModel):
    text: str
    job_description: str = ""

@app.get("/")
def root():
    return {"message": "Resumeeit ML API is Online"}

@app.get("/health")
def health():
    return {"status": "ok", "message": "ML ATS Engine is running natively!"}

@app.post("/api/score-resume")
async def score_resume(request: ScoreRequest):
    try:
        result = rank_resume(request.text, request.job_description)
        return {"success": True, "data": result}
    except Exception as e:
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}

@app.post("/api/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    text = ""
    try:
        content = await file.read()
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return {"success": True, "text": text}
    except Exception as e:
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}
