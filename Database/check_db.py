import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["submission_system"]
    users = await db.users.find().to_list(100)
    submissions = await db.submissions.find().to_list(100)
    print("Users:", users)
    print("Submissions:", submissions)

if __name__ == "__main__":
    asyncio.run(check_db())
