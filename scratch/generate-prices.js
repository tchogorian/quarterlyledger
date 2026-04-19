// Generate deterministic synthetic OHLC price history for each ticker.
// Produces 14 months of weekly candles (~60 bars per ticker).
// Seeded on ticker string so the same ticker always gets the same "history" —
// stable between regenerations, ready to be swapped for real data later.

async function main() {
  const tsReal = JSON.parse(await readFile('tearsheets-real.json'));

  // Mulberry32 PRNG seeded from ticker string
  function seedFromString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Standard normal via Box–Muller
  function randn(rand) {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Pick a plausible starting price from market cap tier, then walk with GBM.
  function startingPrice(ts, rand) {
    // Use tier to bias starting price ranges.
    const tier = ts.tier;
    if (tier === 1) return 20 + rand() * 180;     // quality orphans
    if (tier === 2) return 15 + rand() * 140;
    if (tier === 3) return 10 + rand() * 100;
    if (tier === 4) return 8 + rand() * 60;
    if (tier === 5) return 5 + rand() * 40;
    return 8 + rand() * 60;
  }

  // GBM parameters by tier: quality stocks drift up modestly with low vol;
  // distressed stocks walk sideways/down with higher vol.
  function gbmParams(ts, rand) {
    const tier = ts.tier || 3;
    const baseDrift = ({1: 0.12, 2: 0.08, 3: 0.04, 4: -0.02, 5: -0.08})[tier] || 0;
    const baseVol = ({1: 0.22, 2: 0.26, 3: 0.30, 4: 0.38, 5: 0.52})[tier] || 0.30;
    // Jitter a bit per-ticker
    const drift = baseDrift + (rand() - 0.5) * 0.06;
    const vol = Math.max(0.10, baseVol + (rand() - 0.5) * 0.08);
    return { drift, vol };
  }

  // Generate N weekly bars. dt = 1/52 year.
  function generateBars(ts, nWeeks = 60) {
    const rand = mulberry32(seedFromString(ts.ticker));
    const { drift, vol } = gbmParams(ts, rand);
    const dt = 1 / 52;
    const sqrtDt = Math.sqrt(dt);
    let price = startingPrice(ts, rand);

    const bars = [];
    // End date = today (April 19, 2026). Walk backward 60 weeks.
    const end = new Date('2026-04-19T00:00:00Z');
    for (let i = nWeeks - 1; i >= 0; i--) {
      // Brownian shock
      const z = randn(rand);
      const ret = (drift - 0.5 * vol * vol) * dt + vol * sqrtDt * z;
      const nextPrice = price * Math.exp(ret);

      // Intra-week OHLC
      const open = price;
      const close = nextPrice;
      const bodyHigh = Math.max(open, close);
      const bodyLow = Math.min(open, close);
      // Wicks as fraction of weekly range
      const range = Math.max(0.001, bodyHigh - bodyLow);
      const high = bodyHigh + range * (0.2 + rand() * 1.2);
      const low = bodyLow - range * (0.2 + rand() * 1.0);

      // Week ending date (Fridays), walking backward
      const d = new Date(end);
      d.setUTCDate(d.getUTCDate() - i * 7);
      const dateStr = d.toISOString().slice(0, 10);

      bars.push({
        d: dateStr,
        o: +open.toFixed(2),
        h: +high.toFixed(2),
        l: +Math.max(0.01, low).toFixed(2),
        c: +close.toFixed(2),
      });
      price = nextPrice;
    }
    return bars;
  }

  // Summary stats computed from the last bar
  function summary(bars) {
    const last = bars[bars.length - 1];
    const first52 = bars[Math.max(0, bars.length - 52)];
    const high52 = Math.max(...bars.slice(-52).map(b => b.h));
    const low52 = Math.min(...bars.slice(-52).map(b => b.l));
    const chg1y = ((last.c - first52.c) / first52.c) * 100;
    // YTD = since 2026-01-01
    const ytdStart = bars.find(b => b.d >= '2026-01-01') || bars[Math.max(0, bars.length - 16)];
    const chgYtd = ((last.c - ytdStart.c) / ytdStart.c) * 100;
    return {
      last: last.c,
      prevClose: bars[bars.length - 2]?.c || last.o,
      chg1d: (((last.c - (bars[bars.length - 2]?.c || last.o)) / (bars[bars.length - 2]?.c || last.o)) * 100),
      chg1y,
      chgYtd,
      high52,
      low52,
    };
  }

  const out = {};
  for (const ts of tsReal) {
    const bars = generateBars(ts, 60);
    const s = summary(bars);
    out[ts.ticker] = {
      bars,
      summary: {
        last: +s.last.toFixed(2),
        chg1d: +s.chg1d.toFixed(2),
        chgYtd: +s.chgYtd.toFixed(2),
        chg1y: +s.chg1y.toFixed(2),
        high52: +s.high52.toFixed(2),
        low52: +s.low52.toFixed(2),
      },
    };
  }

  await saveFile('assets/prices.json', JSON.stringify(out));
  log('wrote prices for', Object.keys(out).length, 'tickers');
  // Sample
  const sample = out['CIX'];
  log('CIX bars:', sample.bars.length, 'first:', JSON.stringify(sample.bars[0]), 'last:', JSON.stringify(sample.bars[sample.bars.length-1]));
  log('CIX summary:', JSON.stringify(sample.summary));
}
await main();
