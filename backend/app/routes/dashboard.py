from fastapi import APIRouter
from app import database
from datetime import datetime, timezone

router = APIRouter()


@router.get("/summary")
async def dashboard_summary():
    # Total employees
    total_employees = await database.db.employees.count_documents({})

    # Total departments
    total_departments = await database.db.departments.count_documents({})

    # Department-wise employee count
    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    dept_counts = []
    async for doc in database.db.employees.aggregate(pipeline):
        dept_counts.append({"department": doc["_id"], "count": doc["count"]})

    # Today's attendance
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_present = await database.db.attendance.count_documents(
        {"date": today_str, "status": "Present"}
    )
    today_absent = await database.db.attendance.count_documents(
        {"date": today_str, "status": "Absent"}
    )

    # Recent 5 attendance records
    recent_records = []
    cursor = database.db.attendance.find({}).sort("date", -1).limit(5)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        recent_records.append(doc)

    return {
        "total_employees": total_employees,
        "total_departments": total_departments,
        "department_counts": dept_counts,
        "today_present": today_present,
        "today_absent": today_absent,
        "recent_records": recent_records,
    }
