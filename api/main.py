from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import datetime

app = FastAPI(title="Hackathon Practice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_TOKEN = "5o7M8JI2dsqF83M91PTwmxIJIOxX0q7+VXduJQi9iqZTidHs/KxbXsMETMUoStDlnhSwX0zqHmqilkGXx6UgGrZtKtfyQneSApvpd+cjXHw70m4mnPT8Ym2feaZMncFU"
QUERY_URL = "https://api.gridradar.net/query"

# --- CRITICAL: Move this OUTSIDE the function so it stays in memory ---
recent_readings = []

@app.get("/status")
def get_grid_status():
    try:
        payload = {"metric": "frequency-ucte-median-1s", "format": "json"}
        headers = {"Content-type": "application/json", "Authorization": f"Bearer {API_TOKEN}"}
        
        response = requests.post(QUERY_URL, json=payload, headers=headers)
        if response.status_code != 200:
            return {"error": "API Error", "detail": response.text}

        data = response.json()
        latest_reading = data[0]['datapoints'][-1]
        freq_value = latest_reading[0]
        timestamp = latest_reading[1]

        # Add to memory
        recent_readings.append(freq_value)
        if len(recent_readings) > 20: recent_readings.pop(0)

        
        return {
            "value": freq_value,
            "timestamp": timestamp
        }
    except Exception as e:
        return {"error": "Connection Failed", "detail": str(e)}