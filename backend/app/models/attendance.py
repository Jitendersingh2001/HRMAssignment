from pydantic import BaseModel, Field
from typing import Literal
import datetime


class AttendanceBase(BaseModel):
    employee_id: str = Field(
        ..., description="Employee ID associated with the attendance record"
    )
    date: datetime.date = Field(..., description="Date of attendance")
    status: Literal["Present", "Absent"] = Field(..., description="Attendance status")


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "60d5ecb54f6c4424340d898b",
                "employee_id": "EMP123",
                "date": "2023-11-20",
                "status": "Present",
            }
        }
