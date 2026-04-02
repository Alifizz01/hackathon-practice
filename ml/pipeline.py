"""Anomaly detection pipeline skeleton."""

import pandas as pd


def load_data(path: str) -> pd.DataFrame:
    """Load dataset from path."""
    return pd.read_csv(path)


def detect_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    """Run anomaly detection on the dataframe. TODO: implement."""
    raise NotImplementedError("Anomaly detection not yet implemented")
