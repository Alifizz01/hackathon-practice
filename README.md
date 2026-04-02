# hackathon-practice

Hands-on hackathon prep — building full-stack data monitoring projects to practice rapid prototyping, Git workflow, and team collaboration.

## Project Structure

```
hackathon-practice/
├── api/           ← FastAPI backend
├── ml/            ← anomaly detection pipeline
├── dashboard/     ← interactive dashboard (Streamlit)
├── data/          ← raw & processed data (gitignored)
├── notebooks/     ← EDA notebooks
└── docs/          ← data sources, git workflow
```

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd hackathon-practice

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 5. Run the API
uvicorn api.main:app --reload
```

## Team

| Name | Role | GitHub |
|------|------|--------|
|      |      |        |
