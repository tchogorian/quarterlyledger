// Chart renderer — loads assets/prices.json and draws a candlestick SVG
// into .chart-frame elements that carry data-ticker.
//
// Also updates the ts-price block in the header (last, 1d change)
// and shows a 52-week range + YTD figure beneath the chart.

(function () {
  const PRICES_URL = (document.currentScript?.dataset.pricesUrl) || '../assets/prices.json';

  const fmt$ = (n) => {
    if (n == null) return '—';
    if (n >= 1000) return '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    return '$' + n.toFixed(2);
  };
  const fmtPct = (n) => {
    if (n == null) return '—';
    const sign = n > 0 ? '+' : '';
    return sign + n.toFixed(2) + '%';
  };

  function drawCandles(svgEl, bars, opts) {
    const W = opts.width;
    const H = opts.height;
    const pad = { t: 10, r: 54, b: 24, l: 10 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const highs = bars.map(b => b.h);
    const lows = bars.map(b => b.l);
    const yMax = Math.max(...highs);
    const yMin = Math.min(...lows);
    const yRange = yMax - yMin || 1;
    const yPad = yRange * 0.08;
    const yLo = yMin - yPad;
    const yHi = yMax + yPad;

    const xAt = (i) => pad.l + (i + 0.5) * (plotW / bars.length);
    const yAt = (price) => pad.t + (1 - (price - yLo) / (yHi - yLo)) * plotH;

    const barWidth = Math.max(2, (plotW / bars.length) * 0.64);

    const bgGrid = [];
    // 4 horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (i / 4) * plotH;
      const price = yHi - (i / 4) * (yHi - yLo);
      bgGrid.push(
        `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" stroke="var(--rule-soft, #E5DFD3)" stroke-width="0.5"/>`
      );
      bgGrid.push(
        `<text x="${W - pad.r + 6}" y="${y + 3}" font-family="IBM Plex Mono, monospace" font-size="10" fill="var(--ink-mute, #6b6356)" text-anchor="start">${price.toFixed(2)}</text>`
      );
    }

    const candles = bars.map((b, i) => {
      const x = xAt(i);
      const yH = yAt(b.h);
      const yL = yAt(b.l);
      const yO = yAt(b.o);
      const yC = yAt(b.c);
      const up = b.c >= b.o;
      const fill = up ? '#3a6b3a' : '#8b2e2e';   // muted green / muted red
      const stroke = up ? '#2d5c2d' : '#6e2525';
      const bodyY = Math.min(yO, yC);
      const bodyH = Math.max(1, Math.abs(yC - yO));
      return `
        <line x1="${x}" x2="${x}" y1="${yH}" y2="${yL}" stroke="${stroke}" stroke-width="0.8"/>
        <rect x="${x - barWidth / 2}" y="${bodyY}" width="${barWidth}" height="${bodyH}" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/>
      `;
    }).join('');

    // X-axis labels — first, middle, last
    const xLabels = [];
    const pickIdx = [0, Math.floor(bars.length / 2), bars.length - 1];
    for (const i of pickIdx) {
      const x = xAt(i);
      const label = bars[i].d.slice(0, 7); // YYYY-MM
      xLabels.push(
        `<text x="${x}" y="${H - 6}" font-family="IBM Plex Mono, monospace" font-size="10" fill="var(--ink-mute, #6b6356)" text-anchor="middle">${label}</text>`
      );
    }

    // Last price dashed guide
    const lastPrice = bars[bars.length - 1].c;
    const lastY = yAt(lastPrice);
    const lastGuide = `
      <line x1="${pad.l}" x2="${W - pad.r}" y1="${lastY}" y2="${lastY}" stroke="var(--ink, #1a1a1a)" stroke-width="0.6" stroke-dasharray="2 3" opacity="0.5"/>
      <rect x="${W - pad.r}" y="${lastY - 8}" width="50" height="16" fill="var(--ink, #1a1a1a)"/>
      <text x="${W - pad.r + 25}" y="${lastY + 3}" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="10" fill="var(--paper, #f5f1e8)" text-anchor="middle">${lastPrice.toFixed(2)}</text>
    `;

    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.setAttribute('width', '100%');
    svgEl.setAttribute('height', H);
    svgEl.innerHTML = `
      <rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>
      ${bgGrid.join('')}
      ${candles}
      ${lastGuide}
      ${xLabels.join('')}
    `;
  }

  function renderChart(container, ticker, data) {
    if (!data) {
      container.innerHTML = '<div class="pending">Chart · Historical OHLC data pending</div>';
      return;
    }
    const bars = data.bars;
    const sum = data.summary;
    const W = container.clientWidth || 720;
    const H = 300;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Price chart for ${ticker}`);
    container.innerHTML = '';
    container.appendChild(svg);
    drawCandles(svg, bars, { width: W, height: H });

    // Redraw on resize
    let resizeTimer;
    const resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newW = container.clientWidth || 720;
        drawCandles(svg, bars, { width: newW, height: H });
      }, 120);
    };
    window.addEventListener('resize', resizeHandler);
  }

  function updateHeader(ticker, data) {
    const priceBlock = document.querySelector('.ts-price');
    if (!priceBlock || !data) return;
    const s = data.summary;
    const up = s.chg1d >= 0;
    priceBlock.innerHTML = `
      <div class="label">Last price (synthetic)</div>
      <div class="val">${fmt$(s.last)}</div>
      <div class="sub" style="color:${up ? '#3a6b3a' : '#8b2e2e'}">
        ${fmtPct(s.chg1d)} · 1d
      </div>
    `;
  }

  function injectStats(container, data) {
    if (!data) return;
    const s = data.summary;
    const stats = document.createElement('div');
    stats.className = 'chart-stats';
    stats.innerHTML = `
      <div><span class="k">52-Week High</span><span class="v">${fmt$(s.high52)}</span></div>
      <div><span class="k">52-Week Low</span><span class="v">${fmt$(s.low52)}</span></div>
      <div><span class="k">YTD</span><span class="v" style="color:${s.chgYtd >= 0 ? '#3a6b3a' : '#8b2e2e'}">${fmtPct(s.chgYtd)}</span></div>
      <div><span class="k">1-Year</span><span class="v" style="color:${s.chg1y >= 0 ? '#3a6b3a' : '#8b2e2e'}">${fmtPct(s.chg1y)}</span></div>
    `;
    container.parentElement.insertBefore(stats, container.nextSibling);
  }

  async function init() {
    const frames = document.querySelectorAll('.chart-frame[data-ticker]');
    if (!frames.length) return;

    // Prefer inline price data (avoids 401s in sandboxed previews + works offline)
    const inlineEl = document.getElementById('ticker-prices');
    let singleTickerData = null;
    if (inlineEl && inlineEl.textContent.trim()) {
      try { singleTickerData = JSON.parse(inlineEl.textContent); } catch (e) {}
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
      const data = singleTickerData || (priceData ? priceData[tk] : null);
      renderChart(frame, tk, data);
      if (data) {
        updateHeader(tk, data);
        injectStats(frame, data);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
