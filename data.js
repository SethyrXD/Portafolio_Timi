// ============================================================
//  PORTFOLIO DATA — Sergio Pérez | Clicktrade / iBroker
//  Trades extraídos del Excel de transacciones (ene 2022 – mar 2026)
//  Precios actuales: cierre 19-mar-2026 según informe iBroker
//  Divisa base: EUR
// ============================================================

const PORTFOLIO_DATA = {

  portfolioName: "Sergio · Portfolio",
  currency: "EUR",
  benchmark: "US Tech 100 (NAS)",

  // ─── POSICIONES ACTUALES ───────────────────────────────────
  // "trades" = TODAS las compras históricas de la posición actual
  // Para posiciones con ventas parciales, el cálculo de precio
  // medio usa FIFO (las primeras compras cubren las ventas)
  // y el app.js excluye los lotes ya vendidos automáticamente.

  positions: [
    {
      ticker: "ASTS",
      name: "AST SpaceMobile Inc.",
      currency: "USD",
      fxRate: 0.85857,
      currentPrice: 94.09,
      lastUpdated: "2026-03-19",
      sector: "Space / Telecom",
      notes: "7 tramos de compra. Sin ventas. +227% histórico.",
      trades: [
        { date: "2025-03-21", shares: 400,  price: 25.69  },
        { date: "2025-05-12", shares: 200,  price: 26.46  },
        { date: "2025-05-16", shares: 225,  price: 26.66  },
        { date: "2025-09-11", shares: 225,  price: 38.37  },
        { date: "2025-11-14", shares: 150,  price: 61.20  },
        { date: "2026-03-03", shares: 100,  price: 89.37  },
        { date: "2026-03-18", shares: 200,  price: 90.79  },
      ],
      // Sin ventas => acciones actuales = 1500
    },
    {
      ticker: "HIMS",
      name: "Hims & Hers Health Inc.",
      currency: "USD",
      fxRate: 0.85857,
      currentPrice: 24.16,
      lastUpdated: "2026-03-19",
      sector: "Health / DTC",
      notes: "5 compras, 2 ventas parciales (440+200 acc). Quedan 1000 acc.",
      trades: [
        // Compras restantes tras ventas FIFO (440+200=640 acc vendidas de los primeros lotes)
        // Lote 1: 550 → 440 vendidas en feb-25 → quedan 110
        // Lote 2: 250 → 200 vendidas en ago-25 → quedan 50
        // Lotes 3,4,5 completos
        { date: "2024-10-10", shares: 110,  price: 17.97  }, // restante tras venta feb-25
        { date: "2024-10-18", shares: 50,   price: 22.16  }, // restante tras venta ago-25
        { date: "2024-10-22", shares: 410,  price: 23.52  },
        { date: "2024-10-30", shares: 230,  price: 18.96  },
        { date: "2025-11-13", shares: 200,  price: 36.75  },
      ],
    },
    {
      ticker: "TMDX",
      name: "TransMedics Group Inc.",
      currency: "USD",
      fxRate: 0.85857,
      currentPrice: 113.72,
      lastUpdated: "2026-03-19",
      sector: "Medtech",
      notes: "6 compras, 1 venta parcial (300 acc ago-25 @ 114.92). Quedan 400 acc.",
      trades: [
        // 300 vendidas en ago-25 FIFO desde los primeros lotes:
        // Lote 1: 90  → 90 vendidas → 0 restantes
        // Lote 2: 65  → 65 vendidas → 0 restantes
        // Lote 3: 95  → 95 vendidas → 0 restantes
        // Lote 4: 175 → 50 vendidas → 125 restantes
        { date: "2024-12-31", shares: 125,  price: 61.70  }, // restante tras venta
        { date: "2025-02-21", shares: 135,  price: 72.90  },
        { date: "2025-03-05", shares: 140,  price: 68.94  },
      ],
    },
    {
      ticker: "NBIS",
      name: "Nebius Group NV",
      currency: "USD",
      fxRate: 0.85857,
      currentPrice: 121.52,
      lastUpdated: "2026-03-19",
      sector: "AI / Cloud",
      notes: "2 tramos de compra. Sin ventas.",
      trades: [
        { date: "2025-11-20", shares: 250,  price: 99.05  },
        { date: "2025-12-26", shares: 50,   price: 88.58  },
      ],
    },
    {
      ticker: "RKLB",
      name: "Rocket Lab Corporation",
      currency: "USD",
      fxRate: 0.85857,
      currentPrice: 71.93,
      lastUpdated: "2026-03-19",
      sector: "Space / Launch",
      notes: "Compra 700 @ 42.14, venta parcial 200 @ 74.80 (dic-25). Quedan 500 acc.",
      trades: [
        // 700 compradas, 200 vendidas → 500 restantes (todo del mismo lote)
        { date: "2025-12-02", shares: 500,  price: 42.14  },
      ],
    },
    {
      ticker: "MELI",
      name: "MercadoLibre Inc.",
      currency: "USD",
      fxRate: 0.85857,
      currentPrice: 1666.93,
      lastUpdated: "2026-03-19",
      sector: "E-Commerce / LatAm",
      notes: "1 sola compra. Sin ventas.",
      trades: [
        { date: "2025-11-12", shares: 15,   price: 2105.09 },
      ],
    },
    {
      ticker: "NAGARRO",
      name: "Nagarro N",
      currency: "EUR",
      fxRate: 1.0,
      currentPrice: 49.52,
      lastUpdated: "2026-03-19",
      sector: "IT Services",
      notes: "14 tramos de compra entre may-22 y jul-24. Sin ventas. Mayor pérdida latente.",
      trades: [
        { date: "2022-05-02", shares: 25,   price: 127.60 },
        { date: "2022-07-15", shares: 10,   price: 95.50  },
        { date: "2022-08-31", shares: 6,    price: 99.80  },
        { date: "2022-09-12", shares: 9,    price: 108.00 },
        { date: "2022-09-14", shares: 10,   price: 100.60 },
        { date: "2022-09-29", shares: 12,   price: 90.50  },
        { date: "2023-02-24", shares: 8,    price: 93.50  },
        { date: "2023-03-14", shares: 20,   price: 97.00  },
        { date: "2023-06-22", shares: 100,  price: 79.25  },
        { date: "2023-07-03", shares: 60,   price: 80.85  },
        { date: "2023-08-31", shares: 50,   price: 70.00  },
        { date: "2023-09-20", shares: 70,   price: 68.90  },
        { date: "2024-07-17", shares: 140,  price: 77.81  },
        { date: "2024-07-31", shares: 100,  price: 81.00  },
      ],
    },
    {
      ticker: "ABCL",
      name: "AbCellera Biologics Inc.",
      currency: "USD",
      fxRate: 0.85857,
      currentPrice: 3.53,
      lastUpdated: "2026-03-19",
      sector: "Biotech",
      notes: "4 tramos de compra. Sin ventas.",
      trades: [
        { date: "2025-08-13", shares: 2800, price: 4.48   },
        { date: "2025-09-11", shares: 1200, price: 4.64   },
        { date: "2025-11-20", shares: 1200, price: 3.79   },
        { date: "2025-12-26", shares: 600,  price: 3.62   },
      ],
    },
    {
      ticker: "AFENTRA",
      name: "Afentra PLC",
      currency: "GBP",
      fxRate: 1.15319,
      currentPrice: 73.40,   // en peniques (GBX)
      lastUpdated: "2026-03-19",
      sector: "Energy / Oil",
      notes: "1 sola compra (19-mar-26). Posición muy reciente.",
      trades: [
        { date: "2026-03-19", shares: 20000, price: 75.00 },
      ],
    },
    { date: "2022-05-11", shares: 40,   price: 46.79  },
        { date: "2022-06-13", shares: 10,   price: 45.10  },
        { date: "2022-10-18", shares: 20,   price: 40.26  },
        { date: "2022-11-25", shares: 15,   price: 46.55  },
      ],
    },
  { date: "2022-05-24", shares: 5,    price: 177.94 },
        { date: "2022-06-06", shares: 5,    price: 193.17 },
      ],
    },
  ],

  // ─── LIQUIDEZ ──────────────────────────────────────────────
  cash: {
    amount: 15760.31,   // EUR exacto a 19-mar-2026
    currency: "EUR"
  },

  // ─── BENCHMARK ─────────────────────────────────────────────
  benchmarkReturn: 75.0,
  portfolioTotalReturn: 23.56,

  // ─── HISTÓRICO SEMESTRAL (informe iBroker, pág. 4) ────────
  historicalReturns: [
    { period: "H1-2022", portfolio: -20.1, benchmark: -17.6 },
    { period: "H2-2022", portfolio:  -7.7, benchmark:  -4.6 },
    { period: "H1-2023", portfolio:  20.6, benchmark:  38.3 },
    { period: "H2-2023", portfolio:  13.7, benchmark:  10.9 },
    { period: "H1-2024", portfolio:  -2.8, benchmark:  17.3 },
    { period: "H2-2024", portfolio:   2.9, benchmark:   6.6 },
    { period: "H1-2025", portfolio:  25.2, benchmark:   7.7 },
    { period: "H2-2025", portfolio:   0.0, benchmark:  11.4 },
    { period: "H1-2026", portfolio:  -2.3, benchmark:  -3.3 },
  ],

  // ─── RESUMEN CUENTA ────────────────────────────────────────
  accountSummary: {
    startValue:      0,
    depositsNet:     260008.07,
    totalPnL:         85579.69,
    totalCosts:      -13920.89,
    endValue:        345587.76,
    twrReturn:           23.56,
  },

  // ─── G/P HISTÓRICA COMPLETA (todas las posiciones, pág 5-9)─
  allTimeGP: [
    { name: "AST SpaceMobile",          gp:  62368.60, pct:  227.40 },
    { name: "Hims & Hers Health",        gp:  23624.65, pct:   25.73 },
    { name: "SoFi Technologies",         gp:  19155.81, pct:   51.00 },
    { name: "Rocket Lab",                gp:  17996.55, pct:   67.96 },
    { name: "TransMedics Group",         gp:  15572.89, pct:   -9.01 },
    { name: "Nebius Group",              gp:   5944.41, pct:   21.23 },
    { name: "goeasy Ltd",               gp:   9290.48, pct:   17.30 },
    { name: "Brookfield Corp.",          gp:   9674.47, pct:   52.55 },
    { name: "Brookfield Asset Mgmt",     gp:   4892.36, pct:   52.94 },
    { name: "ZIM Shipping",              gp:   5172.44, pct:   49.88 },
    { name: "Alibaba ADR",               gp:   5373.20, pct:   18.65 },
    { name: "ASML Holding",              gp:   5140.90, pct:   57.24 },
    { name: "Meta Platforms",            gp:   4934.93, pct:   48.10 },
    { name: "Filo Corp (delisted)",      gp:   4036.36, pct:   46.25 },
    { name: "Adobe Inc.",                gp:   3642.88, pct:   32.40 },
    { name: "KULR Technology",           gp:   2395.19, pct:   32.62 },
    { name: "EPAM Systems",              gp:   2372.21, pct:   62.60 },
    { name: "Playmates Toys",            gp:   2085.53, pct:   -1.04 },
    { name: "Advanced Micro Devices",    gp:   1357.96, pct:    7.56 },
    { name: "Fortinet",                  gp:   1328.18, pct:    0.77 },
    { name: "NagaCorp",                  gp:   1212.97, pct:   17.64 },
    { name: "Palantir",                  gp:   1091.25, pct:   26.34 },
    { name: "Alphabet Class A",          gp:    939.50, pct:   -4.72 },
    { name: "Kosmos Energy",             gp:    854.66, pct:    5.67 },
    { name: "Alphamin Resources",        gp:    828.70, pct:    2.66 },
    { name: "PayPal",                    gp:   1179.85, pct:   13.36 },
    { name: "Microsoft",                 gp:   1544.57, pct:    7.81 },
    { name: "Int. Petroleum",            gp:    307.85, pct:    3.13 },
    { name: "Scorpio Tankers",           gp:    169.68, pct:    3.33 },
    { name: "Games Workshop",            gp:    179.61, pct:    8.82 },
    { name: "S&P Global",               gp:    280.58, pct:    8.60 },
    { name: "T Rowe Price",              gp:    285.81, pct:   -5.60 },
    { name: "Topicus.com",              gp:    121.52, pct:    2.74 },
    { name: "Tandem Diabetes Care",      gp:    129.17, pct:   13.42 },
    { name: "Afentra PLC",              gp:   -572.59, pct:   -3.28 },
    { name: "Genel Energy",              gp:   -249.78, pct:   -6.25 },
    { name: "Valeura Energy",            gp:   -311.17, pct:  -12.82 },
    { name: "S & U Plc",               gp:   -684.51, pct:  -13.18 },
    { name: "AbCellera Biologics",       gp:  -3847.87, pct:  -24.66 },
    { name: "Pacira BioSciences",        gp:   -740.65, pct:   -8.17 },
    { name: "Kaspi.kz ADR",             gp:  -4284.80, pct:  -30.72 },
    { name: "MercadoLibre",             gp:  -5914.79, pct:  -21.62 },
    { name: "Bit Digital",              gp:  -5604.52, pct:  -33.51 },
    { name: "AMC Entertainment",         gp:  -1819.42, pct:  -52.67 },
    { name: "GameStop",                  gp:   -515.54, pct:  -42.79 },
    { name: "Boston Omaha",              gp:  -1319.73, pct:  -48.12 },
    { name: "Opendoor Technologies",     gp:  -5985.37, pct:  -42.69 },
    { name: "Endava ADR",               gp:  -3155.16, pct:  -49.99 },
    { name: "Paramount Skydance",        gp:  -1829.26, pct:  -32.77 },
    { name: "Novo Nordisk ADR",          gp:  -9113.16, pct:  -39.89 },
    { name: "Brookfield Corp. (closed)", gp:  -9690.47, pct:  -22.14 },
    { name: "Teleperformance SE",        gp: -15033.84, pct:  -51.76 },
    { name: "Propel Holdings",           gp: -11367.86, pct:  -15.69 },
    { name: "RCI Hospitality",           gp: -17596.33, pct:  -52.56 },
    { name: "Nagarro",                   gp: -19476.28, pct:  -60.62 },
    { name: "NowVertical Group",         gp:  -4920.96, pct:  -88.73 },
    { name: "Converge Tech (delisted)",  gp:  -5698.27, pct:  -65.13 },
    { name: "District Metals",           gp:   -188.07, pct:   -0.79 },
  ],
};
