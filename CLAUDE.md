# CLAUDE.md — InferenceOS

Guidance for Claude Code when working in this repository. Read this file fully before starting any task.

> **Source of truth:** `InferenceOS - Product Specification (v0.2).docx` (Nov 01, 2026).
> When this file and the spec disagree, the spec wins, except for decisions recorded in [docs/decisions.md](docs/decisions.md). If the spec is ambiguous, check **§15 Open Decisions** and ask. Do not guess.
> **Project status:** Specification stage. There is no application code yet. Sections marked *(planned)* describe the intended setup, not files that exist today.

---

## 0. Non-negotiable rules (read first)

1. **The transaction ledger is the single source of truth.** Holdings, cash, P&L and returns are always *derived* by replaying the ledger. Never store a user-typed balance, position or return as an authoritative value. Derived caches (snapshots, lots) can always be thrown away and rebuilt.
2. **Never trust financial math without hand-verified tests.** Every formula (returns, FIFO lots, splits, dividends, FX, ladder spend, worst-case weight, drift) needs unit tests with expected values worked out by hand *before* the change is merged. AI-written finance code gets the same test bar as any other code, no exceptions.
3. **InferenceOS never places, modifies or cancels orders at a broker.** It plans and tracks. Execution stays at the broker. Do not add broker-execution APIs, broker credential storage or direct broker connections.
4. **Not investment advice.** UI copy, labels and AI output describe measurements and the consequences of the *user's own* plan. They never recommend buying or selling. See §11.4.
5. **Row-level security on every user table.** A row is visible only to its owner. Portfolio-level tables also check that the portfolio belongs to the user. A table without RLS is a release blocker.
6. **No secrets in the browser or the repository.** The client holds only the public Supabase anon key. The service-role key never appears in client code.
7. **Deposits and withdrawals are never profit.** Any return figure that moves on a deposit is a bug.
8. **One feature or fix per task.** Write tests alongside the change. Commit after each working feature. Fix known bugs before starting new features.
9. **Stay inside V1 scope** (§3) unless the user asks for more. If a request touches a V1.1 or out-of-scope item, say so before building it.
10. **Mock market data only.** Prices, history, fundamentals, splits, dividends and exchange rates come from the mock data module; do not call an external data service. Use fictional portfolios, and never commit real holdings, personal data or local file paths.

---

## 1. Product in one paragraph

InferenceOS is a web-based portfolio planning and tracking platform for **analytical private investors**. It replaces paid trackers plus Excel buy lists with one system for **buy ladders** (laddered limit-order entry plans with capital guardrails), **order tracking** (hundreds of limit orders, from draft to fill), **portfolio-wide technical signals** (distance from the 200-week and 200-day moving averages), and **true performance** (time-weighted return net of deposits, in USD or ILS).

- **Tagline:** "From data to decisions."
- **Positioning:** Institutional-grade portfolio discipline, made accessible to the private investor. A planning and tracking tool, not investment advice.
- **Name:** *Inference* means reaching conclusions from evidence. *OS* means the single layer the whole investing workflow runs on.

### 1.1 Target user

Self-directed investors who research companies in depth (P/E, FCF, ROIC, margins), hold a concentrated portfolio of about 10 to 40 US stocks and ETFs, set target allocations and conviction levels, and buy in stages at technical levels. Many are **Israeli residents investing in US markets** (often through Interactive Brokers), so they think in both USD and ILS.

| Persona | Profile | Key pain |
|---|---|---|
| **Daniel** (primary), 32 | Software engineer, about 25 holdings at IBKR, deposits monthly in ILS, about 150 standing limit orders | Can't see total committed capital across ladders; checks the 200WMA chart by chart; pays for two trackers |
| **Maya** (secondary), 41 | Physician, about 12 holdings, invests quarterly, medium tech level | Little time; unsure the portfolio matches her plan; confuses deposits with returns |

Composite validation personas: **A** Spreadsheet Maximizer (fundamentals, $0 tools, 5-7 h/month), **B** Busy Professional (ETFs, about $20/month, about 1 h/month, wants TWR), **C** Hybrid Investor (fundamentals plus 200WMA entries, tranches 30/30/40, about $25/month).

### 1.2 Five core problems the product solves

1. **Fragmentation and cost:** paid tools plus a spreadsheet.
2. **Order chaos:** hundreds of limit orders with no view of committed capital or post-fill concentration.
3. **Distorted performance:** deposits mixed with gains; dividends, withholding, fees, splits and FX scattered around.
4. **No portfolio-wide signals:** the 200WMA can only be checked one company at a time.
5. **Silent allocation drift:** no continuous check of current weights against targets.

**The morning question the Dashboard must answer:** what moved, which holdings are in a buy zone, which orders need action, and is the portfolio still on target?

---

## 2. Domain glossary

Use these exact terms in code, UI copy and tests. Names in `code` are the proposed identifiers.

| Term | Meaning |
|---|---|
| **Net Liquidity** (`netLiquidity`) | Cash plus the market value of all holdings for the selected scope. |
| **Invested** | Market value of holdings, excluding cash. |
| **Day P&L** | Change in holdings value since the previous close. Live during US market hours, otherwise labeled with the last session's date. |
| **Unrealized P&L / Realized P&L** | Open-lot gain vs. FIFO cost; closed-lot gain booked on sells. |
| **TWR** (time-weighted return) | Return that neutralizes the timing and size of external flows. The headline return. |
| **MWR / XIRR** | Money-weighted return; reflects the investor's own flow timing. |
| **External flow** | A deposit or withdrawal. Never counted as profit. |
| **Portfolio** | A user-defined group of broker accounts. "Total (All)" is the union of all portfolios. |
| **Account** | A broker account inside a portfolio, with a base currency of USD or ILS. |
| **Scenario Book** | A container of buy ladders for one portfolio. |
| **Scenario asset** | A company inside a Scenario Book, with a **target weight** and a **hard cap**. |
| **Rung** | One planned buy level. Types: **Buy Point**, **Lower Buy Point**, **Deep Technical Target** (usually near the 200WMA). |
| **Rung sizing** | Number of shares, a cash amount, or a fixed cash amount per event. |
| **Funding class** | **Protected** (never cut), **Flex**, **Cancel-First**. |
| **Hard cap** | The maximum share of the portfolio a company may ever reach. |
| **Worst-case weight** | The company's weight if every enabled rung fills (see §5.5 for the formula). |
| **BREACH** | Worst-case weight exceeds the hard cap. Rung or row shown in red. |
| **External Funding** | Planned future deposits counted toward the Scenario Book's available funding. |
| **Available Funding** | Cash plus External Funding. |
| **Enabled Spend** | Total cost of all enabled rungs. Split into Protected Spend and Flex / Cancel-First spend. |
| **Projected Cash** | Available Funding minus Enabled Spend. |
| **Overbooked** | Enabled Spend exceeds Available Funding. |
| **Cancellation Waterfall** | Proposed order of rung cuts when overbooked: Cancel-First, then Flex, never Protected. Shows the shortfall and the cash each cut frees. |
| **Tied Capital** | Cash reserved by working buy orders. |
| **Fill Rate** | Share of submitted orders that end up Filled. |
| **Drift** | Current weight minus target weight. |
| **Target Σ** | Sum of all target weights. Should equal 100%. |
| **Deploy Budget** | Cash available to invest in Rebalance. |
| **MA zones** | Find the Dip buckets: **Very Cheap**, **Cheap**, **Near MA**, **Below MA**, **Above MA**. |
| **Primary distance** | `(price − MA) / MA` against the MA chosen by Scanner MA mode. |
| **MA mode** | Prefer 200WMA, Force 200WMA or Force 200DMA. |
| **200WMA / 200DMA** | 200-week / 200-day simple moving average of closing prices. Also 50, 100 and 200-day distances are shown. |
| **Health Center** | Shows price freshness, cache state and last import, with a recommended action. |

---

## 3. Scope

### 3.1 V1 — Must Have (with acceptance criteria)

| Feature | What it does | Acceptance criterion |
|---|---|---|
| Secure account | Email and password sign-in; every record owned by one user | A user can never read or change another user's data, enforced in the database |
| Portfolios and accounts | One or more portfolios, each with USD or ILS broker accounts | Switching portfolio or the Total view updates every screen |
| Transaction ledger | Buy, Sell, Deposit, Withdrawal, Dividend (gross plus withholding tax), Fee | Cash and holdings recalculate immediately after each save, edit or delete |
| Holdings | Shares, average cost, market value, unrealized and realized P&L, weight | Matches the broker statement within **$1** for a test portfolio |
| Market prices | Automatic mock prices for every held symbol | Refresh every **2 minutes** during US market hours; every price shows its "as of" time |
| Dashboard | Net Liquidity, Cash, Invested, Day P&L, Unrealized P&L, TWR, Top Movers | Deposits and withdrawals never count as profit |
| Currency switch | Every value in USD or ILS | One click switches the whole app using the daily USD/ILS rate |
| Scenario Book | Rungs at three levels, hard cap, funding classes, cash check | Shows total spend, projected cash and worst-case weight before any order exists |
| Orders | Every order from Draft to Filled, grouped by company and status | A filled order books a matching BUY or SELL transaction in one step |
| Find the Dip | Every holding ranked by distance from the 200WMA and 200DMA | One screen sorted from "Very Cheap" to "Above MA" |
| Desktop UI | Clear, consistent desktop browser UI | Every Must Have flow can be completed without leaving the app |

### 3.2 V1.1 — Nice to Have (do not build in V1 unless asked)

- **Research** (first V1.1 priority): side-by-side comparison of up to four companies, fundamentals next to each holding, per-company investment thesis and conviction level.
- **Rebalance:** current vs. target weight and drift, by holding **and by sector**; What-If mode; draft orders from the plan.
- **Dividends:** received and upcoming, withholding tax, forward 12-month estimate.
- **Alerts:** inbox of moving-average and target-price alerts.
- **Analytics:** monthly returns, drawdown, volatility, Sharpe ratio, cash-flow history.
- **Broker CSV import:** bulk import with preview, duplicate detection and warnings.
- Mobile responsive layout (down to tablet width) and keyboard shortcuts for power users.

### 3.3 Out of scope for V1

Placing or cancelling broker orders · storing broker credentials or direct broker connections · personalized advice or automated trading · tax reports and filing · **payment processing and subscriptions** · multi-language UI (English only) · asset classes beyond stocks, ETFs and cash · social features, shared portfolios, advisor accounts · native iOS and Android apps.

### 3.4 Core flow and canonical end-to-end case

**Login → Action → Result:** sign in and land on the Dashboard → log deposits and trades, build a ladder → holdings and TWR update instantly, the ladder shows its cash and concentration impact, and rungs become tracked orders.

The **Daniel ladder case** (§5.5) is the canonical acceptance test for the Scenario Book and must exist as a test fixture.

---

## 4. Architecture

```
Browser (React SPA, TypeScript)
  │  Supabase client + user JWT (HTTPS)
  ├──────────────► PostgreSQL (Supabase)  ← RLS filters every query to the owner's rows
  │
  └──────────────► Edge Functions (Deno, TypeScript)  ← verify JWT first
                       ├─► Mock data module  (prices, history, fundamentals, splits, dividends, USD/ILS)
                       └─► writes mock data to shared market-data tables
Hosting: Vercel (SPA + CDN, preview per branch) · Source: GitHub
```

- **Frontend:** single-page app. Each screen is its own lazily loaded chunk, prefetched when the user hovers its sidebar link. TanStack Query caches server data with a **2-minute stale time** and invalidates after every mutation.
- **Backend:** Supabase Auth (email and password, auto-refreshing JWT), PostgreSQL with RLS, Edge Functions, and the auto-generated REST API used through the Supabase client.
- **User data path:** browser → database directly, protected by RLS.
- **Trusted path:** anything that needs privileged database access runs in an Edge Function.
- **Edge Functions (14, in four groups):**
  - *Market data:* mock prices (every 2 minutes in market hours), daily history, intraday points, USD/ILS rate.
  - *Instruments:* ticker search, create new tickers (name, logo), fundamentals.
  - *Corporate actions:* stock splits, split-adjusted lots, dividend calendars and history.
  - *Intelligence:* scanner metrics, alert evaluation.
- **Portfolio engine:** pure, deterministic TypeScript functions with no UI, network or clock dependencies (pass `asOf` and price inputs in explicitly). See §5.

### 4.1 Planned evolution

- Scheduled server jobs for price sync and alert evaluation, so prices stay current and alerts fire while the app is closed.
- **One calculation engine for every chart**, so historical charts and current KPIs share the same rules.
- A complete, versioned migration history, so the whole database can be rebuilt from the repo.
- A Python service for AI agents (§13), deployed next to the backend.

---

## 5. Portfolio engine — financial rules

All of this lives in `src/engine/` *(planned)* as pure functions with exhaustive unit tests.

### 5.1 Ledger replay

- Rebuild cash and positions from the full history, **oldest first**.
- **Deterministic order:** `trade_date ASC, created_at ASC, id ASC`. The same data must always give the same result.
- **FIFO lots.** Sells consume the oldest open lots first. Realized P&L comes from consumed lots; unrealized P&L from remaining lots at the current price.
- **Splits** adjust share counts and cost per share of all lots opened before the split's effective date. Total cost basis is unchanged.
- **Unfunded buy detection:** if cash would go negative from a buy with no recorded deposit, flag it (Health Center or inline warning). Do not silently clamp.
- **Selling more than owned** is a validation error, not a short position.
- Edits and deletes of any transaction trigger a full replay (or a replay from the affected date). The result must be identical either way.

### 5.2 Transaction types and cash effect

| Type | Fields | Cash effect (account currency) |
|---|---|---|
| `BUY` | ticker, account, date, shares, price, fees, notes | `−(shares × price + fees)` |
| `SELL` | same; UI offers **Sell all** | `+(shares × price − fees)` |
| `DEPOSIT` | amount, account, date | `+amount` (external flow) |
| `WITHDRAWAL` | amount, account, date | `−amount` (external flow) |
| `DIVIDEND` | ticker, gross amount, tax withheld | `+(gross − tax)` |
| `FEE` | amount | `−amount` |
| `FX_CONVERSION` | from currency and amount, to currency and amount, fee | `−from amount`, `+to amount` (each in its own currency) |

- **Dividend convention:** store **gross** and **tax withheld**. Cash receives **net**. Default withholding is **25%** (US dividends paid to Israeli residents), and the user can edit it.
- Allowed types are a Postgres enum, mirrored in a Zod schema.
- `FX_CONVERSION` moves cash between ILS and USD and is not an external flow. Other gaps are listed in §15.

### 5.3 Performance

- **TWR:** chain-link sub-period returns, with each external flow starting a new sub-period, so deposits and withdrawals have zero effect on the return.
- **XIRR:** money-weighted return over dated flows (deposits negative, withdrawals positive, ending value positive).
- **Daily and monthly returns** neutralize external flows the same way as TWR.
- Dashboard TWR, Analytics and charts must produce identical numbers for the same scope and range. An integration test checks this.

### 5.4 Prices, freshness and FX

- A price counts as **current only if its trade is from today** (US market calendar). Otherwise show the last-session value, its "as of" time and a stale badge.
- Refresh held symbols every 2 minutes during US regular hours (9:30–16:00 America/New_York, trading days only).
- **USD/ILS:** one global toggle converts every value on every screen with the daily rate from `fx_rates_daily`. Every displayed value carries its currency symbol.
- Historical series in ILS: see §15 (rate per date vs. today's rate is an open decision).

### 5.5 Scenario Book math

For one scenario asset in a specific portfolio (the Scenario Book is not available in "Total (All)"):

```
rungSpend_i         = shares_i × limitPrice_i                 (or the cash amount for cash-sized rungs)
enabledSpend        = Σ rungSpend_i  over enabled rungs
cumulativeShares_k  = currentShares + Σ_{i ≤ k} shares_i      (rungs ordered by price, highest first)
cumulativePct_k     = cumulativeShares_k × currentPrice / netLiquidity
worstCaseWeight     = cumulativePct_last (all enabled rungs filled)
BREACH              = worstCaseWeight > hardCap
availableFunding    = cash + externalFunding
projectedCash       = availableFunding − Σ enabledSpend (whole book)
overbooked          = projectedCash < 0
```

**Canonical test fixture (from the spec, must pass exactly):**

| Input | Value |
|---|---|
| Net liquidity | $100,000 |
| Cash | $12,000 |
| Current position | 50 shares @ $150 (200WMA = $120) |
| Hard cap | 20% |
| Rungs v1 | 20 @ $140, 30 @ $125, 40 @ $110 |

| Expected | v1 | v2 (third rung lowered to 30 shares) |
|---|---|---|
| Total spend | **$10,950** | **$9,850** |
| Projected cash | $1,050 (funded) | **$2,150** |
| Final shares | 140 | 130 |
| Worst-case weight | **21.0% → BREACH on rung 3** | **19.5% → within cap** |

> The spec's numbers value the position at **today's price** against **today's net liquidity**. Keep that convention so the fixture passes, but see §15 (it is not a true stress case).

**Cancellation Waterfall:** when overbooked, propose cuts in the order **Cancel-First → Flex**, **never Protected**, and show the shortfall and the cash each cut frees. Order *within* a class is an open decision (§15).

**Send to Orders:** every enabled rung becomes a `DRAFT` order under Action Needed.

### 5.6 Order lifecycle (state machine)

```
DRAFT ─► SUBMITTED ─► PARTIALLY_FILLED ─► FILLED
  │           │               │
  └───────────┴───────────────┴──► CANCELLED
              └───────────────┴──► FAILED | EXPIRED
```

- A Submitted order can go straight to Filled when it fills in one execution.
- **Sections:** Action Needed = Draft · Working = Submitted + Partially Filled · Completed = Filled · Exceptions = Cancelled + Failed + Expired.
- **Fill** (Execute Order dialog): Book to Account, Executed Shares, Executed Price, Fees, Execution Date, Total Notional → a full fill moves to Completed, a partial fill stays in Working, and **one matching BUY/SELL transaction is booked atomically** (one database transaction or RPC: no fill without its ledger row, and no ledger row without its fill).
- **Deleting an order record never changes the ledger.** The delete dialog must say so.
- Cancelling asks "Cancel order?" and moves the order to Exceptions.
- Implement transitions as a pure function `transition(order, event) → order | Error` with a test for every legal and illegal transition.

### 5.7 Find the Dip

- For each holding: price, zone, primary distance, and distance from 50DMA, 100DMA, 200DMA and 200WMA; target price and % to target.
- Zones come from user thresholds (percent) in Scanner Settings: Near MA, Cheap, Very Cheap, Near Target. Defaults are not in the spec; see §15.
- Sort from the cheapest zone down. Zone counters filter the table. "Hide no alloc" hides companies without a target allocation.
- Badge colors: green for Very Cheap and Cheap, yellow for Near MA.
- Holdings with too little history for a 200WMA (about four years of weekly closes) must show "insufficient history", never a wrong number.

### 5.8 Rebalance math (V1.1)

`drift = currentWeight − targetWeight`, by holding and by sector. Suggestions such as "Buy 12 shares" are calculated from the user's own targets and Deploy Budget, rounded down to whole shares. What-If mode never writes to the database. "Create draft orders" produces DRAFT orders.

### 5.9 Numeric precision

- Postgres: `numeric` for all money, prices, share counts and rates. **Never** `float`/`real`/`double precision`.
- TypeScript: do not accumulate money in plain `number` sums across many rows without a defined rounding rule. Use `decimal.js` ([docs/decisions.md](docs/decisions.md)).
- Display: thousands separators, percentages to two decimals, a currency symbol on every value, tabular (monospace) digits.

---

## 6. Data model

About 30 PostgreSQL tables in six groups:

| Group | Tables | Notes |
|---|---|---|
| **Structure** | `portfolios`, `accounts`, `user_settings` | Owned by user. Account has `currency` (USD or ILS) and `portfolio_id`. |
| **Ledger** | `transactions`, `orders`, `import_batches` | Single source of truth. `transactions.type` is an enum. |
| **Market data** (shared, read-only to users) | `instruments`, `instrument_prices_daily`, `corporate_actions`, `fx_rates_daily`, `dividend_announcements`, `instrument_fundamentals_cache` | Written only by Edge Functions with the service role. |
| **Planning** | `scenario_books`, `scenario_assets`, `scenario_rungs`, `target_allocations`, `instrument_targets` | Scoped to a portfolio. |
| **Intelligence** | `instrument_scanner_metrics`, `alerts_rules`, `alerts_state`, `alerts_events`, `user_watchlist`, `investment_memos` | |
| **Derived caches** | `adjusted_lots_cache`, `portfolio_snapshots`, `holding_snapshots`, `portfolio_intraday_points`, `portfolio_states` | Disposable. Must be rebuildable from the ledger at any time. |

### 6.1 Conventions

- Every user-owned table has `user_id uuid not null references auth.users`, `created_at`, `updated_at`.
- RLS policy pattern: `using (user_id = auth.uid())` and `with check (user_id = auth.uid())`. Portfolio-scoped tables also check that `portfolio_id` belongs to `auth.uid()`.
- Shared market-data tables: `select` for authenticated users; no `insert/update/delete` policies for users.
- Enums for transaction type, order status, order side, rung type, funding class, MA zone, MA mode and currency.
- Constraints over trust: `check (shares > 0)`, `check (price >= 0)`, foreign keys everywhere, `on delete` behavior chosen on purpose.
- Every schema change is a **migration file** in `supabase/migrations/`. Never change the schema only through the dashboard.

---

## 7. Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript (frontend and Edge Functions) |
| Frontend | React 18, Vite, React Router 6 (lazy routes, protected pages) |
| Server state | TanStack Query 5 |
| UI | shadcn/ui on Radix UI primitives, Tailwind CSS, Lucide icons |
| Charts | Recharts (line, bar, area, heatmap) |
| Forms | React Hook Form + Zod |
| Utilities | date-fns, Papa Parse, decimal.js (exact money math) |
| Backend | Supabase: PostgreSQL + RLS, Auth, Edge Functions (Deno) |
| Market data | Mock data module |
| Testing | Vitest, Testing Library, jsdom |
| Quality | ESLint, `tsc` |
| Hosting / VCS | Vercel, Git + GitHub (GitHub CLI) |
| Design | Google Stitch (UX flows and high-fidelity screens) |
| Future AI layer | Python, CrewAI, MCP |

Do not add dependencies outside this list without saying why and getting approval.

---

## 8. Repository layout *(planned)*

```
/
├── CLAUDE.md
├── docs/                         # spec (.docx), decisions log, design exports
├── src/
│   ├── app/                      # router, providers, layout shell (sidebar, top bar)
│   ├── pages/                    # one folder per screen, lazily loaded
│   │   ├── dashboard/  holdings/  ticker/  transactions/
│   │   ├── scenario-book/  orders/  scanner/
│   │   ├── rebalance/  dividends/  alerts/  research/   # V1.1
│   │   └── settings/  login/
│   ├── engine/                   # PURE financial logic, no React, no Supabase
│   │   ├── ledger/  performance/  scenario/  orders/  rebalance/  scanner/  fx/
│   │   └── __tests__/            # hand-calculated fixtures live here
│   ├── data/                     # Supabase client, query hooks, query keys
│   ├── components/ui/            # shadcn components
│   ├── components/               # shared app components (KpiTile, MoneyCell, ZoneBadge…)
│   ├── lib/                      # formatting, dates, zod schemas
│   └── styles/                   # tailwind tokens
├── supabase/
│   ├── migrations/
│   ├── functions/                # 14 Edge Functions, shared code in _shared/
│   └── tests/                    # RLS coverage + two-user isolation
└── .env.example                  # public vars only (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
```

**Dependency direction:** `pages → data → engine`. `engine` imports nothing from `pages`, `data`, React or Supabase.

---

## 9. Commands *(planned; update once the repo exists)*

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm test
```

```bash
npm run lint
```

```bash
npx tsc --noEmit
```

```bash
supabase start
```

```bash
supabase db reset
```

```bash
supabase functions serve
```

Before calling any task done: tests, lint and type-check must pass.

---

## 10. Environment and secrets

- Client (`VITE_*`, public): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Edge Functions only (set with `supabase secrets set`): `SUPABASE_SERVICE_ROLE_KEY`.
- Never commit `.env`. Keep `.env.example` up to date with names only, no values.
- Release check: scan the built client bundle for secret patterns. Zero secrets allowed.

---

## 11. UX and UI rules

### 11.1 UX principles

- **Every screen answers one question.** Every important number is at most **two clicks** away.
- First login shows a **Get started** checklist (create portfolio → add account → first deposit → first trade), with each item ticked automatically when done.
- Portfolio-level pages opened in "Total (All)" (e.g. Scenario Book) show a prompt with the portfolio selector one click away.
- Every metric with a non-obvious meaning (TWR, drift, hard cap, funding class) gets a one-sentence info popover explaining how it is calculated.

### 11.2 Navigation

Fixed left sidebar in four groups, plus a global top bar.

| Group | Screen | Question it answers | Shortcut |
|---|---|---|---|
| Dashboard | Dashboard | Where do I stand right now? | G D |
| Portfolio | Holdings | What do I own and how is each position doing? | G H |
| Portfolio | Transactions | What happened in my account, and when? | G T |
| Portfolio | Dividends | How much income do I earn, and what is coming? | — |
| Portfolio | Rebalance | How far am I from my target allocation? | G R |
| Portfolio | Scenario Book | Where will I buy, how much, and can I afford it? | G B |
| Portfolio | Orders | Which orders need action, are working or are done? | G O |
| Intelligence | Scanner (Find the Dip) | Which holdings are near a buy zone? | G S |
| Intelligence | Alerts | What changed that I should know about? | G A |
| Intelligence | Research | How do these companies compare? | G E |
| System | Settings | Portfolios, accounts, currency, import, health | G X |

**Top bar (every screen):** portfolio selector (Total (All) or one portfolio; everything recalculates), USD/ILS toggle, global search (Ctrl/Cmd+K; "In Portfolio" results first; arrows, Enter, Esc), alerts bell with unread count, health badge (green "Operating normally" or amber "Attention" → Health Center).

### 11.3 Design system — "trading terminal, made calm"

| Token | Value |
|---|---|
| Background | `#1B1F2A` (dark charcoal, default theme) |
| Card | `#2A2F3B` |
| Sidebar | near-black |
| Brand / primary | `#3C83F6` (buttons, links, focus rings, active nav) |
| Profit | `#22C35D` |
| Loss | `#F0425F` |
| Warning | amber |
| Radius | `0.9rem` on cards, inputs, dialogs |
| Spacing | 8px grid |
| Headings | Space Grotesk |
| Body | Plus Jakarta Sans |
| Numbers | DM Mono (tabular alignment) |

- **Color never carries meaning alone:** always pair it with a sign (+/−) or a label.
- **Layout per screen:** page header (title, one-line description, primary action at top right) → KPI row → main content. Inspectors and edit forms open as **right-side sheets** so context is never lost.
- **States:** skeleton loading (never blank), empty state with one sentence and one action, error with retry (one failing panel never breaks the page), success toast at the bottom, stale-data amber badge with "as of" time.
- **Destructive actions:** red, behind a confirmation dialog that says exactly what will and will not change.
- **Accessibility:** WCAG AA contrast on the dark theme; every icon-only button has an accessible label; Esc closes any dialog.
- **Desktop first** (1280px and wider) in V1.
- Company logo next to every ticker; one line-icon set (Lucide).

### 11.4 Copy rules (legal positioning)

- Short disclaimer at sign-up, in the terms of use and in the footer of every screen: *planning and tracking tool, not investment advice*.
- Zone labels ("Very Cheap", "Near MA") are presented as **technical measurements of distance from a user-chosen moving average**, never as recommendations. Tooltips must say so.
- Suggestions (Rebalance "Buy 12 shares", the Cancellation Waterfall) are framed as consequences of the **user's own targets and rules**.
- AI output is labeled "AI-generated analysis", never advice.

### 11.5 Screen specs (layout → what the eye hits first → controls)

| Screen | Layout | First focus | Controls |
|---|---|---|---|
| Login | Centered card | Logo, email, password | Sign in; inline "Authentication failed"; fields keep values |
| Dashboard | KPI row, performance chart, card grid | Net Liquidity, Day P&L | Range chips 1W/1M/YTD/ALL; Gainers/Losers by $ impact; Open Orders card; Allocation card |
| Holdings | Summary strip, tabs, table, inspector | Total value, total profit, best/worst | Tabs General/Performance/Fundamentals/Analytics; sort; filter; Reset; row → Holding Inspector |
| Ticker Details | Position header, price chart with trade markers, tabs | Shares, avg cost, value, unrealized P&L, weight | Range YTD/10Y/ALL; Buy/Sell/Dividend markers; Add Transaction; thesis; conviction; target % |
| Transactions | Header, filter chips, paginated ledger, activity panels | Newest transactions | Add Transaction; CSV; chips All/Buy/Sell/Dep/Wdr/Div/Fee; Edit/Delete; pager; 52-week heatmap; Monthly Returns |
| Scenario Book | Funding strip, Ladder Overview, rung tables, simulation panel | Available Funding vs. Enabled Spend, breach counters | Add company; Expand/Collapse; Add rung; enable switches; Edit/Delete; Send to Orders |
| Orders | KPI row, four sections grouped by company | Action Needed, Tied Capital | New Order; CSV; Expand/Collapse all; Fill; Edit; Cancel; Edit/Delete record |
| Scanner | Zone counters, multi-MA distance table | Very Cheap and Cheap holdings | Filter; Hide no alloc; Refresh; Scanner Settings; Set target; Alert settings; watchlist |
| Rebalance (V1.1) | Header metrics, table, inspector | Max Drift, Deploy Budget | What-If; filters; Inspector; Create draft orders |
| Dividends (V1.1) | KPI tiles, chart, upcoming cards, tables | Forward 12M, upcoming | Mark received; Edit; period filter |
| Alerts (V1.1) | Filter bar, inbox | Unread | Family/state/read filters; Mark read; Delete; Select all; Mark All Read; Evaluate |
| Research (V1.1) | Ticker chips, normalized chart, fundamentals table | Relative performance | Add Ticker (max 4); range chips; remove chip |
| Settings | Vertical tabs | Active panel | General, Portfolios, Data, Diagnostics, Health |

### 11.6 Key journey details to implement exactly

- **Add Transaction form:** segmented type control (Buy default) → ticker autocomplete → Account (pre-selected if only one), Date (today), Shares, Price, Fees, Notes (hint "e.g. Averaged down, tax-loss harvest") → **live preview** of Trade total, Weight after and Cash after, with a shortfall warning → Save → toast, new row at top, holdings and Dashboard refresh.
- **Delete transaction dialog:** "Delete transaction? This will permanently delete this transaction" with Cancel / Delete.
- **Account validation:** name shorter than two characters → "Name too short". Success toast "Account created".
- **Scanner refresh:** "Computing metrics..." then toast "Metrics refreshed".
- **Orders empty state:** "No orders yet" with a button to build a ladder.

### 11.7 Design source of truth (Google Stitch)

- **Stitch project:** "InferenceOS Investment Portfolio Terminal", `projects/3397049411855537113` (desktop, private). Design system asset: `assets/88e6dc2491b54379a608cc691fc4e0fe` ("InferenceOS").
- **Written design system:** [`docs/design/DESIGN.md`](docs/design/DESIGN.md): tokens, component specs, badge families, interface states and copy rules. When building UI, follow DESIGN.md; the Stitch HTML exports are visual references, not code to copy.
- **Reference boards in Stitch:** "Core User Flow" (the Daniel case end to end), "Component Library", "Interface States".
- **Core-flow screens in order:** Login → Dashboard (Empty State / Get started) → Settings (Portfolios & Accounts) → Add Transaction (deposit) → Scenario Book (Rung Editor Breach) → Scenario Book (resolved) → Orders (Full View) → Execute Order dialog ("InferenceOS - Orders") → Transactions → Dashboard.
- **Corrected reference:** [`docs/design/reference/transactions.html`](docs/design/reference/transactions.html) (+ `.png`) is the corrected Transactions ledger: notes under the symbol, Cash after column that adds up ($4,123.88 → $9,199.00), full-year heatmap. Prefer it over the Stitch version, whose notes were dropped.
- **Known design debt (fix before handing screens to development):**
  - Earlier screens (Dashboard, Scenario Book, Orders, Portfolio…): an image logo that does not load, cut-off KPI values, 2024 dates, "Senior Desk / PRO ANALYST" placeholder, and "True Alpha" copy.
  - Execute Order dialog is missing the executed-price and fees fields (§15 #2).
  - Several new screens still use jargon that DESIGN.md §8 forbids. Core User Flow board: about 15 phrases ("desk", "staging", "pod"). Interface States board: "telemetry", "deterministic", "isolated pod". Health Center: extra shell buttons (Quick Order, Export, Deposit), "Cluster US-East-1", "SHA-256", and the reconcile table shows ADBE 50 shs where it should be 70.

---

## 12. Security checklist

| Area | Requirement |
|---|---|
| Authentication | Supabase Auth email and password; short-lived JWT, auto refresh |
| Authorization | RLS on every user table; portfolio ownership checked on portfolio-scoped tables |
| Shared data | Market data is read-only for users; only Edge Functions write it |
| Edge Functions | Verify the caller's JWT before doing anything; service role only on the server |
| Secrets | None in the repository or the browser; privileged credentials only on the server |
| Transport | HTTPS everywhere |
| Data minimization | Never request or store broker logins, bank details or ID numbers |
| Input validation | Zod on the client, plus DB constraints and enums |
| Destructive actions | Confirmation dialogs; deleting an order record never changes the ledger |
| Release gate | Automated test that every user table has RLS enabled, plus a two-user isolation test |

---

## 13. Testing strategy

- **Unit (engine):** ledger-replay invariants, FIFO lots, splits between buys, dividends with withholding, deposits not counted as return, TWR/XIRR, same-day ordering, price freshness, cash validation, Scenario Book fixture (§5.5), order state machine (§5.6), zone classification.
- **Integration:** RLS coverage on every table, two-user isolation, Dashboard vs. Analytics consistency, route prefetching.
- **Manual:** click through every Step 4 journey end to end before each release.
- **Required edge cases:** empty portfolio · selling more than owned · a split between two buys · dividends with withholding · stale prices on weekends and holidays · lost connection · very large imports · same-day multiple trades · ILS account buying USD stocks · holdings without enough history for a 200WMA.
- **Test style:** hand-calculated expected values written as literals in the test, with a comment showing the arithmetic. Never compute the expected value with the function under test.

---

## 14. Success criteria

**Quality gates (product works):**

| Dimension | Target |
|---|---|
| Accuracy | Cash and every holding within $1 of the broker statement |
| Reliability | 100% manual checklist pass per release; zero open calculation bugs |
| Security | Zero cross-user access; zero secrets in the client bundle |
| Performance | Dashboard under 3s on first load, under 1s from cache; prices every 2 minutes in market hours |
| Usability | Setup under 10 minutes; a trade logged in under 30 seconds |

**Pilot metrics (20-30 investors, first three months):** weekly retention ≥ 60% at week 8 · WAU growing week over week · ≥ 3 h saved per user per month · ladder adoption ≥ 40% · ≥ 20 orders tracked per active Pro user · ≥ 30% cancel a paid tracker · free-to-Pro ≥ 5% within 60 days · NPS ≥ +40 · mismatch reports < 5% of active users.

**Business model:** Free ($0: one portfolio, ledger, live holdings, Dashboard with TWR, USD/ILS) · Pro ($12/month or $120/year: unlimited portfolios, Scenario Book, Orders, Find the Dip, Rebalance, Dividends, Alerts, CSV import, Analytics) · Pro + AI ($20/month, future).

---

## 15. Open decisions and known spec gaps

Found while reviewing spec v0.2. **Do not resolve these silently in code.** Ask the user, then record the decision in `docs/decisions.md` *(planned)* and update this file.

### 15.1 Ledger and engine gaps (affect correctness)

1. **FX conversion.** *Decided:* add an `FX_CONVERSION` transaction type ([docs/decisions.md](docs/decisions.md)).
2. **Executed price.** *Decided:* the Fill dialog has an editable executed price (defaults to the limit price) and fees.
3. **Partial fills.** *Decided:* book the filled part; the remainder stays `PARTIALLY_FILLED`.
4. **Draft vs. Planned.** *Decided:* one status, `DRAFT`.
5. **Worst-case weight convention.** The spec values the filled position at *today's* price against *today's* net liquidity. That is not a real stress case (rung 3 only fills if the price falls to $110, and the rest of the portfolio probably falls too). Proposed: keep the spec convention as the default so the fixture passes, and add an optional "at rung prices" stress view later.
6. **Waterfall order within a funding class** (deepest rung first? newest first? user priority?) is unspecified.
7. **"Fixed cash amount per event"** rung sizing is not defined.
8. **External Funding inside Available Funding** lets a ladder look "funded" with money not yet deposited. Proposed: show funded-by-cash and funded-by-planned-deposits separately.
9. **TWR flow timing** (flows at start or end of day) is not specified.
10. **ILS history:** historical values in ILS should use each date's USD/ILS rate, not today's rate. The spec only says "daily rate".
11. **Withholding default:** 25% assumes a W-8BEN is on file; without it US withholding is 30%. Consider a per-account default.
12. **Zone definitions:** default thresholds and the order of "Near MA" vs. "Below MA" are not given.
13. **Missing transaction types** a real IBKR statement contains: interest, transfers between accounts, spin-offs and other non-split corporate actions.

### 15.2 Scope contradictions inside the spec

14. **CSV import is V1.1**, but Journey 1, the Get started checklist and the friction table depend on it. Without it, "setup under 10 minutes" is unrealistic for a 25-stock history.
15. **Keyboard shortcuts are V1.1**, but the navigation map and the accessibility section present them as standard.
16. **The alerts bell is in the V1 top bar**, but Alerts are V1.1.
17. **The Orders empty state** links to Rebalance (V1.1).
18. **Holdings tabs Fundamentals and Analytics, and the Ticker Details thesis and conviction**, are V1.1 features shown on V1 screens. Decide: hide them in V1 or show a "coming soon" state.
19. **Payment processing is out of scope**, yet free-to-Pro conversion is a pilot metric, and Rebalance, Dividends, Alerts, CSV import and Analytics are sold as Pro features without being in V1. The pilot cannot measure conversion without billing or at least an entitlement flag.

### 15.3 Data, legal and security risks

20. **Market-data licensing.** The project uses mock data. A commercial launch would need a licensed data source, and that cost is missing from the cost model.
21. **MFA:** a financial app with email and password only. Supabase supports TOTP MFA; consider it for V1.
22. **Privacy:** no account deletion or data export is specified (Israeli Privacy Protection Law, GDPR for EU users).
23. **Advice risk in Israel:** "Very Cheap" and "Buy 12 shares" wording should be reviewed against the Israeli Investment Advice Law (1995). Neutral alternatives such as "≥ 20% below 200WMA" lower the risk.
24. **Price polling without scheduled jobs:** in V1, the browser triggers refreshes, so every open tab calls Edge Functions every 2 minutes. Watch function usage and costs. Alerts (V1.1) need the scheduled jobs from §4.1.

### 15.4 Spec document fixes

25. **Arithmetic error:** "Snowball Investor plus Koyfin Plus pays $53.98 a month" should be **$53.99** ($14.99 + $39.00).
26. **The retention metric is circular** ("60% of active users return weekly"). Define the cohort, e.g. users who finished setup in week 1.
27. **The pilot sample size** (20-30 users) is too small for a 5% conversion target (about 1 user) or a stable NPS. Treat these as directional.
28. **The USD/ILS need is "not tested"** in Problem Validation but is a headline differentiator. Validate it with real Israeli investors in the pilot.
29. **TASE holdings** (ILS prices quoted in agorot) remain an open question.

---

## 16. Working with Claude Code in this repo

- **Plan first** for anything that touches the engine, the schema or RLS. State which files change and which tests prove it.
- **Small tasks:** one feature or fix per task, with tests in the same change.
- **Diff review:** every AI-generated change is reviewed as a diff before committing. Finance changes must point to the hand-calculated test that covers them.
- **Commits:** one commit per working feature, with a clear message. Branch per feature (`feature/…`, `fix/…`) from `dev`, pull request into `dev`, then a release pull request from `dev` into `main`. Vercel preview link per branch. Never commit directly to `main` and never push without being asked.
- **Migrations:** schema changes only through new files in `supabase/migrations/`. Never edit an applied migration.
- **When unsure about product behavior:** check the spec, then §15, then ask. Do not invent product rules.
- **Do not:** add broker execution, store credentials, write to shared market-data tables from the client, use floats for money in SQL, bypass RLS with the service role in client code, or label any signal as a recommendation.
- **Useful MCP in development:** GitHub (PRs, reviews) and the database (inspect schema, verify data) while building features.

---

## 17. AI integration roadmap (future phase, not V1)

**AI Analyst Crew (CrewAI):** Portfolio Analyst (what moved and why) · Risk Monitor (concentration, hard-cap breaches, overbooked ladders, drawdowns) · Company Watch (earnings, filings, news vs. the user's thesis) · Opportunity Scout (Find the Dip zones plus targets plus ladders) · Report Writer (one daily or weekly brief).

**InferenceOS MCP server:** read-only tools such as `get_holdings`, `get_performance`, `get_ladders`, `get_scanner_zones`, so an assistant can answer "How exposed am I to semiconductors?" or "Which ladders would fill if the market fell 10%?".

**User experience:** a Daily Brief card on the Dashboard (top three insights) → an Insights screen in the Intelligence group, organized by agent → each insight links to its screen → weekly reports archived and searchable.

**Technical approach:** a Python service (e.g. on Railway) runs the crew on a schedule and on demand, reads portfolio data through read-only functions and saves reports to a new `reports` table.

**Guardrails (binding when this is built):**
- Read-only: agents never create transactions, change plans or place orders.
- **Every number comes from the portfolio engine**, never from the language model.
- Labeled as AI-generated analysis, not advice.
- Opt-in; data goes only to the configured language model.

---

## 18. Roadmap

| Phase | Steps | Next deliverable |
|---|---|---|
| 1. Discovery | 1-3 | Done (spec v0.2) |
| 2. Design | 4-5 | High-fidelity screens and an interactive prototype of the nine journeys (Google Stitch) |
| 3. Architecture | 6-7 | Final architecture and data model, including scheduled jobs |
| 4. Setup | 8-9 | Repo structure, environment variables, GitHub branching and PR flow |
| 5. AI Integration | 10-12 | AI workflow, InferenceOS MCP server, CrewAI analyst crew |
| 6. Development | 13-15 | Must Have features built and tested in small tasks |
| 7. Deployment | 16-18 | Production deploy, monitoring and logs, iteration from feedback |

**Suggested V1 build order:** schema + RLS + isolation tests → auth and app shell → portfolios and accounts → ledger + engine replay (with fixtures) → holdings + market prices → Dashboard + TWR → USD/ILS → Scenario Book (with the Daniel fixture) → Orders + fill-to-ledger → Find the Dip → Health Center → release checklist.
