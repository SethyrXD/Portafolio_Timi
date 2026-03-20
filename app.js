// ═══════════════════════════════════════════════
//  TIMI PORTFOLIO — app.js
// ═══════════════════════════════════════════════

const FX = 0.85857; // USD→EUR

// ── FORMATTERS ──────────────────────────────────
const eur = v => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:0}).format(v);
const pct = v => (v>=0?'+':'')+v.toFixed(1)+'%';
const pct2 = v => (v>=0?'+':'')+v.toFixed(2)+'%';
const num = v => new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
const colorClass = v => v>=0?'pos':'neg';
const colorStyle = v => v>=0?'var(--green)':'var(--red)';

// ── CALC POSITIONS ───────────────────────────────
function calcPositions(positions, fxOverride) {
  const fx = fxOverride || FX;
  return positions.map(p => {
    const priceEUR = p.currency === 'EUR' ? p.price : p.price * fx;
    const avgEUR   = p.currency === 'EUR' ? p.avgCost : p.avgCost * fx;
    const mktVal   = p.shares * priceEUR;
    const cost     = p.shares * avgEUR;
    const pnlAbs   = mktVal - cost;
    const pnlPct   = cost > 0 ? (pnlAbs/cost)*100 : 0;
    return { ...p, priceEUR, avgEUR, mktVal, cost, pnlAbs, pnlPct };
  });
}

function calcTotals(calced, cashEUR) {
  const totalMkt  = calced.reduce((s,p)=>s+p.mktVal,0) + cashEUR;
  const totalCost = calced.reduce((s,p)=>s+p.cost,0);
  const totalPnl  = calced.reduce((s,p)=>s+p.pnlAbs,0);
  const totalPct  = totalCost>0?(totalPnl/totalCost)*100:0;
  calced.forEach(p => p.weight = totalMkt>0?(p.mktVal/totalMkt)*100:0);
  return { totalMkt, totalCost, totalPnl, totalPct, cashPct: (cashEUR/totalMkt)*100 };
}

// ── INIT ─────────────────────────────────────────
function initDashboard() {
  const d = TIMI_DATA;
  const calced = calcPositions(d.positions);
  const totals  = calcTotals(calced, d.cash.amount);

  document.getElementById('updated-at').textContent = 'Actualizado ' + d.updatedAt;

  renderRentabilidad(d, totals);
  renderCartera(d, calced, totals);
}

// ══════════════════════════════════════════════
//  TAB: RENTABILIDAD
// ══════════════════════════════════════════════
function renderRentabilidad(d, totals) {
  // TWR KPI
  const twrEl = document.getElementById('r-twr');
  const twr = d.accountSummary.twrReturn;
  twrEl.textContent = pct(twr);
  twrEl.style.color = colorStyle(twr);

  // Historical chart
  renderHistChart(d.historicalReturns);

  // Perf table
  renderPerfTable(d.historicalReturns);

  // Summary strip
  renderSummary(d.accountSummary);
}

function renderHistChart(hist) {
  const canvas = document.getElementById('hist-chart');
  if (!canvas) return;
  if (window._histChart) window._histChart.destroy();

  window._histChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: hist.map(h => h.period),
      datasets: [
        {
          label: 'Timi',
          data: hist.map(h => h.portfolio),
          backgroundColor: hist.map(h => h.portfolio>=0 ? 'rgba(91,114,240,0.85)' : 'rgba(255,92,92,0.7)'),
          borderRadius: 3, borderSkipped: false,
        },
        {
          label: 'Nasdaq-100',
          data: hist.map(h => h.benchmark),
          backgroundColor: 'rgba(255,255,255,0.10)',
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          borderRadius: 3, borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 10 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y>=0?'+':''}${ctx.parsed.y.toFixed(1)}%` } }
      },
      scales: {
        x: { ticks: { color: '#666', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          ticks: { color: '#666', font: { size: 10 }, callback: v => (v>=0?'+':'')+v+'%' },
          grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4,4] }
        }
      }
    }
  });
}

function renderPerfTable(hist) {
  const tbody = document.getElementById('perf-tbody');
  if (!tbody) return;
  tbody.innerHTML = hist.map(h => {
    const alpha = h.portfolio - h.benchmark;
    return `<tr>
      <td>${h.period}</td>
      <td class="right ${colorClass(h.portfolio)}">${pct(h.portfolio)}</td>
      <td class="right" style="color:var(--text2)">${pct(h.benchmark)}</td>
      <td class="right ${colorClass(alpha)}">${pct(alpha)}</td>
    </tr>`;
  }).join('');
}

function renderSummary(s) {
  const el = document.getElementById('summary-strip');
  if (!el) return;
  el.innerHTML = `
    <div class="sum-item"><div class="sum-label">Depósitos netos</div><div class="sum-val">${eur(s.depositsNet)}</div></div>
    <div class="sum-item"><div class="sum-label">G/P totales (4 años)</div><div class="sum-val" style="color:${colorStyle(s.totalPnL)}">${eur(s.totalPnL)}</div></div>
    <div class="sum-item"><div class="sum-label">Costes totales</div><div class="sum-val" style="color:var(--red)">${eur(s.totalCosts)}</div></div>
    <div class="sum-item"><div class="sum-label">Valor actual</div><div class="sum-val">${eur(s.endValue)}</div></div>
    <div class="sum-item"><div class="sum-label">Rendimiento TWR</div><div class="sum-val" style="color:${colorStyle(s.twrReturn)}">${pct(s.twrReturn)}</div></div>
    <div class="sum-item"><div class="sum-label">Nasdaq mismo período</div><div class="sum-val" style="color:var(--text2)">${pct(s.benchmarkReturn)}</div></div>
  `;
}

// ══════════════════════════════════════════════
//  TAB: CARTERA
// ══════════════════════════════════════════════
function renderCartera(d, calced, totals) {
  // KPIs
  document.getElementById('c-total').textContent = eur(totals.totalMkt);
  const pnlEl = document.getElementById('c-pnl');
  pnlEl.textContent = eur(totals.totalPnl);
  pnlEl.style.color = colorStyle(totals.totalPnl);
  document.getElementById('c-cash').textContent = eur(d.cash.amount);
  document.getElementById('c-cash-pct').textContent = totals.cashPct.toFixed(1)+'% del portfolio';

  // Donut
  renderDonut(calced, totals.cashPct, d.cash.amount);

  // Geo
  renderGeo(calced, d);

  // Table
  renderPosTable(calced);
}

function renderDonut(calced, cashPct, cashAmount) {
  const canvas = document.getElementById('donut-chart');
  if (!canvas) return;
  if (window._donutChart) window._donutChart.destroy();

  const labels = [...calced.map(p=>p.ticker), 'CASH'];
  const values = [...calced.map(p=>p.weight), cashPct];
  const colors = [...calced.map(p=>p.color), '#555a72'];

  window._donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderColor:'rgba(0,0,0,0)', borderWidth:0, hoverOffset:8 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'65%',
      plugins: {
        legend: { display:false },
        tooltip: { callbacks: { label: ctx=>`  ${ctx.label}: ${ctx.parsed.toFixed(1)}%` } }
      },
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          if (idx < calced.length) showDetail(calced[idx]);
        }
      }
    }
  });

  // Custom legend inside card
  // labels rendered in donut area via Chart.js datalabels would need plugin
  // Use simple outside legend
}

function renderGeo(calced, d) {
  const canvas = document.getElementById('geo-chart');
  if (!canvas) return;
  if (window._geoChart) window._geoChart.destroy();

  const geoMap = {};
  calced.forEach(p => {
    geoMap[p.geo] = (geoMap[p.geo]||0) + p.weight;
  });

  const labels = Object.keys(geoMap);
  const values = Object.values(geoMap);
  const colors = labels.map(g => d.geoColors[g] || '#888');

  window._geoChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderColor:'rgba(0,0,0,0)', borderWidth:0, hoverOffset:6 }]
    },
    options: {
      responsive:true, maintainAspectRatio:false, cutout:'60%',
      plugins: {
        legend: { display:false },
        tooltip: { callbacks: { label: ctx=>`  ${ctx.label}: ${ctx.parsed.toFixed(1)}%` } }
      }
    }
  });

  // Legend
  const legendEl = document.getElementById('geo-legend');
  if (legendEl) {
    legendEl.innerHTML = labels.map((l,i) => `
      <div class="geo-item">
        <div class="geo-dot" style="background:${colors[i]}"></div>
        <span>${l} ${values[i].toFixed(1)}%</span>
      </div>`).join('');
  }
}

function renderPosTable(calced) {
  const tbody = document.getElementById('pos-tbody');
  if (!tbody) return;
  const sorted = [...calced].sort((a,b) => b.mktVal - a.mktVal);
  tbody.innerHTML = sorted.map(p => `
    <tr onclick="showDetail(TIMI_DATA.positions.find(x=>x.ticker==='${p.ticker}') && calcPositions([TIMI_DATA.positions.find(x=>x.ticker==='${p.ticker}')])[0])">
      <td>
        <span class="ticker-name">${p.name}</span>
        <span class="ticker-sym">${p.ticker}</span>
      </td>
      <td><span class="geo-tag">${p.geo}</span></td>
      <td style="color:var(--text2)">${p.currency}</td>
      <td class="right">${num(p.price)}</td>
      <td class="right ${colorClass(p.pnlPct)}">${pct2(p.pnlPct)}</td>
      <td class="right">${p.weight.toFixed(1)}%</td>
      <td class="right ${colorClass(p.pnlAbs)}">${eur(p.pnlAbs)}</td>
    </tr>`).join('');
}

// ── MODAL ─────────────────────────────────────
function showDetail(p) {
  if (!p) return;
  const modal = document.getElementById('modal');
  const box   = document.getElementById('modal-box');

  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
      <div>
        <div class="modal-ticker">${p.ticker}</div>
        <div class="modal-name">${p.name} · ${p.geo} · ${p.sector}</div>
      </div>
      <button class="modal-close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-grid">
      <div class="modal-kpi"><div class="kpi-label">Valor mercado</div><div class="kpi-val">${eur(p.mktVal)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Coste total</div><div class="kpi-val">${eur(p.cost)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">P&L €</div><div class="kpi-val" style="color:${colorStyle(p.pnlAbs)}">${eur(p.pnlAbs)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">P&L %</div><div class="kpi-val" style="color:${colorStyle(p.pnlPct)}">${pct2(p.pnlPct)}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Acciones</div><div class="kpi-val">${p.shares.toLocaleString('es-ES')}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Precio medio</div><div class="kpi-val">${num(p.avgCost)} ${p.currency}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Precio actual</div><div class="kpi-val">${num(p.price)} ${p.currency}</div></div>
      <div class="modal-kpi"><div class="kpi-label">Peso cartera</div><div class="kpi-val">${p.weight.toFixed(2)}%</div></div>
    </div>
  `;

  modal.classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

// ── TABS ──────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
}

function setPeriod(p, btn) {
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Future: filter chart by period
}

// ── BOOT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', initDashboard);
