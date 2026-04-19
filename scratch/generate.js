// Generator for 376 procedural tearsheets.
// Deterministic (seeded) so regenerating produces stable output.

// ── Seeded RNG ────────────────────────────────────────────────────────
let _seed = 0xC0FFEE;
function rand() {
  _seed = (_seed * 1664525 + 1013904223) >>> 0;
  return _seed / 0x100000000;
}
function randInt(a, b) { return Math.floor(rand() * (b - a + 1)) + a; }
function randFloat(a, b, dp = 2) { return +((rand() * (b - a) + a).toFixed(dp)); }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function maybe(p) { return rand() < p; }

// ── Name banks ────────────────────────────────────────────────────────
// Fictional surname-style roots that sound like old-line American corporations
const ROOTS = [
  'Abernethy','Ashcombe','Ashburton','Atherton','Attwater','Balfour','Barksdale','Beaumont',
  'Belknap','Beresford','Blackburn','Blackwood','Braddock','Brampton','Briarshore','Bridgewater',
  'Cadwallader','Calverton','Carrington','Caslon','Caverly','Chadbourne','Chilcott','Claverly',
  'Clifton','Colby','Copperline','Cornelius','Cornerstone','Covehaven','Coxwell','Cranbrook',
  'Cresswell','Crispin','Dalhousie','Danforth','Dinsmore','Drayton','Eastlake','Edgemere',
  'Ellicott','Elmwood','Evergreen','Fairhaven','Fairleigh','Fenmore','Ferncliff','Fitzroy',
  'Forrester','Foxcroft','Galloway','Garland','Gatsby','Glenmoor','Goddard','Grangehall',
  'Granite','Gresham','Halberd','Halifax','Hallmark','Hampden','Harborline','Hartwell',
  'Hastings','Hawthorne','Hazelmere','Hearth','Hemsworth','Holbrook','Holloway','Hornsby',
  'Ingleside','Ironbridge','Jardine','Kelmscott','Kenwick','Keystone','Kilbourne','Kingsbridge',
  'Kirkland','Langley','Larchmont','Lifemark','Lindenhurst','Lodgerton','Longmoor','Lovelace',
  'Ludlow','Luminary','Lyndhurst','Mallory','Marchmont','Markham','Mayfair','McAllister',
  'McCandless','Meadowood','Meridian','Merrivale','Milhaven','Mossborough','Norbury','Northbrook',
  'Norwick','Oakenshaw','Oakmere','Orion','Osbourne','Palmerston','Pemberton','Pennington',
  'Percival','Pickering','Pinnacle','Plainfield','Prescott','Quarterdeck','Radcliffe','Ranleigh',
  'Ravenhill','Redgrave','Reliance','Remington','Renfrew','Ridgemont','Rockwell','Rutherford',
  'Sackville','Saltmarsh','Sandringham','Seabright','Sedgefield','Selwyn','Sherborne','Silverstone',
  'Somerset','Southwark','Standish','Stanhope','Steelhaven','Sterling','Stockton','Stonebridge',
  'Strickland','Swiftland','Tadcaster','Tallbrook','Tavenham','Tavistock','Templeton','Thackeray',
  'Thornbury','Thorpewood','Tidewater','Tilbury','Tolworth','Topham','Tredegar','Trelawney',
  'Trevelyan','Truscott','Underwood','Vantage','Verdant','Vickery','Wadsworth','Walsingham',
  'Warrington','Waverly','Wedgemere','Wentworth','Westcott','Whitmore','Whittaker','Wickham',
  'Willoughby','Winchester','Windermere','Woodbridge','Wyndham','Yardley','Yorkfield'
];

// Sector definitions: target count aligns with sector scorecard
const SECTORS = [
  { key:'tech',    label:'Technology & Communications',     dividerRoman:'I',    count:42,
    subs:['Enterprise Software — Infrastructure','Enterprise Software — Applications','Semiconductors — Analog & Mixed-Signal','Semiconductors — Logic','Semiconductors — Equipment','Networking Equipment','Telecom — Integrated','Telecom — Wireless','Cloud Infrastructure','Data & Analytics','IT Services','Internet Services','Consumer Electronics','Cybersecurity Software'],
    suffixBank:['Corp.','Inc.','Systems','Technologies','Networks','Software','Data Services','Holdings','Group','Semiconductor Corp.'] },
  { key:'health',  label:'Health Services & Pharmaceuticals', dividerRoman:'II', count:56,
    subs:['Pharmaceuticals — Large-Cap','Pharmaceuticals — Specialty & Biotech','Biotechnology','Medical Devices — Diagnostics','Medical Devices — Cardiovascular','Medical Devices — Orthopedic','Hospitals & Clinical Services','Managed Care','Life Sciences Tools','Pharmacy & Drug Retail','Healthcare Distribution'],
    suffixBank:['Pharmaceuticals Ltd.','Laboratories','Medical Systems','Therapeutics','BioSciences','Health Holdings','Hospital Holdings','MedTech','Clinical Corp.','Biologics','Health Inc.'] },
  { key:'indust',  label:'Industrials',                     dividerRoman:'III',  count:41,
    subs:['Aerospace & Defense — Prime','Aerospace & Defense — Subsystems','Diversified Industrials','Machinery — Construction','Machinery — Agricultural','Machinery — Precision Tools','Electrical Equipment','Building Products','Engineering & Construction','Industrial Distribution','Commercial Services'],
    suffixBank:['Industries','Industrial Group','Manufacturing','Tool Works','Aerospace Industries','Machinery Co.','Engineering','Corp.','& Co.','Works'] },
  { key:'trans',   label:'Transport & Logistics',           dividerRoman:'IV',   count:27,
    subs:['Transport — Containerized & Dry Bulk','Railroads — Class I','Railroads — Short-Line','Trucking & Freight Forwarding','Air Freight & Logistics','Passenger Airlines','Marine Ports & Services'],
    suffixBank:['Shipping Co.','Rail Holdings','Logistics','Transport','Freight','Lines','Marine Co.','Railways','Cargo Corp.'] },
  { key:'staples', label:'Consumer Staples',                dividerRoman:'V',    count:24,
    subs:['Packaged Foods','Beverages — Non-Alcoholic','Beverages — Alcoholic','Tobacco','Household Products','Personal Care','Food Retail','Consumer Products — Diversified'],
    suffixBank:['Provisions','Brands','Beverages','& Sons','Food Co.','Products','Foods Inc.','& Co.','Mills']},
  { key:'discret', label:'Consumer Discretionary',          dividerRoman:'VI',   count:28,
    subs:['Specialty Retail','Department Stores','Restaurants','Hotels & Lodging','Apparel & Footwear','Automobiles — OEM','Automobile Parts','Media — Publishing','Leisure & Recreation','Homebuilding'],
    suffixBank:['Retail Group','Hotels','Apparel','Automotive','Brands','Stores','Holdings','& Co.','Publishing','Restaurants'] },
  { key:'banks',   label:'Financials — Banks',              dividerRoman:'VII',  count:21,
    subs:['Banks — Money Center','Banks — Super-Regional','Banks — Regional · Mid-Atlantic','Banks — Regional · New England','Banks — Regional · South','Banks — Regional · Midwest','Banks — Regional · West','Banks — Community','Thrifts & Savings','Custody & Trust'],
    suffixBank:['Financial Holdings','Mutual Bancorp','Bankshares','Bancorp','Financial Corp.','Savings','Trust Co.','Union Bankshares','National','& Trust'] },
  { key:'insure',  label:'Financials — Insurance',          dividerRoman:'VIII', count:26,
    subs:['Property & Casualty Insurance','Life & Health Insurance','Reinsurance','Insurance Brokers','Title Insurance','Specialty Insurance','Multi-Line Insurance'],
    suffixBank:['Casualty','Assurance','Mutual Holdings','Insurance Group','Life Co.','Reinsurance','& Marine','Indemnity','General Ins.','Underwriters'] },
  { key:'util',    label:'Utilities & Pipelines',           dividerRoman:'IX',   count:27,
    subs:['Electric & Water Utilities — Regulated','Electric Utility — Integrated','Natural Gas Utility','Natural Gas Pipelines','Water Utilities','Hydro & Renewables — Regulated','Multi-Utility'],
    suffixBank:['Utilities Group','Power & Light','Electric Co.','Gas Pipeline','Water Works','Hydro','Energy Corp.','Utility Holdings','Resources'] },
  { key:'energy',  label:'Energy',                          dividerRoman:'X',    count:19,
    subs:['Integrated Oil & Gas','E&P — Independent','Oilfield Services & Equipment','Natural Gas — Exploration','Refining & Marketing','Midstream — MLP','Coal & Mining Fuels'],
    suffixBank:['Petroleum','Resources','Energy','Oilfield Services','Natural Gas','Refining Co.','Exploration','Oil Corp.','Gas Co.'] },
  { key:'mat',     label:'Materials & Chemicals',           dividerRoman:'XI',   count:24,
    subs:['Specialty Chemicals','Commodity Chemicals','Paper & Forest Products','Containers & Packaging','Metals & Mining — Copper','Metals & Mining — Gold','Metals & Mining — Diversified','Steel','Construction Materials','Agricultural Chemicals'],
    suffixBank:['Chemicals Corp.','Paper & Forest','Mining','Steel Co.','Materials','Industries','Metals','Chemical Works','& Refining'] },
  { key:'reit',    label:'Real Estate & Lodging',           dividerRoman:'XII',  count:41,
    subs:['REIT — Residential','REIT — Industrial/Logistics','REIT — Office & Mixed-Use','REIT — Retail','REIT — Healthcare','REIT — Self-Storage','REIT — Data Center','REIT — Lodging','REIT — Net Lease','REIT — Specialty'],
    suffixBank:['Realty Trust','Industrial REIT','Office Trust','Properties','Realty Corp.','Storage Trust','Data Trust','Lodging Trust','Net Lease','REIT Holdings'] },
];

// verify total
const total = SECTORS.reduce((s, x) => s + x.count, 0);
console.log('total sector headcount:', total);

// ── Helpers ────────────────────────────────────────────────────────────
// cryptic CUSIP (9 chars)
function cusip() {
  const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 9; i++) s += chars[Math.floor(rand() * chars.length)];
  return s;
}
// Generate a 4-char ticker from a root
function ticker(used) {
  let t;
  for (let tries = 0; tries < 20; tries++) {
    const root = pick(ROOTS).toUpperCase().replace(/[^A-Z]/g, '');
    const len = pick([3,4,4,4,5]);
    t = root.slice(0, len);
    if (!used.has(t) && t.length >= 3) { used.add(t); return t; }
  }
  // fallback
  t = (t || 'XXXX') + randInt(0,9);
  used.add(t); return t;
}

// Company name from bank
function companyName(sec, used) {
  for (let tries = 0; tries < 40; tries++) {
    const a = pick(ROOTS);
    const useDouble = maybe(0.15);
    let base = a;
    if (useDouble) {
      const b = pick(ROOTS);
      if (b !== a) base = `${a}-${b}`;
    }
    const suf = pick(sec.suffixBank);
    const nm = `${base} ${suf}`;
    if (!used.has(nm)) { used.add(nm); return nm; }
  }
  return `Unnamed ${sec.key}`;
}

// Generate price-history ~23 monthly points
function priceHistory(px, style) {
  // styles: 'growth', 'cyclical', 'defensive', 'decline'
  const n = 23;
  const out = [];
  let v = px * 0.55 + rand() * px * 0.15;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let drift;
    if (style === 'growth') drift = px * (0.020 + rand() * 0.015);
    else if (style === 'cyclical') drift = Math.sin(i / 3 + rand()) * px * 0.025 + (rand() - 0.4) * px * 0.01;
    else if (style === 'defensive') drift = px * (0.006 + (rand() - 0.5) * 0.012);
    else if (style === 'decline') drift = (rand() - 0.65) * px * 0.025;
    else drift = (rand() - 0.45) * px * 0.02;
    v = v + drift;
    v = Math.max(v, px * 0.25);
    out.push(+v.toFixed(2));
  }
  // final point near current px
  out[n - 1] = px;
  return out;
}
function chartRange(hist) {
  const high = Math.max(...hist) * randFloat(1.00, 1.04);
  const low  = Math.min(...hist) * randFloat(0.95, 1.00);
  return [high, low];
}
const money = v => '$' + (v >= 1000 ? (v/1000).toFixed(2) + 'B' : v.toFixed(0) + 'M');
const delta = (px, pct) => {
  const amt = px * pct / 100;
  const sign = pct >= 0 ? '+' : '−';
  return `${sign}$${Math.abs(amt).toFixed(2)}  (${sign}${Math.abs(pct).toFixed(1)}%)`;
};
const range52 = r => `$${r[0].toFixed(2)} – $${r[1].toFixed(2)}`;

// Produce a 10-year fundamental history with a growth profile.
// Returns the financials object and derived thesis-relevant metrics.
function buildFinancials(cfg) {
  const years = 10;
  const g = cfg.growth;          // avg rev CAGR 0.0..0.2
  const baseRev = cfg.baseRev;   // starting revenue
  const baseMgn = cfg.baseMgn;   // starting op margin
  const baseShr = cfg.baseShr;   // starting shares
  const shapeNoise = cfg.noise ?? 0.04;
  const mgnTrend = cfg.mgnTrend ?? 0.004;  // margin improvement per year
  const bvStart = cfg.bvStart;   // book value per share start

  const rev=[], opmgn=[], earn=[], eps=[], div=[], bv=[], roe=[], shares=[];
  let r = baseRev, m = baseMgn, s = baseShr, b = bvStart;
  let d = cfg.divStart ?? 0.4;
  for (let i = 0; i < years; i++) {
    const noise = 1 + (rand() - 0.5) * shapeNoise * 2;
    r = r * (1 + g + (rand() - 0.5) * 0.03) * noise;
    m = Math.min(Math.max(m + mgnTrend + (rand() - 0.5) * 0.005, 0.03), 0.55);
    s = s * (1 + (rand() - 0.55) * 0.008);  // slight buybacks bias
    const ni = r * m * randFloat(0.78, 0.95, 3);  // some below-line expense
    const e = ni / s;
    b = b * (1 + randFloat(0.03, 0.14, 3));
    const rEquity = e / b * 100;
    const divYr = d;
    d = d * (1 + randFloat(0.04, 0.10, 3));
    rev.push(Math.round(r));
    opmgn.push(+(m * 100).toFixed(1));
    earn.push(Math.round(ni));
    eps.push(+e.toFixed(2));
    div.push(+divYr.toFixed(2));
    bv.push(+b.toFixed(2));
    roe.push(+rEquity.toFixed(1));
    shares.push(Math.round(s));
  }
  return { rev, opmgn, earn, eps, div, bv, roe, shares };
}

// Deterministic thesis scaffolds per sector
const THESIS_SCAFFOLDS = {
  tech: {
    lead: [
      '{co}\'s revenue model has migrated decisively to recurring subscription, and the compounding effects on margin and visibility remain under-appreciated.',
      'Semiconductor content per system is expanding faster than end-market units; {co} is positioned where the content growth is most durable.',
      'The firm\'s technical moat in {sub} is widening, yet shares trade at an unremarkable multiple to the peer group.',
    ],
    bullets: [
      'Subscription revenue compounds at {x}% annually and now represents {y}% of the total — each incremental dollar accretes at high marginal operating margin.',
      'Customer cohort retention over three years is {x}%, well above the industry median of {y}%, producing predictable forward visibility.',
      'R&D intensity of {x}% is consistent with a firm investing for the next product cycle; capitalized software is held flat through the cycle.',
      'Net cash position of {x}% of market capitalization provides optionality for disciplined acquisition or accelerated buyback.',
      'At {x}× forward earnings the shares do not yet reflect the margin expansion we project through FY27.',
    ],
    risks: [
      ['Cyclical Demand','End-market demand in {sub} is cyclical; a synchronized slowdown would compress growth 300–500 bps for 2–4 quarters.'],
      ['Platform Transition','Customer migration to cloud-native architectures creates revenue lumpiness and short-term margin drag.'],
      ['Talent Competition','Engineering compensation inflation has outpaced revenue growth by ~2 pts per year; retention risk is non-trivial.'],
      ['Customer Concentration','Top-ten customers represent 24% of revenue; any large departure is material.'],
      ['FX & International','International revenue mix of ~40% creates non-trivial translation sensitivity to the dollar.'],
    ],
  },
  health: {
    lead: [
      '{co}\'s pipeline and franchise profitability combine to produce an earnings trajectory not yet reflected in the forward multiple.',
      'The firm\'s specialty portfolio within {sub} is differentiated and durable; we regard the current valuation as undemanding.',
      'Regulatory approval risk is consistent with the category; what distinguishes {co} is the quality of execution against its labels.',
    ],
    bullets: [
      'Branded volume grew {x}% in FY25 against a peer median of {y}%; the leading franchise contributes {z}% of operating profit.',
      'Phase-III readout in H2 FY26 represents a $1–2B incremental revenue opportunity vs. consensus.',
      'Gross margin of {x}% reflects a favorable manufacturing and mix position that will persist absent IRA renegotiation.',
      'Net cash of $ {x}mm funds both pipeline investment and a programmatic buyback without impairing flexibility.',
      'Patent protection on the two largest products extends to {yr}, providing a long runway for cash generation.',
    ],
    risks: [
      ['Clinical Trial Risk','Pipeline advancement depends on binary readouts; a negative Phase-III outcome would compress estimates 15–25%.'],
      ['Pricing / IRA','Selected-drug negotiation exposure in the next cycle is a known overhang; management has flagged which SKUs are at risk.'],
      ['Patent Cliff','Composition-of-matter expiries in 2030+ will produce revenue step-downs; formulation patents extend only partial cover.'],
      ['Reimbursement Policy','Government payer and PBM formulary position can shift quickly; management pursues outcomes-based contracts to mitigate.'],
      ['Litigation','Product-liability exposure is a persistent tail risk in {sub}; reserves are adequate against known cases.'],
    ],
  },
  indust: {
    lead: [
      '{co}\'s backlog and unit economics describe a business that is materially better than the reported multiple suggests.',
      'Operating leverage is asymmetric; a modest acceleration in order activity would produce outsized earnings response.',
      'The firm\'s position in {sub} is protected by switching costs, depot coverage, and regulatory approval — all underappreciated moats.',
    ],
    bullets: [
      'Order book coverage at {x}× revenue is the highest in the peer group; visibility extends {y} quarters forward.',
      'Unit margins have expanded from {x}% to {y}% since FY20 through mix, pricing discipline, and aftermarket attach.',
      'Aftermarket revenue — {x}% of total — provides counter-cyclical stability and compounds at {y}% annually.',
      'Capex intensity has normalized to ~{x}% of revenue; free cash flow conversion has exceeded 90% for four years.',
      'Dividend has grown {x}% compounded over ten years; payout ratio of {y}% leaves significant headroom.',
    ],
    risks: [
      ['Cyclical End-Markets','End-market demand in {sub} is cyclical; order push-outs could compress revenue 8–12% peak-to-trough.'],
      ['Supply Chain','Casting, forging, and specialty-metal inputs remain constrained; single-source dependencies on six components.'],
      ['Labor','Skilled-labor inflation runs 5–7% per year; union contract renewals in FY26–27 are a watch item.'],
      ['Program Execution','Fixed-price development programs carry cost-overrun risk; FY25 aggregate provision was $ {x}mm.'],
      ['Regulatory','Emissions and safety standards in {sub} are tightening; compliance capex is embedded in guidance.'],
    ],
  },
  trans: {
    lead: [
      'Transport businesses are cyclical and are valued as such; what distinguishes {co} is balance-sheet quality and capital-return cadence.',
      'Network density and route economics produce returns on capital well above {sub} peer averages.',
      'Shareholders have benefitted from disciplined capacity and share repurchase in equal measure; we expect the pattern to continue.',
    ],
    bullets: [
      'Operating ratio of {x}% is {y} pts better than the peer group; further improvement is plausible on PSR initiatives.',
      'Net debt / EBITDA at {x}× is among the lowest in the group; balance-sheet flexibility permits counter-cyclical investment.',
      'The firm has returned {x}% of FY24 free cash flow via buybacks and dividends — a pattern we expect to persist.',
      'Modal mix (domestic intermodal / international / bulk) generates {x}% less earnings volatility than the industry average.',
      'At {x}× forward and {y}% FCF yield the shares trade at a meaningful discount to long-run averages.',
    ],
    risks: [
      ['Rate Cyclicality','Freight rates are volatile; a return to pre-pandemic medians would compress EBITDA ~30%.'],
      ['Regulatory / Emissions','Emissions rules raise opex; non-compliant equipment must be retrofitted or retired.'],
      ['Geopolitical Chokepoints','Route disruption around key chokepoints requires costly re-routing and premium rates.'],
      ['Labor','Union contract exposure is significant; strike risk is non-trivial in certain modes.'],
      ['Fuel','Fuel is a large cost element; surcharge recovery is imperfect across modes.'],
    ],
  },
  staples: {
    lead: [
      '{co} operates in a slow-growth category where the quality of the franchise is the variable that matters.',
      'The firm\'s distribution footprint and brand equity in {sub} have compounded quietly for a century.',
      'We regard the current valuation as attractive for a business of this consistency and cash-return profile.',
    ],
    bullets: [
      'Category share has ticked higher every year since FY18 despite modest promotional intensity.',
      'Gross margin of {x}% reflects scale economies in procurement and a premium brand portfolio.',
      'Dividend has been paid uninterrupted for {yr}+ years and has grown {x}% compounded over the last decade.',
      'Free cash flow conversion of {x}% supports the combined dividend + buyback yield of {y}%.',
      'At {x}× forward and a {y}% yield, shares are undemanding for a franchise of this quality.',
    ],
    risks: [
      ['Input Cost','Commodity inputs are a large share of COGS; transient spikes compress margin until pricing catches up.'],
      ['Retailer Power','Category consolidation at retail compresses effective shelf economics; private-label pressure is persistent.'],
      ['FX','International exposure of ~{x}% creates translation sensitivity to the dollar.'],
      ['Regulation','Labeling and ingredient regulations continue to tighten; reformulation costs are ongoing.'],
      ['Shifting Consumer Preferences','Category evolution in {sub} is slow but real; management must continue innovation investment.'],
    ],
  },
  discret: {
    lead: [
      '{co}\'s position in {sub} is differentiated by execution — merchandising, real estate, and operating cadence — in a way the market underappreciates.',
      'Cyclical businesses eventually look cheap; the question is execution on the way through, which {co} has demonstrably delivered.',
      'Brand equity and customer loyalty combine to support durable unit economics and attractive capital returns.',
    ],
    bullets: [
      'Comparable sales of +{x}% outpaced the peer group ({y}%) on the back of traffic, not price, which is the durable driver.',
      'Gross margin of {x}% benefits from vertical integration and inventory discipline during the recent cycle.',
      'The real-estate footprint has been rationalized — {x} net units over three years — improving four-wall productivity.',
      'Net cash balance of $ {x}mm supports programmatic buyback without impairing reinvestment.',
      'At {x}× forward, shares are priced for a cycle trough; we regard them as attractive for a franchise of this quality.',
    ],
    risks: [
      ['Consumer Cycle','Discretionary spend is cyclical; a recession could compress comparable sales 4–8% for several quarters.'],
      ['Fashion / Taste','Merchandising misses produce markdown pressure; inventory risk is an ongoing management concern.'],
      ['Real Estate','Lease exposure is long-dated; underperforming locations remain a slow headwind.'],
      ['Digital Competition','Channel shift compresses traditional margin structures; digital investment is ongoing.'],
      ['Labor','Wage inflation in service-heavy categories is persistent; productivity offsets are partial.'],
    ],
  },
  banks: {
    lead: [
      '{co} combines deposit quality, credit discipline, and capital strength in a way that the current P/TBV does not reflect.',
      'Regional banks trade on concerns about credit and deposits; {co}\'s portfolio data speak to neither problem applying.',
      'This is a franchise where consistency of underwriting is the compounding variable; the evidence is in the ratios.',
    ],
    bullets: [
      'Net interest margin of {x}% is {y} bps above the regional peer median, reflecting a high low-cost deposit mix.',
      'Non-performing asset ratio of {x}% is the lowest in the peer group; reserves cover projected cycle losses {y}×.',
      'Tangible common equity of {x}% and CET1 of {y}% provide cushion against regulatory tightening.',
      'The bank has paid uninterrupted quarterly dividends since {yr}; {x} consecutive years of dividend increases.',
      'At {x}× forward and {y}× tangible book, the valuation embeds more caution than the data support.',
    ],
    risks: [
      ['Credit Cycle','Commercial real-estate exposure is the principal downside variable; office sub-segment is {x}% of total loans.'],
      ['Deposit Competition','Deposit beta through the recent cycle has been managed; a repeat requires continued active pricing.'],
      ['Regulatory','Basel III finalization and potential assessment increases raise capital requirements and cost of doing business.'],
      ['Interest Rate','Asset-sensitive balance sheet benefits from higher-for-longer; NIM falls in a rapid-cut scenario.'],
      ['Geographic Concentration','{x}% of loans are in the core footprint; regional shocks are non-diversifiable.'],
    ],
  },
  insure: {
    lead: [
      'Underwriting discipline across cycles is the variable that separates insurers; {co} has evidenced it in the reported loss ratio.',
      'The firm\'s reserving posture has been consistently conservative, producing positive development across recent accident years.',
      'Book value has compounded at {x}% over a decade, which — combined with disciplined buybacks — produces attractive per-share results.',
    ],
    bullets: [
      'Combined ratio of {x}% vs. peer {y}% reflects pricing discipline and favorable catastrophe experience.',
      'Reserves have developed positively in each of the last {x} accident years — evidence of conservative initial posture.',
      'Investment portfolio duration of {x} years positions the firm well for the current reinvestment environment.',
      'Dividend grew {x}% compounded over a decade; payout ratio of {y}% leaves substantial capital flexibility.',
      'At {x}× forward and {y}× book, shares reflect cycle worries we consider overstated.',
    ],
    risks: [
      ['Catastrophe','Storm, earthquake, and wildfire exposure is real; reinsurance attachment points manage but do not eliminate tail risk.'],
      ['Reserve Development','Adverse development on long-tail lines is a perennial risk; case reserves are subject to revision.'],
      ['Investment Portfolio','Rate-driven mark-to-market and credit spread widening affect book value and statutory capital.'],
      ['Competitive Pricing','Soft-market rate cycles erode margin; discipline is the only defense.'],
      ['Regulatory','Rate-approval regimes in certain jurisdictions lag economic reality; persistent friction.'],
    ],
  },
  util: {
    lead: [
      'In a market discomfited by duration, {co} offers exactly that: a regulated-utility compound with a clean path to rate-base growth.',
      'Rate-base growth and regulatory constructiveness combine to produce a reliable total-return profile.',
      'The firm\'s capital plan is fully funded and produces visible earnings growth for the next half-decade.',
    ],
    bullets: [
      'Rate base is ${x}B, growing at {y}% CAGR through FY29, driven by transmission hardening and {sub} investment.',
      'Allowed ROE settlements in FY25 produced a blended {x}%; regulatory constructive across jurisdictions.',
      'Dividend has compounded at {x}% annually over twenty years; payout ratio of {y}% leaves headroom; {yr}-year uninterrupted history.',
      'Credit metrics support the BBB+/Baa1 rating; FFO / debt of {x}% is consistent with utility sector norms.',
      'At {x}× forward and a {y}% yield, shares trade in line with peers despite a superior regulatory track record.',
    ],
    risks: [
      ['Interest Rate','Utility multiples compress when long-rates rise; a 100 bp move has historically compressed the group 12–14%.'],
      ['Regulatory','Rate cases are the central risk; an unexpectedly adverse outcome could compress earnings 4–7%.'],
      ['Capex Execution','Multi-billion-dollar capital plan relies on supply-chain deliveries and siting approvals — slippage defers rate-base growth.'],
      ['Climate / Storm','Coastal and inland extreme-weather exposure has risen; recoverability via trackers is imperfect.'],
      ['Fuel / Power Cost','Procurement volatility, though pass-through in principle, creates working-capital swings.'],
    ],
  },
  energy: {
    lead: [
      '{co} is disciplined on capital, balance sheet, and shareholder return in a commodity category where those are uncommon.',
      'Reserve quality and cost curve position are the durable variables; {co}\'s portfolio sits favorably on both.',
      'The firm\'s free cash profile across a range of price decks produces an attractive capital-return program.',
    ],
    bullets: [
      'Breakeven oil price of $ {x}/bbl is in the lowest quartile of the peer group; the portfolio generates free cash at $ {y}/bbl.',
      'Capital program of $ {x}B is fully funded within operating cash flow through the assumed price deck.',
      'Net debt / EBITDA of {x}× is among the lowest in the group; balance-sheet flexibility permits counter-cyclical action.',
      'Shareholder return — dividend + buyback — yielded {x}% in FY25 and management has guided to maintaining the pace.',
      'At {x}× forward and {y}% FCF yield, the shares trade below the historic average despite improved portfolio quality.',
    ],
    risks: [
      ['Commodity Price','Oil and gas prices are the principal earnings variable; hedging program covers ~{x}% of near-term production.'],
      ['Reserve Replacement','Organic reserve replacement requires ongoing capital; any shortfall creates decline-curve pressure.'],
      ['Regulatory / Permitting','Federal land and pipeline permitting timelines can slip; this affects project economics at the margin.'],
      ['Geopolitical','International asset exposure creates risk of fiscal-regime change and expropriation.'],
      ['Energy Transition','Demand-side evolution on a multi-decade horizon is real; {co} maintains a capital-allocation optionality framework.'],
    ],
  },
  mat: {
    lead: [
      '{co}\'s portfolio quality in {sub} produces returns across the cycle that screen favorably against the sector.',
      'Operating leverage to a modest volume recovery is significant; the cost base has been restructured during the downturn.',
      'The firm\'s capital-allocation framework — capex, dividend, buyback — has been consistently applied and is under-credited.',
    ],
    bullets: [
      'Unit margin of {x}% is {y} pts above peer; product mix, vertical integration, and geographic position contribute.',
      'Cost base has been restructured during the cycle — overhead per unit is down {x}% since FY20, producing asymmetric recovery.',
      'Dividend has been paid uninterrupted for {yr}+ years; the current payout is comfortably covered.',
      'Balance sheet net debt / EBITDA of {x}× is conservative for the category; firepower for counter-cyclical investment.',
      'At {x}× forward and {y}× book, shares reflect caution that we consider overstated given portfolio quality.',
    ],
    risks: [
      ['Commodity / End-Market','Cyclical exposure to construction, auto, and industrial end-markets is real; a synchronized slowdown compresses EBITDA 20–30%.'],
      ['Input Costs','Energy, feedstock, and logistics costs are volatile; pricing recovers on a lag.'],
      ['Environmental / Regulatory','Remediation and emissions rules continue to tighten; compliance capex is an ongoing headwind.'],
      ['FX','International revenue mix creates translation sensitivity.'],
      ['Trade Policy','Tariff and duty changes affect import/export economics; {co} maintains flexible sourcing where possible.'],
    ],
  },
  reit: {
    lead: [
      '{co}\'s portfolio in {sub} has favorable demand drivers that the current multiple does not reflect.',
      'Same-store NOI growth continues to outpace the sector median; balance sheet flexibility permits external growth.',
      'We regard the current AFFO yield as attractive for a portfolio of this quality and capital structure.',
    ],
    bullets: [
      'Same-store NOI growth of {x}% in FY25 outpaced the peer group at {y}%; leasing spreads remain accretive.',
      'Portfolio occupancy of {x}% is the highest in the peer group; lease expirations through FY28 are modest.',
      'Balance sheet net debt / EBITDA of {x}× and fixed-charge coverage of {y}× provide flexibility.',
      'External growth pipeline — acquisitions + development — of $ {x}B is under contract or in active pursuit.',
      'At {x}× AFFO and a {y}% dividend yield, shares reflect sector-wide caution that does not apply to this portfolio.',
    ],
    risks: [
      ['Interest Rate','REIT multiples compress when long-rates rise; interest expense is a material line item.'],
      ['Tenant Credit','Credit concentration in top tenants is material; bankruptcy of any top-5 tenant is a watch item.'],
      ['Supply','New supply in select submarkets compresses leasing economics; management monitors pipeline.'],
      ['Capital Access','External growth depends on equity and debt capital markets; periods of dislocation compress external growth.'],
      ['Cap Rate Compression/Expansion','Asset values respond to cap-rate shifts; leverage magnifies the effect on book value.'],
    ],
  },
};

// Fill template strings
function fillTemplate(str, ctx) {
  return str
    .replaceAll('{co}', ctx.co)
    .replaceAll('{sub}', ctx.sub)
    .replaceAll('{x}', ctx.x)
    .replaceAll('{y}', ctx.y)
    .replaceAll('{z}', ctx.z)
    .replaceAll('{yr}', ctx.yr);
}

function synthesizeThesis(sec, shortName, sub, style) {
  const bank = THESIS_SCAFFOLDS[sec.key];
  const ctx = {
    co: shortName, sub: sub.replace(/&amp;/g, '&'),
    x: randFloat(2, 40, 1),
    y: randFloat(2, 80, 1),
    z: randFloat(5, 60, 1),
    yr: String(randInt(1875, 1998)),
  };
  const lead = fillTemplate(pick(bank.lead), ctx);
  // Pick 4 unique bullets
  const chosen = [];
  const poolIdx = [...bank.bullets.keys()];
  for (let i = 0; i < 4 && poolIdx.length; i++) {
    const j = Math.floor(rand() * poolIdx.length);
    chosen.push(bank.bullets[poolIdx.splice(j, 1)[0]]);
  }
  const thesis = chosen.map(b => fillTemplate(b, { ...ctx,
    x: randFloat(2, 80, 1), y: randFloat(2, 80, 1), z: randFloat(2, 60, 1),
  }));
  // Risks: pick 4
  const riskPoolIdx = [...bank.risks.keys()];
  const risks = [];
  for (let i = 0; i < 4 && riskPoolIdx.length; i++) {
    const j = Math.floor(rand() * riskPoolIdx.length);
    const [t, d] = bank.risks[riskPoolIdx.splice(j, 1)[0]];
    risks.push({ t, d: fillTemplate(d, { ...ctx, x: randFloat(2, 30, 1), y: 0, z: 0 }) });
  }
  return { thesisLead: lead, thesis, risks };
}

// Business description – short, derived from sub-industry
const BUSINESS_TEMPLATES = {
  tech: '{co} is a {sub} provider serving enterprise and mid-market customers globally. The firm operates across {x} principal product lines, with approximately {y}% of FY25 revenue from recurring subscription and the balance from services and perpetual licenses. {co} was founded in {yr} and has operated through three product platforms, most recently transitioning its install base to a cloud-native architecture.',
  health: '{co} develops and commercializes therapies and devices within {sub}. The firm\'s commercial portfolio comprises {x} approved products across {y} indications; the clinical pipeline includes {z} late-stage candidates with readouts expected through FY28. {co} operates manufacturing facilities in three regions and was founded in {yr}.',
  indust: '{co} is a manufacturer and service provider operating within {sub}. The firm\'s product portfolio serves commercial, industrial, and government customers across {x} operating segments; aftermarket service and parts account for approximately {y}% of revenue. {co} was founded in {yr} and maintains {z} manufacturing facilities across North America and Europe.',
  trans: '{co} is a transport and logistics operator within {sub}. The firm operates a fleet of approximately {x} assets across {y} principal route networks, with {z}% of revenue from long-term contract business and the balance from spot. {co} was founded in {yr} and is ranked among the top operators in its category by capacity.',
  staples: '{co} produces and markets consumer products within {sub}. The portfolio comprises {x} primary brands distributed through food, drug, mass, and club channels, with international presence in {y}+ countries. {co} was founded in {yr} and has paid uninterrupted dividends for {z} decades.',
  discret: '{co} operates in {sub}, serving consumers through a combination of owned locations, wholesale, and digital channels. The firm operates {x} retail locations across {y} states/countries, supplemented by digital revenue of {z}% of total. {co} was founded in {yr}.',
  banks: '{co} is the parent of {co} Bank, a {sub} institution with {x} branches across {y} states and ${z}B in assets. The franchise comprises commercial banking, retail banking, and wealth management; the bank was founded in {yr} and has operated continuously since.',
  insure: '{co} is an insurance holding company operating within {sub}. The firm underwrites primary and excess coverage through a network of independent and captive agents across {x} lines of business; invested assets total ${y}B. {co} was founded in {yr}.',
  util: '{co} is a holding company for regulated utilities serving approximately {x} million customer accounts across {y} states. Principal subsidiaries operate under cost-of-service regulation with allowed returns currently between {z}% and 10.4%. The company has paid uninterrupted dividends since {yr}.',
  energy: '{co} is an energy company operating within {sub}. The firm\'s upstream position comprises {x} thousand barrels of oil equivalent per day of production across {y} principal basins; midstream and downstream interests supplement the upstream portfolio. {co} was founded in {yr}.',
  mat: '{co} is a materials company operating within {sub}. The firm\'s portfolio includes {x} principal product lines serving construction, automotive, packaging, and industrial end-markets, with manufacturing at {y} facilities across {z} regions. {co} was founded in {yr}.',
  reit: '{co} is a real estate investment trust operating within {sub}. The portfolio comprises {x} properties totaling {y} million square feet across {z} principal markets. The trust was organized in {yr} under Maryland statute and is a constituent of the relevant REIT indices.',
};

// Segments/geos
const GEO_MIXES = [
  'United States 62% · Europe 24% · Rest of World 14%.',
  'Americas 41% · Asia/Pacific 38% · Europe 18% · Other 3%.',
  'Domestic 88% · International 12%.',
  'United States 100% (domestic operations only).',
  'United States 72% · Canada 14% · Mexico 9% · Other 5%.',
  'North America 52% · Europe 28% · Asia 16% · Other 4%.',
];

// Financial shape library per sector
function makeFinancialCfg(sec, tl) {
  const base = { noise: 0.04, mgnTrend: 0.003 };
  switch (sec.key) {
    case 'tech':    return { ...base, growth: randFloat(0.06, 0.22, 3), baseRev: randInt(800, 5000), baseMgn: randFloat(0.15, 0.30, 3), baseShr: randInt(80, 450), bvStart: randFloat(8, 28, 2), divStart: randFloat(0.0, 0.8, 2), mgnTrend: 0.008 };
    case 'health':  return { ...base, growth: randFloat(0.04, 0.16, 3), baseRev: randInt(1200, 9000), baseMgn: randFloat(0.18, 0.36, 3), baseShr: randInt(150, 900), bvStart: randFloat(10, 30, 2), divStart: randFloat(0.4, 1.8, 2), mgnTrend: 0.006 };
    case 'indust':  return { ...base, growth: randFloat(0.03, 0.09, 3), baseRev: randInt(3000, 22000), baseMgn: randFloat(0.08, 0.17, 3), baseShr: randInt(150, 700), bvStart: randFloat(28, 60, 2), divStart: randFloat(0.6, 3.2, 2), mgnTrend: 0.003 };
    case 'trans':   return { ...base, growth: randFloat(0.02, 0.08, 3), baseRev: randInt(4000, 18000), baseMgn: randFloat(0.07, 0.22, 3), baseShr: randInt(150, 650), bvStart: randFloat(18, 40, 2), divStart: randFloat(0.4, 2.8, 2), mgnTrend: 0.002 };
    case 'staples': return { ...base, growth: randFloat(0.01, 0.05, 3), baseRev: randInt(5000, 30000), baseMgn: randFloat(0.12, 0.22, 3), baseShr: randInt(280, 1200), bvStart: randFloat(12, 28, 2), divStart: randFloat(1.0, 3.2, 2), mgnTrend: 0.001 };
    case 'discret': return { ...base, growth: randFloat(0.02, 0.10, 3), baseRev: randInt(2000, 40000), baseMgn: randFloat(0.06, 0.15, 3), baseShr: randInt(180, 900), bvStart: randFloat(14, 36, 2), divStart: randFloat(0.4, 2.4, 2), mgnTrend: 0.002 };
    case 'banks':   return { ...base, growth: randFloat(0.02, 0.07, 3), baseRev: randInt(1600, 8000), baseMgn: randFloat(0.32, 0.42, 3), baseShr: randInt(190, 900), bvStart: randFloat(18, 42, 2), divStart: randFloat(0.7, 2.0, 2), mgnTrend: 0.002 };
    case 'insure':  return { ...base, growth: randFloat(0.02, 0.08, 3), baseRev: randInt(3000, 22000), baseMgn: randFloat(0.10, 0.18, 3), baseShr: randInt(120, 500), bvStart: randFloat(40, 120, 2), divStart: randFloat(0.6, 4.0, 2), mgnTrend: 0.002 };
    case 'util':    return { ...base, growth: randFloat(0.03, 0.06, 3), baseRev: randInt(4000, 14000), baseMgn: randFloat(0.17, 0.24, 3), baseShr: randInt(220, 900), bvStart: randFloat(24, 48, 2), divStart: randFloat(1.6, 3.4, 2), mgnTrend: 0.001 };
    case 'energy':  return { ...base, growth: randFloat(-0.01, 0.07, 3), baseRev: randInt(8000, 80000), baseMgn: randFloat(0.08, 0.22, 3), baseShr: randInt(320, 3000), bvStart: randFloat(30, 80, 2), divStart: randFloat(1.0, 4.8, 2), mgnTrend: 0.002, noise: 0.09 };
    case 'mat':     return { ...base, growth: randFloat(0.01, 0.06, 3), baseRev: randInt(2500, 22000), baseMgn: randFloat(0.08, 0.18, 3), baseShr: randInt(120, 600), bvStart: randFloat(22, 52, 2), divStart: randFloat(0.6, 2.8, 2), mgnTrend: 0.002, noise: 0.07 };
    case 'reit':    return { ...base, growth: randFloat(0.02, 0.10, 3), baseRev: randInt(900, 5000), baseMgn: randFloat(0.28, 0.44, 3), baseShr: randInt(140, 900), bvStart: randFloat(20, 48, 2), divStart: randFloat(2.0, 5.4, 2), mgnTrend: 0.002 };
  }
}

// Price-history style per sector/tl
function styleFor(sec, tl) {
  if (sec.key === 'energy' || sec.key === 'mat' || sec.key === 'trans') return tl >= 4 ? 'decline' : 'cyclical';
  if (sec.key === 'staples' || sec.key === 'util' || sec.key === 'banks' || sec.key === 'insure') return 'defensive';
  if (sec.key === 'tech' || sec.key === 'health' || sec.key === 'reit') return tl <= 2 ? 'growth' : 'cyclical';
  return tl <= 2 ? 'growth' : 'cyclical';
}

// Valuation rows: sector-specific appropriate metrics
function valuationRows(sec, pe, yld) {
  const peT = pe * randFloat(1.05, 1.25, 2);
  const med3 = pe * randFloat(0.88, 1.10, 2);
  const med5 = pe * randFloat(0.85, 1.20, 2);
  const common = [
    ['P/E (Forward)', pe.toFixed(1) + '×', med3.toFixed(1) + '×', med5.toFixed(1) + '×'],
    ['P/E (Trailing)', peT.toFixed(1) + '×', (peT * randFloat(0.9, 1.1, 2)).toFixed(1) + '×', (peT * randFloat(0.85, 1.15, 2)).toFixed(1) + '×'],
  ];
  if (sec.key === 'banks') {
    return [
      ...common,
      ['P/Tangible Book', randFloat(0.9, 1.8, 2) + '×', randFloat(0.9, 1.6, 2) + '×', randFloat(0.9, 1.5, 2) + '×'],
      ['Price/Earnings/Growth', randFloat(0.8, 1.8, 2) + '×', randFloat(0.8, 1.7, 2) + '×', randFloat(0.8, 1.9, 2) + '×'],
      ['Dividend Yield', yld.toFixed(1) + '%', (yld * randFloat(0.9, 1.1, 2)).toFixed(1) + '%', (yld * randFloat(0.9, 1.15, 2)).toFixed(1) + '%'],
      ['Efficiency Ratio', randFloat(48, 60, 1) + '%', randFloat(48, 62, 1) + '%', randFloat(50, 64, 1) + '%'],
    ];
  }
  if (sec.key === 'insure') {
    return [
      ...common,
      ['P/Book', randFloat(1.0, 2.0, 2) + '×', randFloat(1.0, 1.8, 2) + '×', randFloat(1.0, 1.7, 2) + '×'],
      ['Combined Ratio', randFloat(88, 102, 1) + '%', randFloat(90, 100, 1) + '%', randFloat(92, 102, 1) + '%'],
      ['Dividend Yield', yld.toFixed(1) + '%', (yld * randFloat(0.9, 1.1, 2)).toFixed(1) + '%', (yld * randFloat(0.9, 1.15, 2)).toFixed(1) + '%'],
      ['ROE', randFloat(8, 16, 1) + '%', randFloat(8, 15, 1) + '%', randFloat(7, 14, 1) + '%'],
    ];
  }
  if (sec.key === 'util') {
    return [
      ...common,
      ['P/B', randFloat(1.4, 2.2, 2) + '×', randFloat(1.4, 2.0, 2) + '×', randFloat(1.4, 2.1, 2) + '×'],
      ['EV/EBITDA', randFloat(9, 14, 1) + '×', randFloat(9, 13, 1) + '×', randFloat(9, 13.5, 1) + '×'],
      ['Price/Cash Flow', randFloat(8, 13, 1) + '×', randFloat(8, 12.5, 1) + '×', randFloat(8, 13, 1) + '×'],
      ['Dividend Yield', yld.toFixed(1) + '%', (yld * randFloat(0.9, 1.08, 2)).toFixed(1) + '%', (yld * randFloat(0.9, 1.12, 2)).toFixed(1) + '%'],
    ];
  }
  if (sec.key === 'reit') {
    return [
      ['P/FFO', pe.toFixed(1) + '×', med3.toFixed(1) + '×', med5.toFixed(1) + '×'],
      ['P/AFFO', (pe * 1.15).toFixed(1) + '×', (med3 * 1.12).toFixed(1) + '×', (med5 * 1.14).toFixed(1) + '×'],
      ['P/NAV', randFloat(0.75, 1.10, 2) + '×', randFloat(0.80, 1.08, 2) + '×', randFloat(0.85, 1.05, 2) + '×'],
      ['Implied Cap Rate', randFloat(4.2, 7.2, 1) + '%', randFloat(4.4, 7.0, 1) + '%', randFloat(4.5, 7.2, 1) + '%'],
      ['Dividend Yield', yld.toFixed(1) + '%', (yld * randFloat(0.9, 1.08, 2)).toFixed(1) + '%', (yld * randFloat(0.9, 1.12, 2)).toFixed(1) + '%'],
      ['Debt / Assets', randFloat(28, 48, 1) + '%', randFloat(28, 48, 1) + '%', randFloat(28, 48, 1) + '%'],
    ];
  }
  // default corporate
  return [
    ...common,
    ['P/B', randFloat(1.0, 8.0, 2) + '×', randFloat(1.0, 6.0, 2) + '×', randFloat(1.0, 6.0, 2) + '×'],
    ['EV/EBITDA', randFloat(6, 20, 1) + '×', randFloat(6, 18, 1) + '×', randFloat(6, 18, 1) + '×'],
    ['P/Sales', randFloat(0.5, 8.0, 2) + '×', randFloat(0.5, 7.0, 2) + '×', randFloat(0.5, 6.5, 2) + '×'],
    ['FCF Yield', randFloat(1.5, 12, 1) + '%', randFloat(1.5, 11, 1) + '%', randFloat(1.5, 10, 1) + '%'],
  ];
}

// Capital structure rows
function capitalRows(sec, mcapBillions, finals) {
  const lastRev = finals.rev[finals.rev.length - 1];
  const equity  = finals.bv[finals.bv.length - 1] * finals.shares[finals.shares.length - 1];
  if (sec.key === 'banks') {
    const assets = lastRev * randFloat(14, 26, 1);
    return [
      ['Total Assets', '$' + Math.round(assets).toLocaleString() + 'mm'],
      ['Total Deposits', '$' + Math.round(assets * randFloat(0.75, 0.88, 2)).toLocaleString() + 'mm'],
      ['Total Loans', '$' + Math.round(assets * randFloat(0.62, 0.74, 2)).toLocaleString() + 'mm'],
      ['Tangible Common Equity', '$' + Math.round(equity * 0.92).toLocaleString() + 'mm'],
      ['CET1 Ratio', randFloat(10.8, 13.4, 1) + '%'],
      ['Credit Rating', pick(['A− / A3','A / A2','A+ / A1','BBB+ / Baa1','BBB+ / Baa2'])],
    ];
  }
  if (sec.key === 'insure') {
    return [
      ['Invested Assets', '$' + Math.round(lastRev * randFloat(3.2, 5.8, 1)).toLocaleString() + 'mm'],
      ['Policy Reserves', '$' + Math.round(lastRev * randFloat(2.6, 4.4, 1)).toLocaleString() + 'mm'],
      ['Shareholders\' Equity', '$' + Math.round(equity).toLocaleString() + 'mm'],
      ['Debt / Capital', randFloat(14, 28, 1) + '%'],
      ['Combined Ratio (5-yr)', randFloat(92, 100, 1) + '%'],
      ['Credit Rating', pick(['A− / A3','A / A2','A+ / A1','A++ / Aaa'])],
    ];
  }
  if (sec.key === 'util') {
    const ltd = Math.round(lastRev * randFloat(1.8, 3.2, 1)) * 1000;
    const cap = ltd + Math.round(equity);
    return [
      ['Long-Term Debt', '$' + ltd.toLocaleString() + 'mm'],
      ['Cash &amp; Equivalents', '$' + randInt(200, 800) + 'mm'],
      ['Total Capitalization', '$' + cap.toLocaleString() + 'mm'],
      ['Equity Ratio', randFloat(38, 46, 1) + '%'],
      ['Allowed ROE (wtd.)', randFloat(9.4, 10.6, 2) + '%'],
      ['Credit Rating', pick(['A− / A3','A / A2','BBB+ / Baa1','BBB+ / Baa2'])],
    ];
  }
  if (sec.key === 'reit') {
    return [
      ['Total Assets', '$' + Math.round(lastRev * randFloat(9, 16, 1)).toLocaleString() + 'mm'],
      ['Secured Debt', '$' + Math.round(lastRev * randFloat(2, 4, 1)).toLocaleString() + 'mm'],
      ['Unsecured Debt', '$' + Math.round(lastRev * randFloat(2.5, 5.5, 1)).toLocaleString() + 'mm'],
      ['Net Debt / EBITDA', randFloat(4.8, 7.2, 1) + '×'],
      ['Fixed Charge Coverage', randFloat(2.8, 4.4, 2) + '×'],
      ['Credit Rating', pick(['BBB / Baa2','BBB+ / Baa1','A− / A3','BBB / Baa3'])],
    ];
  }
  // default corporate
  const ltd = Math.round(lastRev * randFloat(0.2, 0.8, 2));
  const cash = Math.round(lastRev * randFloat(0.05, 0.30, 2));
  const netDebt = ltd - cash;
  return [
    ['Long-Term Debt', '$' + (ltd * 1).toLocaleString() + 'mm'],
    ['Cash &amp; Equivalents', '$' + cash.toLocaleString() + 'mm'],
    netDebt >= 0
      ? ['Net Debt', '$' + netDebt.toLocaleString() + 'mm']
      : ['Net Cash', '($' + Math.abs(netDebt).toLocaleString() + 'mm)'],
    ['Total Equity', '$' + Math.round(equity).toLocaleString() + 'mm'],
    ['Debt / Capital', randFloat(15, 48, 1) + '%'],
    sec.key === 'indust' && maybe(0.4)
      ? ['Backlog', '$' + Math.round(lastRev * randFloat(1.2, 4, 1)).toLocaleString() + 'mm']
      : ['Interest Coverage', randFloat(4, 60, 1) + '×'],
  ];
}

// Segments / geos line
function segmentLine(sec, sub) {
  const buckets = [
    [randInt(35, 68), randInt(18, 32), randInt(8, 18), randInt(2, 10)],
  ][0];
  const total = buckets.reduce((a, b) => a + b, 0);
  const norm = buckets.map(b => Math.round(b / total * 100));
  // Adjust last to sum to 100
  norm[norm.length - 1] = 100 - norm.slice(0, -1).reduce((a, b) => a + b, 0);
  const categories = {
    tech: ['Subscription','Services','Licenses','Hardware'],
    health: ['Pharma','Devices','Diagnostics','Consumer'],
    indust: ['Equipment','Aftermarket','Systems','Services'],
    trans: ['Core Freight','Logistics','Intermodal','Other'],
    staples: ['Food','Beverage','Household','Other'],
    discret: ['Retail','Wholesale','Digital','Licensing'],
    banks: ['Commercial Banking','Retail Banking','Wealth','Other'],
    insure: ['Primary','Reinsurance','Specialty','Investment'],
    util: ['Electric T&amp;D','Gas Distribution','Water','Other'],
    energy: ['Upstream','Midstream','Refining','Chemicals'],
    mat: ['Specialty','Commodity','Packaging','Other'],
    reit: ['Same-store','Acquisitions','Development','Third-Party'],
  }[sec.key] || ['Primary','Secondary','Services','Other'];
  const parts = categories.slice(0, 4).map((c, i) => `${c} (${norm[i]}% of FY25 rev)`);
  return parts.join('; ') + '.';
}

// Build a single company record
function buildCompany(sec, page, usedTickers, usedNames) {
  const nm = companyName(sec, usedNames);
  const shortName = nm.replace(/ (Inc\.|Corp\.|Ltd\.|Holdings|Group|Co\.|Company|Industries|Systems).*$/,'');
  const tk = ticker(usedTickers);
  const sub = pick(sec.subs);
  const ex = pick(['NYSE','NYSE','NYSE','NASDAQ','NASDAQ']);
  const inc = randInt(1850, 2010);
  const px = sec.key === 'energy' || sec.key === 'mat'
    ? randFloat(18, 180, 2)
    : sec.key === 'reit'
    ? randFloat(18, 180, 2)
    : randFloat(22, 420, 2);
  const dpct = randFloat(-2.5, 2.5, 1);
  const pe = sec.key === 'tech' ? randFloat(16, 42, 1)
    : sec.key === 'health' ? randFloat(13, 30, 1)
    : sec.key === 'banks' ? randFloat(9, 14, 1)
    : sec.key === 'insure' ? randFloat(9, 15, 1)
    : sec.key === 'util' ? randFloat(14, 19, 1)
    : sec.key === 'energy' ? randFloat(7, 13, 1)
    : sec.key === 'mat' ? randFloat(11, 17, 1)
    : sec.key === 'trans' ? randFloat(10, 18, 1)
    : sec.key === 'staples' ? randFloat(17, 24, 1)
    : sec.key === 'reit' ? randFloat(16, 30, 1)
    : randFloat(12, 22, 1);
  const yld = sec.key === 'tech' ? randFloat(0, 2.4, 1)
    : sec.key === 'health' ? randFloat(0.5, 3.6, 1)
    : sec.key === 'banks' ? randFloat(2.4, 4.4, 1)
    : sec.key === 'insure' ? randFloat(1.4, 3.6, 1)
    : sec.key === 'util' ? randFloat(3.4, 5.2, 1)
    : sec.key === 'energy' ? randFloat(2.4, 5.8, 1)
    : sec.key === 'mat' ? randFloat(1.8, 4.4, 1)
    : sec.key === 'trans' ? randFloat(1.0, 3.8, 1)
    : sec.key === 'staples' ? randFloat(2.4, 3.8, 1)
    : sec.key === 'reit' ? randFloat(2.8, 6.8, 1)
    : randFloat(0.8, 3.2, 1);
  const mcap = randFloat(1.2, 380, 1);
  const sh = Math.round(mcap * 1000 / px);
  const tl = randInt(1, 5);
  const sf = randInt(1, 5);
  const fs = pick(['A++','A+','A','A','A','A','B++','B++','B+','B']);
  const hist = priceHistory(px, styleFor(sec, tl));
  const [high, low] = chartRange(hist);
  const cfg = makeFinancialCfg(sec, tl);
  const fin = buildFinancials(cfg);
  const biz = fillTemplate(BUSINESS_TEMPLATES[sec.key], {
    co: shortName, sub: sub.replace(/&amp;/g, '&'),
    x: randInt(2, 8), y: randInt(6, 92), z: randInt(2, 48), yr: String(inc),
  });
  const thesis = synthesizeThesis(sec, shortName, sub, styleFor(sec, tl));
  const val = valuationRows(sec, pe, yld);
  const cap = capitalRows(sec, mcap, fin);
  return {
    page, exchange: ex, ticker: tk, cusip: cusip(),
    name: nm, industry: sub.replaceAll('&','&amp;'),
    incorporated: String(inc), fye: 'Dec 31',
    price: px.toFixed(2),
    delta: delta(px, dpct),
    deltaClass: dpct >= 0 ? 'pos' : 'neg',
    range52: range52([low, high]),
    pe: pe.toFixed(1) + '×',
    peT: (pe * randFloat(1.05, 1.25, 2)).toFixed(1) + '×',
    yield: yld.toFixed(1) + '%',
    mcap: mcap >= 10 ? '$' + mcap.toFixed(1) + 'B' : '$' + mcap.toFixed(2) + 'B',
    shares: sh.toLocaleString() + 'mm',
    timeliness: String(tl),
    safety: String(sf),
    finstr: fs,
    stability: String(randInt(30, 95)),
    predict: String(randInt(30, 95)),
    priceHistory: hist.map(v => Math.round(v * 100) / 100),
    chartHigh: '$' + high.toFixed(2),
    chartLow: '$' + low.toFixed(2),
    business: biz,
    segments: segmentLine(sec, sub),
    geos: pick(GEO_MIXES),
    thesisLead: thesis.thesisLead,
    thesis: thesis.thesis,
    risks: thesis.risks,
    valuation: val,
    capital: cap,
    financials: fin,
    sector: sec.key, sectorLabel: sec.label,
  };
}

// ── Run ───────────────────────────────────────────────────────────────
const usedTickers = new Set(['MDSC','HBRL','BWDU','VRDN','CRNF','ORAI','PSFT','GRRH','HMLB','MRCH']);
const usedNames = new Set();
const all = [];
let page = 8;
for (const sec of SECTORS) {
  const secCompanies = [];
  for (let i = 0; i < sec.count; i++) {
    secCompanies.push(buildCompany(sec, page, usedTickers, usedNames));
    page += 1;
  }
  // sort sector alphabetically by ticker for readability
  secCompanies.sort((a, b) => a.ticker.localeCompare(b.ticker));
  all.push(...secCompanies);
}
console.log('total tearsheets:', all.length);
await saveFile('scratch/tearsheets.json', JSON.stringify(all));
console.log('saved scratch/tearsheets.json');
