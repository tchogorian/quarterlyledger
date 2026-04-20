#!/usr/bin/env python3
"""Inject real price data from assets/prices.json directly into each stock
page's inline <script id="ticker-prices"> tag, in the {bars, summary}
format the chart code expects. No runtime fetch needed."""

import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRICES_FILE = ROOT / "assets" / "prices.json"
STOCKS_DIR = ROOT / "stocks"


def build_chart_data(raw_candles):
    """Convert raw candle array into {bars, summary} format."""
    if not raw_candles:
        return None
    bars = []
    for r in raw_candles:
        bars.append({
            "d": r.get("date", r.get("d", "")),
            "o": r["o"],
            "h": r["h"],
            "l": r["l"],
            "c": r["c"],
        })
    if not bars:
        return None

    last = bars[-1]["c"]
    prev = bars[-2]["c"] if len(bars) > 1 else last
    chg1d = ((last - prev) / prev * 100) if prev else 0
    highs = [b["h"] for b in bars]
    lows = [b["l"] for b in bars]
    high52 = max(highs)
    low52 = min(lows)
    first_c = bars[0]["c"]
    chg_ytd = ((last - first_c) / first_c * 100) if first_c else 0

    def rnd(v):
        return round(v, 2)

    return {
        "bars": bars,
        "summary": {
            "last": rnd(last),
            "chg1d": rnd(chg1d),
            "high52": rnd(high52),
            "low52": rnd(low52),
            "chgYtd": rnd(chg_ytd),
            "chg1y": rnd(chg_ytd),
        },
    }


def main():
    with open(PRICES_FILE) as f:
        all_prices = json.load(f)

    no_data = set(all_prices.get("no_data", []))
    injected = 0
    skipped = 0

    for html_file in sorted(STOCKS_DIR.glob("*.html")):
        ticker = html_file.stem
        raw = all_prices.get(ticker)
        if not raw or ticker in no_data:
            skipped += 1
            continue

        chart_data = build_chart_data(raw)
        if not chart_data:
            skipped += 1
            continue

        inline_json = json.dumps(chart_data, separators=(",", ":"))

        text = html_file.read_text()
        old_tag = '<script id="ticker-prices" type="application/json"></script>'
        new_tag = f'<script id="ticker-prices" type="application/json">{inline_json}</script>'

        if old_tag in text:
            text = text.replace(old_tag, new_tag)
            html_file.write_text(text)
            injected += 1
        else:
            skipped += 1

    print(f"Injected real prices into {injected} pages, skipped {skipped}")


if __name__ == "__main__":
    main()
