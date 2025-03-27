from fastapi import FastAPI
from src.api.routes import router as api_router
import mlflow

mlflow.set_tracking_uri("http://localhost:5000")

app = FastAPI(title="LLM Chat API with MLFlow Logging")

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
