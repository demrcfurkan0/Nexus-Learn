from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import roadmaps, auth
from .database import create_indexes # YENİ
from .routers import roadmaps, auth, challenges, interviews, flashcards, assessments



app = FastAPI(title="Nexus AI Learning Backend")

# Frontend'den gelen isteklere izin vermek için CORS ayarları
origins = [
    "http://localhost:5173", # Varsayılan Vite portu
    "http://localhost:3000", # Varsayılan Create React App portu
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotaları uygulamaya dahil et
app.include_router(roadmaps.router)
app.include_router(challenges.router) 

@app.on_event("startup")
async def startup_db_client():
    await create_indexes()
app.include_router(auth.router) # Yeni auth rotalarını ekle

@app.get("/")
def read_root():
    return {"message": "Welcome to the Nexus Backend!"}