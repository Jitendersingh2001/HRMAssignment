from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
db = None


def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]
    print(f"Connected to MongoDB at {settings.MONGODB_URI}")

    # ---------------------------------------------------------
    # Auto-seed required default departments for Dropdown Data
    # ---------------------------------------------------------
    required_departments = [
        {"name": "IT"},
        {"name": "HR"},
        {"name": "Marketing"},
        {"name": "Business Analyst"},
        {"name": "Project Manager"},
    ]

    try:
        # Create a unique index on 'name' to prevent accidental duplicates upon repeated startups
        db.departments.create_index("name", unique=True)

        for dept in required_departments:
            db.departments.update_one(
                {"name": dept["name"]}, {"$setOnInsert": dept}, upsert=True
            )
        print("Required departments seeded successfully.")
    except Exception as e:
        print(f"Error seeding departments: {e}")


def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")
