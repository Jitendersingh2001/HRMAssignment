from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    PROJECT_NAME: str = "HRMS-Lite"
    MONGODB_URI: str = "mongodb://mongodb:27017"
    DATABASE_NAME: str = "hrms_lite"
    ALLOWED_ORIGINS: str = "*"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
