from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/smart_dashboard"
    openai_api_key: str = ""
    openai_base_url: str = ""
    openai_model: str = "meta/llama-3.1-70b-instruct"
    cors_origins: str = "http://localhost:5173"


    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
