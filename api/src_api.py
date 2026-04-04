from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import json  # Required for saving files

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_TOKEN = "Zd2lvI+1fMlnrA0Re3IQ8VIz2SkYAqmqedTN7gGD8ReOTYGMEa5qk3qOX4Wrijy6d2M2l4iBI1uOcnpXKu/qnm7pPap5BH6uH946a6sEtQPqlludQc0gv4U/5V5tEotC"
QUERY_URL = "https://api.gridradar.net/query"
PAYLOAD = {"metric": "frequency-ucte-median-1s", "format": "json", "ts": "rfc3339", "aggr": "1s"}
HEADERS = {"Content-type": "application/json", "Authorization": f"Bearer {API_TOKEN}"}

# Cache variables to prevent 429 errors
last_valid_data = None
last_fetch_time = 0

@app.get("/status")
def get_grid_status():
    global last_valid_data, last_fetch_time
    current_time = time.time()

    # Use cache if we are within the 15-second limit
    if last_valid_data and (current_time - last_fetch_time) < 15:
        return {**last_valid_data, "source": "cache"}

    try:
        response = requests.post(QUERY_URL, json=PAYLOAD, headers=HEADERS)
        
        if response.status_code == 200:
            data = response.json()
            latest = data[0]['datapoints'][-1]
            
            # Prepare the data package
            last_valid_data = {
                "value": latest[0],
                "timestamp": latest[1],
                "status": "STABLE" if 49.95 < latest[0] < 50.05 else "WARNING",
                "region": "Central Europe"
            }
            last_fetch_time = current_time

            # --- THE LOGGING BLOCK ---
            # 'a' means APPEND (add to the end of the file)
            with open("grid_history_log.json", "a") as f:
                f.write(json.dumps(last_valid_data) + "\n")
            # -------------------------

            return {**last_valid_data, "source": "live"}
        
        return last_valid_data if last_valid_data else {"error": "API Cooldown"}

    except Exception as e:
        return {"error": "Connection Failed", "detail": str(e)}
