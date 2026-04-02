from fastapi import FastAPI

app = FastAPI(title="Hackathon Practice API")


@app.get("/health")
def health_check():
    return {"status": "ok"}
