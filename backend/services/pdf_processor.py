import os
import logging
from langchain_community.vectorstores import FAISS
from langchain_community.chat_models import ChatOllama
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.loader = PyPDFLoader(pdf_path)
        self.documents = self.loader.load()
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        self.chunks = self.text_splitter.split_documents(self.documents)
        self.embedding_model = OllamaEmbeddings(model="nomic-embed-text", base_url="http://host.docker.internal:11434")
        self.vector_db = FAISS.from_documents(self.chunks, self.embedding_model)
        self.retriever = self.vector_db.as_retriever(search_kwargs={"k": 5})
        self.llm = ChatOllama(model="llama3", base_url="http://host.docker.internal:11434")
        self.chain = RetrievalQA.from_chain_type(self.llm, retriever=self.retriever)
    
    def answer_question(self, question: str) -> str:
        try:
            return self.chain.invoke({"query": question})
        except Exception as e:
            logger.error(f"Error answering question: {str(e)}")
            return f"Error answering question: {str(e)}"

async def answer_pdf_question(pdf_path: str, question: str) -> str:
    if not os.path.exists(pdf_path):
        return "PDF not found"
    processor = PDFProcessor(pdf_path)
    return processor.answer_question(question)