from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class EmployeeBase(BaseModel):
    employee_id: str = Field(..., description="Unique Employee ID", pattern=r"^EMP\d+$")
    full_name: str = Field(..., min_length=2, max_length=100, pattern=r"^[A-Za-z\s]+$")
    email: EmailStr
    phone: Optional[str] = Field(
        default=None, description="Phone number", pattern=r"^\+?[0-9]{10,15}$"
    )
    department: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Department name",
        pattern=r"^[A-Za-z\s]+$",
    )


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: str = Field(..., alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "60d5ecb54f6c4424340d898a",
                "employee_id": "EMP123",
                "full_name": "Jane Doe",
                "email": "jane@example.com",
                "phone": "+1234567890",
                "department": "Engineering",
                "created_at": "2023-11-20T10:00:00.000Z",
            }
        }
