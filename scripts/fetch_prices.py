#!/usr/bin/env python3
"""
Fetch real weekly OHLCV candles for every ticker in Universe_Categorized.json
via yfinance. Writes assets/prices.json for the frontend chart renderer.
"""

import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

try:
    import yfinance as yf
except ImportError:
    print("Installing yfinance...")
    os.system(f"{sys.executable} -m pip install yfinance -q")
    import yfinance as yf

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUT_FILE = ROOT / "assets" / "prices.json"

YAHOO_OVERRIDE = {
    "EXOSF": "EXXRF",
    "BLX.TO": "BLX.TO",
    "POW.TO": "POW.TO",
    "ONEX.TO": "ONEX.TO",
    "WED.TO": "WED.TO",
    "FI": "FISV",
}

KNOWN_DELISTED = {
    "ATMC", "BFZ", "BIGZ", "DNDCF", "DYNX", "K", "KLG",
    "MCKPF", "PARH", "REINY", "TWNP", "_NOTES_",
}


def load_tickers():
    with open(DATA_DIR / "Universe_Categorized.json") as f:
        cats = json.load(f)
    tickers = set()
    for cat in cats.values():
        for item in cat.get("items", []):
            tk = item.get("ticker", "").strip()
            if tk and tk not in KNOWN_DELISTED:
                tickers.add(tk)
    return sorted(tickers)


def fetch_one(ticker: str) -> tuple:
    symbol = YAHOO_OVERRIDE.get(ticker, ticker)
    try:
        df = yf.download(
            symbol, period="14mo", interval="1wk",
            auto_adjust=True, progress=False, threads=False,
        )
        if df is None or df.empty:
            return ticker, None

        # Handle MultiIndex columns from yfinance
        if hasattr(df.columns, 'levels'):
            df.columns = df.columns.get_level_values(0)

        candles = []
        for date, row in df.iterrows():
            candles.append({
                "date": date.strftime("%Y-%m-%d"),
                "o": round(float(row["Open"]), 2),
                "h": round(float(row["High"]), 2),
                "l": round(float(row["Low"]), 2),
                "c": round(float(row["Close"]), 2),
                "v": int(row["Volume"]) if row["Volume"] == row["Volume"] else 0,
            })
        return ticker, candles
    except Exception as e:
        print(f"  FAIL {ticker} ({symbol}): {e}", file=sys.stderr)
        return ticker, None


def main():
    tickers = load_tickers()
    print(f"Fetching {len(tickers)} tickers (skipping {len(KNOWN_DELISTED)} delisted)...")

    results = {}
    no_data = list(KNOWN_DELISTED - {"_NOTES_"})
    done = 0

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(fetch_one, tk): tk for tk in tickers}
        for future in as_completed(futures):
            tk, candles = future.result()
            done += 1
            if candles:
                results[tk] = candles
                if done % 25 == 0 or done == len(tickers):
                    print(f"  [{done}/{len(tickers)}] {tk}: {len(candles)} candles")
            else:
                no_data.append(tk)
                print(f"  [{done}/{len(tickers)}] {tk}: NO DATA")

    output = {"no_data": sorted(set(no_data)), **{k: results[k] for k in sorted(results)}}

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w") as f:
        json.dump(output, f, separators=(",", ":"))

    size_mb = OUT_FILE.stat().st_size / (1024 * 1024)
    print(f"\nDone. {len(results)} tickers with data, {len(no_data)} no-data.")
    print(f"Written to {OUT_FILE} ({size_mb:.1f} MB)")

    # Verify TVTX
    if "TVTX" in results:
        last = results["TVTX"][-1]
        print(f"TVTX last candle: {last}")


if __name__ == "__main__":
    main()
