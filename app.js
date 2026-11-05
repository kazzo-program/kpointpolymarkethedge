/**
 * KPOINT HEDGE // FREE BET & QUALIFYING BET 70%+ PERFECT HEDGE ENGINE
 * Supports:
 * 1. Exchange Back vs. Lay Hedging (Betfair / Smarkets / Matchbook)
 * 2. 2-Bookmaker Opposite Outcome Hedging (Bookmaker A vs. Bookmaker B)
 * 3. Live Qualifying Bet (~20p Loss) + Free Bet SNR (~70%-80% Guaranteed Profit)
 * 4. Smart Odds Advisor, Live Sensitivity Matrix, Presets & Odds Format Converter
 */

(function () {
  'use strict';

  const state = {
    mode: 'exchange', // 'exchange' | 'dutch'
    currency: '£'     // '£' | '$' | '€'
  };

  // DOM References
  const els = {
    modeExchangeBtn: document.getElementById('mode-exchange-btn'),
    modeDutchBtn: document.getElementById('mode-dutch-btn'),
    currBtns: document.querySelectorAll('.curr-btn'),
    currPrefixes: document.querySelectorAll('.curr-prefix'),
    presetChips: document.querySelectorAll('.preset-chip'),

    // Converter
    convFrac: document.getElementById('conv-frac'),
    convDec: document.getElementById('conv-dec'),
    convAmer: document.getElementById('conv-amer'),
    applyConvBet2: document.getElementById('apply-conv-bet2'),

    // Master Banner
    masterQualResult: document.getElementById('master-qual-result'),
    masterQualSub: document.getElementById('master-qual-sub'),
    masterFreeProfit: document.getElementById('master-free-profit'),
    masterFreeSub: document.getElementById('master-free-sub'),
    masterNetProfit: document.getElementById('master-net-profit'),
    masterNetSub: document.getElementById('master-net-sub'),
    masterTargetBadge: document.getElementById('master-target-badge'),
    masterRetentionPct: document.getElementById('master-retention-pct'),
    masterProgressFill: document.getElementById('master-progress-fill'),
    masterCapitalNeeded: document.getElementById('master-capital-needed'),

    // Bet 1: Qualifying Bet
    qStake: document.getElementById('q-stake'),
    qBackOdds: document.getElementById('q-back-odds'),
    qLayOdds: document.getElementById('q-lay-odds'),
    qComm: document.getElementById('q-comm'),
    qBackLabel: document.getElementById('q-back-label'),
    qLayLabel: document.getElementById('q-lay-label'),
    qCommLabel: document.getElementById('q-comm-label'),
    qRatingBadge: document.getElementById('q-rating-badge'),
    qActionTitle: document.getElementById('q-action-title'),
    qHedgeStake: document.getElementById('q-hedge-stake'),
    qInstructionLine: document.getElementById('q-instruction-line'),
    qLiabilityLabel: document.getElementById('q-liability-label'),
    qLiability: document.getElementById('q-liability'),
    qNetLoss: document.getElementById('q-net-loss'),
    qAdvisor: document.getElementById('q-advisor'),
    qAdvisorText: document.getElementById('q-advisor-text'),
    qTableHedgeCol: document.getElementById('q-table-hedge-col'),
    qWinBookie: document.getElementById('q-win-bookie'),
    qWinExchange: document.getElementById('q-win-exchange'),
    qWinNet: document.getElementById('q-win-net'),
    qLoseBookie: document.getElementById('q-lose-bookie'),
    qLoseExchange: document.getElementById('q-lose-exchange'),
    qLoseNet: document.getElementById('q-lose-net'),

    // Bet 2: Free Bet Hedge
    fStake: document.getElementById('f-stake'),
    fBackOdds: document.getElementById('f-back-odds'),
    fLayOdds: document.getElementById('f-lay-odds'),
    fComm: document.getElementById('f-comm'),
    fType: document.getElementById('f-type'),
    fBackLabel: document.getElementById('f-back-label'),
    fLayLabel: document.getElementById('f-lay-label'),
    fCommLabel: document.getElementById('f-comm-label'),
    fRatingBadge: document.getElementById('f-rating-badge'),
    fActionTitle: document.getElementById('f-action-title'),
    fHedgeStake: document.getElementById('f-hedge-stake'),
    fInstructionLine: document.getElementById('f-instruction-line'),
    fLiabilityLabel: document.getElementById('f-liability-label'),
    fLiability: document.getElementById('f-liability'),
    fNetProfit: document.getElementById('f-net-profit'),
    fAdvisor: document.getElementById('f-advisor'),
    fAdvisorText: document.getElementById('f-advisor-text'),
    fTableHedgeCol: document.getElementById('f-table-hedge-col'),
    fWinBookie: document.getElementById('f-win-bookie'),
    fWinExchange: document.getElementById('f-win-exchange'),
    fWinNet: document.getElementById('f-win-net'),
    fLoseBookie: document.getElementById('f-lose-bookie'),
    fLoseExchange: document.getElementById('f-lose-exchange'),
    fLoseNet: document.getElementById('f-lose-net'),

    // Simulator Matrix
    simFreeStakeLabel: document.getElementById('sim-free-stake-label'),
    simCommLabel: document.getElementById('sim-comm-label'),
    matrixHedgeColTitle: document.getElementById('matrix-hedge-col-title'),
    oddsMatrixBody: document.getElementById('odds-matrix-body')
  };

  // Format currency helper
  function fmtMoney(amount, showSign = false) {
    const c = state.currency;
    const abs = Math.abs(amount).toFixed(2);
    if (amount < -0.0001) {
      return `-${c}${abs}`;
    }
    if (showSign && amount > 0.0001) {
      return `+${c}${abs}`;
    }
    return `${c}${abs}`;
  }

  // Format pence/cents for small qualifying losses (e.g. "20p" or "20c")
  function fmtSmallUnit(amount) {
    const minor = Math.round(Math.abs(amount) * 100);
    const unit = state.currency === '£' ? 'p' : 'c';
    if (minor < 100) {
      return `${minor}${unit}`;
    }
    return fmtMoney(Math.abs(amount), false);
  }

  // Calculate Bet 1 (Qualifying Bet)
  function calculateQualifyingBet() {
    const stake = Math.max(0.01, parseFloat(els.qStake.value) || 0);
    const backOdds = Math.max(1.01, parseFloat(els.qBackOdds.value) || 1.01);
    const layOdds = Math.max(1.01, parseFloat(els.qLayOdds.value) || 1.01);
    const commPct = Math.max(0, Math.min(50, parseFloat(els.qComm.value) || 0));
    const comm = commPct / 100;

    let hedgeStake = 0;
    let liability = 0;
    let winBookie = 0;
    let winHedge = 0;
    let loseBookie = 0;
    let loseHedge = 0;
    let netIfWin = 0;
    let netIfLose = 0;

    if (state.mode === 'exchange') {
      // Exchange Back vs Lay Math
      const denom = Math.max(0.01, layOdds - comm);
      hedgeStake = (stake * backOdds) / denom;
      liability = hedgeStake * (layOdds - 1);

      winBookie = stake * (backOdds - 1);
      winHedge = -liability;
      netIfWin = winBookie + winHedge;

      loseBookie = -stake;
      loseHedge = hedgeStake * (1 - comm);
      netIfLose = loseBookie + loseHedge;
    } else {
      // 2-Bookmaker Opposite Outcome Math (Outcome A at backOdds vs Outcome B at layOdds)
      const effOdds2 = 1 + (layOdds - 1) * (1 - comm);
      hedgeStake = (stake * backOdds) / Math.max(1.001, effOdds2);
      liability = hedgeStake; // Cash staked at Bookmaker 2

      winBookie = stake * (backOdds - 1);
      winHedge = -hedgeStake;
      netIfWin = winBookie + winHedge;

      loseBookie = -stake;
      loseHedge = hedgeStake * (effOdds2 - 1);
      netIfLose = loseBookie + loseHedge;
    }

    const guaranteedNet = (netIfWin + netIfLose) / 2;
    const ratingPct = ((stake + guaranteedNet) / stake) * 100;

    return {
      stake,
      backOdds,
      layOdds,
      commPct,
      hedgeStake,
      liability,
      winBookie,
      winHedge,
      netIfWin,
      loseBookie,
      loseHedge,
      netIfLose,
      guaranteedNet,
      ratingPct
    };
  }

  // Calculate Bet 2 (Free Bet Hedge - SNR or SR)
  function calculateFreeBet() {
    const stake = Math.max(0.01, parseFloat(els.fStake.value) || 0);
    const backOdds = Math.max(1.01, parseFloat(els.fBackOdds.value) || 1.01);
    const layOdds = Math.max(1.01, parseFloat(els.fLayOdds.value) || 1.01);
    const commPct = Math.max(0, Math.min(50, parseFloat(els.fComm.value) || 0));
    const comm = commPct / 100;
    const betType = els.fType.value; // 'SNR' or 'SR'

    let hedgeStake = 0;
    let liability = 0;
    let winBookie = 0;
    let winHedge = 0;
    let loseBookie = 0;
    let loseHedge = 0;
    let netIfWin = 0;
    let netIfLose = 0;

    const effectiveBackReturn = betType === 'SNR' ? stake * (backOdds - 1) : stake * backOdds;

    if (state.mode === 'exchange') {
      // Exchange Lay Hedge for Free Bet
      const denom = Math.max(0.01, layOdds - comm);
      hedgeStake = effectiveBackReturn / denom;
      liability = hedgeStake * (layOdds - 1);

      winBookie = effectiveBackReturn;
      winHedge = -liability;
      netIfWin = winBookie + winHedge;

      loseBookie = 0; // Free Bet token lost costs £0 cash
      loseHedge = hedgeStake * (1 - comm);
      netIfLose = loseBookie + loseHedge;
    } else {
      // 2-Bookmaker Opposite Outcome Hedge for Free Bet
      const effOdds2 = 1 + (layOdds - 1) * (1 - comm);
      hedgeStake = effectiveBackReturn / Math.max(1.001, effOdds2);
      liability = hedgeStake;

      winBookie = effectiveBackReturn;
      winHedge = -hedgeStake;
      netIfWin = winBookie + winHedge;

      loseBookie = 0;
      loseHedge = hedgeStake * (effOdds2 - 1);
      netIfLose = loseBookie + loseHedge;
    }

    const guaranteedProfit = (netIfWin + netIfLose) / 2;
    const retentionPct = (guaranteedProfit / stake) * 100;

    return {
      stake,
      backOdds,
      layOdds,
      commPct,
      betType,
      hedgeStake,
      liability,
      winBookie,
      winHedge,
      netIfWin,
      loseBookie,
      loseHedge,
      netIfLose,
      guaranteedProfit,
      retentionPct
    };
  }

  // Render All UI Elements
  function updateAll() {
    const q = calculateQualifyingBet();
    const f = calculateFreeBet();

    // Update Mode Labels
    if (state.mode === 'exchange') {
      els.qBackLabel.textContent = '2. Bookmaker Back Odds';
      els.qLayLabel.textContent = '3. Exchange Lay Odds (Hedge)';
      els.qCommLabel.textContent = '4. Exchange Commission %';
      els.qActionTitle.textContent = 'PERFECT HEDGE LAY STAKE TO PLACE:';
      els.qLiabilityLabel.textContent = 'Exchange Liability Needed';
      els.qTableHedgeCol.textContent = 'Exchange Account';

      els.fBackLabel.textContent = '2. Free Bet Back Odds';
      els.fLayLabel.textContent = '3. Exchange Lay Odds (Hedge)';
      els.fCommLabel.textContent = '4. Exchange Commission %';
      els.fActionTitle.textContent = 'PERFECT FREE BET HEDGE LAY STAKE:';
      els.fLiabilityLabel.textContent = 'Exchange Liability Needed';
      els.fTableHedgeCol.textContent = 'Exchange Account';
      els.matrixHedgeColTitle.textContent = 'Typical Tight Lay Odds';
    } else {
      els.qBackLabel.textContent = '2. Bookie 1 Odds (Outcome A)';
      els.qLayLabel.textContent = '3. Bookie 2 Odds (Opposite B)';
      els.qCommLabel.textContent = '4. Bookie 2 Fee / Tax %';
      els.qActionTitle.textContent = 'BOOKIE 2 OPPOSITE HEDGE STAKE:';
      els.qLiabilityLabel.textContent = 'Bookie 2 Cash Outlay';
      els.qTableHedgeCol.textContent = 'Bookmaker 2 (Hedge)';

      els.fBackLabel.textContent = '2. Bookie 1 Free Bet Odds (A)';
      els.fLayLabel.textContent = '3. Bookie 2 Opposite Odds (B)';
      els.fCommLabel.textContent = '4. Bookie 2 Fee %';
      els.fActionTitle.textContent = 'BOOKIE 2 OPPOSITE HEDGE STAKE:';
      els.fLiabilityLabel.textContent = 'Bookie 2 Cash Outlay';
      els.fTableHedgeCol.textContent = 'Bookmaker 2 (Hedge)';
      els.matrixHedgeColTitle.textContent = 'Bookie 2 Opposite Odds';
    }

    // ---------- Update Bet 1 (Qualifying Bet) ----------
    els.qHedgeStake.textContent = fmtMoney(q.hedgeStake, false);
    els.qLiability.textContent = fmtMoney(q.liability, false);

    const qSmallText = fmtSmallUnit(q.guaranteedNet);
    if (q.guaranteedNet < 0) {
      els.qNetLoss.textContent = `${fmtMoney(q.guaranteedNet, true)} (${qSmallText} loss)`;
      els.qRatingBadge.textContent = `${q.ratingPct.toFixed(1)}% MATCH • -${qSmallText} LOSS`;
    } else {
      els.qNetLoss.textContent = `${fmtMoney(q.guaranteedNet, true)} (Arb Profit!)`;
      els.qRatingBadge.textContent = `${q.ratingPct.toFixed(1)}% MATCH • +${qSmallText} PROFIT`;
    }

    if (state.mode === 'exchange') {
      els.qInstructionLine.innerHTML =
        `Place <strong>${fmtMoney(q.stake)} Back</strong> at Bookmaker (odds <code>${q.backOdds.toFixed(2)}</code>) &amp; <strong>${fmtMoney(q.hedgeStake)} Lay</strong> at Exchange (odds <code>${q.layOdds.toFixed(2)}</code>).`;
    } else {
      els.qInstructionLine.innerHTML =
        `Place <strong>${fmtMoney(q.stake)}</strong> on Outcome A at Bookie 1 (odds <code>${q.backOdds.toFixed(2)}</code>) &amp; <strong>${fmtMoney(q.hedgeStake)}</strong> on Opposite Outcome B at Bookie 2 (odds <code>${q.layOdds.toFixed(2)}</code>).`;
    }

    // Bet 1 Proof Table
    els.qWinBookie.textContent = fmtMoney(q.winBookie, true);
    els.qWinExchange.textContent = fmtMoney(q.winHedge, true);
    els.qWinNet.textContent = fmtMoney(q.netIfWin, true);

    els.qLoseBookie.textContent = fmtMoney(q.loseBookie, true);
    els.qLoseExchange.textContent = fmtMoney(q.loseHedge, true);
    els.qLoseNet.textContent = fmtMoney(q.netIfLose, true);

    // Bet 1 Live Advisor
    const lossFraction = Math.abs(q.guaranteedNet) / q.stake;
    if (q.guaranteedNet >= 0) {
      els.qAdvisor.className = 'smart-advisor-bar advisor-electric';
      els.qAdvisorText.innerHTML =
        `<strong>Zero-Loss Qualifying Bet (${q.ratingPct.toFixed(1)}%):</strong> You actually make <strong>${fmtMoney(q.guaranteedNet, true)}</strong> while unlocking your Free Bet!`;
    } else if (lossFraction <= 0.035) {
      els.qAdvisor.className = 'smart-advisor-bar advisor-good';
      els.qAdvisorText.innerHTML =
        `<strong>Textbook ~20p Qualifier (${q.ratingPct.toFixed(1)}% match):</strong> You only lose <strong>${qSmallText} (${fmtMoney(q.guaranteedNet, true)})</strong> to unlock your Free Bet. That is an ultra-tight hedge.`;
    } else if (lossFraction <= 0.07) {
      els.qAdvisor.className = 'smart-advisor-bar advisor-warn';
      els.qAdvisorText.innerHTML =
        `<strong>Acceptable Qualifier (${q.ratingPct.toFixed(1)}% match):</strong> Losing <strong>${fmtMoney(q.guaranteedNet, true)}</strong> is okay, but look for Lay odds closer to <code>${(q.backOdds + 0.02).toFixed(2)}</code> at lower odds (<code>1.50–2.10</code>) to get your loss down to ~20p.`;
    } else {
      els.qAdvisor.className = 'smart-advisor-bar advisor-warn';
      els.qAdvisorText.innerHTML =
        `<strong>High Qualifying Loss Warning (${fmtMoney(q.guaranteedNet, true)}):</strong> Your Back &amp; Hedge odds are too far apart. Switch to a match with low, tight odds (e.g. Back <code>2.00</code> / Lay <code>2.02</code>) so you only lose ~20p!`;
    }

    // ---------- Update Bet 2 (Free Bet Hedge) ----------
    els.fHedgeStake.textContent = fmtMoney(f.hedgeStake, false);
    els.fLiability.textContent = fmtMoney(f.liability, false);
    els.fNetProfit.textContent = `${fmtMoney(f.guaranteedProfit, true)} (${f.retentionPct.toFixed(1)}%)`;
    els.fRatingBadge.textContent = `${f.retentionPct.toFixed(1)}% GUARANTEED PROFIT`;

    if (state.mode === 'exchange') {
      els.fInstructionLine.innerHTML =
        `Use <strong>${fmtMoney(f.stake)} Free Bet</strong> at Bookmaker (odds <code>${f.backOdds.toFixed(2)}</code>) &amp; place <strong>${fmtMoney(f.hedgeStake)} Lay</strong> at Exchange (odds <code>${f.layOdds.toFixed(2)}</code>).`;
    } else {
      els.fInstructionLine.innerHTML =
        `Use <strong>${fmtMoney(f.stake)} Free Bet</strong> on Outcome A at Bookie 1 (odds <code>${f.backOdds.toFixed(2)}</code>) &amp; stake <strong>${fmtMoney(f.hedgeStake)} Cash</strong> on Opposite Outcome B at Bookie 2 (odds <code>${f.layOdds.toFixed(2)}</code>).`;
    }

    // Bet 2 Proof Table
    els.fWinBookie.textContent = fmtMoney(f.winBookie, true);
    els.fWinExchange.textContent = fmtMoney(f.winHedge, true);
    els.fWinNet.textContent = fmtMoney(f.netIfWin, true);

    els.fLoseBookie.textContent = `${state.currency}0.00 (Free Token)`;
    els.fLoseExchange.textContent = fmtMoney(f.loseHedge, true);
    els.fLoseNet.textContent = fmtMoney(f.netIfLose, true);

    // Total Combined Net Profit
    const totalNetProfit = q.guaranteedNet + f.guaranteedProfit;
    const netRetentionAfterQual = (totalNetProfit / f.stake) * 100;

    // Bet 2 Live Advisor
    if (f.retentionPct >= 70) {
      els.fAdvisor.className = 'smart-advisor-bar advisor-electric';
      els.fAdvisorText.innerHTML =
        `<strong>70%+ Guaranteed Profit Target Hit (${f.retentionPct.toFixed(1)}%):</strong> You lock in <strong>${fmtMoney(f.guaranteedProfit, true)}</strong> from the Free Bet alone, and <strong>${fmtMoney(totalNetProfit, true)} net profit</strong> after deducting Bet 1!`;
    } else if (f.backOdds < 4.0 && state.mode === 'exchange') {
      els.fAdvisor.className = 'smart-advisor-bar advisor-warn';
      els.fAdvisorText.innerHTML =
        `<strong>Odds Too Low for 70% Target (Currently ${f.retentionPct.toFixed(1)}%):</strong> Because SNR Free Bets don't return the stake, low odds (${f.backOdds.toFixed(2)}) reduce profit. Look for higher Back odds between <code>4.50</code> and <code>6.50</code> (e.g. Back <code>5.00</code> / Lay <code>5.20</code>) to hit <strong>75%+ guaranteed profit</strong>!`;
    } else {
      els.fAdvisor.className = 'smart-advisor-bar advisor-warn';
      els.fAdvisorText.innerHTML =
        `<strong>Below 70% Target (Currently ${f.retentionPct.toFixed(1)}%):</strong> Your hedge odds are too wide relative to your Back odds. Look for tighter Lay odds (or higher Back odds around <code>5.00 / 5.20</code>) to cross <strong>70%+ guaranteed profit</strong>.`;
    }

    // ---------- Update Master Campaign Banner ----------
    els.masterQualResult.textContent = fmtMoney(q.guaranteedNet, true);
    els.masterQualSub.textContent =
      q.guaranteedNet < 0
        ? `Only ${fmtSmallUnit(q.guaranteedNet)} cost to unlock Free Bet (${q.ratingPct.toFixed(1)}% match)`
        : `Zero qualifying loss (${q.ratingPct.toFixed(1)}% match)`;

    els.masterFreeProfit.textContent = fmtMoney(f.guaranteedProfit, true);
    els.masterFreeSub.textContent = `${f.retentionPct.toFixed(1)}% guaranteed Free Bet extraction either way`;

    els.masterNetProfit.textContent = fmtMoney(totalNetProfit, true);
    els.masterNetSub.textContent = `${netRetentionAfterQual.toFixed(1)}% net profit of Free Bet after Bet 1 qualifier!`;

    els.masterRetentionPct.textContent = `${f.retentionPct.toFixed(1)}%`;
    const clampedWidth = Math.max(5, Math.min(100, f.retentionPct));
    els.masterProgressFill.style.width = `${clampedWidth}%`;

    if (f.retentionPct >= 70) {
      els.masterTargetBadge.textContent = '✔ 70%+ TARGET LOCKED';
      els.masterTargetBadge.className = 'gauge-badge';
    } else {
      els.masterTargetBadge.textContent = '▲ AIM FOR 4.50+ ODDS';
      els.masterTargetBadge.className = 'gauge-badge warn-tone';
    }

    const totalHedgeCapital = q.stake + q.liability + f.liability;
    els.masterCapitalNeeded.innerHTML =
      `Bet 1 Liability: <strong>${fmtMoney(q.liability)}</strong> &bull; Bet 2 Liability: <strong>${fmtMoney(f.liability)}</strong> (Total: <strong>${fmtMoney(totalHedgeCapital)}</strong>)`;

    // Update Simulator Table
    renderOddsSimulatorMatrix(f.stake, f.commPct, q.guaranteedNet);
  }

  // Render Live Odds vs Profit Simulator Table
  function renderOddsSimulatorMatrix(freeStake, commPct, qualNet) {
    els.simFreeStakeLabel.textContent = fmtMoney(freeStake, false);
    els.simCommLabel.textContent = `${commPct.toFixed(1)}%`;

    const comm = commPct / 100;
    const sampleTiers = state.mode === 'exchange'
      ? [
          { back: 2.00, lay: 2.04, note: 'Too Low (Avoid for Free Bet)' },
          { back: 3.00, lay: 3.10, note: 'Below 70% Target' },
          { back: 4.00, lay: 4.15, note: 'Borderline (~70%)' },
          { back: 4.50, lay: 4.65, note: '70%+ Sweet Spot', sweet: true },
          { back: 5.00, lay: 5.20, note: '75% Optimal Target', sweet: true },
          { back: 6.00, lay: 6.25, note: '78% High Extraction', sweet: true },
          { back: 7.50, lay: 7.85, note: '80%+ Max Profit (High Liab)', sweet: true }
        ]
      : [
          { back: 2.00, lay: 1.95, note: 'Too Low (Avoid for Free Bet)' },
          { back: 3.00, lay: 1.47, note: 'Below 70% Target' },
          { back: 4.00, lay: 1.32, note: '70%+ Sweet Spot', sweet: true },
          { back: 4.50, lay: 1.27, note: '74% Optimal Target', sweet: true },
          { back: 5.00, lay: 1.23, note: '76% High Extraction', sweet: true },
          { back: 6.00, lay: 1.18, note: '79% Max Profit', sweet: true }
        ];

    const rowsHtml = sampleTiers.map((tier) => {
      let hedgeStake = 0;
      let liability = 0;
      let profit = 0;

      if (state.mode === 'exchange') {
        const denom = Math.max(0.01, tier.lay - comm);
        hedgeStake = (freeStake * (tier.back - 1)) / denom;
        liability = hedgeStake * (tier.lay - 1);
        profit = hedgeStake * (1 - comm);
      } else {
        const effOdds2 = 1 + (tier.lay - 1) * (1 - comm);
        hedgeStake = (freeStake * (tier.back - 1)) / effOdds2;
        liability = hedgeStake;
        profit = hedgeStake * (effOdds2 - 1);
      }

      const retention = (profit / freeStake) * 100;
      const combinedNet = profit + qualNet;
      const badgeClass = retention >= 70 ? 'badge-sweet' : 'badge-low';

      return `
        <tr class="${tier.sweet ? 'matrix-row-sweetspot' : ''}">
          <td><strong>${tier.back.toFixed(2)}</strong></td>
          <td>${tier.lay.toFixed(2)}</td>
          <td>${fmtMoney(hedgeStake)}</td>
          <td>${fmtMoney(liability)}</td>
          <td class="pos-val"><strong>${fmtMoney(profit, true)}</strong></td>
          <td><strong>${retention.toFixed(1)}%</strong></td>
          <td class="pos-val">${fmtMoney(combinedNet, true)}</td>
          <td>
            <span class="matrix-badge ${badgeClass}">${tier.note}</span>
            <button type="button" class="btn-load-row" data-sim-back="${tier.back}" data-sim-lay="${tier.lay}">
              Load
            </button>
          </td>
        </tr>
      `;
    }).join('');

    els.oddsMatrixBody.innerHTML = rowsHtml;

    // Attach click listeners to "Load" buttons in matrix
    els.oddsMatrixBody.querySelectorAll('.btn-load-row').forEach((btn) => {
      btn.addEventListener('click', () => {
        els.fBackOdds.value = parseFloat(btn.dataset.simBack).toFixed(2);
        els.fLayOdds.value = parseFloat(btn.dataset.simLay).toFixed(2);
        updateAll();
      });
    });
  }

  // Odds Converter Utilities
  function decimalToFractional(dec) {
    if (dec <= 1.01) return '1/100';
    const val = dec - 1;
    const commonDenoms = [1, 2, 4, 5, 8, 10, 20, 25, 50, 100];
    for (const d of commonDenoms) {
      const n = val * d;
      if (Math.abs(n - Math.round(n)) < 0.015) {
        return `${Math.round(n)}/${d}`;
      }
    }
    return `${Math.round(val * 100)}/100`;
  }

  function decimalToAmerican(dec) {
    if (dec >= 2.0) {
      return `+${Math.round((dec - 1) * 100)}`;
    }
    return `${Math.round(-100 / Math.max(0.01, dec - 1))}`;
  }

  function setupOddsConverter() {
    els.convFrac.addEventListener('input', () => {
      const parts = els.convFrac.value.trim().split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const den = parseFloat(parts[1]);
        if (num > 0 && den > 0) {
          const dec = 1 + num / den;
          els.convDec.value = dec.toFixed(2);
          els.convAmer.value = decimalToAmerican(dec);
        }
      }
    });

    els.convDec.addEventListener('input', () => {
      const dec = parseFloat(els.convDec.value);
      if (dec > 1.0) {
        els.convFrac.value = decimalToFractional(dec);
        els.convAmer.value = decimalToAmerican(dec);
      }
    });

    els.convAmer.addEventListener('input', () => {
      const raw = parseFloat(els.convAmer.value.replace('+', ''));
      if (!isNaN(raw) && raw !== 0) {
        const dec = raw > 0 ? 1 + raw / 100 : 1 + 100 / Math.abs(raw);
        if (dec > 1.0) {
          els.convDec.value = dec.toFixed(2);
          els.convFrac.value = decimalToFractional(dec);
        }
      }
    });

    els.applyConvBet2.addEventListener('click', () => {
      const dec = parseFloat(els.convDec.value);
      if (dec > 1.05) {
        els.fBackOdds.value = dec.toFixed(2);
        if (state.mode === 'exchange') {
          els.fLayOdds.value = (dec + 0.2).toFixed(2);
        } else {
          // Implied opposite outcome odds with ~3% bookie margin
          const p1 = 1 / dec;
          const p2 = Math.max(0.1, 1.03 - p1);
          els.fLayOdds.value = (1 / p2).toFixed(2);
        }
        updateAll();
      }
    });
  }

  // Presets Configuration
  const PRESETS = {
    bet10get10: {
      qStake: 10.00, qBack: 2.00, qLay: 2.02, qComm: 1.0,
      fStake: 10.00, fBack: 5.00, fLay: 5.20, fComm: 2.0
    },
    bet10get30: {
      qStake: 10.00, qBack: 2.00, qLay: 2.02, qComm: 1.0,
      fStake: 30.00, fBack: 5.00, fLay: 5.20, fComm: 2.0
    },
    bet20get20: {
      qStake: 20.00, qBack: 1.90, qLay: 1.92, qComm: 1.0,
      fStake: 20.00, fBack: 5.00, fLay: 5.20, fComm: 2.0
    },
    high78: {
      qStake: 10.00, qBack: 1.80, qLay: 1.82, qComm: 0.0,
      fStake: 10.00, fBack: 6.00, fLay: 6.20, fComm: 2.0
    }
  };

  function applyPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;

    state.mode = 'exchange';
    els.modeExchangeBtn.classList.add('active');
    els.modeDutchBtn.classList.remove('active');

    els.qStake.value = p.qStake.toFixed(2);
    els.qBackOdds.value = p.qBack.toFixed(2);
    els.qLayOdds.value = p.qLay.toFixed(2);
    els.qComm.value = p.qComm.toFixed(1);

    els.fStake.value = p.fStake.toFixed(2);
    els.fBackOdds.value = p.fBack.toFixed(2);
    els.fLayOdds.value = p.fLay.toFixed(2);
    els.fComm.value = p.fComm.toFixed(1);
    els.fType.value = 'SNR';

    updateAll();
  }

  // Initialize Event Listeners
  function init() {
    // Live calculation inputs
    [
      els.qStake, els.qBackOdds, els.qLayOdds, els.qComm,
      els.fStake, els.fBackOdds, els.fLayOdds, els.fComm, els.fType
    ].forEach((input) => {
      input.addEventListener('input', updateAll);
      input.addEventListener('change', updateAll);
    });

    // Mode Switcher (Exchange vs 2-Bookmaker Dutching)
    els.modeExchangeBtn.addEventListener('click', () => {
      if (state.mode === 'exchange') return;
      state.mode = 'exchange';
      els.modeExchangeBtn.classList.add('active');
      els.modeDutchBtn.classList.remove('active');

      // Set typical Exchange Lay defaults
      els.qBackOdds.value = '2.00';
      els.qLayOdds.value = '2.02';
      els.qComm.value = '1.0';
      els.fBackOdds.value = '5.00';
      els.fLayOdds.value = '5.20';
      els.fComm.value = '2.0';
      updateAll();
    });

    els.modeDutchBtn.addEventListener('click', () => {
      if (state.mode === 'dutch') return;
      state.mode = 'dutch';
      els.modeDutchBtn.classList.add('active');
      els.modeExchangeBtn.classList.remove('active');

      // Set typical 2-Bookmaker Opposite Outcome defaults (e.g. 1.98 vs 1.98 for Bet 1, and 4.50 vs 1.27 for Bet 2)
      els.qBackOdds.value = '1.98';
      els.qLayOdds.value = '1.98';
      els.qComm.value = '0.0';
      els.fBackOdds.value = '4.50';
      els.fLayOdds.value = '1.27';
      els.fComm.value = '0.0';
      updateAll();
    });

    // Currency Switcher
    els.currBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        els.currBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.currency = btn.dataset.currency;
        els.currPrefixes.forEach((prefix) => {
          prefix.textContent = state.currency;
        });
        updateAll();
      });
    });

    // Preset Chips
    els.presetChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        els.presetChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        applyPreset(chip.dataset.preset);
      });
    });

    // Quick Odds Nudge Buttons for Bet 1
    document.querySelectorAll('.nudge-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mode = 'exchange';
        els.modeExchangeBtn.classList.add('active');
        els.modeDutchBtn.classList.remove('active');
        els.qBackOdds.value = parseFloat(btn.dataset.qBack).toFixed(2);
        els.qLayOdds.value = parseFloat(btn.dataset.qLay).toFixed(2);
        els.qComm.value = parseFloat(btn.dataset.qComm).toFixed(1);
        updateAll();
      });
    });

    // Quick Odds Nudge Buttons for Bet 2
    document.querySelectorAll('.nudge-btn-free').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.mode = 'exchange';
        els.modeExchangeBtn.classList.add('active');
        els.modeDutchBtn.classList.remove('active');
        els.fBackOdds.value = parseFloat(btn.dataset.fBack).toFixed(2);
        els.fLayOdds.value = parseFloat(btn.dataset.fLay).toFixed(2);
        updateAll();
      });
    });

    // Copy Hedge Stake Buttons
    document.querySelectorAll('.btn-copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.copyTarget;
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;
        const numericOnly = targetEl.textContent.replace(/[^0-9.]/g, '');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(numericOnly);
        }
        const origText = btn.textContent;
        btn.textContent = `Copied ${numericOnly}!`;
        setTimeout(() => {
          btn.textContent = origText;
        }, 1400);
      });
    });

    setupOddsConverter();
    updateAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
