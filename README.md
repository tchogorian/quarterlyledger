# The Quarterly Ledger

A standing reference of under-followed public securities. Institutional-grade equity research published once a quarter and maintained as a living archive — not a one-time report.

**351 tearsheets. Eight situation types. No sell-side noise. No sponsored content. No affiliate links.**

Built in the tradition of *Value Line*, Graham & Dodd's *Security Analysis*, and the Munger checklist.

---

## Contents

| Path | What's there |
|---|---|
| `index.html` | The April Register — home, with all eight bucket sections and search |
| `stocks/<TK>.html` | Per-ticker tearsheet (×351): narrative, OHLC chart, 52-wk stats, Munger scorecard |
| `tiers/<slug>.html` | One page per situation type (8 files) |
| `watchlist.html` | Full sortable/filterable register (all 351 names) |
| `my-watchlist.html` | User's saved tearsheets (localStorage, never server-side) |
| `methodology.html` | How the register is built: ten-thousand-filing funnel, ten-point screen, four-tier classification |
| `about.html` | The editor's standing |
| `disclaimer.html` | Legal |
| `assets/` | `ledger.css`, `search-index.js`, `buckets-client.js`, `site.js`, `charts.js`, `prices.json` |
| `tearsheets-real.json` | Source of truth — 351 records with bucket, score, narrative, metrics |

## The eight situation types

1. **Institutional Orphans** — zero sell-side coverage; insider-controlled floats
2. **Hidden Compounders** — See's Candies economics inside optical complexity
3. **Activist Situations** — 13D-filed campaigns with credentialed activists
4. **Spinoffs** — recent and pending; forced-seller setups
5. **Merger Arbitrage** — announced deals, tenders, take-privates
6. **Holding Company Discounts** — persistent NAV discounts
7. **Cyclicals & CEFs** — trough valuations; activist-pressured CEFs
8. **Distressed & Binary** — post-reorg, FDA, SPAC liquidations, rights offerings

## Running locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Most stylesheets and scripts are inlined into each page, so the site works offline once loaded.

## Data pipeline

```
source PDFs                               tearsheets-real.json
   ↓                                           ↓
parse-pdf.js          →  regenerate-site.js  →  stocks/*.html + tiers/*.html + index.html
                                               (regenerator rebuilds from JSON)
```

To regenerate prices (weekly OHLC per ticker), run `fetch-prices.py` — see that script for required env vars and API choice (Polygon, Tiingo, or Yahoo).

## Deployment

### Cloudflare Pages (recommended — free tier fits)

1. Push to GitHub.
2. Cloudflare Pages → Create → connect repo.
3. Build command: *(leave blank)* · Build output: `/`
4. Environment: none needed.

`_headers` and `_redirects` files in the root configure caching and clean URLs.

### Static hosts (Netlify, Vercel, GH Pages, S3+CloudFront)

Any static host works. No server-side anything.

## License

Text and research: © 2026 The Quarterly Ledger. All rights reserved.
Template code: MIT — take it and make your own.

## Disclaimer

For informational purposes only. Not investment advice. The author may hold positions in names discussed. Data as of April 2026 and will lag; read the filings. See `disclaimer.html`.
