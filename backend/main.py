from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import pdf, question


def create_app():
    app = FastAPI()
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(pdf.router)
    app.include_router(question.router)
    
    return app

app = create_app()

@app.get("/health")
async def health_check():
    return {"status": "OK"}