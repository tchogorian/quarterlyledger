#!/usr/bin/env python3
"""Replace the init() function in all stock pages so it transforms
prices.json raw arrays into the {bars, summary} format the chart code expects."""

import re
from pathlib import Path

STOCKS_DIR = Path(__file__).resolve().parent.parent / "stocks"

OLD_INIT = r"""  async function init\(\) \{
    const frames = document\.querySelectorAll\('\.chart-frame\[data-ticker\]'\);
    if \(!frames\.length\) return;

    // Prefer inline price data \(avoids 401s in sandboxed previews \+ works offline\)
    const inlineEl = document\.getElementById\('ticker-prices'\);
    let singleTickerData = null;
    if \(inlineEl && inlineEl\.textContent\.trim\(\)\) \{
      try \{ singleTickerData = JSON\.parse\(inlineEl\.textContent\); \} catch \(e\) \{\}
    \}

    let priceData = null;
    if \(!singleTickerData\) \{
      try \{
        const res = await fetch\(PRICES_URL\);
        if \(res\.ok\) priceData = await res\.json\(\);
      \} catch \(e\) \{
        console\.warn\('\[charts\] failed to load prices', e\);
      \}
    \}

    for \(const frame of frames\) \{
      const tk = frame\.dataset\.ticker;
      const data = singleTickerData \|\| \(priceData \? priceData\[tk\] : null\);
      renderChart\(frame, tk, data\);
      if \(data\) \{
        updateHeader\(tk, data\);
        injectStats\(frame, data\);
      \}
    \}
  \}"""

NEW_INIT = """  function transformRaw(raw) {
    if (!raw || !Array.isArray(raw) || raw.length === 0) return null;
    const bars = raw.map(function(r) {
      return { d: r.date || r.d, o: r.o, h: r.h, l: r.l, c: r.c };
    });
    var last = bars[bars.length - 1].c;
    var prev = bars.length > 1 ? bars[bars.length - 2].c : last;
    var chg1d = prev ? ((last - prev) / prev) * 100 : 0;
    var highs = bars.map(function(b){ return b.h; });
    var lows  = bars.map(function(b){ return b.l; });
    var high52 = Math.max.apply(null, highs);
    var low52  = Math.min.apply(null, lows);
    var firstC = bars[0].c;
    var chgYtd = firstC ? ((last - firstC) / firstC) * 100 : 0;
    var chg1y  = chgYtd;
    return {
      bars: bars,
      summary: { last: last, chg1d: chg1d, high52: high52, low52: low52, chgYtd: chgYtd, chg1y: chg1y }
    };
  }

  async function init() {
    const frames = document.querySelectorAll('.chart-frame[data-ticker]');
    if (!frames.length) return;

    const inlineEl = document.getElementById('ticker-prices');
    let singleTickerData = null;
    if (inlineEl && inlineEl.textContent.trim()) {
      try {
        var parsed = JSON.parse(inlineEl.textContent);
        if (parsed && parsed.bars) { singleTickerData = parsed; }
        else { singleTickerData = transformRaw(parsed); }
      } catch (e) {}
    }

    let priceData = null;
    if (!singleTickerData) {
      try {
        const res = await fetch(PRICES_URL);
        if (res.ok) priceData = await res.json();
      } catch (e) {
        console.warn('[charts] failed to load prices', e);
      }
    }

    for (const frame of frames) {
      const tk = frame.dataset.ticker;
      let data = singleTickerData;
      if (!data && priceData) {
        var raw = priceData[tk];
        data = transformRaw(raw);
      }
      renderChart(frame, tk, data);
      if (data) {
        updateHeader(tk, data);
        injectStats(frame, data);
      }
    }
  }"""

count = 0
for html_file in sorted(STOCKS_DIR.glob("*.html")):
    text = html_file.read_text()
    if "async function init()" not in text:
        continue
    new_text = re.sub(OLD_INIT, NEW_INIT, text)
    if new_text != text:
        html_file.write_text(new_text)
        count += 1

print(f"Fixed {count} files")
