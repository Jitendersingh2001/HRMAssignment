from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import employees, attendance, departments, dashboard
from app.database import connect_to_mongo, close_mongo_connection
from app.core.config import settings
app = FastAPI(title="HRMS-Lite API")


origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    employees.router,
    prefix="/api/employees",
    tags=["employees"],
)
app.include_router(
    attendance.router,
    prefix="/api/attendance",
    tags=["attendance"],
)
app.include_router(
    departments.router,
    prefix="/api/departments",
    tags=["departments"],
)
app.include_router(
    dashboard.router,
    prefix="/api/dashboard",
    tags=["dashboard"],
)


@app.on_event("startup")
def startup_db_client():
    connect_to_mongo()


@app.on_event("shutdown")
def shutdown_db_client():
    close_mongo_connection()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
