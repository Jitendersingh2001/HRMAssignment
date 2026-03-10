from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "HRMS-Lite"
    MONGODB_URI: str = "mongodb://mongodb:27017"
    DATABASE_NAME: str = "hrms_lite"
    API_TOKEN: str = "admin123-token"
    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"


settings = Settings()
