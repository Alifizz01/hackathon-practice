import requests
import dotenv

dotenv.load_dotenv()

BASE_URL = "https://api.gridradar.net"


def get_headers() -> dict:
    token = dotenv.get_key(dotenv.find_dotenv(), "GRIDRADAR_API_TOKEN")
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def query(
    metric: str = "frequency-ucte-median-1s",
    aggr: str = "1s",
    fmt: str = "json",
    ts: str = "rfc3339",
    from_: str | None = None,
    to: str | None = None,
) -> dict:
    payload = {"metric": metric, "format": fmt, "ts": ts, "aggr": aggr}

    if from_:
        payload["from"] = from_
    if to:
        payload["to"] = to

    response = requests.post(
        f"{BASE_URL}/query",
        headers=get_headers(),
        json=payload,
    )
    response.raise_for_status()
    return response.json()


def get_formats() -> dict:
    response = requests.post(f"{BASE_URL}/formats", headers=get_headers())
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    data = query(metric="frequency-ucte-median-1s", aggr="1s")
    print(data)