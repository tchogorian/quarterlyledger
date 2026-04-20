#!/usr/bin/env python3
"""Fetch price data for tickers that are missing from assets/prices.json."""

import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from pathlib import Path

try:
    import yfinance as yf
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "yfinance", "-q"])
    import yfinance as yf

ROOT = Path(__file__).resolve().parent.parent
PRICES_FILE = ROOT / "assets" / "prices.json"
STOCKS_DIR = ROOT / "stocks"

YAHOO_OVERRIDE = {
    "WED.TO": "WED.TO",
    "DNDCF": "DNDCF",
    "MCKPF": "MCKPF",
    "REINY": "REINY",
}


def get_missing_tickers():
    with open(PRICES_FILE) as f:
        all_prices = json.load(f)
    has_data = set(k for k in all_prices.keys() if k != "no_data")
    missing = []
    for f in sorted(STOCKS_DIR.glob("*.html")):
        tk = f.stem
        if tk not in has_data:
            missing.append(tk)
    return missing, all_prices


def fetch_one(ticker):
    yahoo_sym = YAHOO_OVERRIDE.get(ticker, ticker)
    try:
        end = datetime.now()
        start = end - timedelta(days=420)
        tk = yf.Ticker(yahoo_sym)
        df = tk.history(start=start.strftime("%Y-%m-%d"),
                        end=end.strftime("%Y-%m-%d"),
                        interval="1wk")
        if df.empty:
            return ticker, None
        rows = []
        for idx, row in df.iterrows():
            rows.append({
                "date": idx.strftime("%Y-%m-%d"),
                "o": round(row["Open"], 2),
                "h": round(row["High"], 2),
                "l": round(row["Low"], 2),
                "c": round(row["Close"], 2),
                "v": int(row["Volume"]),
            })
        return ticker, rows
    except Exception as e:
        print(f"  FAIL {ticker}: {e}", file=sys.stderr)
        return ticker, None


def main():
    missing, all_prices = get_missing_tickers()
    print(f"Fetching prices for {len(missing)} missing tickers...")

    no_data = list(all_prices.get("no_data", []))
    fetched = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_one, tk): tk for tk in missing}
        for fut in as_completed(futures):
            tk, candles = fut.result()
            if candles:
                all_prices[tk] = candles
                fetched += 1
                print(f"  OK {tk} ({len(candles)} candles)")
            else:
                if tk not in no_data:
                    no_data.append(tk)
                failed += 1
                print(f"  NO DATA {tk}")

    all_prices["no_data"] = sorted(no_data)

    with open(PRICES_FILE, "w") as f:
        json.dump(all_prices, f, separators=(",", ":"))

    print(f"\nDone: {fetched} fetched, {failed} no data")


if __name__ == "__main__":
    main()
