import json
import os
from typing import Dict, List, Any
import pandas as pd
import requests


def get_financial_metrics(ticker: str, end_date: str, period: str = 'ttm', limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch financial metrics from cache or API."""
    # Check cache first
    if cached_data := os.getenv(ticker):
        # Filter cached data by date and limit
        filtered_data = [
            metric for metric in cached_data
            if metric["report_period"] <= end_date
        ]
        filtered_data.sort(key=lambda x: x["report_period"], reverse=True)
        if filtered_data:
            return filtered_data[:limit]

    # If not in cache or insufficient data, fetch from API
    headers = {}
    if api_key := os.environ.get("DATASET_API_KEY"):
        headers["X-API-KEY"] = api_key

    url = (
        f"https://api.financialdatasets.ai/financial-metrics/"
        f"?ticker={ticker}"
        f"&report_period_lte={end_date}"
        f"&limit={limit}"
        f"&period={period}"
    )
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(
            f"Error fetching data: {response.status_code} - {response.text}"
        )
    data = response.json()
    financial_metrics = data.get("financial_metrics")
    if not financial_metrics:
        raise ValueError("No financial metrics returned")

    # Cache the results
    os.environ[ticker] = financial_metrics
    return financial_metrics[:limit]


def get_prices(ticker: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    """Fetch price data from cache or API."""
    # Check cache first
    if cached_data := os.getenv(ticker):
        # Filter cached data by date range
        filtered_data = [
            price for price in cached_data
            if start_date <= price["time"] <= end_date
        ]
        if filtered_data:
            return filtered_data

    # If not in cache or no data in range, fetch from API
    headers = {}
    if api_key := os.environ.get("DATASET_API_KEY"):
        headers["X-API-KEY"] = api_key

    url = (
        f"https://api.financialdatasets.ai/prices/"
        f"?ticker={ticker}"
        f"&interval=day"
        f"&interval_multiplier=1"
        f"&start_date={start_date}"
        f"&end_date={end_date}"
    )
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(
            f"Error fetching data: {response.status_code} - {response.text}"
        )
    data = response.json()
    prices = data.get("prices")
    if not prices:
        raise ValueError("No price data returned")

    # set the value to os
    os.environ[ticker] = prices
    return prices


def search_line_items(ticker: str, line_items: List[str], end_date: str, period: str = 'ttm', limit: int = 10
                      ) -> List[Dict[str, Any]]:
    """Fetch line items from cache or API."""
    # Check cache first
    if cached_data := os.getenv(ticker):
        # Filter cached data by date and limit
        filtered_data = [
            item for item in cached_data
            if item["report_period"] <= end_date
        ]
        filtered_data.sort(key=lambda x: x["report_period"], reverse=True)
        if filtered_data:
            return filtered_data[:limit]

    # If not in cache or insufficient data, fetch from API
    headers = {}
    if api_key := os.environ.get("DATASET_API_KEY"):
        headers["X-API-KEY"] = api_key

    url = "https://api.financialdatasets.ai/financials/search/line-items"

    body = {
        "tickers": [ticker],
        "line_items": line_items,
        "end_date": end_date,
        "period": period,
        "limit": limit
    }
    response = requests.post(url, headers=headers, json=body)
    if response.status_code != 200:
        raise Exception(
            f"Error fetching data: {response.status_code} - {response.text}"
        )
    data = response.json()
    search_results = data.get("search_results")
    if not search_results:
        raise ValueError("No search results returned")

    # Cache the results
    os.environ[ticker] = search_results
    return search_results[:limit]


def get_insider_trades(ticker: str, end_date: str, limit: int = 1000) -> List[Dict[str, Any]]:
    """Fetch insider trades from cache or API."""
    # Check cache first
    if cached_data := os.getenv(ticker):
        # Filter cached data by date and limit
        filtered_data = [
            trade for trade in cached_data
            if (trade.get("transaction_date") or trade["filing_date"]) <= end_date
        ]
        # Sort by transaction_date if available, otherwise filing_date
        filtered_data.sort(
            key=lambda x: x.get("transaction_date") or x["filing_date"],
            reverse=True
        )
        if filtered_data:
            return filtered_data[:limit]

    # If not in cache or insufficient data, fetch from API
    headers = {}
    if api_key := os.environ.get("DATASET_API_KEY"):
        headers["X-API-KEY"] = api_key

    url = (
        f"https://api.financialdatasets.ai/insider-trades/"
        f"?ticker={ticker}"
        f"&filing_date_lte={end_date}"
        f"&limit={limit}"
    )
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(
            f"Error fetching data: {response.status_code} - {response.text}"
        )
    data = response.json()
    insider_trades = data.get("insider_trades")
    if not insider_trades:
        raise ValueError("No insider trades returned")

    # Cache the results
    os.environ[ticker] = insider_trades

    return insider_trades[:limit]


def get_market_cap(ticker: str, end_date: str) -> List[Dict[str, Any]]:
    """Fetch market cap from the API."""
    financial_metrics = get_financial_metrics(ticker, end_date)
    market_cap = financial_metrics[0].get('market_cap')
    if not market_cap:
        raise ValueError("No market cap returned")

    return market_cap


def prices_to_df(prices: List[Dict[str, Any]]) -> pd.DataFrame:
    """Convert prices to a DataFrame."""
    df = pd.DataFrame(prices)
    df["Date"] = pd.to_datetime(df["time"])
    df.set_index("Date", inplace=True)
    numeric_cols = ["open", "close", "high", "low", "volume"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df.sort_index(inplace=True)
    return df


# Update the get_price_data function to use the new functions
def get_price_data(ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
    prices = get_prices(ticker, start_date, end_date)
    return prices_to_df(prices)

