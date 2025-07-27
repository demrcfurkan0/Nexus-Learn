import motor.motor_asyncio
from .config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)
database = client.nexus_db

roadmap_collection = database.get_collection("roadmaps")
user_collection = database.get_collection("users")
challenge_collection = database.get_collection("challenges")
interview_collection = database.get_collection("interviews")
flashcard_collection = database.get_collection("flashcards")
assessment_collection = database.get_collection("assessments")

async def create_indexes():
    await user_collection.create_index("email", unique=True)