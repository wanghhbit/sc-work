from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class Response(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None

class PaginatedResponse(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[list[T]] = None
    total: int = 0
    page: int = 1
    page_size: int = 10
