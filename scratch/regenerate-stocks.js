// Regenerate all 351 stock pages with full narrative content from parsed-profiles.json
// merged with financial metrics from tearsheets-real.json.

async function main() {
  const parsed = JSON.parse(await readFile('parsed-profiles.json'));
  const tsReal = JSON.parse(await readFile('tearsheets-real.json'));
  const prices = JSON.parse(await readFile('assets/prices.json'));
  const css = await readFile('assets/ledger.css');
  const siteJs = await readFile('assets/site.js');
  const chartsJs = await readFile('assets/charts.js');
  const indexJs = await readFile('assets/search-index.js');

  const tsByTicker = {};
  for (const t of tsReal) tsByTicker[t.ticker] = t;

  const esc = (s) => (s == null ? '' : String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;'));

  // Turn a multi-paragraph block into <p> elements, preserving blank-line separators.
  function paragraphs(text) {
    if (!text) return '';
    const clean = text.replace(/\r\n/g, '\n').trim();
    const paras = clean.split(/\n\s*\n/).map(p => p.replace(/\n+/g, ' ').trim()).filter(Boolean);
    return paras.map(p => `<p>${esc(p)}</p>`).join('');
  }

  // Parse Munger checklist markdown table (| col | col |) into styled list.
  // Falls back to paragraphs if no table found.
  function mungerBlock(raw) {
    if (!raw) return '';
    // Look for table rows: | Category | Score | Assessment |
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const tableRows = [];
    for (const l of lines) {
      if (l.startsWith('|') && l.endsWith('|')) {
        const cols = l.slice(1, -1).split('|').map(c => c.trim());
        // skip divider rows of dashes
        if (cols.every(c => /^:?-+:?$/.test(c))) continue;
        tableRows.push(cols);
      }
    }
    if (tableRows.length >= 2) {
      // first row is header
      const header = tableRows[0];
      const body = tableRows.slice(1);
      return `
        <table class="munger-table">
          <thead><tr>${header.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>
            ${body.map(r => `<tr>${r.map((c, i) => `<td class="col-${i}">${esc(c)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>`;
    }
    // fallback
    return paragraphs(raw);
  }

  // Pull out a ticker's full profile data, merging parsed PDF content with TS metrics.
  function buildPage(tk) {
    const ts = tsByTicker[tk] || {};
    const pr = parsed[tk] || {};
    const name = ts.name || pr.name || tk;
    const tier = ts.tier ?? pr.tier;
    const tierName = ts.tierName || pr.tierName;
    const score = ts.score ?? pr.score;

    const analystSummary = pr.analystSummary || ts.analystSummary;
    const wscs = pr.whatScreenCantSee || ts.whatScreenCantSee;
    const munger = pr.mungerBreakdown;
    const thesis = ts.thesis;
    const catalyst = ts.catalyst;
    const risks = ts.risks;

    const tierChip = tier
      ? `<span class="tier-chip">Tier ${tier}${tierName ? ' · ' + esc(tierName) : ''}</span>`
      : `<span class="tier-chip" style="color:var(--ink-mute); border-color:var(--rule-soft)">Extended Watchlist</span>`;
    const scoreChip = score != null ? `<span class="score-chip">${score}/100</span>` : '';

    const metricRail1 = [
      ['Market Cap', ts.marketCap || '—'],
      ['Revenue (TTM)', ts.revenue || '—'],
      ['Net Income (TTM)', ts.netIncome || '—'],
      ['Free Cash Flow', ts.fcf || '—'],
      ['P/E (TTM)', ts.pe || '—'],
      ['EV/EBITDA', ts.evEbitda || '—'],
    ];
    const metricRail2 = [
      ['Cash', ts.cash || '—'],
      ['Total Debt', ts.totalDebt || '—'],
      ['Net Debt', ts.netDebt || '—'],
      ['Enterprise Value', ts.ev || '—'],
      ['Gross Margin', ts.grossMargin || '—'],
      ['Dividend Yield', ts.divYield || '—'],
    ];

    const rail = (arr) => `<div class="metric-rail"${arr === metricRail2 ? ' style="border-top:0; margin-top:0;"' : ''}>
      ${arr.map(([k, v]) => `<div class="metric"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}
    </div>`;

    // Body sections — LEFT column (primary reading), RIGHT aside (classification + quick facts).
    const sections = [];

    // Price chart placeholder
    sections.push(`
      <section>
        <div class="ts-block-title">Price History</div>
        <div class="chart-frame" data-ticker="${esc(tk)}"><div class="pending">Loading chart…</div></div>
        <div class="chart-caption">Weekly candles · 14 months. Prices are illustrative (synthetic GBM seeded per ticker); swap in real OHLC by regenerating prices.json.</div>
      </section>`);

    // Analyst Summary — the main narrative
    if (analystSummary) {
      sections.push(`
        <section>
          <div class="ts-block-title">Analyst Summary</div>
          <div class="ts-prose">${paragraphs(analystSummary)}</div>
        </section>`);
    }

    // Thesis (compact, older schema)
    if (thesis && !analystSummary) {
      sections.push(`
        <section>
          <div class="ts-block-title">Thesis</div>
          <div class="ts-prose">${paragraphs(thesis)}</div>
        </section>`);
    }

    // What a Screen Can't See
    if (wscs) {
      sections.push(`
        <section>
          <div class="ts-block-title">What a Screen Can't See</div>
          <div class="ts-prose">${paragraphs(wscs)}</div>
        </section>`);
    }

    // Munger Checklist
    if (munger) {
      sections.push(`
        <section>
          <div class="ts-block-title">Munger Checklist Breakdown</div>
          <div class="munger-wrap">${mungerBlock(munger)}</div>
        </section>`);
    }

    const asideSections = [];
    if (catalyst) {
      asideSections.push(`
        <section>
          <div class="ts-block-title">Catalysts</div>
          <div class="ts-prose">${paragraphs(catalyst)}</div>
        </section>`);
    }
    if (risks) {
      asideSections.push(`
        <section>
          <div class="ts-block-title">Principal Risks</div>
          <div class="ts-prose">${paragraphs(risks)}</div>
        </section>`);
    }
    asideSections.push(`
      <section>
        <div class="ts-block-title">Classification</div>
        <div class="ts-prose">
          <p><strong>Ticker:</strong> ${esc(tk)}</p>
          ${tier ? `<p><strong>Tier:</strong> ${esc(tier)} — ${esc(tierName || '')}</p>` : `<p><strong>Tier:</strong> Extended Watchlist</p>`}
          ${score != null ? `<p><strong>Munger Score:</strong> ${esc(score)}/100</p>` : ''}
        </div>
      </section>`);

    const subline = [
      ts.marketCap ? `Market cap ${esc(ts.marketCap)}` : null,
      ts.ev ? `EV ${esc(ts.ev)}` : null,
    ].filter(Boolean).join(' · ');

    // Inline price data for this ticker — avoids fetch blocks in sandboxed previews
    // and keeps the static export self-contained per page.
    const tickerPrices = prices[tk] || null;
    const inlinedPricesScript = tickerPrices
      ? `<script id="ticker-prices" type="application/json">${JSON.stringify(tickerPrices)}</script>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(tk)} · ${esc(name)} — The Quarterly Ledger</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(`Equity research tearsheet for ${name} (${tk}). Published by The Quarterly Ledger.`)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
${css}

/* Per-page additions */
.watch-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border: 1px solid var(--rule);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  margin-left: 12px;
  transition: background 120ms ease, color 120ms ease;
}
.watch-btn:hover { background: var(--paper-2); }
.watch-btn.on { background: var(--ink); color: var(--paper); }

/* Munger checklist table */
.munger-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--serif-text);
  font-size: 14px;
  margin-top: 6px;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.munger-table th {
  text-align: left;
  padding: 10px 12px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-mute);
  border-bottom: 1px solid var(--rule-soft);
  background: var(--paper-2);
}
.munger-table td {
  padding: 10px 12px;
  vertical-align: top;
  border-bottom: 1px solid var(--rule-soft);
  line-height: 1.5;
}
.munger-table tr:last-child td { border-bottom: none; }
.munger-table .col-0 {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
  min-width: 180px;
  font-weight: 500;
}
.munger-table .col-1 {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--accent);
  min-width: 80px;
  text-align: left;
  white-space: nowrap;
}

.ts-eyebrow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.ts-eyebrow .dot { color: var(--ink-mute); }
</style>
</head>
<body>
<div class="page">
  <header class="masthead">
    <div class="masthead-row">
      <div class="masthead-left">
        <a href="../index.html" style="border:none;"><div class="wordmark" style="font-size: 30px;">The Quarterly Ledger</div></a>
        <div class="tagline">A Surveyor of Public Securities</div>
      </div>
      <div class="masthead-meta">
        Vol. 1 · No. 1<br>
        April 2026 Issue
      </div>
    </div>
  </header>
  <nav class="nav">
    <a href="../index.html">The Register</a>
    <a href="../watchlist.html">Watchlist</a>
    <a href="../my-watchlist.html">My Saves</a>
    <a href="../methodology.html">Methodology</a>
    <a href="../about.html">About</a>
    <a href="../disclaimer.html">Disclaimer</a>
  </nav>

  <div class="ts-head">
    <div>
      <div class="ts-eyebrow">
        <span>${esc(tk)}</span>
        <span class="dot">·</span>
        ${tierChip}
        ${scoreChip}
        <button class="watch-btn" id="watch-btn" onclick="toggleWatch()" aria-label="Save to watchlist">☆ Save</button>
      </div>
      <h1 class="ts-name">${esc(name)}</h1>
      ${subline ? `<p class="ts-sub">${subline}</p>` : ''}
    </div>
    <div class="ts-price">
      <div class="label">Price data</div>
      <div class="val" style="font-size:20px; color:var(--ink-mute);">Pending</div>
      <div class="sub">Price feed loading</div>
    </div>
  </div>

  ${rail(metricRail1)}
  ${rail(metricRail2)}

  <div class="ts-body">
    <div>
      ${sections.join('\n')}
    </div>
    <aside>
      ${asideSections.join('\n')}
    </aside>
  </div>

  <footer class="footer">
    <div class="about">
      <h4>The Quarterly Ledger</h4>
      <p>An independent quarterly reference for public securities.</p>
    </div>
    <div>
      <h4>Navigate</h4>
      <ul>
        <li><a href="../index.html">The Register</a></li>
        <li><a href="../watchlist.html">Full List</a></li>
        <li><a href="../my-watchlist.html">My Saves</a></li>
        <li><a href="../methodology.html">Methodology</a></li>
      </ul>
    </div>
    <div>
      <h4>Compliance</h4>
      <ul>
        <li><a href="../disclaimer.html">Disclaimer</a></li>
        <li><a href="../about.html">About</a></li>
      </ul>
    </div>
    <div>
      <h4>This Sheet</h4>
      <ul>
        <li class="colophon">${esc(tk)} · April 2026</li>
      </ul>
    </div>
  </footer>
  <div class="disclaimer-strip">
    Not investment advice. For informational purposes only. <a href="../disclaimer.html" style="color:inherit; border-bottom-color: currentColor;">Full disclaimer</a>.
  </div>
</div>

<script>window.TQL_STOCK_COUNT = 351; window.TQL_FREE = true;</script>
${inlinedPricesScript}
<script>
${chartsJs}
</script>
<script>
  const TK = ${JSON.stringify(tk)};
  function getWL(){ try { return JSON.parse(localStorage.getItem('tql_watchlist') || '[]'); } catch(e) { return []; } }
  function setWL(v){ localStorage.setItem('tql_watchlist', JSON.stringify(v)); }
  function updBtn(){
    const wl = getWL();
    const b = document.getElementById('watch-btn');
    if (!b) return;
    if (wl.includes(TK)) { b.classList.add('on'); b.innerHTML = '★ Saved'; }
    else { b.classList.remove('on'); b.innerHTML = '☆ Save'; }
  }
  function toggleWatch(){
    let wl = getWL();
    if (wl.includes(TK)) wl = wl.filter(t => t !== TK);
    else wl.push(TK);
    setWL(wl);
    updBtn();
  }
  document.addEventListener('DOMContentLoaded', updBtn);
</script>
</body>
</html>`;
  }

  // Write all pages. Chunk by batches so the 30s limit doesn't bite.
  const tickers = Object.keys(tsByTicker);
  const OFFSET = globalThis.__TQL_OFFSET || 0;
  const BATCH = globalThis.__TQL_BATCH || 60;
  log('total tickers:', tickers.length, 'offset:', OFFSET, 'batch:', BATCH);

  let written = 0;
  for (let i = OFFSET; i < Math.min(OFFSET + BATCH, tickers.length); i++) {
    const tk = tickers[i];
    const html = buildPage(tk);
    await saveFile(`stocks/${tk}.html`, html);
    written++;
  }
  log('wrote', written, 'pages (indexes', OFFSET, '..', OFFSET + written - 1, ')');
}
await main();
