from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router as api_router
from src.monitoring.prometheus_metrics import (
    prometheus_middleware, 
    metrics_endpoint, 
    start_mongodb_monitoring_thread
)

app = FastAPI(title="NeuroChat Backend with Monitoring")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(prometheus_middleware)
app.include_router(api_router, prefix="/api")

app.add_api_route("/metrics", metrics_endpoint)

@app.on_event("startup")
async def startup_event():
    start_mongodb_monitoring_thread()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
