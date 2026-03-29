import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://iam_user:iam_password@localhost:5432/iam_governance"
)

# API
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))

# Analysis Engine
CLUSTERING_METHOD = "hierarchical"  # hierarchical, dbscan
CLUSTER_MIN_SIZE = 1
CLUSTER_THRESHOLD = 0.7  # 70% for core permissions

# Risk Scoring Weights
RISK_WEIGHTS = {
    "sensitivity": 0.4,
    "infrequency": 0.3,
    "peer_deviation": 0.2,
    "recency": 0.1
}

# Recency Decay (days)
RECENCY_HALFLIFE = 30

# Outlier Detection
OUTLIER_FREQUENCY_PERCENTILE = 10
OUTLIER_DAYS_THRESHOLD = 90

# MVP Features
DEBUG_MODE = os.getenv("DEBUG", "false").lower() == "true"
