#!/usr/bin/env python3
"""
fetch-prices.py — pull weekly OHLC for every ticker in tearsheets-real.json
                  and emit assets/prices.json for the client-side chart.

Provider precedence (first one with a key set wins):
    1. Tiingo     (env: TIINGO_TOKEN)
    2. Polygon    (env: POLYGON_API_KEY)
    3. yfinance   (fallback, unauthenticated — slow but works)

Output shape — assets/prices.json:
{
  "CIX": {
    "candles": [[iso_date, o, h, l, c], ...],   # 60-70 weekly bars
    "stats":   { "high_52w": n, "low_52w": n, "ytd_pct": n, "yr_pct": n }
  },
  ...
}

Usage:
    export TIINGO_TOKEN=...
    python3 fetch-prices.py                       # all tickers
    python3 fetch-prices.py CIX CURB VEEV         # subset
    python3 fetch-prices.py --since 2024-11-01    # custom start
"""

import argparse
import json
import os
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).parent
SRC  = ROOT / "tearsheets-real.json"
OUT  = ROOT / "assets" / "prices.json"
DEFAULT_SINCE = (date.today() - timedelta(days=500)).isoformat()


# ── Provider shims ────────────────────────────────────────────────────────

def _get_json(url, headers=None):
    req = Request(url, headers=headers or {})
    with urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def fetch_tiingo(ticker, since, token):
    url = "https://api.tiingo.com/tiingo/daily/" + ticker + "/prices?" + urlencode({
        "startDate": since, "resampleFreq": "weekly", "token": token,
    })
    data = _get_json(url, {"Content-Type": "application/json"})
    return [(d["date"][:10], d["open"], d["high"], d["low"], d["close"]) for d in data]


def fetch_polygon(ticker, since, key):
    today = date.today().isoformat()
    url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/week/{since}/{today}?adjusted=true&sort=asc&apiKey={key}"
    data = _get_json(url)
    out = []
    for c in data.get("results", []):
        iso = datetime.utcfromtimestamp(c["t"] / 1000).date().isoformat()
        out.append((iso, c["o"], c["h"], c["l"], c["c"]))
    return out


def fetch_yfinance(ticker, since):
    # Lazy import so the script runs without yfinance installed when using APIs.
    import yfinance as yf  # noqa
    df = yf.Ticker(ticker).history(start=since, interval="1wk", auto_adjust=False)
    out = []
    for ts, row in df.iterrows():
        out.append((ts.date().isoformat(), float(row["Open"]), float(row["High"]),
                    float(row["Low"]), float(row["Close"])))
    return out


# ── Stats derivation ──────────────────────────────────────────────────────

def derive_stats(candles):
    if not candles:
        return {"high_52w": None, "low_52w": None, "ytd_pct": None, "yr_pct": None}

    last_close = candles[-1][4]
    year_ago = candles[-52][4] if len(candles) >= 52 else candles[0][4]
    ytd_ref  = next((c[4] for c in candles if c[0].startswith(str(date.today().year))), candles[0][4])

    window = candles[-52:]
    highs = [c[2] for c in window]
    lows  = [c[3] for c in window]

    return {
        "high_52w": round(max(highs), 2),
        "low_52w":  round(min(lows), 2),
        "ytd_pct":  round((last_close / ytd_ref - 1) * 100, 2),
        "yr_pct":   round((last_close / year_ago - 1) * 100, 2),
    }


# ── Driver ────────────────────────────────────────────────────────────────

def pick_provider():
    if os.environ.get("TIINGO_TOKEN"):
        tok = os.environ["TIINGO_TOKEN"]
        return "tiingo", (lambda tk, since: fetch_tiingo(tk, since, tok))
    if os.environ.get("POLYGON_API_KEY"):
        key = os.environ["POLYGON_API_KEY"]
        return "polygon", (lambda tk, since: fetch_polygon(tk, since, key))
    return "yfinance", fetch_yfinance


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tickers", nargs="*", help="Subset of tickers (default: all)")
    ap.add_argument("--since", default=DEFAULT_SINCE, help="Start date YYYY-MM-DD")
    ap.add_argument("--sleep", type=float, default=0.2, help="Seconds between requests")
    args = ap.parse_args()

    records = json.loads(SRC.read_text())
    by_tk = {r["ticker"]: r for r in records}
    tickers = args.tickers or list(by_tk.keys())

    provider, fn = pick_provider()
    print(f"→ provider: {provider}  · {len(tickers)} tickers · since {args.since}", file=sys.stderr)

    out = {}
    if OUT.exists():
        out = json.loads(OUT.read_text())  # resume-friendly

    for i, tk in enumerate(tickers):
        if tk in out and not args.tickers:
            continue  # skip already-fetched on full runs
        try:
            candles = fn(tk, args.since)
            out[tk] = {"candles": candles, "stats": derive_stats(candles)}
            print(f"  [{i+1:>3}/{len(tickers)}] {tk:<8} {len(candles):>3} bars", file=sys.stderr)
        except Exception as e:
            print(f"  [{i+1:>3}/{len(tickers)}] {tk:<8} FAILED: {e}", file=sys.stderr)
        time.sleep(args.sleep)

        # Checkpoint every 25 tickers so long runs don't lose progress.
        if (i + 1) % 25 == 0:
            OUT.write_text(json.dumps(out))

    OUT.write_text(json.dumps(out))
    print(f"→ wrote {OUT}  ({len(out)} tickers)", file=sys.stderr)


if __name__ == "__main__":
    main()
