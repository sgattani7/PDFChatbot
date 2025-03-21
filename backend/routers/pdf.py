from fastapi import APIRouter, File, UploadFile, Form
import os
from services.pdf_processor import answer_pdf_question
from utils.context_manager import context_manager
from config.settings import UPLOAD_FOLDER


from config.settings import UPLOAD_FOLDER

router = APIRouter(prefix="/pdf", tags=["PDF"])

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), question: str = Form(...)):
    if not file.filename.endswith(".pdf"):
        return {"message": "Invalid file type"}
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    
    summary = await answer_pdf_question(file_path, "Summarize the PDF.")
    context_manager.add_to_context(file.filename, "Summarize the PDF.", summary)
    
    return {"message": "PDF uploaded and summarized successfully", "filename": file.filename, "summary": summary}