import motor.motor_asyncio
from .config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)
database = client.nexus_db # Veritabanı adı: nexus_db

# Collection'lara kolay erişim için
roadmap_collection = database.get_collection("roadmaps")
user_collection = database.get_collection("users")
challenge_collection = database.get_collection("challenges")


async def create_indexes():
    await user_collection.create_index("email", unique=True)