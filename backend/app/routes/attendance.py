from fastapi import APIRouter, HTTPException, Query, status
from app.models.attendance import AttendanceCreate, AttendanceResponse
from app import database
from typing import Optional

EMPLOYEE_NOT_FOUND_MSG = "Employee not found"

router = APIRouter()


@router.post(
    "/",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_404_NOT_FOUND: {"description": EMPLOYEE_NOT_FOUND_MSG},
        status.HTTP_400_BAD_REQUEST: {"description": "Attendance already marked"},
    },
)
async def mark_attendance(attendance: AttendanceCreate):
    # Check if employee exists
    employee = await database.db.employees.find_one(
        {"employee_id": attendance.employee_id}
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=EMPLOYEE_NOT_FOUND_MSG
        )

    attendance_dict = attendance.model_dump()

    # Store date as string for easier querying or ISODate depending on preference.
    # Pydantic date model_dump converts to string by default YYYY-MM-DD
    attendance_dict["date"] = str(attendance_dict["date"])

    # Check if attendance is already marked for this employee on this date
    existing_attendance = await database.db.attendance.find_one(
        {"employee_id": attendance.employee_id, "date": attendance_dict["date"]}
    )

    if existing_attendance:
        # Update existing instead of simple reject? Or reject depending on requirement?
        # "Mark attendance for an employee" - if already marked, maybe reject with 400
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance already marked for this employee on this date.",
        )

    result = await database.db.attendance.insert_one(attendance_dict)

    created_attendance = await database.db.attendance.find_one(
        {"_id": result.inserted_id}
    )
    created_attendance["_id"] = str(created_attendance["_id"])

    return created_attendance


@router.get(
    "/",
    response_model=list[AttendanceResponse],
)
async def get_all_attendance(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    query = {}
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["date"] = date_filter

    records = []
    cursor = database.db.attendance.find(query).sort("date", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        records.append(document)

    return records


@router.get(
    "/{employee_id}",
    response_model=list[AttendanceResponse],
    responses={status.HTTP_404_NOT_FOUND: {"description": EMPLOYEE_NOT_FOUND_MSG}},
)
async def view_attendance(
    employee_id: str,
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    employee = await database.db.employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )

    query = {"employee_id": employee_id}
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["date"] = date_filter

    records = []
    cursor = database.db.attendance.find(query).sort("date", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        records.append(document)

    return records


@router.get(
    "/{employee_id}/summary",
    responses={status.HTTP_404_NOT_FOUND: {"description": EMPLOYEE_NOT_FOUND_MSG}},
)
async def attendance_summary(employee_id: str):
    employee = await database.db.employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=EMPLOYEE_NOT_FOUND_MSG
        )

    total_present = await database.db.attendance.count_documents(
        {"employee_id": employee_id, "status": "Present"}
    )
    total_absent = await database.db.attendance.count_documents(
        {"employee_id": employee_id, "status": "Absent"}
    )
    total_records = total_present + total_absent

    return {
        "employee_id": employee_id,
        "total_present": total_present,
        "total_absent": total_absent,
        "total_records": total_records,
    }
