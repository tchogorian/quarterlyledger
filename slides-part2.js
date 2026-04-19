/* Slides 4-15 — appended to the deck-stage via DOM.
   Split out to keep the main HTML file manageable. */

(function() {
  const stage = document.getElementById('stage');

  // Helper to build sparkline SVG path from data
  function sparkline(data, w=120, h=30, stroke='#0E0E0E') {
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="1.2"/></svg>`;
  }

  // Larger price chart (with axis ticks, rule lines, area fill)
  function priceChart(data, opts = {}) {
    const w = opts.width || 700;
    const h = opts.height || 280;
    const padL = 44, padR = 8, padT = 14, padB = 26;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const yMin = Math.floor(min * 0.96);
    const yMax = Math.ceil(max * 1.04);
    const yRange = yMax - yMin;

    const pts = data.map((v, i) => {
      const x = padL + (i / (data.length - 1)) * plotW;
      const y = padT + plotH - ((v - yMin) / yRange) * plotH;
      return [x, y];
    });
    const linePath = pts.map((p,i) => (i===0?'M':'L') + p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
    const areaPath = linePath + ` L${pts[pts.length-1][0].toFixed(1)},${padT+plotH} L${pts[0][0].toFixed(1)},${padT+plotH} Z`;

    // Y ticks (5)
    let yTicks = '';
    for (let i = 0; i <= 4; i++) {
      const v = yMin + (yRange * i / 4);
      const y = padT + plotH - (plotH * i / 4);
      yTicks += `<line x1="${padL}" y1="${y}" x2="${w-padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-width="0.5"/>`;
      yTicks += `<text x="${padL-6}" y="${y+3}" text-anchor="end" font-family="IBM Plex Mono" font-size="10" fill="currentColor" fill-opacity="0.6">${v.toFixed(0)}</text>`;
    }

    // X ticks (quarters)
    const xLabels = opts.xLabels || ['2022','2023','2024','2025','2026'];
    let xTicks = '';
    xLabels.forEach((lab, i) => {
      const x = padL + (i / (xLabels.length - 1)) * plotW;
      xTicks += `<line x1="${x}" y1="${padT+plotH}" x2="${x}" y2="${padT+plotH+4}" stroke="currentColor" stroke-opacity="0.4"/>`;
      xTicks += `<text x="${x}" y="${padT+plotH+16}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" fill="currentColor" fill-opacity="0.6">${lab}</text>`;
    });

    return `<svg viewBox="0 0 ${w} ${h}" class="ts-chart" preserveAspectRatio="xMidYMid meet" style="color: var(--ink)">
      <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="none" stroke="currentColor" stroke-width="1"/>
      ${yTicks}
      ${xTicks}
      <path d="${areaPath}" fill="currentColor" fill-opacity="0.08"/>
      <path d="${linePath}" fill="none" stroke="currentColor" stroke-width="1.6"/>
    </svg>`;
  }

  // Bar chart for revenues/earnings history
  function barChart(data, opts = {}) {
    const w = opts.width || 420;
    const h = opts.height || 140;
    const padL = 30, padR = 6, padT = 10, padB = 22;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const max = Math.max(...data.map(Math.abs));
    const bw = plotW / data.length * 0.7;
    const gap = plotW / data.length * 0.3;
    let bars = '';
    const labels = opts.labels || data.map((_,i) => (i+1));
    data.forEach((v, i) => {
      const x = padL + i * (bw + gap) + gap/2;
      const bh = Math.abs(v) / max * plotH;
      const y = v >= 0 ? (padT + plotH - bh) : (padT + plotH);
      const fill = v >= 0 ? 'currentColor' : 'var(--accent)';
      bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${fill}"/>`;
      bars += `<text x="${(x+bw/2).toFixed(1)}" y="${(padT+plotH+14).toFixed(1)}" text-anchor="middle" font-family="IBM Plex Mono" font-size="9" fill="currentColor" fill-opacity="0.7">${labels[i]}</text>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="width:100%; color: var(--ink)">
      <line x1="${padL}" y1="${padT+plotH}" x2="${w-padR}" y2="${padT+plotH}" stroke="currentColor" stroke-width="0.8"/>
      ${bars}
    </svg>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 4 — MARKET OVERVIEW
  // ═══════════════════════════════════════════════════════════════════
  function slideMarket() {
    const compData = [4200,4180,4250,4315,4402,4480,4521,4600,4690,4780,4850,4932,5020,5080,5148];
    return `
    <section class="slide market" data-label="Market Overview">
      <div class="masthead-bar">
        <div class="left"><span>Vol. XII · No. 2</span><span>Page 04</span></div>
        <div class="title">The Quarterly Ledger</div>
        <div class="right"><span>Market Overview</span></div>
      </div>

      <div class="hd" style="margin-top: 30px;">
        <div>
          <div class="kicker" style="border: 0; padding: 0; margin: 0;">§ 01 · The Quarter in Review</div>
          <h1>The Market at Large.</h1>
        </div>
        <div style="font-family: var(--mono); font-size: 18px; color: var(--ink-faint); text-align: right;">
          Period covered<br>
          <span style="color: var(--ink); font-size: 22px;">Jan 1 – Mar 31, 2026</span>
        </div>
      </div>

      <div class="grid">
        <div class="narrative">
          <p class="lead">Equities advanced on the strength of earnings revisions rather than multiple expansion — a turnabout from the prior two years, and one that deserves subscribers' attention.</p>
          <p>The quarter closed with the Composite 500 at 5,148.22, a gain of 4.1% on a total-return basis. Breadth was broader than the headline suggests: 312 of the 376 issues in our coverage universe finished with positive price change, and the median issue outperformed the capitalization-weighted average by 140 basis points — a condition last observed in the first half of 2017.</p>
          <p>Sector leadership rotated decisively toward health services, specialty chemicals, and the regulated utility complex, the latter benefitting from the bond market's quiet conviction that the long rate has peaked. The technology group, which led the prior eight quarters, lagged modestly; forward P/E multiples contracted by roughly one turn, while earnings estimates were revised upward by 6% in aggregate.</p>
          <p>Fixed income was quieter. The 30-year Treasury ended the quarter at 4.48%, twenty basis points below its January print. Investment-grade corporate spreads tightened by twelve basis points to 94 over; high-yield tightened by thirty-four. Our composite dividend yield on the universe now stands at 2.14%, against a forward earnings yield of 4.48% — a spread that remains, by historical measure, neither cheap nor extended.</p>
          <p>We draw subscribers' attention to the Sector Scorecard on the following page, where the quarter's relative performance is shown alongside trailing fundamentals. Readers seeking specific issues should consult the index; those with patience may read the book cover to cover.</p>
        </div>

        <div class="sidebar">
          <div style="font-family: var(--mono); font-size: 14px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-soft); border-bottom: 1px solid var(--rule); padding-bottom: 6px;">Composite 500 · Trailing 5 Years</div>
          ${priceChart(compData, {width: 520, height: 220, xLabels: ['2022','2023','2024','2025','2026']})}
          <div class="stat-block">
            <div class="lab">Quarterly Return</div>
            <div class="val">+4.1%</div>
            <div class="chg">Total return, incl. dividends</div>
          </div>
          <div class="stat-block">
            <div class="lab">Advancers / Decliners</div>
            <div class="val">312 / 64</div>
            <div class="chg">Of 376 issues in coverage</div>
          </div>
          <div class="stat-block">
            <div class="lab">Median Forward P/E</div>
            <div class="val">18.4×</div>
            <div class="chg">Down from 19.1× at year-end</div>
          </div>
        </div>
      </div>

      <div class="footer-bar">
        <span>The Quarterly Ledger</span>
        <span>Vol. XII · No. 2 · Spring 2026</span>
        <span>Page 04</span>
      </div>
    </section>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 5 — SECTOR SCORECARD
  // ═══════════════════════════════════════════════════════════════════
  function slideScorecard() {
    const sectors = [
      {name: 'Technology & Communications', iss: 42, qtr: 2.1, ytd: 2.1, pe: 24.8, div: 0.9, roe: 22.1, tl: 3, spark: [88,92,95,98,94,96,99,103,101,104]},
      {name: 'Health Services & Pharmaceuticals', iss: 56, qtr: 8.4, ytd: 8.4, pe: 19.2, div: 1.6, roe: 18.6, tl: 2, spark: [92,94,96,99,102,104,107,109,112,116]},
      {name: 'Industrials', iss: 41, qtr: 5.2, ytd: 5.2, pe: 18.6, div: 2.0, roe: 16.4, tl: 2, spark: [90,93,94,97,99,101,103,104,106,108]},
      {name: 'Transport & Logistics', iss: 27, qtr: 3.8, ytd: 3.8, pe: 16.1, div: 2.3, roe: 14.2, tl: 3, spark: [95,94,97,99,98,100,102,104,103,106]},
      {name: 'Consumer Staples', iss: 24, qtr: 1.4, ytd: 1.4, pe: 20.3, div: 2.8, roe: 19.7, tl: 3, spark: [98,99,100,99,101,100,102,101,103,104]},
      {name: 'Consumer Discretionary', iss: 28, qtr: 3.6, ytd: 3.6, pe: 17.9, div: 1.2, roe: 17.8, tl: 3, spark: [93,92,95,96,98,97,99,101,103,104]},
      {name: 'Financials — Banks', iss: 21, qtr: 4.9, ytd: 4.9, pe: 11.2, div: 3.4, roe: 12.3, tl: 2, spark: [94,96,97,99,100,101,102,103,104,106]},
      {name: 'Financials — Insurance', iss: 26, qtr: 6.1, ytd: 6.1, pe: 13.8, div: 2.1, roe: 13.9, tl: 2, spark: [92,94,96,98,100,102,103,105,107,109]},
      {name: 'Utilities & Pipelines', iss: 27, qtr: 7.9, ytd: 7.9, pe: 17.0, div: 3.9, roe: 10.1, tl: 2, spark: [90,92,94,96,99,101,103,105,107,109]},
      {name: 'Energy', iss: 19, qtr: -3.2, ytd: -3.2, pe: 12.4, div: 4.2, roe: 15.3, tl: 4, spark: [101,99,98,96,97,95,97,96,94,95]},
      {name: 'Materials & Chemicals', iss: 24, qtr: 5.5, ytd: 5.5, pe: 15.6, div: 2.4, roe: 14.1, tl: 3, spark: [92,94,96,97,99,101,102,104,105,107]},
      {name: 'Real Estate & Lodging', iss: 27, qtr: 6.7, ytd: 6.7, pe: 22.4, div: 4.1, roe: 8.6, tl: 3, spark: [88,90,92,95,98,101,103,105,107,109]},
    ];
    const rows = sectors.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.iss}</td>
        <td class="${s.qtr >= 0 ? 'pos' : 'neg'}">${s.qtr >= 0 ? '+' : ''}${s.qtr.toFixed(1)}%</td>
        <td>${sparkline(s.spark, 120, 26)}</td>
        <td>${s.pe.toFixed(1)}×</td>
        <td>${s.div.toFixed(1)}%</td>
        <td>${s.roe.toFixed(1)}%</td>
        <td class="rank-mini">${s.tl} / 5</td>
      </tr>`).join('');

    return `
    <section class="slide scorecard" data-label="Sector Scorecard">
      <div class="masthead-bar">
        <div class="left"><span>Vol. XII · No. 2</span><span>Page 05</span></div>
        <div class="title">The Quarterly Ledger</div>
        <div class="right"><span>Sector Scorecard</span></div>
      </div>

      <div class="hd" style="margin-top: 30px;">
        <div>
          <div class="kicker" style="border: 0; padding: 0; margin: 0;">§ 02 · Sector Standings</div>
          <h1>Sector Scorecard.</h1>
        </div>
        <div style="font-family: var(--mono); font-size: 15px; color: var(--ink-faint); text-align: right; max-width: 480px;">
          Twelve sectors, 376 issues.<br>
          Quarterly price performance, valuation summary, and the Editors' aggregate Timeliness rank (1 = best, 5 = worst).
        </div>
      </div>

      <table class="sectors">
        <thead>
          <tr>
            <th style="width: 28%">Sector</th>
            <th>Issues</th>
            <th>Qtr Return</th>
            <th style="width: 12%">10-Yr Track</th>
            <th>P/E (fwd)</th>
            <th>Div Yield</th>
            <th>Return on Equity</th>
            <th>Aggregate Timeliness</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px;">
        <div>
          <div class="smcaps">Leader</div>
          <div style="font-family: var(--display); font-size: 42px; font-weight: 900; margin: 6px 0;">Health Services</div>
          <div style="font-family: var(--mono); font-size: 18px;">+8.4% · 56 issues</div>
        </div>
        <div>
          <div class="smcaps">Laggard</div>
          <div style="font-family: var(--display); font-size: 42px; font-weight: 900; margin: 6px 0;" class="neg">Energy</div>
          <div style="font-family: var(--mono); font-size: 18px;">&minus;3.2% · 19 issues</div>
        </div>
        <div>
          <div class="smcaps">Greatest Dispersion</div>
          <div style="font-family: var(--display); font-size: 42px; font-weight: 900; margin: 6px 0;">Industrials</div>
          <div style="font-family: var(--mono); font-size: 18px;">42-pt range, top to bottom</div>
        </div>
      </div>

      <div class="footer-bar">
        <span>The Quarterly Ledger</span>
        <span>Vol. XII · No. 2 · Spring 2026</span>
        <span>Page 05</span>
      </div>
    </section>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 6 — TOP PICKS
  // ═══════════════════════════════════════════════════════════════════
  function slidePicks() {
    const picks = [
      {num:'01', tick:'VRDN', name:'Verdant Pharmaceuticals Ltd.', sector:'Health', tl:1, sf:2, pe:'16.4×', yld:'1.8%', ret:'+18.2%'},
      {num:'02', tick:'MDSC', name:'Meridian Semiconductor Corp.', sector:'Technology', tl:1, sf:3, pe:'22.1×', yld:'0.6%', ret:'+12.4%'},
      {num:'03', tick:'HBRL', name:'Harborline Shipping Co.', sector:'Transport', tl:1, sf:2, pe:'9.8×', yld:'3.7%', ret:'+9.6%'},
      {num:'04', tick:'CRNF', name:'Cornerstone Financial Hldgs.', sector:'Financials', tl:1, sf:1, pe:'11.9×', yld:'3.1%', ret:'+7.8%'},
      {num:'05', tick:'BWDU', name:'Blackwood Utilities Group', sector:'Utilities', tl:2, sf:1, pe:'16.2×', yld:'4.4%', ret:'+11.3%'},
      {num:'06', tick:'ORAI', name:'Orion Aerospace Industries', sector:'Industrials', tl:2, sf:2, pe:'19.4×', yld:'1.1%', ret:'+14.7%'},
      {num:'07', tick:'MRCH', name:'Mercer Chemicals Corp.', sector:'Materials', tl:2, sf:2, pe:'14.1×', yld:'2.8%', ret:'+8.2%'},
      {num:'08', tick:'PSFT', name:'Plainfield Software Corp.', sector:'Technology', tl:2, sf:3, pe:'28.6×', yld:'0.0%', ret:'+16.9%'},
      {num:'09', tick:'GRRH', name:'Granite Rail Holdings', sector:'Transport', tl:2, sf:2, pe:'15.3×', yld:'2.3%', ret:'+6.1%'},
      {num:'10', tick:'HMLB', name:'Hallmark Mutual Bancorp', sector:'Financials', tl:2, sf:2, pe:'10.4×', yld:'3.8%', ret:'+5.9%'},
    ];
    const cards = picks.map(p => `
      <div class="card">
        <div class="num">${p.num}</div>
        <div class="ticker">${p.tick}</div>
        <div class="name">${p.name}</div>
        <div class="sector">${p.sector}</div>
        <div class="metrics">
          <div class="row"><span class="lab">Timeliness</span><span>${p.tl} / 5</span></div>
          <div class="row"><span class="lab">Safety</span><span>${p.sf} / 5</span></div>
          <div class="row"><span class="lab">Fwd P/E</span><span>${p.pe}</span></div>
          <div class="row"><span class="lab">Yield</span><span>${p.yld}</span></div>
          <div class="row"><span class="lab">Qtr Return</span><span>${p.ret}</span></div>
        </div>
      </div>`).join('');

    return `
    <section class="slide picks" data-label="Top Picks">
      <div class="masthead-bar">
        <div class="left"><span>Vol. XII · No. 2</span><span>Page 06</span></div>
        <div class="title">The Quarterly Ledger</div>
        <div class="right"><span>Top-Ranked Equities</span></div>
      </div>

      <div class="hd" style="margin-top: 30px;">
        <div>
          <div class="kicker" style="border:0; padding:0; margin:0;">§ 03 · The Editors' Ten</div>
          <h1>Top-Ranked Equities.</h1>
        </div>
        <div style="font-family: var(--mono); font-size: 15px; color: var(--ink-faint); text-align: right; max-width: 440px; line-height: 1.5;">
          The ten issues in our coverage universe earning the strongest combined Timeliness &amp; Safety marks for the forthcoming twelve months.
        </div>
      </div>

      <div class="grid" style="grid-template-rows: 1fr 1fr;">${cards}</div>

      <div class="footer-bar">
        <span>The Quarterly Ledger</span>
        <span>Vol. XII · No. 2 · Spring 2026</span>
        <span>Page 06</span>
      </div>
    </section>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 7 — METHODOLOGY
  // ═══════════════════════════════════════════════════════════════════
  function slideMethod() {
    const items = [
      {n:'A', t:'Masthead & Identifiers', d:'Exchange, ticker, CUSIP, incorporation, and fiscal year-end. Followed by the company name set in our display face.'},
      {n:'B', t:'Price Box', d:'Recent close, 52-week high/low, shares outstanding, and market capitalization — all figures as of the Friday prior to press.'},
      {n:'C', t:'Ranking Strip', d:'Timeliness (1=best, 5=worst) and Safety (1=safest, 5=riskiest) ratings, with Financial Strength, Price Stability, and Earnings Predictability.'},
      {n:'D', t:'Price Chart', d:'Five-year monthly price history with annual dividend markers. Y-axis in native currency; log scale where range exceeds 3×.'},
      {n:'E', t:'Business Description', d:'A brief, factual account of operating segments, geographic mix, end markets, and competitive position. Never promotional.'},
      {n:'F', t:'Analyst Thesis', d:'Three to five numbered points articulating the Editors\' view on the forward earnings trajectory and share-price proposition.'},
      {n:'G', t:'Financial Summary', d:'Ten-year history of revenues, operating margin, earnings per share, dividends, book value, and return on equity.'},
      {n:'H', t:'Valuation Table', d:'Current and projected P/E, P/B, EV/EBITDA, P/S, FCF yield, and peer-relative valuation context.'},
      {n:'I', t:'Risk Factors', d:'The three to five specific, material hazards most likely to impair the thesis, ranked by Editors\' estimation of probability.'},
    ];
    const legend = items.map(i => `
      <div class="item">
        <div class="n">${i.n}</div>
        <div>
          <h4>${i.t}</h4>
          <p>${i.d}</p>
        </div>
      </div>`).join('');

    // Clean SVG annotated diagram — each region has an internal circled letter,
    // no overflowing arrows. Region labels sit cleanly within.
    const diagram = `
      <svg viewBox="0 0 820 980" style="width:100%; height:100%; font-family: var(--mono); color: var(--ink);" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-opacity="0.12" stroke-width="1"/>
          </pattern>
          <style>
            .lbl{font-size:13px;letter-spacing:.14em;text-transform:uppercase;fill:#6B6252;}
            .ttl{font-family:'Playfair Display',serif;font-weight:900;fill:#0E0E0E;}
            .cap{font-size:11px;letter-spacing:.12em;text-transform:uppercase;fill:#6B6252;}
            .key{font-family:'Playfair Display',serif;font-weight:900;font-size:20px;fill:#fff;}
            .tag{font-size:14px;letter-spacing:.16em;text-transform:uppercase;fill:#0E0E0E;font-weight:600;}
            .rule{stroke:#0E0E0E;}
          </style>
        </defs>

        <!-- Outer paper -->
        <rect x="1" y="1" width="818" height="978" fill="none" class="rule" stroke-width="2"/>

        <!-- A · Masthead -->
        <line x1="20" y1="42" x2="800" y2="42" class="rule" stroke-width="4"/>
        <text x="40" y="70" class="lbl">NYSE · EXMP · 12345A678</text>
        <text x="40" y="116" class="ttl" font-size="38">Example Company, Inc.</text>
        <text x="40" y="142" class="cap" font-style="italic">Industry · Incorporated 19XX · FY ends Dec 31</text>
        <line x1="20" y1="160" x2="800" y2="160" class="rule" stroke-width="1"/>
        <circle cx="58" cy="24" r="14" fill="#8A1F1F"/>
        <text x="58" y="31" text-anchor="middle" class="key">A</text>

        <!-- B · Price box (right side of masthead) -->
        <line x1="520" y1="48" x2="520" y2="155" class="rule"/>
        <line x1="640" y1="48" x2="640" y2="155" class="rule"/>
        <text x="540" y="72" class="cap">Recent</text>
        <text x="540" y="108" class="ttl" font-size="26">$84.20</text>
        <text x="540" y="128" class="cap" fill="#0E0E0E">+$0.42</text>
        <text x="660" y="72" class="cap">P/E</text>
        <text x="660" y="108" class="ttl" font-size="26">18.4×</text>
        <text x="660" y="128" class="cap">Yld 2.1%</text>
        <circle cx="768" cy="24" r="14" fill="#8A1F1F"/>
        <text x="768" y="31" text-anchor="middle" class="key">B</text>

        <!-- C · Ranking strip -->
        <rect x="20" y="180" width="780" height="72" fill="none" class="rule" stroke-width="2"/>
        <line x1="176" y1="180" x2="176" y2="252" class="rule"/>
        <line x1="332" y1="180" x2="332" y2="252" class="rule"/>
        <line x1="488" y1="180" x2="488" y2="252" class="rule"/>
        <line x1="644" y1="180" x2="644" y2="252" class="rule"/>
        <text x="36" y="204" class="cap">Timeliness</text>
        <text x="150" y="232" text-anchor="end" class="ttl" font-size="34">1</text>
        <text x="192" y="204" class="cap">Safety</text>
        <text x="306" y="232" text-anchor="end" class="ttl" font-size="34">2</text>
        <text x="348" y="204" class="cap">Fin'l Str.</text>
        <text x="462" y="232" text-anchor="end" class="ttl" font-size="34">A+</text>
        <text x="504" y="204" class="cap">Price Stab</text>
        <text x="618" y="232" text-anchor="end" class="ttl" font-size="34">80</text>
        <text x="660" y="204" class="cap">Earn. Pred</text>
        <text x="774" y="232" text-anchor="end" class="ttl" font-size="34">85</text>
        <circle cx="400" cy="180" r="14" fill="#8A1F1F"/>
        <text x="400" y="187" text-anchor="middle" class="key">C</text>

        <!-- D · Price chart -->
        <rect x="20" y="280" width="420" height="240" fill="url(#hatch)" class="rule" stroke-width="1"/>
        <polyline points="30,490 80,470 130,455 180,440 230,420 280,405 330,380 380,360 420,340"
                  fill="none" class="rule" stroke-width="2"/>
        <text x="40" y="310" class="tag">Price Chart · 5-Year</text>
        <circle cx="62" cy="300" r="14" fill="#8A1F1F"/>
        <text x="62" y="307" text-anchor="middle" class="key">D</text>

        <!-- E · Business Description -->
        <rect x="20" y="540" width="420" height="200" fill="none" class="rule" stroke-width="1"/>
        <text x="40" y="574" class="tag">Business Description</text>
        <line x1="40" y1="592" x2="420" y2="592" class="rule" stroke-opacity="0.25"/>
        <line x1="40" y1="614" x2="420" y2="614" class="rule" stroke-opacity="0.25"/>
        <line x1="40" y1="636" x2="420" y2="636" class="rule" stroke-opacity="0.25"/>
        <line x1="40" y1="658" x2="420" y2="658" class="rule" stroke-opacity="0.25"/>
        <line x1="40" y1="680" x2="420" y2="680" class="rule" stroke-opacity="0.25"/>
        <line x1="40" y1="702" x2="320" y2="702" class="rule" stroke-opacity="0.25"/>
        <circle cx="62" cy="560" r="14" fill="#8A1F1F"/>
        <text x="62" y="567" text-anchor="middle" class="key">E</text>

        <!-- F · Analyst Thesis -->
        <rect x="460" y="280" width="200" height="260" fill="none" class="rule" stroke-width="1"/>
        <text x="478" y="312" class="tag" font-size="13">Analyst Thesis</text>
        <text x="478" y="346" fill="#8A1F1F" font-family="Playfair Display" font-weight="900" font-size="15">1.</text>
        <line x1="500" y1="342" x2="644" y2="342" class="rule" stroke-opacity="0.25"/>
        <line x1="500" y1="360" x2="644" y2="360" class="rule" stroke-opacity="0.25"/>
        <text x="478" y="398" fill="#8A1F1F" font-family="Playfair Display" font-weight="900" font-size="15">2.</text>
        <line x1="500" y1="394" x2="644" y2="394" class="rule" stroke-opacity="0.25"/>
        <line x1="500" y1="412" x2="644" y2="412" class="rule" stroke-opacity="0.25"/>
        <text x="478" y="450" fill="#8A1F1F" font-family="Playfair Display" font-weight="900" font-size="15">3.</text>
        <line x1="500" y1="446" x2="644" y2="446" class="rule" stroke-opacity="0.25"/>
        <line x1="500" y1="464" x2="644" y2="464" class="rule" stroke-opacity="0.25"/>
        <circle cx="482" cy="298" r="14" fill="#8A1F1F"/>
        <text x="482" y="305" text-anchor="middle" class="key">F</text>

        <!-- H · Valuation -->
        <rect x="680" y="280" width="120" height="150" fill="none" class="rule" stroke-width="1"/>
        <text x="694" y="310" class="tag" font-size="12">Valuation</text>
        <text x="694" y="342" class="cap">P/E · P/B</text>
        <text x="694" y="362" class="cap">EV / EBITDA</text>
        <text x="694" y="382" class="cap">FCF Yield</text>
        <text x="694" y="402" class="cap">P / Sales</text>
        <circle cx="700" cy="298" r="14" fill="#8A1F1F"/>
        <text x="700" y="305" text-anchor="middle" class="key">H</text>

        <!-- I · Risks -->
        <rect x="680" y="450" width="120" height="90" fill="none" class="rule" stroke-width="1"/>
        <text x="694" y="480" class="tag" font-size="12">Risks</text>
        <text x="694" y="504" fill="#8A1F1F" class="cap">▼ Risk 1</text>
        <text x="694" y="522" fill="#8A1F1F" class="cap">▼ Risk 2</text>
        <circle cx="700" cy="468" r="14" fill="#8A1F1F"/>
        <text x="700" y="475" text-anchor="middle" class="key">I</text>

        <!-- G · Financial Summary -->
        <rect x="460" y="560" width="340" height="180" fill="none" class="rule" stroke-width="1"/>
        <text x="478" y="590" class="tag" font-size="13">Financial Summary · 10-Yr</text>
        <line x1="478" y1="606" x2="782" y2="606" class="rule"/>
        <line x1="478" y1="634" x2="782" y2="634" class="rule" stroke-opacity="0.25"/>
        <line x1="478" y1="656" x2="782" y2="656" class="rule" stroke-opacity="0.25"/>
        <line x1="478" y1="678" x2="782" y2="678" class="rule" stroke-opacity="0.25"/>
        <line x1="478" y1="700" x2="782" y2="700" class="rule" stroke-opacity="0.25"/>
        <line x1="478" y1="722" x2="782" y2="722" class="rule" stroke-opacity="0.25"/>
        <!-- faux columns -->
        <line x1="560" y1="612" x2="560" y2="732" class="rule" stroke-opacity="0.18"/>
        <line x1="620" y1="612" x2="620" y2="732" class="rule" stroke-opacity="0.18"/>
        <line x1="680" y1="612" x2="680" y2="732" class="rule" stroke-opacity="0.18"/>
        <line x1="740" y1="612" x2="740" y2="732" class="rule" stroke-opacity="0.18"/>
        <circle cx="482" cy="578" r="14" fill="#8A1F1F"/>
        <text x="482" y="585" text-anchor="middle" class="key">G</text>

        <!-- Footer -->
        <line x1="20" y1="770" x2="800" y2="770" class="rule" stroke-width="3"/>
        <text x="40" y="790" class="cap">The Quarterly Ledger · Vol. XII · No. 2</text>
        <text x="780" y="790" text-anchor="end" class="cap">Page · Industry</text>
      </svg>`;

    return `
    <section class="slide method" data-label="How to Read">
      <div class="masthead-bar">
        <div class="left"><span>Vol. XII · No. 2</span><span>Page 07</span></div>
        <div class="title">The Quarterly Ledger</div>
        <div class="right"><span>Methodology</span></div>
      </div>

      <div class="hd" style="margin-top: 30px;">
        <div>
          <div class="kicker" style="border:0; padding:0; margin:0;">§ 04 · A Guide to the Tear Sheets</div>
          <h1>How to Read These&nbsp;Pages.</h1>
        </div>
        <div style="font-family: var(--mono); font-size: 15px; color: var(--ink-faint); text-align: right; max-width: 460px; line-height: 1.5;">
          Every company in coverage receives a single, full-page tear sheet built to this template. The nine lettered regions — A through I — are reproduced on every page, in the same position, without exception.
        </div>
      </div>

      <div class="layout" style="grid-template-columns: 1.15fr 1fr; gap: 56px;">
        <div class="legend" style="font-size: 20px;">${legend}</div>
        <div style="display: flex; flex-direction: column;">
          <div style="flex: 1; display: flex; align-items: center; justify-content: center;">${diagram}</div>
          <div style="font-family: var(--mono); font-size: 13px; color: var(--ink-faint); text-align: center; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 8px;">Figure 1 · Anatomy of a Tear Sheet</div>
        </div>
      </div>

      <div class="footer-bar">
        <span>The Quarterly Ledger</span>
        <span>Vol. XII · No. 2 · Spring 2026</span>
        <span>Page 07</span>
      </div>
    </section>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEAR SHEET — generic builder
  // ═══════════════════════════════════════════════════════════════════
  function tearSheet(cfg) {
    const years = cfg.years || ['2017','2018','2019','2020','2021','2022','2023','2024','2025','2026E'];
    const fin = cfg.financials;
    const finRows = [
      {lab: 'Revenues ($mm)', fmt: v => v.toLocaleString(), data: fin.rev},
      {lab: 'Operating Margin', fmt: v => v.toFixed(1)+'%', data: fin.opmgn},
      {lab: 'Net Earnings ($mm)', fmt: v => v.toLocaleString(), data: fin.earn},
      {lab: 'EPS ($)', fmt: v => v.toFixed(2), data: fin.eps},
      {lab: 'Dividend / Share ($)', fmt: v => v.toFixed(2), data: fin.div},
      {lab: 'Book Value / Share ($)', fmt: v => v.toFixed(2), data: fin.bv},
      {lab: 'Return on Equity', fmt: v => v.toFixed(1)+'%', data: fin.roe},
      {lab: 'Shares Out. (mm)', fmt: v => v.toFixed(1), data: fin.shares},
    ];
    const finTable = `
      <table class="data">
        <thead><tr><th></th>${years.map(y => `<th>${y}</th>`).join('')}</tr></thead>
        <tbody>${finRows.map(r => `<tr><td>${r.lab}</td>${r.data.map(v => `<td>${r.fmt(v)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;

    const valRows = cfg.valuation;
    const valTable = `
      <table class="data">
        <thead><tr><th></th><th>Current</th><th>5-Yr Avg</th><th>Sector</th></tr></thead>
        <tbody>${valRows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody>
      </table>`;

    return `
    <section class="slide tearsheet" data-label="Tear: ${cfg.ticker}">
      <div class="ts-head">
        <div class="company">
          <div class="ticker-line">${cfg.exchange} · ${cfg.ticker} · ${cfg.cusip}</div>
          <div class="name">${cfg.name}</div>
          <div class="sub">${cfg.industry} · Incorporated ${cfg.incorporated} · FY ends ${cfg.fye}</div>
        </div>
        <div class="head-cell">
          <div class="lab">Recent Price</div>
          <div class="val">$${cfg.price}</div>
          <div class="delta ${cfg.deltaClass}">${cfg.delta}</div>
          <div class="meta">52-wk ${cfg.range52}</div>
        </div>
        <div class="head-cell">
          <div class="lab">P/E · Forward</div>
          <div class="val">${cfg.pe}</div>
          <div class="meta">Trailing ${cfg.peT}</div>
        </div>
        <div class="head-cell">
          <div class="lab">Div Yield · Mkt Cap</div>
          <div class="val">${cfg.yield}</div>
          <div class="meta">${cfg.mcap} · ${cfg.shares} sh.</div>
        </div>
      </div>

      <div class="ts-ranks">
        <div><span class="lab">Timeliness</span><span class="val">${cfg.timeliness}</span></div>
        <div><span class="lab">Safety</span><span class="val">${cfg.safety}</span></div>
        <div><span class="lab">Fin'l Strength</span><span class="val">${cfg.finstr}</span></div>
        <div><span class="lab">Price Stability</span><span class="val">${cfg.stability}</span></div>
        <div><span class="lab">Earnings Pred.</span><span class="val">${cfg.predict}</span></div>
      </div>

      <div class="ts-body">
        <section>
          <div class="ts-block-title">Price History · 5-Year Monthly · USD</div>
          ${priceChart(cfg.priceHistory, {width: 700, height: 260, xLabels: ['2021','2022','2023','2024','2025','2026']})}
          <div class="ts-chart-caption">High ${cfg.chartHigh} · Low ${cfg.chartLow} · Log scale suppressed</div>

          <div class="ts-block-title" style="margin-top: 14px;">Business Description</div>
          <div class="ts-overview">
            <p>${cfg.business}</p>
            <p style="font-size: 13px; color: var(--ink-soft);"><span class="biz-label">Segments.</span> ${cfg.segments}</p>
            <p style="font-size: 13px; color: var(--ink-soft);"><span class="biz-label">Geographies.</span> ${cfg.geos}</p>
          </div>
        </section>

        <section>
          <div class="ts-block-title">Analyst Thesis</div>
          <div class="ts-thesis">
            <p class="lead" style="font-style: italic; font-size: 17px; margin-bottom: 10px; line-height: 1.4;">${cfg.thesisLead}</p>
            <div class="points">
              ${cfg.thesis.map((t,i) => `<div class="p"><div class="num">${i+1}.</div><div>${t}</div></div>`).join('')}
            </div>
          </div>
          <div class="ts-block-title" style="margin-top: 14px;">Revenues &amp; Earnings · 10-Year</div>
          ${barChart(fin.rev, {width: 560, height: 130, labels: years.map(y => y.slice(-2))})}
        </section>

        <section>
          <div class="ts-block-title">Valuation</div>
          <div class="ts-valuation">${valTable}</div>

          <div class="ts-block-title" style="margin-top: 14px;">Risks</div>
          <div class="ts-risks">
            ${cfg.risks.map(r => `<div class="r"><div class="m">▼</div><div><strong>${r.t}.</strong> ${r.d}</div></div>`).join('')}
          </div>

          <div class="ts-block-title" style="margin-top: 14px;">Capitalization</div>
          <table class="data" style="font-size: 13px;">
            <tbody>
              ${cfg.capital.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
            </tbody>
          </table>
        </section>
      </div>

      <div class="ts-block-title" style="margin: 0;">Financial Summary · Ten-Year History</div>
      <div class="ts-financials">${finTable}</div>

      <div class="ts-foot">
        <span>The Quarterly Ledger · Vol. XII · No. 2</span>
        <span>${cfg.industry}</span>
        <span>Page ${cfg.page}</span>
      </div>
    </section>`;
  }

  // Tear-sheet data --------------------------------------------------------
  const TEARSHEETS = [
    {
      page: 8, exchange: 'NASDAQ', ticker: 'MDSC', cusip: '58901A104',
      name: 'Meridian Semiconductor Corp.', industry: 'Semiconductors — Analog &amp; Mixed-Signal',
      incorporated: '1984', fye: 'Dec 31',
      price: '142.38', delta: '+$1.84  (+1.3%)', deltaClass: 'pos', range52: '$91.12 – $148.60',
      pe: '22.1×', peT: '24.8×', yield: '0.6%', mcap: '$38.4B', shares: '270mm',
      timeliness: '1', safety: '3', finstr: 'A', stability: '55', predict: '75',
      priceHistory: [62,68,72,74,79,81,85,89,86,92,95,98,101,108,114,112,118,124,131,138,144,140,142],
      chartHigh: '$148.60', chartLow: '$58.90',
      business: 'Meridian Semiconductor is a designer and manufacturer of analog and mixed-signal integrated circuits for power management, signal conditioning, and industrial automation applications. Its products are embedded in data-center power-delivery systems, factory automation equipment, and automotive powertrain controllers. The company operates two 200mm fabs in Oregon and Malaysia and a pilot 300mm line coming online in 2026. Founded in 1984 by a group of engineers formerly with the discrete-semiconductor division of Fairchild, Meridian listed publicly in 1992.',
      segments: 'Industrial (48% of FY25 rev); Automotive (27%); Data Infrastructure (19%); Consumer (6%).',
      geos: 'Americas 41% · Asia/Pacific 38% · Europe 18% · Other 3%.',
      thesisLead: 'The coming cycle favors analog specialists with genuine process differentiation; Meridian, at 22× forward, is neither cheap nor dear, but owns the right inches of silicon.',
      thesis: [
        'Content per industrial system is rising ~7% per annum as automation, electrification, and sensor density grow; Meridian captures this through its position in motor-control and isolated-power ICs.',
        'The new 300mm pilot line in Oregon lowers unit cost by an estimated 22% on migrated products and unlocks capacity for the data-center power-delivery ramp expected into FY26–FY27.',
        'Operating margin has expanded from 21.4% (FY20) to 32.1% (FY25) through mix and utilization; we project 33.5% by FY27 absent a cyclical downturn.',
        'Net cash of $2.1B (5.5% of market cap) and consistent buybacks provide support; dividend, though small, has grown 12% compounded over five years.',
        'Shares have de-rated modestly from 27× to 22× over twelve months despite earnings revisions in the opposite direction — an anomaly we expect to correct.',
      ],
      risks: [
        {t:'Cyclical Downturn', d:'Industrial and automotive end-markets exhibit 3–4 year amplitudes; a synchronized downturn could compress margins 400–600 bps.'},
        {t:'300mm Ramp Execution', d:'New fabs historically miss yield targets by 6–12 months; a material slip would defer the FY27 margin expansion.'},
        {t:'China Exposure', d:'22% of revenue is ultimately consumed in mainland China; export-control escalation presents binary risk to 2–3 product lines.'},
        {t:'Customer Concentration', d:'Top five customers account for 28% of revenue; any single loss is material to quarterly cadence.'},
      ],
      valuation: [
        ['P/E (Forward)','22.1×','20.8×','24.8×'],
        ['P/E (Trailing)','24.8×','22.1×','27.2×'],
        ['P/B','6.2×','5.4×','5.8×'],
        ['EV/EBITDA','16.8×','15.2×','17.4×'],
        ['P/Sales','5.1×','4.6×','5.0×'],
        ['FCF Yield','3.2%','3.6%','2.9%'],
      ],
      capital: [
        ['Long-Term Debt','$1,240mm'],
        ['Cash &amp; Equivalents','$3,340mm'],
        ['Net Cash','($2,100mm)'],
        ['Total Equity','$6,190mm'],
        ['Debt / Capital','16.7%'],
        ['Interest Coverage','38.2×'],
      ],
      financials: {
        rev: [2840,3120,3260,3410,3980,4620,5180,5740,6240,6820],
        opmgn: [18.2,19.4,20.1,21.4,24.8,27.6,29.2,30.4,32.1,33.0],
        earn: [412,498,544,612,842,1108,1340,1540,1720,1910],
        eps: [1.42,1.72,1.89,2.14,2.98,3.94,4.81,5.58,6.34,7.08],
        div: [0.32,0.40,0.48,0.56,0.64,0.72,0.80,0.88,0.96,1.04],
        bv: [12.40,13.60,14.90,16.10,18.20,20.80,23.10,25.80,28.60,32.10],
        roe: [12.4,13.8,14.2,14.6,17.6,20.8,22.8,23.6,24.2,24.8],
        shares: [290,289,288,286,283,281,278,276,272,270],
      },
    },
    {
      page: 107, exchange: 'NYSE', ticker: 'HBRL', cusip: '41902H302',
      name: 'Harborline Shipping Co.', industry: 'Transport — Containerized &amp; Dry Bulk',
      incorporated: '1919', fye: 'Dec 31',
      price: '48.74', delta: '−$0.22  (−0.4%)', deltaClass: 'neg', range52: '$32.10 – $54.82',
      pe: '9.8×', peT: '7.1×', yield: '3.7%', mcap: '$8.2B', shares: '168mm',
      timeliness: '1', safety: '2', finstr: 'A', stability: '60', predict: '55',
      priceHistory: [28,26,29,32,35,38,40,38,42,45,44,46,49,47,50,48,51,52,49,47,48,49,48],
      chartHigh: '$54.82', chartLow: '$21.40',
      business: 'Harborline Shipping operates a fleet of 84 vessels — 52 container ships and 32 dry-bulk carriers — across trans-Pacific, Asia-Europe, and intra-Americas lanes. Founded in 1919 as a coastal freight operator out of Baltimore, the company has evolved into a diversified marine-transport franchise with ancillary revenue from port-terminal stakes in three North American ports and a small logistics-brokerage arm. Harborline is the fourth-largest US-flagged carrier by deadweight tonnage.',
      segments: 'Container Liner (62% of FY25 rev); Dry Bulk (24%); Terminals &amp; Logistics (14%).',
      geos: 'Trans-Pacific 44% · Asia-Europe 28% · Americas 22% · Other 6%.',
      thesisLead: 'Shipping is a cyclical business valued as if perpetual; Harborline\'s fleet age, balance sheet, and capital returns distinguish it from its reputation.',
      thesis: [
        'Spot container rates, while off the 2022 peak, remain 40% above the 2015–2019 median; orderbook-to-fleet at 8.1% remains modest, and scrapping is set to accelerate with IMO 2030 emissions rules.',
        'Fleet modernization is 72% complete — average vessel age 7.4 years vs. peer 11.2 — lowering fuel burn and earning a 6–9% premium on contract rates.',
        'Net debt / EBITDA sits at 0.9×, the lowest among listed US carriers, and the firm has returned 62% of FY24 free cash flow via dividends and buybacks.',
        'At 9.8× forward earnings and a 3.7% dividend yield, Harborline trades at a 15% discount to its 15-year average multiple despite demonstrably superior returns on capital.',
      ],
      risks: [
        {t:'Rate Cyclicality', d:'A return of spot rates to the pre-pandemic median would compress EBITDA by ~35%; operating leverage cuts both ways.'},
        {t:'Regulatory / Emissions', d:'IMO 2030 and regional carbon schemes will raise opex; non-compliant tonnage must be retrofitted or scrapped.'},
        {t:'Geopolitical Chokepoints', d:'~18% of voyages transit the Red Sea / Bab-el-Mandeb; escalation requires Cape of Good Hope re-routing (+20 days, +$1.2M/voyage).'},
        {t:'Trade Policy', d:'Tariff regime changes affect containerized volumes; US–China ratio is the critical variable.'},
      ],
      valuation: [
        ['P/E (Forward)','9.8×','9.2×','11.4×'],
        ['P/E (Trailing)','7.1×','8.4×','9.6×'],
        ['P/B','1.4×','1.2×','1.3×'],
        ['EV/EBITDA','5.2×','5.4×','6.1×'],
        ['P/Sales','0.9×','0.8×','1.0×'],
        ['FCF Yield','11.8%','10.4%','9.6%'],
      ],
      capital: [
        ['Long-Term Debt','$2,840mm'],
        ['Cash &amp; Equivalents','$1,680mm'],
        ['Net Debt','$1,160mm'],
        ['Total Equity','$5,920mm'],
        ['Debt / Capital','32.4%'],
        ['Net Debt / EBITDA','0.9×'],
      ],
      financials: {
        rev: [6240,6820,6940,7810,11240,12680,10840,9620,9180,9420],
        opmgn: [8.2,9.4,10.1,12.4,28.6,24.2,14.8,11.2,13.6,14.2],
        earn: [328,412,484,662,2410,2140,1120,712,980,1060],
        eps: [1.84,2.32,2.74,3.81,14.08,12.62,6.68,4.26,5.84,6.31],
        div: [0.60,0.72,0.84,0.96,1.80,2.40,2.00,1.80,1.80,1.80],
        bv: [18.40,20.20,22.40,25.60,38.20,46.80,49.20,51.40,55.60,60.20],
        roe: [10.2,11.8,12.8,15.4,44.2,29.6,13.8,8.4,10.8,10.9],
        shares: [178,178,177,174,171,170,168,167,168,168],
      },
    },
    {
      page: 263, exchange: 'NYSE', ticker: 'BWDU', cusip: '09384U100',
      name: 'Blackwood Utilities Group', industry: 'Electric &amp; Water Utilities — Regulated',
      incorporated: '1902', fye: 'Dec 31',
      price: '76.12', delta: '+$0.14  (+0.2%)', deltaClass: 'pos', range52: '$61.40 – $78.90',
      pe: '16.2×', peT: '17.0×', yield: '4.4%', mcap: '$24.6B', shares: '323mm',
      timeliness: '2', safety: '1', finstr: 'A+', stability: '95', predict: '95',
      priceHistory: [58,59,60,61,62,63,64,62,63,65,66,67,68,69,70,72,71,73,74,75,76,76,76],
      chartHigh: '$78.90', chartLow: '$54.20',
      business: 'Blackwood Utilities Group is a holding company for regulated electric and water utilities serving approximately 4.2 million customer accounts across four Mid-Atlantic states. Its principal subsidiaries — Blackwood Electric (est. 1902), Meridian Water Co. (acq. 1978), and Tidewater Power (acq. 2004) — operate under cost-of-service regulation with allowed returns on equity currently between 9.6% and 10.4%. The company has paid uninterrupted quarterly dividends since 1919.',
      segments: 'Electric T&amp;D (72% of rev); Water &amp; Wastewater (21%); Natural Gas Distribution (7%).',
      geos: 'Domestic: VA, MD, DE, NC — 100% of operations.',
      thesisLead: 'In a market discomfited by duration, Blackwood offers exactly that: a regulated-utility compound with 106 years of dividend history and a clean path to 6–7% rate-base growth.',
      thesis: [
        'Rate base is $28.4B, growing at 7.1% CAGR through FY29, driven by transmission hardening, data-center interconnect, and EPA water-infrastructure mandates.',
        'Allowed ROE settlements in FY25 produced a blended 10.1%, 30 bps above prior; regulatory constructive across all four jurisdictions.',
        'Dividend has compounded at 6.2% annually over twenty years; payout ratio of 65% leaves headroom; 106-year uninterrupted history.',
        'At 16.2× forward earnings and a 4.4% yield, shares trade in line with regulated-utility peers despite a demonstrably superior regulatory track record.',
      ],
      risks: [
        {t:'Interest Rate Sensitivity', d:'Utility multiples compress when long-rates rise; a 100 bp move has historically compressed the group 12–14%.'},
        {t:'Regulatory Reversal', d:'Rate cases are the company\'s central risk; an unexpectedly adverse outcome in VA or MD could compress earnings 4–7%.'},
        {t:'Capex Execution', d:'$18B capital plan through FY29 relies on supply-chain deliveries and siting approvals — slippage defers rate-base growth.'},
        {t:'Climate / Storm', d:'Coastal storm exposure has risen; recoverability of storm costs through tracker mechanisms is imperfect.'},
      ],
      valuation: [
        ['P/E (Forward)','16.2×','15.8×','17.0×'],
        ['P/E (Trailing)','17.0×','16.4×','17.8×'],
        ['P/B','1.9×','1.7×','1.8×'],
        ['EV/EBITDA','11.4×','11.0×','11.6×'],
        ['Price/Cash Flow','11.2×','10.8×','11.4×'],
        ['Dividend Yield','4.4%','4.6%','4.1%'],
      ],
      capital: [
        ['Long-Term Debt','$18,420mm'],
        ['Cash &amp; Equivalents','$420mm'],
        ['Total Capitalization','$31,460mm'],
        ['Equity Ratio','41.7%'],
        ['Allowed ROE (wtd.)','10.10%'],
        ['Credit Rating','A / A2'],
      ],
      financials: {
        rev: [5840,5920,6080,6240,6520,6840,7180,7520,7920,8340],
        opmgn: [19.6,19.8,20.2,20.6,20.4,21.0,21.4,21.6,22.0,22.2],
        earn: [682,712,748,784,824,896,960,1020,1098,1180],
        eps: [2.10,2.19,2.30,2.41,2.54,2.76,2.97,3.16,3.40,3.66],
        div: [1.98,2.08,2.18,2.28,2.38,2.52,2.66,2.82,3.00,3.18],
        bv: [28.40,29.60,31.20,32.80,34.40,36.20,38.20,40.10,42.40,44.80],
        roe: [7.8,7.9,8.0,8.1,8.2,8.6,8.8,8.9,9.1,9.2],
        shares: [324,324,325,325,324,324,323,323,323,323],
      },
    },
    {
      page: 50, exchange: 'NASDAQ', ticker: 'VRDN', cusip: '92341V108',
      name: 'Verdant Pharmaceuticals Ltd.', industry: 'Pharmaceuticals — Specialty &amp; Biotech',
      incorporated: '1998', fye: 'Dec 31',
      price: '214.60', delta: '+$3.82  (+1.8%)', deltaClass: 'pos', range52: '$134.20 – $221.40',
      pe: '16.4×', peT: '21.2×', yield: '1.8%', mcap: '$42.8B', shares: '199mm',
      timeliness: '1', safety: '2', finstr: 'A', stability: '50', predict: '65',
      priceHistory: [122,128,134,141,138,146,152,149,158,164,168,172,180,186,192,198,194,204,212,214,210,216,214],
      chartHigh: '$221.40', chartLow: '$116.80',
      business: 'Verdant Pharmaceuticals is a specialty pharmaceuticals company developing and marketing small-molecule therapeutics in metabolic, oncology, and rare-disease indications. Its commercial portfolio comprises seven approved compounds across fourteen indications, with two franchise products — Helavex (GLP/GIP dual agonist for type-2 diabetes) and Corvexin (CDK4/6 inhibitor for HR+ breast cancer) — contributing ~60% of revenue. The pipeline includes three Phase-III assets with expected readouts through 2027.',
      segments: 'Metabolic (48% of FY25 rev); Oncology (31%); Rare Disease (14%); Other (7%).',
      geos: 'United States 62% · Europe 24% · Rest of World 14%.',
      thesisLead: 'Helavex\'s growth and a Phase-III oncology catalyst create a two-year window of earnings acceleration that the forward multiple does not, in our view, reflect.',
      thesis: [
        'Helavex net sales reached $3.4B in FY25 (+48% y/y); we project $5.2B in FY26 and $7.1B at peak in FY28 against a 2030 LoE.',
        'Corvexin\'s expansion into adjuvant breast-cancer (TAURUS-3 readout Q3 2026) represents a $1.2B incremental opportunity vs. consensus $700mm.',
        'Operating margin expanded from 28% (FY22) to 41% (FY25) on franchise leverage; we project 44% at FY27 trough.',
        'At 16.4× forward (consensus) vs. 21× peer median, the shares embed a low probability of TAURUS-3 success — a view we regard as insufficiently optimistic given Phase-II overall-response data.',
        'Net cash of $5.8B funds a $2B buyback announced in February without impairing pipeline investment.',
      ],
      risks: [
        {t:'Clinical Trial Failure', d:'TAURUS-3 and the Phase-III metabolic combination trial represent binary readouts; a negative outcome would compress earnings estimates 15–25%.'},
        {t:'Patent Cliff', d:'Helavex U.S. composition-of-matter expires 2030; formulation patents extend some ROW protection; generic entry will be material.'},
        {t:'Pricing / IRA', d:'Selected-drug negotiation in FY27 window could include Helavex or Corvexin at 25–60% statutory discount.'},
        {t:'Competitive Entry', d:'Three peer GLP/GIP compounds in late Phase-III; first-mover advantage may erode quickly post-launch.'},
      ],
      valuation: [
        ['P/E (Forward)','16.4×','14.8×','19.2×'],
        ['P/E (Trailing)','21.2×','18.4×','22.6×'],
        ['P/B','6.8×','5.9×','4.4×'],
        ['EV/EBITDA','12.4×','11.6×','14.8×'],
        ['P/Sales','6.1×','5.4×','4.9×'],
        ['FCF Yield','5.2%','5.8%','4.2%'],
      ],
      capital: [
        ['Long-Term Debt','$2,400mm'],
        ['Cash &amp; Equivalents','$8,200mm'],
        ['Net Cash','($5,800mm)'],
        ['Total Equity','$6,280mm'],
        ['Debt / Capital','27.7%'],
        ['Interest Coverage','42.6×'],
      ],
      financials: {
        rev: [2120,2480,2840,3620,4420,5180,5960,6840,7840,8960],
        opmgn: [22.4,24.8,27.2,28.6,32.4,36.8,39.2,41.0,42.4,43.6],
        earn: [342,462,612,828,1120,1528,1848,2204,2640,3120],
        eps: [1.68,2.28,3.02,4.10,5.58,7.64,9.26,11.06,13.26,15.68],
        div: [0.60,0.72,0.84,0.96,1.20,1.44,1.68,1.96,2.24,2.52],
        bv: [14.20,16.40,19.60,23.80,28.40,34.20,40.60,47.80,56.20,66.40],
        roe: [12.6,14.8,16.8,18.6,21.4,24.2,25.6,26.4,27.2,28.4],
        shares: [204,203,203,202,201,200,200,199,199,199],
      },
    },
    {
      page: 216, exchange: 'NYSE', ticker: 'CRNF', cusip: '22212C209',
      name: 'Cornerstone Financial Holdings', industry: 'Banks — Regional · Mid-Atlantic',
      incorporated: '1874', fye: 'Dec 31',
      price: '58.42', delta: '+$0.36  (+0.6%)', deltaClass: 'pos', range52: '$44.80 – $61.20',
      pe: '11.9×', peT: '12.4×', yield: '3.1%', mcap: '$14.2B', shares: '243mm',
      timeliness: '1', safety: '1', finstr: 'A+', stability: '75', predict: '80',
      priceHistory: [42,43,44,45,44,46,48,47,49,51,50,52,53,54,55,54,56,57,56,58,57,58,58],
      chartHigh: '$61.20', chartLow: '$38.40',
      business: 'Cornerstone Financial Holdings is the parent of Cornerstone Bank, a Mid-Atlantic community and commercial bank with 284 branches across five states and $62B in assets. The franchise comprises three reporting lines: commercial banking (middle-market lending and treasury services), retail banking (consumer deposits, mortgage, small business), and wealth management (AUM $22B). The bank was founded in Philadelphia in 1874 and has operated continuously since, including through the Panic of 1907 and the Great Depression.',
      segments: 'Commercial Banking (51% of FY25 rev); Retail Banking (38%); Wealth Management (11%).',
      geos: 'PA 38% · NJ 24% · DE 16% · MD 14% · NY 8%.',
      thesisLead: 'The bank\'s underwriting discipline is compounded by patience; in a group habitually valued on book, Cornerstone merits a premium it has not yet received.',
      thesis: [
        'Net interest margin of 3.48% is 40 bps above regional peer median, reflecting a 72% low-cost deposit mix and disciplined asset repricing.',
        'Non-performing asset ratio of 0.28% is the lowest in the peer group; reserves at 1.42% of loans cover projected cycle losses 2.9×.',
        'Tangible common equity ratio of 10.1% and CET1 of 12.4% provide cushion against regulatory tightening and opportunistic M&amp;A.',
        'Shares trade at 1.4× tangible book and 11.9× forward earnings against peer 1.3× and 12.8×; the discount-to-quality relationship is misaligned.',
        '151 consecutive quarters of dividend payments (since 1987 initial); 18 consecutive years of dividend increases.',
      ],
      risks: [
        {t:'Credit Cycle', d:'Mid-market commercial real-estate exposure (12% of loans) is the principal downside variable; office sub-segment is 2.8% of total loans.'},
        {t:'Deposit Competition', d:'Rising short rates intensify competition for deposits; further mix shift to CDs would compress NIM 10–20 bps.'},
        {t:'Regulatory', d:'Basel III finalization and potential FDIC assessment increases raise capital requirements and costs.'},
        {t:'Interest Rate', d:'Asset-sensitive balance sheet benefits from higher-for-longer, but NIM falls in a fast-cut scenario.'},
      ],
      valuation: [
        ['P/E (Forward)','11.9×','12.4×','12.8×'],
        ['P/E (Trailing)','12.4×','12.8×','13.2×'],
        ['P/Tangible Book','1.4×','1.3×','1.3×'],
        ['Price/Earnings/Growth','1.6×','1.7×','1.8×'],
        ['Dividend Yield','3.1%','3.2%','3.4%'],
        ['Efficiency Ratio','54.2%','54.8%','58.4%'],
      ],
      capital: [
        ['Total Assets','$62,400mm'],
        ['Total Deposits','$52,180mm'],
        ['Total Loans','$42,840mm'],
        ['Tangible Common Equity','$6,280mm'],
        ['CET1 Ratio','12.4%'],
        ['Credit Rating','A− / A3'],
      ],
      financials: {
        rev: [1840,1920,2010,2080,2140,2240,2480,2680,2840,3020],
        opmgn: [34.2,35.4,36.8,37.2,36.8,37.4,38.6,39.4,40.2,40.8],
        earn: [460,512,574,612,632,694,820,940,1060,1180],
        eps: [1.84,2.06,2.32,2.48,2.56,2.82,3.34,3.84,4.34,4.84],
        div: [0.80,0.88,0.98,1.08,1.16,1.24,1.36,1.52,1.68,1.80],
        bv: [22.40,23.80,25.40,26.80,28.20,29.80,31.80,33.90,36.20,38.60],
        roe: [8.4,8.8,9.4,9.6,9.4,9.8,10.8,11.6,12.2,12.8],
        shares: [250,249,248,247,246,246,245,244,243,243],
      },
    },
    {
      page: 106, exchange: 'NYSE', ticker: 'ORAI', cusip: '68621P102',
      name: 'Orion Aerospace Industries', industry: 'Aerospace &amp; Defense — Prime',
      incorporated: '1955', fye: 'Dec 31',
      price: '328.40', delta: '+$4.20  (+1.3%)', deltaClass: 'pos', range52: '$240.80 – $341.20',
      pe: '19.4×', peT: '22.8×', yield: '1.1%', mcap: '$78.2B', shares: '238mm',
      timeliness: '2', safety: '2', finstr: 'A', stability: '70', predict: '70',
      priceHistory: [192,198,210,218,212,224,232,228,246,252,248,262,274,282,288,298,294,308,316,322,326,330,328],
      chartHigh: '$341.20', chartLow: '$182.60',
      business: 'Orion Aerospace Industries is a prime contractor in military and civil aerospace systems, with programs spanning tactical aircraft, unmanned platforms, propulsion, and space launch. The firm derives 62% of revenue from U.S. Department of Defense contracts, 21% from allied foreign military sales, 12% from civil / space customers, and 5% from commercial aviation aftermarket. Orion has been a continuous prime on the F-series tactical program for 37 years and leads three current-generation DoD programs of record.',
      segments: 'Combat Systems (42% of FY25 rev); Space &amp; Propulsion (26%); Unmanned &amp; Sensors (21%); Aftermarket (11%).',
      geos: 'United States 72% · NATO/Allied 21% · Pacific Allied 5% · Other 2%.',
      thesisLead: 'A backlog extending visibility to 2031, a unit economics inflection on the F-series, and shareholder returns funded by the cash-conversion cycle.',
      thesis: [
        'Funded backlog of $128B provides 4.2 years of revenue visibility; Program of Record wins in FY24 extend the coverage.',
        'The F-series enters Block-5 production in FY26 — unit price $94M vs. $106M on Block-4 — expanding program margins an estimated 180 bps.',
        'Space &amp; Propulsion segment growing 14% per annum off the contract vehicle award; currently dilutive to margin, accretive by FY27.',
        'Free cash flow / net income conversion of 102% supports the 2.4% combined buyback-plus-dividend yield.',
        'At 19.4× forward, Orion trades in line with large-cap primes despite a backlog-coverage metric that ranks second in the group.',
      ],
      risks: [
        {t:'Budgetary Risk', d:'DoD topline risk is material in continuing-resolution years; program-specific termination is a persistent tail risk.'},
        {t:'Program Execution', d:'Fixed-price development contracts on two programs carry cost-overrun exposure; FY25 charges aggregated $410mm.'},
        {t:'Supply Chain', d:'Titanium, semiconductors, and specialty-propellant inputs remain constrained; single-source vendor concentration on five critical parts.'},
        {t:'Export Policy', d:'FMS approvals to key Middle East and Pacific allies are dependent on State Department posture; reversals would compress foreign mix.'},
      ],
      valuation: [
        ['P/E (Forward)','19.4×','18.2×','20.4×'],
        ['P/E (Trailing)','22.8×','21.4×','22.8×'],
        ['P/B','4.8×','4.2×','4.6×'],
        ['EV/EBITDA','14.6×','13.8×','14.8×'],
        ['P/Sales','2.3×','2.1×','2.2×'],
        ['FCF Yield','4.8%','5.2%','4.4%'],
      ],
      capital: [
        ['Long-Term Debt','$12,840mm'],
        ['Cash &amp; Equivalents','$3,240mm'],
        ['Net Debt','$9,600mm'],
        ['Total Equity','$16,280mm'],
        ['Debt / Capital','44.1%'],
        ['Backlog','$128,400mm'],
      ],
      financials: {
        rev: [22400,23840,24620,25840,27440,28920,30420,31840,33620,35640],
        opmgn: [10.8,11.2,11.4,11.6,11.8,12.4,12.8,13.2,13.6,14.0],
        earn: [1840,2040,2180,2340,2560,2840,3120,3420,3780,4180],
        eps: [7.36,8.24,8.88,9.56,10.52,11.72,12.96,14.28,15.88,17.56],
        div: [2.80,3.04,3.28,3.52,3.76,4.00,4.24,4.52,4.84,5.20],
        bv: [48.40,52.80,56.20,59.40,62.80,66.40,70.20,74.80,80.20,85.60],
        roe: [15.2,15.6,15.8,16.1,16.8,17.6,18.4,19.1,19.8,20.5],
        shares: [250,248,246,244,243,242,241,240,239,238],
      },
    },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 14 — GLOSSARY
  // ═══════════════════════════════════════════════════════════════════
  function slideGlossary() {
    const terms = [
      {term: 'Timeliness', abbr: '(1–5)', def: 'The Editors\' rank of probable price performance relative to the Composite 500 over the next 6–12 months. 1 = best; 5 = worst.'},
      {term: 'Safety', abbr: '(1–5)', def: 'A measure of total risk combining price-volatility history and underlying financial strength. 1 = safest.'},
      {term: 'Financial Strength', abbr: '(A+ to C)', def: 'A letter rank combining capital structure, coverage ratios, and earnings stability.'},
      {term: 'Price Stability', abbr: '(0–100)', def: 'Percentile rank of realized weekly price-change volatility over the trailing five years. Higher = more stable.'},
      {term: 'Earnings Predictability', abbr: '(0–100)', def: 'Percentile rank of the standard error of trend-fit EPS over ten fiscal years. Higher = more predictable.'},
      {term: 'P/E (Forward)', abbr: 'F-P/E', def: 'Recent price divided by the Editors\' estimate of earnings per share for the forthcoming fiscal year.'},
      {term: 'P/E (Trailing)', abbr: 'T-P/E', def: 'Recent price divided by the trailing twelve months of earnings per share.'},
      {term: 'EV/EBITDA', abbr: '', def: 'Enterprise value divided by earnings before interest, taxes, depreciation, and amortization — a capital-structure-neutral multiple.'},
      {term: 'Free Cash Flow Yield', abbr: 'FCF Yield', def: 'Trailing twelve months free cash flow divided by current market capitalization.'},
      {term: 'Return on Equity', abbr: 'ROE', def: 'Net earnings divided by average common shareholders\' equity.'},
      {term: 'Book Value / Share', abbr: 'BV/sh', def: 'Total common shareholders\' equity divided by shares outstanding at period-end.'},
      {term: 'Operating Margin', abbr: 'Op Mgn', def: 'Operating income as a percentage of revenues; excludes one-time items at the Editors\' discretion.'},
      {term: 'Net Debt', abbr: '', def: 'Long-term debt plus the current portion of long-term debt, less cash and equivalents.'},
      {term: '52-Week Range', abbr: '', def: 'High and low closing prices over the trailing fifty-two weeks, adjusted for splits.'},
      {term: 'Dividend Yield', abbr: 'Yld', def: 'Trailing twelve-month cash dividends per share divided by recent price.'},
      {term: 'Market Capitalization', abbr: 'Mkt Cap', def: 'Recent share price multiplied by diluted shares outstanding.'},
      {term: 'Beta', abbr: 'β', def: 'Coefficient of a regression of weekly returns against the Composite 500 over five years.'},
      {term: 'Composite 500', abbr: '', def: 'The Editors\' 500-issue, capitalization-weighted index, maintained continuously since 1962.'},
    ];
    const entries = terms.map(t => `
      <div class="entry">
        <span class="term">${t.term}</span><span class="abbr">${t.abbr}</span>
        <div class="def">${t.def}</div>
      </div>`).join('');

    return `
    <section class="slide glossary" data-label="Glossary">
      <div class="masthead-bar">
        <div class="left"><span>Vol. XII · No. 2</span><span>Page 360</span></div>
        <div class="title">The Quarterly Ledger</div>
        <div class="right"><span>Glossary &amp; Rankings</span></div>
      </div>

      <div class="hd" style="margin-top: 30px;">
        <div>
          <div class="kicker" style="border:0; padding:0; margin:0;">§ 05 · Terms of Art</div>
          <h1>Glossary &amp; Rankings.</h1>
        </div>
        <div style="font-family: var(--mono); font-size: 15px; color: var(--ink-faint); text-align: right; max-width: 480px; line-height: 1.5;">
          The definitions on this page are reproduced, with minor revisions, in every issue of the Ledger.
        </div>
      </div>

      <div class="grid">${entries}</div>

      <div class="footer-bar">
        <span>The Quarterly Ledger</span>
        <span>Vol. XII · No. 2 · Spring 2026</span>
        <span>Page 360</span>
      </div>
    </section>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // SLIDE 15 — BACK PAGE / AD
  // ═══════════════════════════════════════════════════════════════════
  function slideBackPage() {
    return `
    <section class="slide backpage" data-label="Back Page">
      <div class="masthead-bar">
        <div class="left"><span>Vol. XII · No. 2</span><span>Page 384</span></div>
        <div class="title">The Quarterly Ledger</div>
        <div class="right"><span>Subscriber Notice</span></div>
      </div>

      <div class="ad" style="margin-top: 50px;">
        <div class="eyebrow">A Notice from the Publisher</div>
        <div class="pitch">Three hundred and seventy-six <em>companies.</em><br>One reliable volume.</div>
        <div class="rule-orn">❦ &nbsp; ❦ &nbsp; ❦</div>
        <div style="max-width: 1200px; font-size: 26px; line-height: 1.5; color: var(--ink-soft); font-style: italic; margin-bottom: 20px;">
          Quarterly tear sheets on every issue in coverage. Ten-year financial histories.
          Editors' Timeliness and Safety ranks. Delivered by post, cover-to-cover,
          four times annually since 1971.
        </div>
        <div class="price">$240 <span style="font-size: 32px; font-style: normal; color: var(--ink-faint);">per annum</span></div>
        <div class="cta">Subscribe by Post · ledger.example / subscribe</div>
      </div>

      <div class="colophon">
        <div><h5>Editor</h5>The Editor, Chief of Research</div>
        <div><h5>Published</h5>Quarterly since 1971 by The Ledger Publishing Company</div>
        <div><h5>Offices</h5>One Financial Square, Suite 2100</div>
        <div><h5>ISSN</h5>0000-0000 · Printed in U.S.A.</div>
      </div>
    </section>`;
  }

  // Append all slides to the deck-stage ----------------------------------
  const html =
    slideMarket() +
    slideScorecard() +
    slidePicks() +
    slideMethod() +
    TEARSHEETS.map(tearSheet).join('') +
    slideGlossary() +
    slideBackPage();

  stage.insertAdjacentHTML('beforeend', html);
})();
