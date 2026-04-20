// Re-parse combined txt to extract category for EVERY ticker.
// Uses:
//   - Primary tier (if ## TIER N — NAME | Score: X/100 present above the entry)
//   - Category classification (## HIDDEN COMPOUNDER | ..., ## ACTIVIST | ..., etc.)
//   - Volume/Section context from parent heading (Volume 3 A: Below-Book, Volume 4 B: Spinoffs, etc.)
//
// Output: parsed-categories.json — { ticker: { tier, tierName, category, volume, volumeSection, score } }

async function main() {
  const txt = await readFile('uploads/Small_Capital_Opportunities_COMBINED.txt');
  const lines = txt.split('\n');

  const out = {};
  let currentVolume = null;
  let currentVolumeSection = null;
  let pendingClassification = null;   // { tier, tierName, category, score }
  let firstLevelTier = null;          // TIER N — NAME from # TIER N heading

  // Helper to reset pending classification
  function parseClassification(line) {
    // Match: "## TIER 3 — QUALITY AT PANIC PRICE | Score: 82/100"
    let m = line.match(/^##\s*TIER\s*(\d)\s*[—–-]\s*([A-Z][A-Z0-9'\s&/-]+?)\s*\|\s*Score:\s*(\d+)\/100/i);
    if (m) {
      return { tier: +m[1], tierName: m[2].trim().toUpperCase(), category: m[2].trim().toUpperCase(), score: +m[3] };
    }
    // Match: "## HIDDEN COMPOUNDER | B2B payments ... | Score: 70/100"
    m = line.match(/^##\s*([A-Z][A-Z0-9'\s—–\-&/]+?)\s*\|.*Score:\s*(\d+)\/100/i);
    if (m) {
      return { tier: null, tierName: null, category: m[1].trim().toUpperCase(), score: +m[2] };
    }
    // Match: "## HIDDEN COMPOUNDER | Description (no score)"
    m = line.match(/^##\s*([A-Z][A-Z0-9'\s—–\-&/]+?)\s*\|/);
    if (m && /^(HIDDEN|ACTIVIST|HOLDCO|SPINOFF|CYCLICAL|POST-|SELF-|TAKE-|MONOPOLY|BRAND|REINSURANCE|ORPHAN|COMPOUNDING|QUANTITATIVE|QUALITY|SPECIAL|CASH|CONDITIONAL|FIRST-|SEE'S|ROYALTY|CLOSED-)/i.test(m[1])) {
      return { tier: null, tierName: null, category: m[1].trim().toUpperCase(), score: null };
    }
    return null;
  }

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    // Volume heading: "#  VOLUME 3 — 50 BELOW-BOOK + SPECIAL SITS ... #"
    let vm = l.match(/VOLUME\s+(\d+)\s*[—–-]\s*([A-Z][A-Z0-9\s\-'+/,&()]+?)(?:\s*\(|\s*#|$)/i);
    if (vm && l.includes('#')) {
      currentVolume = `Volume ${vm[1]}: ${vm[2].trim()}`;
      currentVolumeSection = null;
      continue;
    }

    // Section within volume: "# A. TOP 25 PROFITABLE BELOW-BOOK" or "# A. SUB-CASH & CASH-RICH OPERATING BUSINESSES"
    let sm = l.match(/^#\s+([A-Z])\.\s+([A-Z][A-Z0-9\s\-'+/,&()]+?)\s*$/);
    if (sm) {
      currentVolumeSection = `${sm[1]}. ${sm[2].trim()}`;
      continue;
    }

    // Top-level TIER heading (# TIER 1 — INSTITUTIONAL ORPHANS)
    let tm = l.match(/^#\s+TIER\s*(\d)\s*[—–-]\s*([A-Z][A-Z0-9'\s&/-]+?)\s*$/i);
    if (tm) {
      firstLevelTier = { tier: +tm[1], tierName: tm[2].trim().toUpperCase() };
      continue;
    }

    // ## classification line — attaches to NEXT ticker heading below
    const cl = parseClassification(l);
    if (cl) {
      pendingClassification = cl;
      continue;
    }

    // Ticker entry heading: "# 1. CIX — CompX International" or "# 7. ACGL — Arch Capital Group"
    let th = l.match(/^#\s+\d+\.\s+([A-Z0-9.\-]+)\s*[—–-]\s*(.+?)\s*$/);
    if (th) {
      const tk = th[1];
      const name = th[2].trim();
      // Merge in this order: pending classification > firstLevelTier > volume context
      let tier = pendingClassification?.tier ?? firstLevelTier?.tier ?? null;
      let tierName = pendingClassification?.tierName ?? firstLevelTier?.tierName ?? null;
      let category = pendingClassification?.category ?? firstLevelTier?.tierName ?? null;
      let score = pendingClassification?.score ?? null;

      if (!out[tk]) {
        out[tk] = {
          ticker: tk,
          name,
          tier,
          tierName,
          category,
          score,
          volume: currentVolume,
          volumeSection: currentVolumeSection,
        };
      }
      pendingClassification = null; // consumed
      continue;
    }

    // Catch "##" ticker-like headings that might be extended watchlist format:
    // e.g. "## JILL  — Something"  — rare but check
  }

  // Stats
  const categoryCounts = {};
  let tierCount = 0;
  let categorized = 0;
  for (const t of Object.values(out)) {
    if (t.tier != null) tierCount++;
    const k = t.category || 'UNCATEGORIZED';
    categoryCounts[k] = (categoryCounts[k] || 0) + 1;
    if (t.category) categorized++;
  }

  log('total parsed tickers:', Object.keys(out).length);
  log('have explicit tier:', tierCount);
  log('have category:', categorized);
  log('categories distribution:');
  Object.entries(categoryCounts).sort((a,b) => b[1] - a[1]).forEach(([k, v]) => log('  ', v, ':', k));

  await saveFile('parsed-categories.json', JSON.stringify(out, null, 2));
  log('wrote parsed-categories.json');
}
await main();
