// Map 60+ raw categories into 8 clean thematic buckets.
// Also group by parent "tier" for the homepage layout.

const BUCKETS = {
  'Hidden Compounders': [
    'HIDDEN COMPOUNDER', 'COMPOUNDING MACHINE', 'CASH MACHINE',
    'SEE\'S CANDIES ECONOMICS', 'BRAND TURNAROUND AT PANIC PRICE',
    'MONOPOLY ASSET AT DISCOUNT', 'ROYALTY STREAM AT SCALE',
    'HIDDEN FINTECH TRANSITION', 'FIRST-IN-CLASS NEPHROLOGY',
    'ORPHAN DRUG MONOPOLY', 'REINSURANCE TURNAROUND',
    'POST-LOCKUP / HIDDEN COMPOUNDER', 'QUALITY AT PANIC PRICE',
  ],
  'Institutional Orphans': [
    'INSTITUTIONAL ORPHANS', 'INSTITUTIONAL ORPHAN',
    'QUANTITATIVE SURVIVOR', 'SPECIAL SITUATION', 'CONDITIONAL PICK',
  ],
  'Holding Company Discounts': [
    'HOLDCO — NAV DISCOUNT', 'HOLDCO',
    'HOLDCO — FAMILY-CONTROLLED COMPOUNDER',
    'HIDDEN ASSET WITH COMPLEXITY',
  ],
  'Spinoffs': [
    'SPINOFF', 'SPINOFF — QUALITY-AT-DISCOUNT',
    'SPINOFF — FORCED SELLING', 'SPINOFF — RECENT',
    'SPINOFF / VALUE TRAP RISK',
  ],
  'Activist Situations': [
    'ACTIVIST', 'ACTIVIST — OPERATIONAL TURN',
    'ACTIVIST — CAPITAL RETURN', 'ACTIVIST — SALE OR BREAKUP',
    'ACTIVIST / TENDER OFFER', 'ACTIVIST / M&A ARB',
  ],
  'Merger Arbitrage': [
    'M&A ARBITRAGE', 'M&A ARB', 'M&A ARBITRAGE / ACTIVIST',
    'M&A ARBITRAGE — SPECULATIVE', 'TAKE-PRIVATE PENDING',
    'TAKE-PRIVATE', 'TENDER OFFER', 'SELF-TENDER',
    'LITIGATION RESOLUTION',
  ],
  'Distressed & Binary': [
    'POST-BANKRUPTCY', 'DISTRESSED ARB', 'FDA BINARY',
    'BIOTECH BINARY', 'VALUE TRAP RISK', 'MELTING ICE CUBE',
    'REVERSE SPLIT', 'CONVERTIBLE MATURITY',
    'CONVERTIBLE MATURITY / CYCLICAL TROUGH', 'POST-LOCKUP',
    'SPAC LIQUIDATION', 'RIGHTS OFFERING',
  ],
  'Cyclicals & CEFs': [
    'CYCLICAL TROUGH', 'BELOW-BOOK QUALITY', 'SUB-CASH OPERATING',
    'CASH FORTRESS', 'INDEX REBALANCE',
    'CEF DISCOUNT ACTIVISM', 'CEF — DISCOUNT ACTIVISM',
    'CEF', 'CLOSED-END FUND ARBITRAGE',
  ],
};

// Bucket order for display
const BUCKET_ORDER = [
  'Institutional Orphans',
  'Hidden Compounders',
  'Activist Situations',
  'Spinoffs',
  'Merger Arbitrage',
  'Holding Company Discounts',
  'Cyclicals & CEFs',
  'Distressed & Binary',
];

async function main() {
  const parsedCat = JSON.parse(await readFile('parsed-categories.json'));
  const tsReal = JSON.parse(await readFile('tearsheets-real.json'));
  const parsedProfiles = JSON.parse(await readFile('parsed-profiles.json'));

  // Build lookup of category -> bucket
  const catToBucket = {};
  for (const [bucket, cats] of Object.entries(BUCKETS)) {
    for (const c of cats) catToBucket[c.toUpperCase()] = bucket;
  }

  // Update tearsheets with proper classification
  let matched = 0;
  let unmatched = [];
  for (const t of tsReal) {
    const p = parsedCat[t.ticker];
    if (!p) { unmatched.push(t.ticker); continue; }

    const bucket = catToBucket[(p.category || '').toUpperCase()] || null;
    t.category = p.category;
    t.bucket = bucket;
    // Override tier/tierName if parsedCategories has better data
    if (p.tier != null) t.tier = p.tier;
    if (p.tierName) t.tierName = p.tierName;
    if (p.score != null && t.score == null) t.score = p.score;
    if (bucket) matched++;
  }

  log('tearsheets with a bucket:', matched, '/', tsReal.length);
  log('unmatched tickers (no parsedCategory):', unmatched.length);
  if (unmatched.length) log('  examples:', unmatched.slice(0, 10).join(', '));

  // Bucket distribution
  const bucketCounts = {};
  for (const t of tsReal) {
    const k = t.bucket || 'UNBUCKETED';
    bucketCounts[k] = (bucketCounts[k] || 0) + 1;
  }
  log('Bucket distribution:');
  for (const b of BUCKET_ORDER) log(' ', (bucketCounts[b] || 0).toString().padStart(3), ':', b);
  if (bucketCounts['UNBUCKETED']) log(' ', String(bucketCounts['UNBUCKETED']).padStart(3), ': UNBUCKETED');

  // Show unbucketed categories
  const rawUnmatched = new Set();
  for (const t of tsReal) {
    if (!t.bucket && t.category) rawUnmatched.add(t.category);
  }
  if (rawUnmatched.size) {
    log('Raw categories still unbucketed:');
    for (const c of rawUnmatched) log('  ', c);
  }

  // Save updated tearsheets
  await saveFile('tearsheets-real.json', JSON.stringify(tsReal, null, 2));
  log('updated tearsheets-real.json with bucket + category fields');

  // Also update parsed-profiles with bucket/category so stock pages can render chips
  for (const tk of Object.keys(parsedProfiles)) {
    const p = parsedCat[tk];
    if (!p) continue;
    parsedProfiles[tk].category = p.category;
    parsedProfiles[tk].bucket = catToBucket[(p.category || '').toUpperCase()] || null;
    if (p.tier != null) parsedProfiles[tk].tier = p.tier;
    if (p.tierName) parsedProfiles[tk].tierName = p.tierName;
    if (p.score != null && parsedProfiles[tk].score == null) parsedProfiles[tk].score = p.score;
  }
  await saveFile('parsed-profiles.json', JSON.stringify(parsedProfiles));
  log('updated parsed-profiles.json');

  // Export the bucket map for homepage use
  await saveFile('assets/buckets.json', JSON.stringify({ BUCKET_ORDER, BUCKETS }, null, 2));
}
await main();
