import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient


async def init_indexes():
    # Use environment variable or fallback to localhost
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(uri)
    db = client["hrms_lite"]

    print("Creating indexes...")

    # Ensure employee_id is unique
    await db.employees.create_index("employee_id", unique=True)
    # Ensure email is unique
    await db.employees.create_index("email", unique=True)
    # Ensure composite uniqueness of employee_id + date for attendance
    await db.attendance.create_index([("employee_id", 1), ("date", 1)], unique=True)

    print("Indexes created successfully.")
    client.close()


if __name__ == "__main__":
    asyncio.run(init_indexes())
