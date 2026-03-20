// ============================================================
//  app.js — Motor de cálculo y renderizado del portfolio
// ============================================================

// ─── CÁLCULOS CORE ──────────────────────────────────────────

function calcPosition(pos) {
  const trades = pos.trades || [];
  if (trades.length === 0) return null;

  let totalShares = 0;
  let totalCost = 0;
  let earliestDate = null;

  trades.forEach(t => {
    totalShares += t.shares;
    totalCost += t.shares * t.price;
    const d = new Date(t.date);
    if (!earliestDate || d < earliestDate) earliestDate = d;
  });

  const avgCost = totalCost / totalShares;
  const currentPriceEUR = pos.currency === 'EUR'
    ? pos.currentPrice
    : pos.currentPrice * pos.fxRate;
  const avgCostEUR = pos.currency === 'EUR'
    ? avgCost
    : avgCost * pos.fxRate;

  const marketValue  = totalShares * currentPriceEUR;
  const costBasisEUR = totalShares * avgCostEUR;
  const pnlAbs = marketValue - costBasisEUR;
  const pnlPct = costBasisEUR > 0 ? (pnlAbs / costBasisEUR) * 100 : 0;

  const holdingDays = Math.floor((new Date() - earliestDate) / (1000 * 60 * 60 * 24));
  const years = holdingDays / 365;
  const cagr = years > 0.01 ? (Math.pow(marketValue / costBasisEUR, 1 / years) - 1) * 100 : 0;

  return {
    ticker: pos.ticker,
    name: pos.name,
    sector: pos.sector,
    currency: pos.currency,
    fxRate: pos.fxRate,
    totalShares,
    avgCost,
    avgCostEUR,
    currentPrice: pos.currentPrice,
    currentPriceEUR,
    costBasisEUR,
    marketValue,
    pnlAbs,
    pnlPct,
    holdingDays,
    cagr,
    lastUpdated: pos.lastUpdated,
    notes: pos.notes,
    trades,
  };
}

function calcPortfolio(data) {
  const positions = data.positions.map(calcPosition).filter(Boolean);

  const cashEUR = data.cash?.amount || 0;
  const totalMarketValue = positions.reduce((s, p) => s + p.marketValue, 0) + cashEUR;
  const totalCost = positions.reduce((s, p) => s + p.costBasisEUR, 0);
  const totalPnlAbs = positions.reduce((s, p) => s + p.pnlAbs, 0);
  const totalPnlPct = totalCost > 0 ? (totalPnlAbs / totalCost) * 100 : 0;
  const cashWeight = totalMarketValue > 0 ? (cashEUR / totalMarketValue) * 100 : 0;

  positions.forEach(p => {
    p.weight = totalMarketValue > 0 ? (p.marketValue / totalMarketValue) * 100 : 0;
  });

  const returns = positions.map(x => x.pnlPct);
  const avgRet = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const variance = returns.reduce((s, r) => s + Math.pow(r - avgRet, 2), 0) / (returns.length || 1);
  const portfolioVolatility = Math.sqrt(variance);

  const sorted = [...positions].sort((a, b) => b.pnlPct - a.pnlPct);
  const topWinner = sorted[0] || null;
  const topLoser  = sorted[sorted.length - 1] || null;

  return {
    positions,
    totalMarketValue,
    totalCost,
    totalPnlAbs,
    totalPnlPct,
    cashWeight,
    cashAmount: cashEUR,
    portfolioVolatility,
    topWinner,
    topLoser,
  };
}

// ─── FORMATTERS ─────────────────────────────────────────────

const fmt = {
  eur:    v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v),
  pct:    v => (v >= 0 ? '+' : '') + v.toFixed(2) + '%',
  num:    v => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v),
  shares: v => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(v),
};

const colorStyle = v => v >= 0 ? 'var(--green)' : 'var(--red)';

// ─── RENDER PRINCIPAL ────────────────────────────────────────

function render() {
  const data = PORTFOLIO_DATA;
  const p = calcPortfolio(data);

  document.getElementById('portfolio-name').textContent = data.portfolioName;
  document.getElementById('last-updated').textContent =
    'Datos a: 19 mar 2026  ·  Generado: ' + new Date().toLocaleDateString('es-ES');

  renderKPIs(data, p);
  renderAccountSummary(data);
  renderTable(p);
  renderWeightChart(p);
  renderPnlChart(p);
  renderHistoricalChart(data);
  renderAllTimeGP(data);
  renderRisk(p, data);
}

// ─── KPIs ────────────────────────────────────────────────────

function renderKPIs(data, p) {
  const twrVsBenchmark = data.portfolioTotalReturn - data.benchmarkReturn;

  setKPI('kpi-value',      fmt.eur(p.totalMarketValue), null, null);
  setKPI('kpi-pnl-abs',   fmt.eur(data.accountSummary.totalPnL), null, colorStyle(data.accountSummary.totalPnL));
  setKPI('kpi-pnl-pct',
    fmt.pct(data.portfolioTotalReturn),
    `vs Nasdaq: ${fmt.pct(data.benchmarkReturn)}`,
    colorStyle(data.portfolioTotalReturn));
  setKPI('kpi-cash',      fmt.eur(p.cashAmount), p.cashWeight.toFixed(1) + '% del portfolio', null);
  setKPI('kpi-alpha',
    fmt.pct(twrVsBenchmark),
    'Alpha vs US Tech 100 (4 años)',
    colorStyle(twrVsBenchmark));
  setKPI('kpi-positions', p.positions.length + ' activas', null, null);
}

function setKPI(id, val, sub, color) {
  const el = document.getElementById(id);
  if (!el) return;
  const v = el.querySelector('.kpi-value');
  const s = el.querySelector('.kpi-sub');
  if (v) { v.textContent = val; if (color) v.style.color = color; }
  if (s && sub) s.textContent = sub;
}

// ─── RESUMEN CUENTA ──────────────────────────────────────────

function renderAccountSummary(data) {
  const s = data.accountSummary;
  const el = document.getElementById('account-summary');
  if (!el) return;

  el.innerHTML = `
    <div class="summary-item">
      <span class="summary-label">Depósitos netos (4 años)</span>
      <span class="summary-val">${fmt.eur(s.depositsNet)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">G/P totales</span>
      <span class="summary-val" style="color:${colorStyle(s.totalPnL)}">${fmt.eur(s.totalPnL)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Costes totales (comisiones + FX)</span>
      <span class="summary-val" style="color:var(--red)">${fmt.eur(s.totalCosts)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Valor actual de la cuenta</span>
      <span class="summary-val">${fmt.eur(s.endValue)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Rendimiento total (TWR)</span>
      <span class="summary-val" style="color:${colorStyle(s.twrReturn)}">${fmt.pct(s.twrReturn)}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">Nasdaq 100 mismo período</span>
      <span class="summary-val" style="color:var(--text2)">${fmt.pct(data.benchmarkReturn)}</span>
    </div>
  `;
}

// ─── TABLA DE POSICIONES ─────────────────────────────────────

function renderTable(p) {
  const tbody = document.getElementById('positions-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const sorted = [...p.positions].sort((a, b) => b.marketValue - a.marketValue);

  sorted.forEach(pos => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <span class="ticker">${pos.ticker}</span>
        <span class="name-small">${pos.name}</span>
      </td>
      <td class="right">${fmt.shares(pos.totalShares)}</td>
      <td class="right">${fmt.num(pos.avgCost)} ${pos.currency}</td>
      <td class="right">${fmt.num(pos.currentPrice)} ${pos.currency}</td>
      <td class="right">${fmt.eur(pos.marketValue)}</td>
      <td class="right" style="color:${colorStyle(pos.pnlAbs)}">${fmt.eur(pos.pnlAbs)}</td>
      <td class="right" style="color:${colorStyle(pos.pnlPct)}">${fmt.pct(pos.pnlPct)}</td>
      <td class="right" style="color:${colorStyle(pos.cagr)}">${fmt.pct(pos.cagr)}</td>
      <td class="right">${pos.weight.toFixed(1)}%</td>
      <td class="right">${pos.holdingDays}d</td>
    `;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => showDetail(pos, p));
    tbody.appendChild(row);
  });

  // Fila total
  const totalRow = document.createElement('tr');
  totalRow.className = 'total-row';
  totalRow.innerHTML = `
    <td><strong>TOTAL</strong></td>
    <td></td><td></td><td></td>
    <td class="right"><strong>${fmt.eur(p.totalMarketValue)}</strong></td>
    <td class="right" style="color:${colorStyle(p.totalPnlAbs)}"><strong>${fmt.eur(p.totalPnlAbs)}</strong></td>
    <td class="right" style="color:${colorStyle(p.totalPnlPct)}"><strong>${fmt.pct(p.totalPnlPct)}</strong></td>
    <td></td>
    <td class="right"><strong>${(100 - p.cashWeight).toFixed(1)}%</strong></td>
    <td></td>
  `;
  tbody.appendChild(totalRow);
}

// ─── CHART: DISTRIBUCIÓN ─────────────────────────────────────

function renderWeightChart(p) {
  const canvas = document.getElementById('weight-chart');
  if (!canvas) return;
  if (window._weightChart) window._weightChart.destroy();

  const labels = p.positions.map(x => x.ticker);
  const values = p.positions.map(x => x.weight);
  if (p.cashWeight > 0) { labels.push('CASH'); values.push(p.cashWeight); }

  const palette = ['#4FC3F7','#81C784','#FFB74D','#E57373','#CE93D8',
    '#80DEEA','#A5D6A7','#FFE082','#EF9A9A','#F48FB1','#B0BEC5'];

  window._weightChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: palette.slice(0, labels.length),
        borderColor: 'rgba(0,0,0,0)', borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: {
        legend: { position: 'right', labels: { color: '#aaa', font: { size: 11 }, padding: 10, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%` } }
      }
    }
  });
}

// ─── CHART: P&L POR POSICIÓN ─────────────────────────────────

function renderPnlChart(p) {
  const canvas = document.getElementById('pnl-chart');
  if (!canvas) return;
  if (window._pnlChart) window._pnlChart.destroy();

  const sorted = [...p.positions].sort((a, b) => b.pnlPct - a.pnlPct);

  window._pnlChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: sorted.map(x => x.ticker),
      datasets: [{
        label: 'P&L %',
        data: sorted.map(x => x.pnlPct),
        backgroundColor: sorted.map(x => x.pnlPct >= 0 ? 'rgba(129,199,132,0.85)' : 'rgba(229,115,115,0.85)'),
        borderRadius: 4, borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(2)}%` } }
      },
      scales: {
        x: { ticks: { color: '#888', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          ticks: { color: '#888', font: { size: 10 }, callback: v => (v >= 0 ? '+' : '') + v.toFixed(0) + '%' },
          grid: { color: 'rgba(255,255,255,0.06)' }, border: { dash: [4,4] }
        }
      }
    }
  });
}

// ─── CHART: RENDIMIENTO SEMESTRAL VS BENCHMARK ───────────────

function renderHistoricalChart(data) {
  const canvas = document.getElementById('historical-chart');
  if (!canvas) return;
  if (window._histChart) window._histChart.destroy();

  const h = data.historicalReturns;

  window._histChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: h.map(x => x.period),
      datasets: [
        {
          label: 'Mi Portfolio',
          data: h.map(x => x.portfolio),
          backgroundColor: h.map(x => x.portfolio >= 0 ? 'rgba(91,106,240,0.75)' : 'rgba(229,115,115,0.65)'),
          borderRadius: 4, borderSkipped: false,
        },
        {
          label: 'US Tech 100',
          data: h.map(x => x.benchmark),
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderColor: 'rgba(255,255,255,0.25)',
          borderWidth: 1,
          borderRadius: 4, borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#aaa', font: { size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toFixed(1)}%` } }
      },
      scales: {
        x: { ticks: { color: '#888', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          ticks: { color: '#888', font: { size: 10 }, callback: v => (v >= 0 ? '+' : '') + v + '%' },
          grid: { color: 'rgba(255,255,255,0.06)' }, border: { dash: [4,4] }
        }
      }
    }
  });
}

// ─── ALL TIME G/P (posiciones cerradas + abiertas) ───────────

function renderAllTimeGP(data) {
  const el = document.getElementById('alltime-chart');
  if (!el) return;
  if (window._alltimeChart) window._alltimeChart.destroy();

  const sorted = [...data.allTimeGP].sort((a, b) => b.gp - a.gp);
  const top20 = sorted.slice(0, 10);
  const bottom20 = sorted.slice(-10).reverse();
  const display = [...top20, ...bottom20];

  window._alltimeChart = new Chart(el, {
    type: 'bar',
    data: {
      labels: display.map(x => x.name.length > 18 ? x.name.slice(0,18) + '…' : x.name),
      datasets: [{
        label: 'G/P EUR',
        data: display.map(x => x.gp),
        backgroundColor: display.map(x => x.gp >= 0 ? 'rgba(76,175,125,0.80)' : 'rgba(224,92,92,0.70)'),
        borderRadius: 4, borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: ctx => {
            const gp = ctx.parsed.x;
            return ` ${gp >= 0 ? '+' : ''}${gp.toLocaleString('es-ES', {minimumFractionDigits:0})} EUR`;
          }
        }}
      },
      scales: {
        x: {
          ticks: { color: '#888', font: { size: 10 }, callback: v => (v >= 0 ? '+' : '') + (v/1000).toFixed(0) + 'k' },
          grid: { color: 'rgba(255,255,255,0.06)' }, border: { dash: [4,4] }
        },
        y: { ticks: { color: '#aaa', font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

// ─── PANEL DE RIESGO ─────────────────────────────────────────

function renderRisk(p, data) {
  const el = document.getElementById('risk-section');
  if (!el) return;

  const top3Conc = topNConcentration(p, 3);
  const twrVsBenchmark = data.portfolioTotalReturn - data.benchmarkReturn;

  el.innerHTML = `
    <div class="risk-card">
      <div class="risk-label">Mejor posición actual</div>
      <div class="risk-ticker" style="color:var(--green)">${p.topWinner ? p.topWinner.ticker : '—'}</div>
      <div class="risk-val" style="color:var(--green)">${p.topWinner ? fmt.pct(p.topWinner.pnlPct) : '—'}</div>
    </div>
    <div class="risk-card">
      <div class="risk-label">Peor posición actual</div>
      <div class="risk-ticker" style="color:var(--red)">${p.topLoser ? p.topLoser.ticker : '—'}</div>
      <div class="risk-val" style="color:var(--red)">${p.topLoser ? fmt.pct(p.topLoser.pnlPct) : '—'}</div>
    </div>
    <div class="risk-card">
      <div class="risk-label">Dispersión entre posiciones</div>
      <div class="risk-ticker">±${p.portfolioVolatility.toFixed(1)}%</div>
      <div class="risk-val" style="color:#aaa">Rango P&L</div>
    </div>
    <div class="risk-card">
      <div class="risk-label">Concentración top 3</div>
      <div class="risk-ticker">${top3Conc.toFixed(1)}%</div>
      <div class="risk-val" style="color:#aaa">De la cartera</div>
    </div>
    <div class="risk-card">
      <div class="risk-label">Alpha vs Nasdaq (4 años)</div>
      <div class="risk-ticker" style="color:${colorStyle(twrVsBenchmark)}">${fmt.pct(twrVsBenchmark)}</div>
      <div class="risk-val" style="color:#aaa">TWR portfolio vs índice</div>
    </div>
    <div class="risk-card">
      <div class="risk-label">Coste total (4 años)</div>
      <div class="risk-ticker" style="color:var(--red)">${fmt.eur(data.accountSummary.totalCosts)}</div>
      <div class="risk-val" style="color:#aaa">Comisiones + FX</div>
    </div>
  `;
}

function topNConcentration(p, n) {
  return [...p.positions].sort((a, b) => b.weight - a.weight).slice(0, n).reduce((s, x) => s + x.weight, 0);
}

// ─── MODAL DETALLE ───────────────────────────────────────────

function showDetail(pos, p) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <div class="modal-header">
      <div>
        <div class="modal-ticker">${pos.ticker}</div>
        <div class="modal-name">${pos.name} · ${pos.sector}</div>
      </div>
      <button onclick="closeModal()" class="modal-close">✕</button>
    </div>
    <div class="modal-grid">
      <div class="modal-kpi"><div class="kpi-label">Valor mercado</div><div class="kpi-val">${fmt.eur(pos.marketValue)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Coste total</div><div class="kpi-val">${fmt.eur(pos.costBasisEUR)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">P&L €</div><div class="kpi-val" style="color:${colorStyle(pos.pnlAbs)}">${fmt.eur(pos.pnlAbs)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">P&L %</div><div class="kpi-val" style="color:${colorStyle(pos.pnlPct)}">${fmt.pct(pos.pnlPct)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">CAGR est.</div><div class="kpi-val" style="color:${colorStyle(pos.cagr)}">${fmt.pct(pos.cagr)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Peso cartera</div><div class="kpi-val">${pos.weight.toFixed(2)}%</div></div>
      <div class="modal-kpi"><div class="kpi-label">Acciones</div><div class="kpi-val">${fmt.shares(pos.totalShares)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Precio medio</div><div class="kpi-val">${fmt.num(pos.avgCost)} ${pos.currency}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Precio actual</div><div class="kpi-val">${fmt.num(pos.currentPrice)} ${pos.currency}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Holding</div><div class="kpi-val">${pos.holdingDays} días</div></div>
    </div>
    <div class="modal-trades-title">Compras registradas</div>
    <table class="trades-table">
      <thead><tr><th>Fecha</th><th>Acciones</th><th>Precio</th><th>Importe €</th></tr></thead>
      <tbody>
        ${pos.trades.map(t => `
          <tr>
            <td>${t.date}</td>
            <td>${fmt.shares(t.shares)}</td>
            <td>${fmt.num(t.price)} ${pos.currency}</td>
            <td>${fmt.eur(t.shares * t.price * pos.fxRate)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    ${pos.notes ? `<div class="modal-notes">📝 ${pos.notes}</div>` : ''}
  `;

  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('DOMContentLoaded', render);
