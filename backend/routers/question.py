from fastapi import APIRouter, Path, Query
import os
from services.pdf_processor import answer_pdf_question
from utils.context_manager import context_manager
from config.settings import UPLOAD_FOLDER


router = APIRouter(prefix="/question", tags=["Question"])

@router.get("/{pdf_filename}")
async def ask_question(pdf_filename: str = Path(...), question: str = Query(...)):
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)
    answer = await answer_pdf_question(pdf_path, question)
    context_manager.add_to_context(pdf_filename, question, answer)
    context = context_manager.get_context(pdf_filename)
    return {"answer": answer, "context": context}