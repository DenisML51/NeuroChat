from pydantic import BaseSettings


class Settings(BaseSettings):
    MODEL_USE_CACHE: bool = True
    MODEL_CACHE_IMPLEMENTATION: str = "new"
    MODEL_MAX_TOKENS: int = 2048
    MODEL_TEMPERATURE: float = 0.7
    HF_TOKEN: str = None
    MODEL_DEVICE: str = "auto"