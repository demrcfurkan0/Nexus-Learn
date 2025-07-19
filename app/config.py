from pydantic_settings import BaseSettings
from typing import Optional 

class Settings(BaseSettings):
    MONGO_DETAILS: str

    GEMINI_API_KEY: Optional[str] = None
    JWT_SECRET_KEY: str 


    class Config:
        env_file = ".env"

settings = Settings()