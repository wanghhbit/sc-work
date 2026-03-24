import uvicorn
from init_data import init_data
import asyncio

if __name__ == "__main__":
    asyncio.run(init_data())
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
