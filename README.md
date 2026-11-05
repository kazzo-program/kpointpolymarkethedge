# KPOINT POLYMARKET HEDGE // Top 10 Daily Quant Finance Hedging Terminal

> **Grey & Pitch-Black Institutional Interface // Live Polymarket Gamma API Orderbook Scanner // Top 10 Daily Bets to Hedge & Extract Arbitrage / Delta-Neutral Alpha // 2-Leg Quant Position Sizer**

---

## ⚡ Core Capabilities

1. **Live Polymarket Gamma API Data Pipeline (Zero API Keys Required)**:
   - Pulls high-volume active prediction markets directly from `https://gamma-api.polymarket.com/events` sorted by 24-hour trading volume.
   - Evaluates multi-bracket dislocations, orderbook bid-ask spreads, liquidity depth, and implied probability skews in real time.

2. **Quantitative Finance Hedging Engine (Top 10 Daily Ranking)**:
   - Ranks the **Top 10 Bets of the Day** across 4 institutional prediction-market hedging strategies:
     - **`DUTCH_ARB` — Multi-Bracket Sum-of-NO Arbitrage**: Exploits multi-outcome overround dislocations where pairing the primary bracket against complementary field `NO` shares yields a combined unit cost $\Sigma \text{Cost} < \$1.00$.
     - **`SPREAD_STRADDLE` — Delta-Neutral Maker Bid-Ask Straddle**: Captures resting maker bid spreads on 50/50 high-turnover contracts with 0 bps maker fees on the Polymarket CLOB.
     - **`CONVEX_COLLAR` — Asymmetric Convexity + NO Anchor Collar**: Protects 100% of principal via an anchor `NO` position while retaining free upside convexity on underpriced `YES` catalysts.
     - **`THETA_PAIR` — High-Probability Yield + Tail Protection**: Pairs high-probability convergence contracts with cheap tail-hedge `NO` shares to eliminate binary wipeout risk.

3. **3 Dynamic Hedge Sizing Modes & Interactive 2-Leg Calculator**:
   - **Equal-Profit Arbitrage Lock**: Sizes Leg 1 (`YES`) and Leg 2 (`NO`) so you lock in the exact same net dollar profit regardless of which outcome resolves.
   - **Zero-Loss NO Floor (Free-Roll YES)**: Locks `$0.00` downside if `NO` resolves and stacks 100% of the arbitrage surplus onto `YES`.
   - **Zero-Loss YES Floor (Free-Roll NO)**: Locks `$0.00` downside if `YES` resolves and stacks 100% of the arbitrage surplus onto `NO`.

---

## 🚀 Run Locally

```bash
python server.py
```

Then open **`http://localhost:8080`** in your browser.

---

*KPOINT made this one. Not financial advice the risk is yours and yours only.*
