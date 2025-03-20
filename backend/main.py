from fastapi import FastAPI, File, UploadFile, Path, Query, Form, APIRouter
from fastapi.responses import JSONResponse
import os
import logging
from langchain_community.vectorstores import FAISS
from langchain_community.chat_models import ChatOllama
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from fastapi.middleware.cors import CORSMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the FastAPI application
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change "*" to specific domains if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define upload folder
UPLOAD_FOLDER = 'uploads'

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Define a router for PDF-related endpoints
pdf_router = APIRouter(prefix="/pdf", tags=["PDF"])

# Define a router for question-related endpoints
question_router = APIRouter(prefix="/question", tags=["Question"])

# Context manager to store previous questions and answers
class ContextManager:
    def __init__(self):
        self.context = {}

    def add_to_context(self, pdf_filename, question, answer):
        if pdf_filename not in self.context:
            self.context[pdf_filename] = []
        self.context[pdf_filename].append({"question": question, "answer": answer})

    def get_context(self, pdf_filename):
        return self.context.get(pdf_filename, [])

context_manager = ContextManager()

# Advanced PDFProcessor class
class PDFProcessor:
    def __init__(self, pdf_path: str):
        """
        Initializes the PDFProcessor with a PDF path.
        
        :param pdf_path: Path to the PDF file.
        """
        self.pdf_path = pdf_path
        self.loader = PyPDFLoader(pdf_path)
        try:
            self.documents = self.loader.load()
        except Exception as e:
            logger.error(f"Error loading PDF: {str(e)}")
            raise
        
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        self.chunks = self.text_splitter.split_documents(self.documents)
        
        self.embedding_model = OllamaEmbeddings(model="nomic-embed-text", base_url="http://host.docker.internal:11434")
        try:
            self.vector_db = FAISS.from_documents(self.chunks, self.embedding_model)
        except Exception as e:
            logger.error(f"Error creating vector database: {str(e)}")
            raise
        
        self.retriever = self.vector_db.as_retriever(search_kwargs={"k": 5})
        self.llm = ChatOllama(model="llama3", base_url="http://host.docker.internal:11434")
        self.chain = RetrievalQA.from_chain_type(self.llm, retriever=self.retriever)
 
    def answer_question(self, question: str) -> str:
        """
        Answers a question based on the content of the PDF.
        
        :param question: The question to be answered.
        :return: The answer to the question.
        """
        try:
            retrieved_docs = self.retriever.get_relevant_documents(question)
            logger.info(f"Retrieved {len(retrieved_docs)} documents for question: {question}")
            print("\n--- Retrieved Documents ---")
            for idx, doc in enumerate(retrieved_docs):
                print(f"Chunk {idx + 1}: {doc.page_content[:500]}")  # Show first 500 characters
            answer = self.chain.invoke({"query": question})
            return answer
        except Exception as e:
            logger.error(f"Error answering question: {str(e)}")
            return f"Error answering question: {str(e)}"

# Function to answer a question based on a PDF
async def answer_pdf_question(pdf_path: str, question: str) -> str:
    if not os.path.exists(pdf_path):
        logger.warning(f"PDF not found: {pdf_path}")
        return "PDF not found"
    
    if not question.strip():
        logger.warning("Question cannot be empty")
        return "Question cannot be empty"
    
    try:
        processor = PDFProcessor(pdf_path)
        answer = processor.answer_question(question)
        logger.info(f"Question answered for PDF: {pdf_path}")
        return answer
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        return f"Error answering question: {str(e)}"

# Route for answering questions based on a PDF
@question_router.get("/{pdf_filename}")
async def ask_question(pdf_filename: str = Path(...), question: str = Query(...)):
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)
    answer = await answer_pdf_question(pdf_path, question)
    
    # Add to context
    context_manager.add_to_context(pdf_filename, question, answer)
    
    # Return context along with the answer
    context = context_manager.get_context(pdf_filename)
    return JSONResponse(content={"answer": answer, "context": context}, status_code=200)

# Route for uploading PDFs
@pdf_router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), question: str = Form(...)):
    if not file.filename.endswith(".pdf"):
        logger.warning("Invalid file type")
        return JSONResponse(content={"message": "Invalid file type"}, status_code=400)
    
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    try:
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        
        logger.info(f"PDF uploaded successfully: {file.filename}")
        
        # Call the function to summarize the PDF
        summary_question = "Summarize the PDF."
        summary = await answer_pdf_question(file_path, summary_question)
        
        logger.info(f"PDF summarized: {file.filename}")
        
        # Add summary to context
        context_manager.add_to_context(file.filename, summary_question, summary)
        
        return JSONResponse(content={"message": "PDF uploaded and summarized successfully", 
                                     "filename": file.filename, 
                                     "summary": summary}, status_code=200)
    
    except Exception as e:
        logger.error(f"Error uploading PDF: {str(e)}")
        return JSONResponse(content={"message": f"Error uploading PDF: {str(e)}"}, status_code=500)

# Include routers in the main application
app.include_router(pdf_router)
app.include_router(question_router)

# Optional: Health check endpoint
@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "OK"}, status_code=200)
