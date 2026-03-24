---
description: Code examples for Backend Pydantic models and FastAPI routes.
---

# 后端示例

## Pydantic V2 Model

```python
from pydantic import BaseModel, ConfigDict

class UserDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str | None = None
```

## FastAPI 路由

```python
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from core.deps import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

@router.get("/items/{item_id}")
async def read_item(
    item_id: int,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    item = await service.get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```
