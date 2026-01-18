
from fastapi import FastAPI
from routes import affiliates, booking, ai

app = FastAPI()
app.include_router(affiliates.router)
app.include_router(booking.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"status": "GolfSnap Backend Running"}
