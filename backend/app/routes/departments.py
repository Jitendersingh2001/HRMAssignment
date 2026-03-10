from fastapi import APIRouter
from app import database

router = APIRouter()


@router.get("/")
async def get_departments():
    cursor = database.db.departments.find({}, {"_id": 0, "name": 1})
    departments = await cursor.to_list(length=100)
    return [dept["name"] for dept in departments]
