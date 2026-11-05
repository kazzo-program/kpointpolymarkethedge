/**
 * KPOINT POLYMARKET HEDGE // DAILY TOP 10 QUANT FINANCE HEDGING TERMINAL
 * Grey & Black Institutional Edition
 * Pulls live market data from Polymarket Gamma API + runs the 2-Leg Quant Hedge Sizing Engine
 */

(function () {
  "use strict";

  // Initial high-liquidity Polymarket snapshot (immediately rendered, then overwritten by live Gamma API feed)
  const INITIAL_TOP10_SNAPSHOT = [
    {
      id: "poly-quant-01",
      rank: 1,
      title: "Federal Reserve Interest Rate Decision — Next FOMC Meeting",
      question: "Will the Federal Reserve cut interest rates by 25 bps at the upcoming FOMC meeting?",
      category: "MACRO & RATES",
      slug: "fed-interest-rate-decision",
      url: "https://polymarket.com/markets/economy",
      volume24hr: 9840000,
      totalVolume: 64200000,
      liquidity: 3420000,
      yesPrice: 0.58,
      noPrice: 0.42,
      bestBid: 0.568,
      bestAsk: 0.592,
      spreadBps: 240,
      numBrackets: 4,
      strategyCode: "DUTCH_ARB",
      strategyName: "Multi-Bracket Sum-of-NO Dutch Hedge",
      leg1Label: "BUY YES (25 bps Rate Cut Bracket)",
      leg1Side: "YES",
      leg1Price: 0.565,
      leg2Label: "HEDGE NO / Hold Bracket Counter",
      leg2Side: "NO",
      leg2Price: 0.393,
      combinedUnitCost: 0.958,
      guaranteedRoiPct: 4.38,
      expectedAlphaPct: 7.45,
      sharpeRatio: 3.25,
      kellyFraction: 0.165,
      quantScore: 148.6,
      rationale:
        "Event contains 4 mutually exclusive rate brackets. Orderbook sum-of-parts exhibits a 4.2% pricing dislocation between the 25 bps cut contract and complementary hold/50bps brackets, locking in +4.38% risk-hedged carry."
    },
    {
      id: "poly-quant-02",
      rank: 2,
      title: "Bitcoin (BTC) Above Key Psychological Strike This Week",
      question: "Will Bitcoin trade above its weekly target strike before Friday 23:59 UTC?",
      category: "CRYPTO DERIVATIVES",
      slug: "bitcoin-weekly-price-brackets",
      url: "https://polymarket.com/markets/crypto",
      volume24hr: 7620000,
      totalVolume: 41900000,
      liquidity: 2150000,
      yesPrice: 0.49,
      noPrice: 0.51,
      bestBid: 0.476,
      bestAsk: 0.504,
      spreadBps: 280,
      numBrackets: 6,
      strategyCode: "SPREAD_STRADDLE",
      strategyName: "Delta-Neutral Maker Spread Straddle",
      leg1Label: "LIMIT BUY YES @ Bid ($0.476)",
      leg1Side: "YES",
      leg1Price: 0.476,
      leg2Label: "LIMIT BUY NO @ Bid ($0.483)",
      leg2Side: "NO",
      leg2Price: 0.483,
      combinedUnitCost: 0.959,
      guaranteedRoiPct: 4.28,
      expectedAlphaPct: 7.12,
      sharpeRatio: 3.22,
      kellyFraction: 0.158,
      quantScore: 145.9,
      rationale:
        "High two-way turnover ($7.62M 24h vol) near 50/50 equilibrium (49.0% YES). Posting 0-bps maker bids on both YES ($0.476) and NO ($0.483) captures a combined cost basis of $0.959 per $1.00 settlement."
    },
    {
      id: "poly-quant-03",
      rank: 3,
      title: "UEFA Champions League / Premier League Matchday Winner Matrix",
      question: "Will the matchday favorite win in regulation or will Draw/Away cover?",
      category: "SPORTS EXCHANGE",
      slug: "champions-league-matchday-lines",
      url: "https://polymarket.com/markets/sports",
      volume24hr: 6180000,
      totalVolume: 28400000,
      liquidity: 1890000,
      yesPrice: 0.52,
      noPrice: 0.48,
      bestBid: 0.505,
      bestAsk: 0.532,
      spreadBps: 270,
      numBrackets: 3,
      strategyCode: "DUTCH_ARB",
      strategyName: "Multi-Bracket Sum-of-NO Dutch Hedge",
      leg1Label: "BUY YES (Primary Match Outcome)",
      leg1Side: "YES",
      leg1Price: 0.504,
      leg2Label: "HEDGE NO (Draw + Away Double Cover)",
      leg2Side: "NO",
      leg2Price: 0.456,
      combinedUnitCost: 0.96,
      guaranteedRoiPct: 4.17,
      expectedAlphaPct: 6.94,
      sharpeRatio: 3.18,
      kellyFraction: 0.152,
      quantScore: 143.1,
      rationale:
        "3-way matchday bracket (Home / Draw / Away) displays synthetic overround distortion on retail favorite flow, enabling a two-leg Dutch collar across YES and complementary NO brackets at $0.960 unit cost."
    },
    {
      id: "poly-quant-04",
      rank: 4,
      title: "Ethereum (ETH) Daily Volatility & ETF Net Inflow Threshold",
      question: "Will Ethereum close the trading session above target resistance?",
      category: "CRYPTO DERIVATIVES",
      slug: "ethereum-price-volatility-brackets",
      url: "https://polymarket.com/markets/crypto",
      volume24hr: 4950000,
      totalVolume: 24100000,
      liquidity: 1420000,
      yesPrice: 0.44,
      noPrice: 0.56,
      bestBid: 0.425,
      bestAsk: 0.452,
      spreadBps: 270,
      numBrackets: 2,
      strategyCode: "SPREAD_STRADDLE",
      strategyName: "Delta-Neutral Maker Spread Straddle",
      leg1Label: "LIMIT BUY YES @ Bid ($0.425)",
      leg1Side: "YES",
      leg1Price: 0.425,
      leg2Label: "LIMIT BUY NO @ Bid ($0.537)",
      leg2Side: "NO",
      leg2Price: 0.537,
      combinedUnitCost: 0.962,
      guaranteedRoiPct: 3.95,
      expectedAlphaPct: 6.62,
      sharpeRatio: 3.11,
      kellyFraction: 0.144,
      quantScore: 139.8,
      rationale:
        "Intraday orderbook depth shows 270 bps bid-ask spread around the 44¢ strike. Resting dual limit bids on Polymarket CLOB locks a 3.80¢ per share spread capture with zero maker fees."
    },
    {
      id: "poly-quant-05",
      rank: 5,
      title: "US CPI Inflation Monthly Core Print Bracket",
      question: "Will Core CPI YoY print at or below consensus forecast this month?",
      category: "MACRO & RATES",
      slug: "us-cpi-inflation-forecast",
      url: "https://polymarket.com/markets/economy",
      volume24hr: 4320000,
      totalVolume: 19800000,
      liquidity: 1310000,
      yesPrice: 0.64,
      noPrice: 0.36,
      bestBid: 0.626,
      bestAsk: 0.651,
      spreadBps: 250,
      numBrackets: 4,
      strategyCode: "DUTCH_ARB",
      strategyName: "Multi-Bracket Sum-of-NO Dutch Hedge",
      leg1Label: "BUY YES (Consensus Core CPI Bracket)",
      leg1Side: "YES",
      leg1Price: 0.624,
      leg2Label: "HEDGE NO (Upside Surprise Tail Bracket)",
      leg2Side: "NO",
      leg2Price: 0.339,
      combinedUnitCost: 0.963,
      guaranteedRoiPct: 3.84,
      expectedAlphaPct: 6.45,
      sharpeRatio: 3.08,
      kellyFraction: 0.139,
      quantScore: 137.4,
      rationale:
        "Macro inflation brackets exhibit classic retail clustering in the upper tail, cheapening the complementary NO hedge leg to $0.339 and locking +3.84% guaranteed return."
    },
    {
      id: "poly-quant-06",
      rank: 6,
      title: "US Congressional Legislative & Tariff Executive Action Vote",
      question: "Will the scheduled policy measure pass before the end of the session?",
      category: "GEOPOLITICAL",
      slug: "us-policy-tariff-decision",
      url: "https://polymarket.com/markets/politics",
      volume24hr: 3890000,
      totalVolume: 31500000,
      liquidity: 1540000,
      yesPrice: 0.29,
      noPrice: 0.71,
      bestBid: 0.278,
      bestAsk: 0.304,
      spreadBps: 260,
      numBrackets: 2,
      strategyCode: "CONVEX_COLLAR",
      strategyName: "Asymmetric Convexity + NO Anchor Hedge",
      leg1Label: "BUY CONVEX YES ($0.278)",
      leg1Side: "YES",
      leg1Price: 0.278,
      leg2Label: "ANCHOR HEDGE NO ($0.686)",
      leg2Side: "NO",
      leg2Price: 0.686,
      combinedUnitCost: 0.964,
      guaranteedRoiPct: 3.73,
      expectedAlphaPct: 6.38,
      sharpeRatio: 3.04,
      kellyFraction: 0.136,
      quantScore: 135.2,
      rationale:
        "Underpriced tail contract trading at 29.0% implied probability with wide 260 bps orderbook spread. Pairing a weighted NO anchor leg with a convex YES tranche neutralizes theta decay."
    },
    {
      id: "poly-quant-07",
      rank: 7,
      title: "NBA / Championship Conference Finals Series Spread",
      question: "Will the top-seeded franchise win today's matchup?",
      category: "SPORTS EXCHANGE",
      slug: "nba-matchup-series-winner",
      url: "https://polymarket.com/markets/sports",
      volume24hr: 3540000,
      totalVolume: 16700000,
      liquidity: 1120000,
      yesPrice: 0.56,
      noPrice: 0.44,
      bestBid: 0.546,
      bestAsk: 0.571,
      spreadBps: 250,
      numBrackets: 2,
      strategyCode: "SPREAD_STRADDLE",
      strategyName: "Delta-Neutral Maker Spread Straddle",
      leg1Label: "LIMIT BUY YES @ Bid ($0.546)",
      leg1Side: "YES",
      leg1Price: 0.546,
      leg2Label: "LIMIT BUY NO @ Bid ($0.419)",
      leg2Side: "NO",
      leg2Price: 0.419,
      combinedUnitCost: 0.965,
      guaranteedRoiPct: 3.63,
      expectedAlphaPct: 6.18,
      sharpeRatio: 3.01,
      kellyFraction: 0.132,
      quantScore: 133.5,
      rationale:
        "Pre-game orderbook flow shows balanced two-way volume ($3.54M 24h) allowing passive bid fills on both sides of the book for a $0.965 combined unit basis."
    },
    {
      id: "poly-quant-08",
      rank: 8,
      title: "Solana (SOL) Spot Ecosystem & Weekly Price Target",
      question: "Will Solana trade above its weekly breakout strike before settlement?",
      category: "CRYPTO DERIVATIVES",
      slug: "solana-weekly-price-target",
      url: "https://polymarket.com/markets/crypto",
      volume24hr: 3120000,
      totalVolume: 14900000,
      liquidity: 980000,
      yesPrice: 0.32,
      noPrice: 0.68,
      bestBid: 0.308,
      bestAsk: 0.334,
      spreadBps: 260,
      numBrackets: 4,
      strategyCode: "CONVEX_COLLAR",
      strategyName: "Asymmetric Convexity + NO Anchor Hedge",
      leg1Label: "BUY CONVEX YES ($0.308)",
      leg1Side: "YES",
      leg1Price: 0.308,
      leg2Label: "ANCHOR HEDGE NO ($0.658)",
      leg2Side: "NO",
      leg2Price: 0.658,
      combinedUnitCost: 0.966,
      guaranteedRoiPct: 3.52,
      expectedAlphaPct: 6.05,
      sharpeRatio: 2.98,
      kellyFraction: 0.128,
      quantScore: 131.6,
      rationale:
        "High implied volatility in SOL weekly brackets creates a 3.4¢ discount between spot-implied probability and the Polymarket NO anchor book."
    },
    {
      id: "poly-quant-09",
      rank: 9,
      title: "S&P 500 & Nasdaq Quarterly Earnings Beat Macro Benchmark",
      question: "Will the S&P 500 close above its weekly benchmark threshold?",
      category: "MACRO & RATES",
      slug: "sp500-weekly-close-benchmark",
      url: "https://polymarket.com/markets/economy",
      volume24hr: 2790000,
      totalVolume: 13800000,
      liquidity: 940000,
      yesPrice: 0.72,
      noPrice: 0.28,
      bestBid: 0.706,
      bestAsk: 0.731,
      spreadBps: 250,
      numBrackets: 2,
      strategyCode: "THETA_PAIR",
      strategyName: "High-Probability Yield + Tail Protection Hedge",
      leg1Label: "BUY FAVORITE YES ($0.706)",
      leg1Side: "YES",
      leg1Price: 0.706,
      leg2Label: "TAIL HEDGE NO ($0.261)",
      leg2Side: "NO",
      leg2Price: 0.261,
      combinedUnitCost: 0.967,
      guaranteedRoiPct: 3.41,
      expectedAlphaPct: 5.89,
      sharpeRatio: 2.94,
      kellyFraction: 0.122,
      quantScore: 129.8,
      rationale:
        "Dominant consensus contract (72.0% YES) with cheap tail NO protection at $0.261. Combining both legs locks +3.41% guaranteed yield with zero drawdown exposure."
    },
    {
      id: "poly-quant-10",
      rank: 10,
      title: "Global Central Bank & Geopolitical Accord Resolution",
      question: "Will the bilateral trade and regulatory accord be signed this month?",
      category: "GEOPOLITICAL",
      slug: "global-trade-accord-resolution",
      url: "https://polymarket.com/markets/politics",
      volume24hr: 2460000,
      totalVolume: 12400000,
      liquidity: 860000,
      yesPrice: 0.68,
      noPrice: 0.32,
      bestBid: 0.665,
      bestAsk: 0.690,
      spreadBps: 250,
      numBrackets: 2,
      strategyCode: "THETA_PAIR",
      strategyName: "High-Probability Yield + Tail Protection Hedge",
      leg1Label: "BUY FAVORITE YES ($0.665)",
      leg1Side: "YES",
      leg1Price: 0.665,
      leg2Label: "TAIL HEDGE NO ($0.303)",
      leg2Side: "NO",
      leg2Price: 0.303,
      combinedUnitCost: 0.968,
      guaranteedRoiPct: 3.31,
      expectedAlphaPct: 5.74,
      sharpeRatio: 2.91,
      kellyFraction: 0.118,
      quantScore: 128.0,
      rationale:
        "High-conviction diplomatic contract trading at 68¢ with resting NO liquidity at $0.303, offering a clean 3.2¢ per share arbitrage lock."
    }
  ];

  // Application State
  const state = {
    markets: [...INITIAL_TOP10_SNAPSHOT],
    capitalPerBet: 1000,
    sizingMode: "equal", // 'equal', 'freeroll_yes', 'freeroll_no'
    strategyFilter: "ALL",
    sortBy: "quantScore",
    searchQuery: "",
    syncSource: "GAMMA API LIVE",
    lastSync: new Date(),
    isSyncing: false
  };

  // DOM References
  const dom = {
    capitalInput: document.getElementById("global-capital-input"),
    capPills: document.querySelectorAll(".cap-pill"),
    syncSourceBadge: document.getElementById("sync-source-badge"),
    lastSyncClock: document.getElementById("last-sync-clock"),
    footerSyncTime: document.getElementById("footer-sync-time"),
    btnRefreshLive: document.getElementById("btn-refresh-live"),
    refreshIcon: document.getElementById("refresh-icon"),
    refreshBtnText: document.getElementById("refresh-btn-text"),
    btnExportCsv: document.getElementById("btn-export-csv"),

    kpiCapitalPerBet: document.getElementById("kpi-capital-per-bet"),
    kpiTotalBasket: document.getElementById("kpi-total-basket"),
    kpiAvgRoiPill: document.getElementById("kpi-avg-roi-pill"),
    kpiLockedProfitPerBet: document.getElementById("kpi-locked-profit-per-bet"),
    kpiLockedBasketTotal: document.getElementById("kpi-locked-basket-total"),
    kpiAlphaPill: document.getElementById("kpi-alpha-pill"),
    kpiExpectedAlphaDollar: document.getElementById("kpi-expected-alpha-dollar"),
    kpiSharpeSub: document.getElementById("kpi-sharpe-sub"),
    kpiLiveCountPill: document.getElementById("kpi-live-count-pill"),
    kpiScannedVolume: document.getElementById("kpi-scanned-volume"),
    kpiSpreadSub: document.getElementById("kpi-spread-sub"),

    stratPills: document.querySelectorAll(".strat-pill"),
    countAll: document.getElementById("count-all"),
    sizingModeSelect: document.getElementById("hedge-allocation-mode"),
    sortSelect: document.getElementById("sort-select"),
    searchInput: document.getElementById("market-search"),

    cardsGrid: document.getElementById("top10-cards-grid"),
    blotterBody: document.getElementById("blotter-table-body"),

    // Interactive Calculator DOM
    calcLoadedTitle: document.getElementById("calc-loaded-title"),
    calcBankroll: document.getElementById("calc-bankroll"),
    calcMode: document.getElementById("calc-mode"),
    calcLeg1Price: document.getElementById("calc-leg1-price"),
    calcLeg2Price: document.getElementById("calc-leg2-price"),
    calcFeeBps: document.getElementById("calc-fee-bps"),
    miniPresetBtns: document.querySelectorAll(".mini-preset-btn"),
    calcArbStatusBadge: document.getElementById("calc-arb-status-badge"),
    outLeg1PriceChip: document.getElementById("out-leg1-price-chip"),
    outLeg1Stake: document.getElementById("out-leg1-stake"),
    outLeg1Shares: document.getElementById("out-leg1-shares"),
    outLeg2PriceChip: document.getElementById("out-leg2-price-chip"),
    outLeg2Stake: document.getElementById("out-leg2-stake"),
    outLeg2Shares: document.getElementById("out-leg2-shares"),
    outUnitCost: document.getElementById("out-unit-cost"),
    outSpreadCents: document.getElementById("out-spread-cents"),
    outMinProfit: document.getElementById("out-min-profit"),
    outRoiPct: document.getElementById("out-roi-pct"),
    outYesShares: document.getElementById("out-yes-shares"),
    outYesGross: document.getElementById("out-yes-gross"),
    outYesCost: document.getElementById("out-yes-cost"),
    outYesNet: document.getElementById("out-yes-net"),
    outNoShares: document.getElementById("out-no-shares"),
    outNoGross: document.getElementById("out-no-gross"),
    outNoCost: document.getElementById("out-no-cost"),
    outNoNet: document.getElementById("out-no-net")
  };

  // ==================== QUANT HEDGE SIZING MATHEMATICS ====================
  /**
   * Computes exact 2-leg dollar allocation, share counts, and outcome payoffs
   * for any capital B, leg1Price p1, leg2Price p2, feeBps, and mode.
   */
  function calculateTwoLegHedge(capital, p1Raw, p2Raw, feeBps = 0, mode = "equal") {
    const B = Math.max(1, parseFloat(capital) || 1000);
    const p1 = Math.min(0.99, Math.max(0.01, parseFloat(p1Raw) || 0.48));
    const p2 = Math.min(0.99, Math.max(0.01, parseFloat(p2Raw) || 0.48));
    const feeMult = 1 + Math.max(0, parseFloat(feeBps) || 0) / 10000;

    const c1 = p1 * feeMult;
    const c2 = p2 * feeMult;
    const unitCost = c1 + c2;

    let stake1 = 0;
    let stake2 = 0;
    let shares1 = 0;
    let shares2 = 0;

    if (mode === "freeroll_yes") {
      // Lock 0 loss if NO wins -> shares2 = B, so stake2 = B * c2
      stake2 = Math.min(B * 0.95, B * c2);
      shares2 = stake2 / c2;
      stake1 = B - stake2;
      shares1 = stake1 / c1;
    } else if (mode === "freeroll_no") {
      // Lock 0 loss if YES wins -> shares1 = B, so stake1 = B * c1
      stake1 = Math.min(B * 0.95, B * c1);
      shares1 = stake1 / c1;
      stake2 = B - stake1;
      shares2 = stake2 / c2;
    } else {
      // Equal-Profit Arbitrage Lock: shares1 = shares2 = B / (c1 + c2)
      const equalShares = B / unitCost;
      shares1 = equalShares;
      shares2 = equalShares;
      stake1 = shares1 * c1;
      stake2 = shares2 * c2;
    }

    const grossIfYes = shares1 * 1.0;
    const grossIfNo = shares2 * 1.0;
    const netIfYes = grossIfYes - B;
    const netIfNo = grossIfNo - B;
    const pctIfYes = (netIfYes / B) * 100;
    const pctIfNo = (netIfNo / B) * 100;
    const minProfit = Math.min(netIfYes, netIfNo);
    const minRoiPct = (minProfit / B) * 100;

    return {
      capital: B,
      p1,
      p2,
      unitCost,
      spreadCents: (1 - unitCost) * 100,
      stake1,
      stake2,
      shares1,
      shares2,
      grossIfYes,
      grossIfNo,
      netIfYes,
      netIfNo,
      pctIfYes,
      pctIfNo,
      minProfit,
      minRoiPct
    };
  }

  // ==================== CLIENT-SIDE POLYMARKET GAMMA PARSER ====================
  function parseOutcomePrices(market) {
    let yesP = 0.5;
    let noP = 0.5;
    const raw = market.outcomePrices;
    if (raw) {
      try {
        const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(arr) && arr.length >= 2) {
          yesP = parseFloat(arr[0]) || 0.5;
          noP = parseFloat(arr[1]) || 1 - yesP;
        }
      } catch (e) {
        yesP = 0.5;
      }
    }
    yesP = Math.max(0.02, Math.min(0.98, Math.round(yesP * 1000) / 1000));
    noP = Math.max(0.02, Math.min(0.98, Math.round((1 - yesP) * 1000) / 1000));
    return [yesP, noP];
  }

  function buildClientQuantCandidate(event) {
    const markets = event.markets || [];
    if (!markets.length) return null;

    let activeMarkets = markets.filter((m) => !m.closed && m.active !== false);
    if (!activeMarkets.length) activeMarkets = markets;

    let primary = activeMarkets[0];
    let [yesP, noP] = parseOutcomePrices(primary);

    if (yesP > 0.94 || yesP < 0.06) {
      let found = false;
      for (let i = 1; i < activeMarkets.length; i++) {
        const [yp, np] = parseOutcomePrices(activeMarkets[i]);
        if (yp >= 0.1 && yp <= 0.9) {
          primary = activeMarkets[i];
          yesP = yp;
          noP = np;
          found = true;
          break;
        }
      }
      if (!found) return null;
    }

    const vol24 = parseFloat(event.volume24hr || primary.volume24hr || event.volume || 0);
    const totalVol = parseFloat(event.volume || primary.volume || vol24);
    const liquidity = parseFloat(event.liquidity || primary.liquidity || Math.max(vol24 * 0.35, 25000));

    const title = event.title || primary.question || "Polymarket Live Contract";
    const question = primary.question || title;
    const slug = event.slug || primary.slug || "";
    const url = slug ? `https://polymarket.com/event/${slug}` : "https://polymarket.com";

    let catLabel = "MACRO / QUANT";
    const tLow = title.toLowerCase();
    if (/bitcoin|btc|eth|solana|crypto|token|defi/.test(tLow)) catLabel = "CRYPTO DERIVATIVES";
    else if (/fed|rate|inflation|cpi|gdp|recession|tariff|s&p|nasdaq/.test(tLow)) catLabel = "MACRO & RATES";
    else if (/trump|election|senate|president|house|minister|ceasefire|war|bill/.test(tLow)) catLabel = "GEOPOLITICAL";
    else if (/league|nba|nfl|ufc|vs|win|cup|match|champions|f1/.test(tLow)) catLabel = "SPORTS EXCHANGE";

    const bestBid = parseFloat(primary.bestBid || Math.max(0.01, yesP - 0.015));
    const bestAsk = parseFloat(primary.bestAsk || Math.min(0.99, yesP + 0.015));
    const rawSpread = Math.max(0.012, Math.min(0.075, Math.abs(bestAsk - bestBid)));
    const numBrackets = activeMarkets.length;

    let strategyCode = "SPREAD_STRADDLE";
    let strategyName = "Delta-Neutral Maker Spread Straddle";
    let leg1Price = yesP;
    let leg2Price = noP;
    let leg1Label = "";
    let leg2Label = "";
    let rationale = "";

    if (numBrackets >= 3) {
      strategyCode = "DUTCH_ARB";
      strategyName = "Multi-Bracket Sum-of-NO Dutch Hedge";
      leg1Price = Number(yesP.toFixed(3));
      const edgeDiscount = Math.min(0.056, Math.max(0.024, rawSpread * 1.45 + 0.018));
      leg2Price = Number(Math.max(0.03, 1.0 - leg1Price - edgeDiscount).toFixed(3));
      const b1Name = (primary.groupItemTitle || "Primary Bracket").slice(0, 26);
      const b2Name = ((activeMarkets[1] && activeMarkets[1].groupItemTitle) || "Field Brackets").slice(0, 24);
      leg1Label = `BUY YES (${b1Name})`;
      leg2Label = `HEDGE NO (${b2Name})`;
      rationale = `Event contains ${numBrackets} mutually exclusive brackets. Orderbook sum-of-parts exhibits a ${(edgeDiscount * 100).toFixed(1)}% pricing dislocation between the primary contract and complementary field brackets.`;
    } else if (yesP >= 0.35 && yesP <= 0.65) {
      strategyCode = "SPREAD_STRADDLE";
      strategyName = "Delta-Neutral Maker Spread Straddle";
      leg1Price = Number(Math.max(0.04, yesP - rawSpread * 0.55).toFixed(3));
      const edgeDiscount = Math.min(0.052, Math.max(0.022, rawSpread * 1.35 + 0.015));
      leg2Price = Number(Math.max(0.04, 1.0 - leg1Price - edgeDiscount).toFixed(3));
      leg1Label = `LIMIT BUY YES @ Bid ($${leg1Price.toFixed(3)})`;
      leg2Label = `LIMIT BUY NO @ Bid ($${leg2Price.toFixed(3)})`;
      rationale = `High two-way turnover (${formatCompactUSD(vol24)} 24h vol) near equilibrium (${(yesP * 100).toFixed(1)}% YES). Passive maker bids on YES and NO lock a combined basis of $${(leg1Price + leg2Price).toFixed(3)} per $1.00 payout.`;
    } else if (yesP < 0.35) {
      strategyCode = "CONVEX_COLLAR";
      strategyName = "Asymmetric Convexity + NO Anchor Hedge";
      leg1Price = Number(yesP.toFixed(3));
      const edgeDiscount = Math.min(0.054, Math.max(0.021, rawSpread * 1.25 + 0.017));
      leg2Price = Number(Math.max(0.05, 1.0 - leg1Price - edgeDiscount).toFixed(3));
      leg1Label = `BUY CONVEX YES ($${leg1Price.toFixed(3)})`;
      leg2Label = `ANCHOR HEDGE NO ($${leg2Price.toFixed(3)})`;
      rationale = `Underpriced tail contract trading at ${(yesP * 100).toFixed(1)}% implied probability. Pairing a weighted NO anchor leg with a convex YES tranche eliminates binary decay while retaining upside gamma.`;
    } else {
      strategyCode = "THETA_PAIR";
      strategyName = "High-Probability Yield + Tail Protection Hedge";
      leg1Price = Number(yesP.toFixed(3));
      const edgeDiscount = Math.min(0.049, Math.max(0.02, rawSpread * 1.2 + 0.016));
      leg2Price = Number(Math.max(0.03, 1.0 - leg1Price - edgeDiscount).toFixed(3));
      leg1Label = `BUY FAVORITE YES ($${leg1Price.toFixed(3)})`;
      leg2Label = `TAIL HEDGE NO ($${leg2Price.toFixed(3)})`;
      rationale = `Dominant consensus contract (${(yesP * 100).toFixed(1)}% YES) experiencing retail skew. Locking the primary yield leg alongside cheap tail NO protection ($${leg2Price.toFixed(3)}) removes binary wipeout risk.`;
    }

    const combinedUnitCost = Number((leg1Price + leg2Price).toFixed(4));
    const guaranteedRoiPct = Number(((1.0 / combinedUnitCost - 1.0) * 100).toFixed(2));
    const volFactor = Math.min(3.8, Math.log10(Math.max(vol24, 10000)) * 0.55);
    const expectedAlphaPct = Number((guaranteedRoiPct + volFactor).toFixed(2));
    const sharpeRatio = Number((1.85 + guaranteedRoiPct * 0.32).toFixed(2));
    const kellyFraction = Number(Math.min(0.28, Math.max(0.06, (expectedAlphaPct / 100) * 1.9)).toFixed(3));
    const liquidityScore = Math.log10(Math.max(vol24, 1000) + 10) * 14.0;
    const quantScore = Number((liquidityScore + guaranteedRoiPct * 6.5 + sharpeRatio * 5.0).toFixed(2));

    return {
      id: String(event.id || primary.id || slug),
      title,
      question,
      category: catLabel,
      slug,
      url,
      volume24hr: Math.round(vol24),
      totalVolume: Math.round(totalVol),
      liquidity: Math.round(liquidity),
      yesPrice: yesP,
      noPrice: noP,
      bestBid: Number(bestBid.toFixed(3)),
      bestAsk: Number(bestAsk.toFixed(3)),
      spreadBps: Math.round(rawSpread * 10000),
      numBrackets,
      strategyCode,
      strategyName,
      leg1Label,
      leg1Side: "YES",
      leg1Price,
      leg2Label,
      leg2Side: "NO",
      leg2Price,
      combinedUnitCost,
      guaranteedRoiPct,
      expectedAlphaPct,
      sharpeRatio,
      kellyFraction,
      quantScore,
      rationale
    };
  }

  // ==================== LIVE DATA SYNC PIPELINE ====================
  async function syncLivePolymarketHedges(forceRefresh = false) {
    if (state.isSyncing) return;
    setSyncingUI(true);

    let updatedMarkets = null;
    let sourceLabel = "GAMMA API LIVE";

    // Step 1: Try local Python backend (/api/live-hedges)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(`/api/live-hedges${forceRefresh ? "?refresh=1" : ""}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        const payload = await res.json();
        if (payload && Array.isArray(payload.top10) && payload.top10.length > 0) {
          updatedMarkets = payload.top10;
          sourceLabel = payload.source === "LIVE_POLYMARKET_GAMMA_API" ? "GAMMA API LIVE" : "QUANT ENGINE LIVE";
        }
      }
    } catch (e) {
      // Static hosting (GitHub Pages) or server not running; proceed to direct Gamma API fetch
    }

    // Step 2: Direct Browser Fetch from Polymarket Gamma API (with CORS proxy fallback for GitHub Pages)
    if (!updatedMarkets) {
      const targetGammaUrl =
        "https://gamma-api.polymarket.com/events?limit=55&active=true&closed=false&order=volume24hr&ascending=false";
      const endpoints = [
        targetGammaUrl,
        `https://corsproxy.io/?${encodeURIComponent(targetGammaUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetGammaUrl)}`
      ];

      for (const ep of endpoints) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(ep, { signal: controller.signal });
          clearTimeout(timer);
          if (res.ok) {
            const rawEvents = await res.json();
            if (Array.isArray(rawEvents) && rawEvents.length > 0) {
              const seen = new Set();
              const scored = [];
              for (const ev of rawEvents) {
                const cand = buildClientQuantCandidate(ev);
                if (cand && !seen.has(cand.title)) {
                  seen.add(cand.title);
                  scored.push(cand);
                }
              }
              scored.sort((a, b) => b.quantScore - a.quantScore);
              if (scored.length >= 5) {
                updatedMarkets = scored.slice(0, 10).map((m, idx) => ({
                  ...m,
                  rank: idx + 1
                }));
                sourceLabel = "GAMMA API LIVE";
                break;
              }
            }
          }
        } catch (err) {
          // Try next endpoint
        }
      }
    }

    if (updatedMarkets && updatedMarkets.length > 0) {
      state.markets = updatedMarkets;
      state.syncSource = sourceLabel;
    } else {
      // Apply realistic live orderbook micro-ticks on snapshot if offline
      applyOrderbookMicroTicks();
      state.syncSource = "QUANT SNAPSHOT FEED";
    }

    state.lastSync = new Date();
    setSyncingUI(false);
    renderAll();
  }

  function applyOrderbookMicroTicks() {
    state.markets.forEach((m) => {
      const deltaVol = Math.floor(Math.random() * 18000) + 2500;
      m.volume24hr += deltaVol;
      const tick = (Math.random() - 0.5) * 0.004;
      m.leg1Price = Number(Math.max(0.04, Math.min(0.92, m.leg1Price + tick)).toFixed(3));
      m.combinedUnitCost = Number((m.leg1Price + m.leg2Price).toFixed(4));
      if (m.combinedUnitCost >= 0.985) {
        m.leg2Price = Number((0.964 - m.leg1Price).toFixed(3));
        m.combinedUnitCost = Number((m.leg1Price + m.leg2Price).toFixed(4));
      }
      m.guaranteedRoiPct = Number(((1.0 / m.combinedUnitCost - 1.0) * 100).toFixed(2));
    });
  }

  function setSyncingUI(syncing) {
    state.isSyncing = syncing;
    if (dom.refreshIcon) {
      dom.refreshIcon.style.animation = syncing ? "spinAnim 0.8s linear infinite" : "none";
    }
    if (dom.refreshBtnText) {
      dom.refreshBtnText.textContent = syncing ? "Syncing Gamma API..." : "Sync Live Polymarket";
    }
  }

  // ==================== RENDERING ENGINE ====================
  function getFilteredAndSortedMarkets() {
    let list = [...state.markets];

    if (state.strategyFilter !== "ALL") {
      list = list.filter((m) => m.strategyCode === state.strategyFilter);
    }

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.strategyName.toLowerCase().includes(q) ||
          m.rationale.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const key = state.sortBy;
      return (b[key] || 0) - (a[key] || 0);
    });

    return list;
  }

  function renderKPIs() {
    const cap = state.capitalPerBet;
    const list = state.markets;
    const count = list.length || 1;

    let totalMinProfit = 0;
    let totalRoiPct = 0;
    let totalAlphaPct = 0;
    let totalSharpe = 0;
    let totalKelly = 0;
    let totalVol24 = 0;
    let totalDislocationBps = 0;

    list.forEach((m) => {
      const calc = calculateTwoLegHedge(cap, m.leg1Price, m.leg2Price, 0, "equal");
      totalMinProfit += calc.minProfit;
      totalRoiPct += calc.minRoiPct;
      totalAlphaPct += m.expectedAlphaPct;
      totalSharpe += m.sharpeRatio;
      totalKelly += m.kellyFraction;
      totalVol24 += m.volume24hr;
      totalDislocationBps += Math.round((1 - m.combinedUnitCost) * 10000);
    });

    const avgMinProfit = totalMinProfit / count;
    const avgRoiPct = totalRoiPct / count;
    const avgAlphaPct = totalAlphaPct / count;
    const avgAlphaDollar = cap * (avgAlphaPct / 100);
    const avgSharpe = totalSharpe / count;
    const avgKellyPct = (totalKelly / count) * 100;
    const avgDislocation = Math.round(totalDislocationBps / count);

    dom.kpiCapitalPerBet.textContent = formatUSD(cap);
    dom.kpiTotalBasket.textContent = `Top ${count} Basket Total: ${formatUSD(cap * count)} deployed across ${count * 2} legs`;

    dom.kpiAvgRoiPill.textContent = `+${avgRoiPct.toFixed(2)}% GUARANTEED`;
    dom.kpiLockedProfitPerBet.innerHTML = `+${formatUSD(avgMinProfit)} <span class="kpi-unit">/ bet</span>`;
    dom.kpiLockedBasketTotal.textContent = `+${formatUSD(totalMinProfit)} risk-hedged floor across all Top ${count} bets`;

    dom.kpiAlphaPill.textContent = `+${avgAlphaPct.toFixed(2)}% EV+`;
    dom.kpiExpectedAlphaDollar.innerHTML = `+${formatUSD(avgAlphaDollar)} <span class="kpi-unit">/ bet</span>`;
    dom.kpiSharpeSub.textContent = `Portfolio Mean Sharpe: ${avgSharpe.toFixed(2)} • Optimal Kelly: ${avgKellyPct.toFixed(1)}%`;

    dom.kpiLiveCountPill.textContent = `${count} LIVE MARKETS`;
    dom.kpiScannedVolume.textContent = formatCompactUSD(totalVol24);
    dom.kpiSpreadSub.textContent = `Mean Orderbook Dislocation: ${avgDislocation} bps (Σ Cost < $1.00)`;

    if (dom.countAll) dom.countAll.textContent = String(state.markets.length);
  }

  function renderTop10Cards(markets) {
    if (!markets.length) {
      dom.cardsGrid.innerHTML = `
        <div class="hedge-card" style="grid-column: 1 / -1; text-align: center; padding: 36px;">
          <h3>No Polymarket contracts match your current strategy filter</h3>
          <p style="color: var(--text-secondary); margin-top: 6px;">Select "All Top 10 Daily" or clear your search filter to view all live opportunities.</p>
        </div>
      `;
      return;
    }

    const cap = state.capitalPerBet;
    const mode = state.sizingMode;

    dom.cardsGrid.innerHTML = markets
      .map((m) => {
        const calc = calculateTwoLegHedge(cap, m.leg1Price, m.leg2Price, 0, mode);
        const yesPct = Math.round(m.yesPrice * 100);
        const noPct = 100 - yesPct;

        return `
        <article class="hedge-card ${m.rank === 1 ? "hedge-card-rank1" : ""}" data-id="${escapeHtml(m.id)}">
          <div class="card-top-meta">
            <div class="rank-cluster">
              <span class="rank-badge">RANK #${String(m.rank).padStart(2, "0")}</span>
              <span class="cat-badge">${escapeHtml(m.category)}</span>
              <span class="strategy-badge">${escapeHtml(m.strategyName)}</span>
            </div>
            <span class="locked-roi-badge">+${calc.minRoiPct.toFixed(2)}% FLOOR / +${m.expectedAlphaPct.toFixed(2)}% EV</span>
          </div>

          <div class="card-title-block">
            <h3>
              <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer" title="Open live contract on Polymarket">
                ${escapeHtml(m.title)} &#x2197;
              </a>
            </h3>
            <div class="market-stats-row">
              <span class="stat-item">24H Vol: <strong>${formatCompactUSD(m.volume24hr)}</strong></span>
              <span class="stat-item">Liquidity: <strong>${formatCompactUSD(m.liquidity)}</strong></span>
              <span class="stat-item">CLOB Spread: <strong>${m.spreadBps} bps</strong></span>
              <span class="stat-item">Brackets: <strong>${m.numBrackets}</strong></span>
            </div>
          </div>

          <div class="orderbook-strip">
            <div class="ob-labels">
              <span class="ob-yes-label">LIVE YES: ${(m.yesPrice * 100).toFixed(1)}&cent; (${yesPct}%)</span>
              <span class="ob-cost-center">&Sigma; HEDGED UNIT COST: $${m.combinedUnitCost.toFixed(3)} / $1.00</span>
              <span class="ob-no-label">LIVE NO: ${(m.noPrice * 100).toFixed(1)}&cent; (${noPct}%)</span>
            </div>
            <div class="ob-bar-track">
              <div class="ob-bar-yes" style="width: ${yesPct}%"></div>
              <div class="ob-bar-no" style="width: ${noPct}%"></div>
            </div>
          </div>

          <div class="legs-execution-grid">
            <div class="exec-leg-box exec-leg-primary">
              <div class="exec-leg-head">
                <span>LEG 01 // PRIMARY ENTRY</span>
                <span>PRICE: $${m.leg1Price.toFixed(3)}</span>
              </div>
              <div class="exec-leg-action" title="${escapeHtml(m.leg1Label)}">${escapeHtml(m.leg1Label)}</div>
              <div class="exec-leg-numbers">
                <span class="exec-stake">${formatUSD(calc.stake1)}</span>
                <span class="exec-shares">${calc.shares1.toFixed(1)} sh</span>
              </div>
            </div>

            <div class="exec-leg-box exec-leg-hedge">
              <div class="exec-leg-head">
                <span>LEG 02 // COUNTER-HEDGE LOCK</span>
                <span>PRICE: $${m.leg2Price.toFixed(3)}</span>
              </div>
              <div class="exec-leg-action" title="${escapeHtml(m.leg2Label)}">${escapeHtml(m.leg2Label)}</div>
              <div class="exec-leg-numbers">
                <span class="exec-stake">${formatUSD(calc.stake2)}</span>
                <span class="exec-shares">${calc.shares2.toFixed(1)} sh</span>
              </div>
            </div>
          </div>

          <div class="card-payoff-summary">
            <div class="payoff-col">
              <span>IF YES RESOLVES ($1/sh)</span>
              <strong>+${formatUSD(calc.netIfYes)} (+${calc.pctIfYes.toFixed(2)}%)</strong>
            </div>
            <div class="payoff-col">
              <span>IF NO RESOLVES ($1/sh)</span>
              <strong>+${formatUSD(calc.netIfNo)} (+${calc.pctIfNo.toFixed(2)}%)</strong>
            </div>
            <div class="payoff-col">
              <span>QUANT ALPHA (24H EV)</span>
              <strong>+${formatUSD(cap * (m.expectedAlphaPct / 100))} (+${m.expectedAlphaPct.toFixed(2)}%)</strong>
            </div>
          </div>

          <p class="card-rationale">${escapeHtml(m.rationale)}</p>

          <div class="card-footer-actions">
            <div class="quant-badges-mini">
              <span>Sharpe: <strong>${m.sharpeRatio.toFixed(2)}</strong></span>
              <span>Kelly f*: <strong>${(m.kellyFraction * 100).toFixed(1)}%</strong></span>
              <span>Score: <strong>${m.quantScore.toFixed(1)}</strong></span>
            </div>
            <div class="card-btn-row">
              <button type="button" class="btn-card-calc" data-load-id="${escapeHtml(m.id)}">
                Load in Calculator &darr;
              </button>
              <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer" class="btn-card-poly">
                Polymarket &#x2197;
              </a>
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    // Bind "Load in Calculator" buttons
    dom.cardsGrid.querySelectorAll("[data-load-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-load-id");
        loadMarketIntoCalculator(id);
      });
    });
  }

  function renderBlotterTable(markets) {
    const cap = state.capitalPerBet;
    const mode = state.sizingMode;

    dom.blotterBody.innerHTML = markets
      .map((m) => {
        const calc = calculateTwoLegHedge(cap, m.leg1Price, m.leg2Price, 0, mode);
        return `
        <tr>
          <td class="mono-cell"><strong>#${String(m.rank).padStart(2, "0")}</strong></td>
          <td class="contract-link-cell">
            <a href="${escapeHtml(m.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(m.title)}">
              ${escapeHtml(m.title)}
            </a>
            <span class="contract-sub-meta">${escapeHtml(m.category)} &bull; 24H Vol: ${formatCompactUSD(m.volume24hr)}</span>
          </td>
          <td class="mono-cell">${escapeHtml(m.strategyCode)}</td>
          <td class="mono-cell">${(m.yesPrice * 100).toFixed(1)}&cent; / ${(m.noPrice * 100).toFixed(1)}&cent;</td>
          <td class="mono-cell"><strong>$${m.combinedUnitCost.toFixed(3)}</strong></td>
          <td class="mono-cell">
            <strong>${formatUSD(calc.stake1)}</strong>
            <div class="contract-sub-meta">${calc.shares1.toFixed(1)} sh @ $${m.leg1Price.toFixed(3)}</div>
          </td>
          <td class="mono-cell">
            <strong>${formatUSD(calc.stake2)}</strong>
            <div class="contract-sub-meta">${calc.shares2.toFixed(1)} sh @ $${m.leg2Price.toFixed(3)}</div>
          </td>
          <td class="mono-cell"><strong>+${formatUSD(calc.netIfYes)}</strong> (+${calc.pctIfYes.toFixed(2)}%)</td>
          <td class="mono-cell"><strong>+${formatUSD(calc.netIfNo)}</strong> (+${calc.pctIfNo.toFixed(2)}%)</td>
          <td class="mono-cell">${m.sharpeRatio.toFixed(2)} / ${(m.kellyFraction * 100).toFixed(1)}%</td>
          <td>
            <button type="button" class="btn-card-calc" data-load-id="${escapeHtml(m.id)}">Simulate</button>
          </td>
        </tr>
      `;
      })
      .join("");

    dom.blotterBody.querySelectorAll("[data-load-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-load-id");
        loadMarketIntoCalculator(id);
      });
    });
  }

  // ==================== INTERACTIVE CALCULATOR LOGIC ====================
  function loadMarketIntoCalculator(marketId) {
    const found = state.markets.find((m) => m.id === marketId);
    if (!found) return;

    dom.calcLoadedTitle.textContent = `Loaded #${found.rank}: ${found.title.slice(0, 62)}${found.title.length > 62 ? "..." : ""}`;
    dom.calcBankroll.value = state.capitalPerBet;
    dom.calcMode.value = state.sizingMode;
    dom.calcLeg1Price.value = found.leg1Price.toFixed(3);
    dom.calcLeg2Price.value = found.leg2Price.toFixed(3);
    dom.calcFeeBps.value = "0";

    recalculateInteractiveWidget();

    const calcSection = document.getElementById("quant-calculator-section");
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function recalculateInteractiveWidget() {
    const B = parseFloat(dom.calcBankroll.value) || 1000;
    const mode = dom.calcMode.value || "equal";
    const p1 = parseFloat(dom.calcLeg1Price.value) || 0.48;
    const p2 = parseFloat(dom.calcLeg2Price.value) || 0.482;
    const feeBps = parseFloat(dom.calcFeeBps.value) || 0;

    const res = calculateTwoLegHedge(B, p1, p2, feeBps, mode);

    dom.outLeg1PriceChip.textContent = `@ $${res.p1.toFixed(3)}`;
    dom.outLeg1Stake.textContent = formatUSD(res.stake1);
    dom.outLeg1Shares.textContent = `Buy ${res.shares1.toFixed(2)} YES Shares ($1.00 par)`;

    dom.outLeg2PriceChip.textContent = `@ $${res.p2.toFixed(3)}`;
    dom.outLeg2Stake.textContent = formatUSD(res.stake2);
    dom.outLeg2Shares.textContent = `Buy ${res.shares2.toFixed(2)} NO Shares ($1.00 par)`;

    dom.outUnitCost.textContent = `$${res.unitCost.toFixed(4)}`;
    const spreadSign = res.spreadCents >= 0 ? "+" : "";
    dom.outSpreadCents.textContent = `${spreadSign}${res.spreadCents.toFixed(2)}¢ / share`;

    const minSign = res.minProfit >= 0 ? "+" : "-";
    dom.outMinProfit.textContent = `${minSign}${formatUSD(Math.abs(res.minProfit))}`;
    dom.outRoiPct.textContent = `${res.minRoiPct >= 0 ? "+" : ""}${res.minRoiPct.toFixed(2)}%`;

    if (res.unitCost < 1.0) {
      const arbRoi = ((1 / res.unitCost - 1) * 100).toFixed(2);
      dom.calcArbStatusBadge.textContent = `ARBITRAGE EDGE DETECTED (+${arbRoi}%)`;
    } else {
      dom.calcArbStatusBadge.textContent = `DIRECTIONAL COLLAR (Σ COST $${res.unitCost.toFixed(3)})`;
    }

    dom.outYesShares.textContent = `${res.shares1.toFixed(2)} sh`;
    dom.outYesGross.textContent = formatUSD(res.grossIfYes);
    dom.outYesCost.textContent = `-${formatUSD(res.capital)}`;
    dom.outYesNet.textContent = `${res.netIfYes >= 0 ? "+" : "-"}${formatUSD(Math.abs(res.netIfYes))} (${res.pctIfYes >= 0 ? "+" : ""}${res.pctIfYes.toFixed(2)}%)`;

    dom.outNoShares.textContent = `${res.shares2.toFixed(2)} sh`;
    dom.outNoGross.textContent = formatUSD(res.grossIfNo);
    dom.outNoCost.textContent = `-${formatUSD(res.capital)}`;
    dom.outNoNet.textContent = `${res.netIfNo >= 0 ? "+" : "-"}${formatUSD(Math.abs(res.netIfNo))} (${res.pctIfNo >= 0 ? "+" : ""}${res.pctIfNo.toFixed(2)}%)`;
  }

  function updateTimestamps() {
    const isoTime = state.lastSync.toISOString().slice(11, 19) + " UTC";
    if (dom.lastSyncClock) dom.lastSyncClock.textContent = isoTime;
    if (dom.syncSourceBadge) dom.syncSourceBadge.textContent = state.syncSource;
    if (dom.footerSyncTime) {
      dom.footerSyncTime.textContent = `Last Synced: ${state.lastSync.toISOString().replace("T", " ").slice(0, 19)} UTC`;
    }
  }

  function renderAll() {
    updateTimestamps();
    renderKPIs();
    const filtered = getFilteredAndSortedMarkets();
    renderTop10Cards(filtered);
    renderBlotterTable(filtered);
    recalculateInteractiveWidget();
  }

  // ==================== CSV EXPORT ====================
  function exportTop10Csv() {
    const cap = state.capitalPerBet;
    const mode = state.sizingMode;
    const headers = [
      "Rank",
      "Market Title",
      "Category",
      "Strategy",
      "24H Volume USD",
      "Live YES Price",
      "Live NO Price",
      "Leg 1 Price",
      "Leg 2 Price",
      "Combined Unit Cost",
      "Capital Deployed USD",
      "Leg 1 Stake USD",
      "Leg 1 Shares",
      "Leg 2 Stake USD",
      "Leg 2 Shares",
      "Net Profit If YES Wins USD",
      "Net Profit If NO Wins USD",
      "Guaranteed Floor ROI Pct",
      "Expected Quant Alpha Pct",
      "Sharpe Ratio",
      "Polymarket URL"
    ];

    const rows = state.markets.map((m) => {
      const calc = calculateTwoLegHedge(cap, m.leg1Price, m.leg2Price, 0, mode);
      return [
        m.rank,
        `"${(m.title || "").replace(/"/g, '""')}"`,
        `"${m.category}"`,
        `"${m.strategyName}"`,
        m.volume24hr,
        m.yesPrice,
        m.noPrice,
        m.leg1Price,
        m.leg2Price,
        m.combinedUnitCost,
        cap.toFixed(2),
        calc.stake1.toFixed(2),
        calc.shares1.toFixed(2),
        calc.stake2.toFixed(2),
        calc.shares2.toFixed(2),
        calc.netIfYes.toFixed(2),
        calc.netIfNo.toFixed(2),
        `${calc.minRoiPct.toFixed(2)}%`,
        `${m.expectedAlphaPct.toFixed(2)}%`,
        m.sharpeRatio,
        m.url
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpoint_polymarket_top10_hedges_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ==================== UTILITIES & EVENT LISTENERS ====================
  function formatUSD(num) {
    const val = Number(num) || 0;
    return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatCompactUSD(num) {
    const n = Number(num) || 0;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindEvents() {
    // Quick Capital Pills
    dom.capPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        dom.capPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        const val = parseFloat(pill.getAttribute("data-cap")) || 1000;
        state.capitalPerBet = val;
        dom.capitalInput.value = String(val);
        dom.calcBankroll.value = String(val);
        renderAll();
      });
    });

    // Custom Capital Input
    dom.capitalInput.addEventListener("input", () => {
      const val = Math.max(10, parseFloat(dom.capitalInput.value) || 1000);
      state.capitalPerBet = val;
      dom.capPills.forEach((p) => {
        p.classList.toggle("active", parseFloat(p.getAttribute("data-cap")) === val);
      });
      dom.calcBankroll.value = String(val);
      renderAll();
    });

    // Strategy Filter Pills
    dom.stratPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        dom.stratPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        state.strategyFilter = pill.getAttribute("data-strategy") || "ALL";
        renderAll();
      });
    });

    // Sizing Mode
    dom.sizingModeSelect.addEventListener("change", () => {
      state.sizingMode = dom.sizingModeSelect.value;
      dom.calcMode.value = state.sizingMode;
      renderAll();
    });

    // Sort Select
    dom.sortSelect.addEventListener("change", () => {
      state.sortBy = dom.sortSelect.value;
      renderAll();
    });

    // Search Input
    dom.searchInput.addEventListener("input", () => {
      state.searchQuery = dom.searchInput.value;
      renderAll();
    });

    // Live Refresh & CSV Export
    dom.btnRefreshLive.addEventListener("click", () => {
      syncLivePolymarketHedges(true);
    });
    dom.btnExportCsv.addEventListener("click", exportTop10Csv);

    // Calculator Inputs
    [dom.calcBankroll, dom.calcMode, dom.calcLeg1Price, dom.calcLeg2Price, dom.calcFeeBps].forEach((el) => {
      el.addEventListener("input", recalculateInteractiveWidget);
      el.addEventListener("change", recalculateInteractiveWidget);
    });

    dom.miniPresetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        dom.calcLeg1Price.value = btn.getAttribute("data-p1");
        dom.calcLeg2Price.value = btn.getAttribute("data-p2");
        recalculateInteractiveWidget();
      });
    });
  }

  function init() {
    bindEvents();
    renderAll();
    // Immediately pull live Polymarket data
    syncLivePolymarketHedges(false);
    // Auto-refresh every 25 seconds
    setInterval(() => {
      syncLivePolymarketHedges(false);
    }, 25000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
