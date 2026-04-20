// Regenerate ALL bucket-related pages: tiers/*.html, watchlist.html, and add bucket chip to all stock pages.

const BUCKET_META = {
  'Institutional Orphans': {
    slug: 'institutional-orphans',
    num: 1,
    desc: 'Zero sell-side coverage. Insider-controlled floats too small for funds to touch. Priced where no one is looking.',
    longDesc: 'These are the names institutional money cannot hold — float too small, liquidity too thin, coverage too sparse. What they often are, however, is cash-rich, cheap on earnings, and controlled by insiders who would never sell below intrinsic value. The filings tell the story; the screens ignore them.',
  },
  'Hidden Compounders': {
    slug: 'hidden-compounders',
    num: 2,
    desc: "See's Candies economics hidden inside complexity, optical noise, or transitional quarters. Quality franchises at panic-price multiples.",
    longDesc: "Companies earning high returns on capital that the market has temporarily mispriced — because of segment optics, recent spinouts, transient headwinds, or a regulatory cloud that won't survive the weather. When found, these are the names Charlie Munger called \"the best business you can own.\"",
  },
  'Activist Situations': {
    slug: 'activist-situations',
    num: 3,
    desc: 'Credentialed activists in 13D-filed campaigns — operational turnarounds, capital-return programs, sales, and breakups.',
    longDesc: 'Every name here has an active 13D filer with a track record of forcing value realization. Timelines are defined, outcomes have a clear hard-catalyst structure, and the base rates on activist campaigns of this profile are well-documented.',
  },
  'Spinoffs': {
    slug: 'spinoffs',
    num: 4,
    desc: 'Recent and pending spinoffs where forced index selling and management independence create the Greenblatt setup.',
    longDesc: 'Joel Greenblatt built a career on this pattern. When a parent jettisons a division, the spin-co rarely fits the parent\'s index, and most holders become forced sellers. The spin trades below intrinsic value for 6-18 months until fundamentals reassert themselves.',
  },
  'Merger Arbitrage': {
    slug: 'merger-arbitrage',
    num: 5,
    desc: 'Announced deals, tender offers, self-tenders, take-privates. Short-duration, defined-risk, defined-upside situations.',
    longDesc: 'Short-duration arbitrage with a defined payoff structure. Each name in this bucket has an announced transaction with a documented timeline and a calculable spread-to-close. Risk is regulatory, financing, or a competing bid.',
  },
  'Holding Company Discounts': {
    slug: 'holdco-discounts',
    num: 6,
    desc: 'Holding companies trading at persistent discounts to NAV. Family-controlled compounders, asset-rich structures.',
    longDesc: 'Holding companies carry perpetual discounts — to tax optics, governance friction, or the plain fact that the sum of the parts is harder to index. The better ones close those discounts on their own; the best ones compound underneath them.',
  },
  'Cyclicals & CEFs': {
    slug: 'cyclicals-cefs',
    num: 7,
    desc: 'Cyclical-trough valuations with survivable balance sheets. Closed-end funds at persistent discounts with activist pressure.',
    longDesc: 'Cyclical names bought at the trough with a balance sheet that survives the cycle — the setup Peter Lynch called "the most reliable repeat-pattern in equities." Plus closed-end funds trading at discounts of 10-20%+ to NAV with activists applying pressure to close the gap.',
  },
  'Distressed & Binary': {
    slug: 'distressed-binary',
    num: 8,
    desc: 'Post-bankruptcy equities, FDA and biotech binaries, SPAC liquidations, rights offerings. Higher variance, higher reward.',
    longDesc: 'Higher-variance, defined-event situations — post-reorg equities with clean cap tables, FDA approval decisions with known timelines, SPAC liquidations below trust value, and rights-offering dislocations. Position sizing matters more here than anywhere else in the register.',
  },
};

const BUCKET_ORDER = [
  'Institutional Orphans','Hidden Compounders','Activist Situations','Spinoffs',
  'Merger Arbitrage','Holding Company Discounts','Cyclicals & CEFs','Distressed & Binary',
];

const ts = JSON.parse(await readFile('tearsheets-real.json'));

// Group
const grouped = {};
for (const n of BUCKET_ORDER) grouped[n] = [];
for (const t of ts) {
  if (grouped[t.bucket]) grouped[t.bucket].push(t);
}
for (const k of Object.keys(grouped)) {
  grouped[k].sort((a,b) => (b.score||0) - (a.score||0) || a.ticker.localeCompare(b.ticker));
}

const FONT_LINK = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">';

const FOOTER = `<footer class="footer">
<div class="about"><h4>The Quarterly Ledger</h4><p>An independent survey of under-followed public securities.</p><div class="colophon">Set in Cormorant, EB Garamond, &amp; IBM Plex Mono.</div></div>
<div><h4>The Register</h4><ul>${BUCKET_ORDER.map(n => `<li><a href="../tiers/${BUCKET_META[n].slug}.html">${n}</a></li>`).join('')}<li><a href="../watchlist.html">Full List</a></li></ul></div>
<div><h4>Editorial</h4><ul><li><a href="../methodology.html">Methodology</a></li><li><a href="../about.html">About</a></li><li><a href="../disclaimer.html">Disclaimer</a></li><li><a href="../my-watchlist.html">My Saves</a></li></ul></div>
<div><h4>Compliance</h4><ul><li><a href="../disclaimer.html">Not investment advice</a></li><li><a href="../disclaimer.html">Author may hold positions</a></li><li><a href="../disclaimer.html">Data as of April 2026</a></li></ul></div>
</footer>
<div class="disclaimer-strip">For informational purposes only. Not investment advice. See <a href="../disclaimer.html" style="color:inherit; border-bottom-color: currentColor;">full disclaimer</a>.</div>`;

const MAST = `<header class="masthead"><div class="masthead-row"><div class="masthead-left"><a href="../index.html" style="border:none;"><div class="wordmark" style="font-size:42px;">The Quarterly Ledger</div></a><div class="tagline">A Surveyor of Public Securities</div></div><div class="masthead-meta">Vol. 1 · No. 1<br>April 2026<br>Est. 2026</div></div></header>
<nav class="nav"><a href="../index.html">The Register</a><a href="../watchlist.html">Full List</a><a href="../my-watchlist.html">My Saves</a><a href="../methodology.html">Methodology</a><a href="../about.html">About</a></nav>`;

function row(d, rel = '../') {
  const score = d.score ? `<span class="score">${d.score}/100</span>` : '';
  const catPill = d.category ? `<span style="font-family:var(--mono);font-size:9px;letter-spacing:0.12em;color:var(--ink-mute);text-transform:uppercase;">${d.category}</span>` : '';
  const meta = [d.marketCap].filter(Boolean).join(' · ');
  return `<a class="ticker-row" href="${rel}stocks/${d.ticker}.html">
    <div class="sym"><span>${d.ticker}</span>${score}</div>
    <div class="co">${d.company || d.name}</div>
    <div class="meta">${meta}${meta && catPill ? ' · ' : ''}${catPill}</div>
  </a>`;
}

// --- Generate bucket pages ---
for (const name of BUCKET_ORDER) {
  const meta = BUCKET_META[name];
  const items = grouped[name];
  const rowsHtml = items.map(d => row(d)).join('');
  const otherNav = BUCKET_ORDER.filter(n => n !== name).map(n => `<a href="${BUCKET_META[n].slug}.html" style="display:block;padding:8px 0;border-bottom:1px solid var(--rule-soft);font-family:var(--serif-text);font-size:15px;">${n} <span style="color:var(--ink-mute);font-family:var(--mono);font-size:10px;letter-spacing:0.08em;">${grouped[n].length}</span></a>`).join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${name} — The Quarterly Ledger</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="../assets/ledger.css">${FONT_LINK}
<style>:root{--serif:'Cormorant Garamond',Georgia,serif;--serif-text:'EB Garamond',Georgia,serif;--italic:'EB Garamond',Georgia,serif;}
.bucket-hero{padding:56px 0 30px;border-bottom:3px double var(--rule);}
.bucket-hero .kicker{font-family:var(--mono);font-size:11px;letter-spacing:0.24em;color:var(--accent);text-transform:uppercase;margin-bottom:12px;}
.bucket-hero h1{font-family:var(--serif);font-size:clamp(52px,8vw,86px);line-height:0.96;letter-spacing:-0.025em;font-weight:500;margin:0 0 18px;text-wrap:balance;max-width:16ch;}
.bucket-hero .lede{font-family:var(--italic);font-style:italic;font-size:21px;line-height:1.45;color:var(--ink-soft);max-width:58ch;margin:0 0 14px;}
.bucket-hero .long{font-family:var(--serif-text);font-size:16.5px;line-height:1.6;color:var(--ink-soft);max-width:62ch;}
.bucket-hero .count{font-family:var(--mono);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-mute);margin-top:20px;}
.layout{display:grid;grid-template-columns:1fr 240px;gap:56px;margin-top:36px;}
.layout aside h4{font-family:var(--mono);font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--ink-mute);margin:0 0 12px;padding-bottom:10px;border-bottom:1px solid var(--rule);}
.layout aside a{color:var(--ink);border:none;}
.layout aside a:hover{color:var(--accent);}
.ticker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0;border-top:1px solid var(--rule-soft);}
.ticker-row{padding:14px 18px;border-right:1px solid var(--rule-soft);border-bottom:1px solid var(--rule-soft);display:block;transition:background .1s;}
.ticker-row:hover{background:var(--paper-2);}
.ticker-row .sym{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;}
.ticker-row .sym span:first-child{font-family:var(--mono);font-weight:600;font-size:14px;letter-spacing:0.04em;}
.ticker-row .sym .score{font-family:var(--mono);font-size:10px;color:var(--accent);letter-spacing:0.06em;}
.ticker-row .co{font-family:var(--serif-text);font-size:15px;line-height:1.2;margin-bottom:2px;text-wrap:pretty;}
.ticker-row .meta{font-family:var(--mono);font-size:9px;letter-spacing:0.08em;color:var(--ink-mute);text-transform:uppercase;}
@media (max-width:900px){.layout{grid-template-columns:1fr;}.bucket-hero h1{font-size:46px;}}
</style></head><body><div class="page">
${MAST}
<div class="bucket-hero">
  <div class="kicker">№ ${String(meta.num).padStart(2,'0')} · April Register</div>
  <h1>${name}</h1>
  <p class="lede">${meta.desc}</p>
  <p class="long">${meta.longDesc}</p>
  <div class="count">${items.length} names · ranked by Munger-framework score</div>
</div>
<div class="layout">
  <div>
    <div class="ticker-grid">${rowsHtml}</div>
  </div>
  <aside>
    <h4>Other categories</h4>
    ${otherNav}
    <div style="margin-top:24px;"><a href="../watchlist.html" style="font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--accent);border:none;">All 351 names →</a></div>
  </aside>
</div>
${FOOTER.replace(/\.\.\//g, '../')}
</div><script src="../assets/search-index.js"></script><script src="../assets/site.js"></script></body></html>`;

  await saveFile(`tiers/${meta.slug}.html`, html);
}

log('✓ generated 8 bucket pages');

// --- Generate watchlist.html (full list with filters) ---
const watchlistHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Full Register — The Quarterly Ledger</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="assets/ledger.css">${FONT_LINK}
<style>:root{--serif:'Cormorant Garamond',Georgia,serif;--serif-text:'EB Garamond',Georgia,serif;--italic:'EB Garamond',Georgia,serif;}
.wl-hero{padding:48px 0 24px;border-bottom:3px double var(--rule);}
.wl-hero h1{font-family:var(--serif);font-size:clamp(48px,7vw,78px);line-height:0.96;letter-spacing:-0.025em;font-weight:500;margin:0 0 14px;}
.wl-hero .lede{font-family:var(--italic);font-style:italic;font-size:19px;color:var(--ink-soft);max-width:58ch;margin:0;}
.wl-bar{display:flex;gap:14px;align-items:center;margin:24px 0;flex-wrap:wrap;}
.wl-bar input{font-family:var(--mono);font-size:12px;padding:10px 14px;border:1px solid var(--rule);background:var(--paper);flex:1;min-width:200px;color:var(--ink);}
.wl-bar input:focus{outline:none;border-color:var(--accent);}
.wl-filter{font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;padding:10px 12px;border:1px solid var(--rule-soft);background:var(--paper);color:var(--ink);cursor:pointer;}
.wl-filter.on{background:var(--rule);color:var(--paper);border-color:var(--rule);}
.wl-count{font-family:var(--mono);font-size:11px;color:var(--ink-mute);letter-spacing:0.12em;text-transform:uppercase;margin:8px 0 20px;}
.wl-table{width:100%;border-collapse:collapse;font-family:var(--serif-text);}
.wl-table th{text-align:left;font-family:var(--mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--ink-mute);padding:14px 10px;border-bottom:1px solid var(--rule);font-weight:400;}
.wl-table td{padding:12px 10px;border-bottom:1px solid var(--rule-soft);}
.wl-table tr:hover td{background:var(--paper-2);}
.wl-tk{font-family:var(--mono);font-weight:600;font-size:14px;letter-spacing:0.04em;}
.wl-bucket{font-family:var(--mono);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-mute);}
.wl-score{font-family:var(--mono);font-size:11px;color:var(--accent);}
.wl-mcap{font-family:var(--mono);font-size:11px;color:var(--ink-soft);text-align:right;}
</style></head><body><div class="page">
<header class="masthead"><div class="masthead-row"><div class="masthead-left"><a href="index.html" style="border:none;"><div class="wordmark" style="font-size:42px;">The Quarterly Ledger</div></a><div class="tagline">A Surveyor of Public Securities</div></div><div class="masthead-meta">Vol. 1 · No. 1<br>April 2026<br>Est. 2026</div></div></header>
<nav class="nav"><a href="index.html">The Register</a><a href="watchlist.html" class="active">Full List</a><a href="my-watchlist.html">My Saves</a><a href="methodology.html">Methodology</a><a href="about.html">About</a></nav>
<section class="wl-hero">
  <div class="small-caps" style="margin-bottom:10px;color:var(--accent);">The Full Register · April 2026</div>
  <h1>All 351 names.</h1>
  <p class="lede">Every tearsheet in this issue, searchable and filterable. Sort by score. Filter by category. Everything that passed the screen.</p>
</section>
<div class="wl-bar">
  <input id="wl-search" type="text" placeholder="Filter by ticker or company…" autocomplete="off">
  <button class="wl-filter on" data-bucket="all">All (${ts.length})</button>
  ${BUCKET_ORDER.map(n => `<button class="wl-filter" data-bucket="${n}">${n} (${grouped[n].length})</button>`).join('')}
</div>
<div class="wl-count" id="wl-count">Showing ${ts.length} names</div>
<table class="wl-table"><thead><tr><th>Ticker</th><th>Company</th><th>Category</th><th>Score</th><th style="text-align:right;">Market Cap</th></tr></thead>
<tbody id="wl-tbody"></tbody></table>
${FOOTER.replace(/\.\.\//g, '')}
</div>
<script src="assets/search-index.js"></script>
<script>
(function(){
  const rows = window.TQL_INDEX || [];
  const BUCKET_ORDER = ${JSON.stringify(BUCKET_ORDER)};
  let filterBucket = 'all';
  let filterText = '';
  const tbody = document.getElementById('wl-tbody');
  const count = document.getElementById('wl-count');
  function render(){
    const txt = filterText.toLowerCase();
    const filtered = rows.filter(r => {
      if (filterBucket !== 'all' && r.bucket !== filterBucket) return false;
      if (txt && !(r.ticker.toLowerCase().includes(txt) || (r.name||'').toLowerCase().includes(txt))) return false;
      return true;
    }).sort((a,b) => (b.score||0)-(a.score||0) || a.ticker.localeCompare(b.ticker));
    tbody.innerHTML = filtered.map(r => \`
      <tr onclick="location.href='stocks/\${r.ticker}.html'" style="cursor:pointer;">
        <td class="wl-tk"><a href="stocks/\${r.ticker}.html" style="border:none;">\${r.ticker}</a></td>
        <td>\${r.name||''}</td>
        <td class="wl-bucket">\${r.bucket||'—'}</td>
        <td class="wl-score">\${r.score?r.score+'/100':'—'}</td>
        <td class="wl-mcap">\${r.marketCap||'—'}</td>
      </tr>\`).join('');
    count.textContent = 'Showing '+filtered.length+' name'+(filtered.length===1?'':'s');
  }
  document.querySelectorAll('.wl-filter').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.wl-filter').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      filterBucket = b.dataset.bucket;
      render();
    });
  });
  document.getElementById('wl-search').addEventListener('input', e => { filterText = e.target.value; render(); });
  render();
})();
</script>
<script src="assets/site.js"></script>
</body></html>`;

await saveFile('watchlist.html', watchlistHtml);
log('✓ generated watchlist.html');
