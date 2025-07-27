from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_indexes
from .routers import roadmaps, challenges, interviews, flashcards, assessments
from . import security # security.py'yi import ediyoruz

app = FastAPI(title="Nexus AI Learning Backend")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(security.router) # security.router'ı ekliyoruz
app.include_router(roadmaps.router)
app.include_router(challenges.router)
app.include_router(interviews.router)
app.include_router(flashcards.router)
app.include_router(assessments.router)

@app.on_event("startup")
async def startup_db_client():
    await create_indexes()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Nexus Backend!"}