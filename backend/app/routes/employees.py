from fastapi import APIRouter, HTTPException, status
from app.models.employee import EmployeeCreate, EmployeeResponse
from app import database
from datetime import datetime, timezone
from pymongo.errors import DuplicateKeyError

router = APIRouter()


@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Employee ID or Email already exists"
        }
    },
)
async def create_employee(employee: EmployeeCreate):
    employee_dict = employee.model_dump()
    employee_dict["created_at"] = datetime.now(timezone.utc)

    try:
        # Check if employee_id already exists manually as well for clearer error message
        # (Though we'll also rely on a MongoDB unique index later)
        existing_emp = await database.db.employees.find_one(
            {"employee_id": employee.employee_id}
        )
        if existing_emp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this ID already exists.",
            )

        # Check email uniqueness
        existing_email = await database.db.employees.find_one({"email": employee.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee with this email already exists.",
            )

        # Check phone uniqueness
        if employee.phone:
            existing_phone = await database.db.employees.find_one(
                {"phone": employee.phone}
            )
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Employee with this phone number already exists.",
                )

        result = await database.db.employees.insert_one(employee_dict)

        # Fetch the created document to return
        created_employee = await database.db.employees.find_one(
            {"_id": result.inserted_id}
        )

        # Convert ObjectId back to string for Pydantic
        created_employee["_id"] = str(created_employee["_id"])

        return created_employee

    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate key error. Employee ID or Email already exists.",
        )


@router.get("/", response_model=list[EmployeeResponse])
async def list_employees():
    employees = []
    # Find all, sort by created_at descending
    cursor = database.db.employees.find({}).sort("created_at", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])
        employees.append(document)
    return employees


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
    responses={status.HTTP_404_NOT_FOUND: {"description": "Employee not found"}},
)
async def get_employee(employee_id: str):
    employee = await database.db.employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found",
        )
    employee["_id"] = str(employee["_id"])
    return employee


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={status.HTTP_404_NOT_FOUND: {"description": "Employee not found"}},
)
async def delete_employee(employee_id: str):
    delete_result = await database.db.employees.delete_one({"employee_id": employee_id})

    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found",
        )

    # Also delete associated attendance records
    await database.db.attendance.delete_many({"employee_id": employee_id})

    return None
