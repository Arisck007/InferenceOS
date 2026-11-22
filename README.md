# InferenceOS

**From data to decisions.** A portfolio planning and tracking platform for analytical private investors. It brings buy ladders, order tracking, portfolio-wide technical signals and true performance into one system.

![Status](https://img.shields.io/badge/status-specification%20%2F%20design-blue)
![Spec](https://img.shields.io/badge/spec-v0.2-informational)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20TypeScript%20%2B%20Supabase-3C83F6)
![Market data](https://img.shields.io/badge/market%20data-mock-F5A524)

> **Not investment advice.** InferenceOS is a planning and tracking tool. It never places orders. Every plan, target and allocation comes from the user; the software calculates and shows the consequences.

> **Mock data.** The project uses invented market data and fictional portfolios.

---

## Table of contents

- [Overview](#overview)
- [Project status](#project-status)
- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Installation](#installation)
- [Usage examples](#usage-examples)
- [Design system](#design-system)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security](#security)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Analytical investors run a professional process: deep company research, laddered limit orders, target allocations. Most of them do it on tools that don't talk to each other. The result:

- **Order chaos.** A laddered strategy creates hundreds of standing limit orders, and no tool shows how much capital they commit or how concentrated the portfolio becomes if they all fill.
- **Distorted performance.** Broker apps mix deposits with gains, so a month with a large deposit looks like a great month.
- **No portfolio-wide signals.** The 200-week moving average can only be checked one chart at a time.
- **Silent allocation drift.** Target weights exist in a spreadsheet, but nothing checks them continuously.
- **Fragmentation and cost.** One or more paid trackers plus an Excel buy list.

InferenceOS replaces that setup with one system. Each morning, one screen answers four questions: what moved, which holdings are in a buy zone, which orders need action, and whether the portfolio is still on target.

### Who it's for

Self-directed investors who:
- hold a concentrated portfolio of about 10–40 US stocks and ETFs
- set target weights
- buy in planned stages at technical levels

Many are Israeli residents investing in US markets (often through Interactive Brokers) who think in both USD and ILS.

---

## Project status

| Phase | Steps | State |
|---|---|---|
| 1. Discovery | 1–3 | ✅ Done: [Product Specification v0.2](InferenceOS%20-%20Product%20Specification%20%28v0.2%29.docx) |
| 2. Design | 4–5 | 🟡 In progress: Google Stitch screens, [design system](docs/design/DESIGN.md) |
| 3. Architecture | 6–7 | 🟡 Defined in the spec and [CLAUDE.md](CLAUDE.md), not built yet |
| 4. Setup | 8–9 | 🟡 Repo and branches created; app scaffold not started |
| 5. AI Integration | 10–12 | ⏳ Planned |
| 6. Development | 13–15 | ⏳ Planned |
| 7. Deployment | 16–18 | ⏳ Planned |

**There is no application code in this repository yet.** The installation and usage sections below describe the planned setup, defined in the spec and `CLAUDE.md`. They will be updated as the code lands.

---

## Features

### V1: Must Have

| Feature | What it does | Done when |
|---|---|---|
| **Secure accounts** | Email and password sign-in; every record belongs to one user | No user can read or change another user's data, enforced by the database |
| **Portfolios and accounts** | Several portfolios, each with USD or ILS broker accounts | Switching portfolio, or the Total view, updates every screen |
| **Transaction ledger** | Buy, Sell, Deposit, Withdrawal, Dividend (gross plus withholding), Fee | Cash and holdings recalculate after every save, edit or delete |
| **Holdings** | Shares, average cost, market value, unrealized and realized P&L, weight | Match the broker statement within **$1** |
| **Market prices** | Automatic mock prices for every held symbol | Refreshed every 2 minutes in US market hours, each with an "as of" time |
| **Dashboard** | Net liquidity, cash, invested, day P&L, unrealized P&L, time-weighted return (TWR), top movers | Deposits and withdrawals never count as profit |
| **USD / ILS switch** | Every value in either currency | One click converts the whole app at the daily rate |
| **Scenario Book** | Buy ladders: three rung types, a hard cap per company, funding classes, a cash check | Shows total spend, projected cash and worst-case weight before any order exists |
| **Orders** | Every order from Draft to Filled, grouped by company and status | A fill books the matching transaction in one step |
| **Find the Dip** | Every holding ranked by distance from its 200-week and 200-day moving averages | One screen sorted from "Very Cheap" to "Above MA" |

### V1.1: Next

- **Research:** side-by-side comparison of up to four companies, fundamentals, and an investment thesis and conviction level per company
- **Rebalance:** drift by holding and by sector, a What-If mode, and draft orders from the plan
- **Dividends:** received and upcoming payments, withholding, a forward 12-month estimate
- **Alerts:** inbox for moving-average and target-price alerts
- **Analytics:** monthly returns, drawdown, volatility, Sharpe ratio
- **Broker CSV import:** with a preview, duplicate detection and warnings
- Tablet layout and keyboard shortcuts

### Out of scope for V1

Placing or cancelling orders at a broker · storing broker credentials · investment advice or automated trading · tax reports · payments and subscriptions · languages other than English · crypto, bonds and options · native mobile apps.

---

## How it works

### Core flow: login → action → result

```
SET UP      Sign in → Get started checklist → Create portfolio + account → Record first deposit
PLAN        Add company + hard cap → Add rungs → BREACH? → adjust → Send to Orders
EXECUTE     Draft → mark Submitted (after placing at the broker) → Working → Fill
RESULT      BUY booked to the ledger → Holdings, Cash and Dashboard update instantly
```

### Architecture

```
Browser (React SPA, TypeScript)
  │  Supabase client + user JWT
  ├──► PostgreSQL (Supabase): row-level security filters every query to the owner's rows
  │
  └──► Edge Functions (Deno): verify the JWT first
          └─► Mock market data: invented prices, history, splits, dividends, USD/ILS
Hosting: Vercel · Source: GitHub
```

### Guiding principles

1. **The ledger is the single source of truth.** Holdings, cash and returns are always derived by replaying transactions, never typed in.
2. **Financial math is deterministic and tested.** It lives in pure functions with hand-calculated test cases.
3. **Plan and track, never execute.** Orders are placed by the user at the broker.
4. **Trust in the numbers.** Every price shows its "as of" time. A Health Center reports freshness, and a reconciliation view compares the ledger with the broker statement.

---

## Tech stack

| Layer | Choice |
|---|---|
| Language | TypeScript, end to end |
| Frontend | React 18, Vite, React Router 6, TanStack Query 5 |
| UI | shadcn/ui on Radix UI, Tailwind CSS, Recharts, Lucide icons |
| Forms | React Hook Form + Zod |
| Backend | Supabase: PostgreSQL with row-level security, Auth, Edge Functions |
| Market data | Mock data module |
| Testing | Vitest, Testing Library, jsdom |
| Quality | ESLint, TypeScript compiler |
| Hosting | Vercel (preview deployment per branch) |
| Design | Google Stitch |
| AI tooling | Claude Code (development); Python, CrewAI and MCP (future AI layer) |

---

## Repository structure

**Today:**

```
.
├── README.md
├── CLAUDE.md                                         # Working rules for Claude Code: scope, financial rules, open decisions
├── InferenceOS - Product Specification (v0.2).docx   # Source of truth for the product
├── docs/
│   ├── decisions.md                                  # Decisions made after the spec
│   └── design/
│       ├── DESIGN.md                                 # Design system: tokens, components, states, copy rules
│       └── reference/
│           ├── transactions.html                     # Corrected Transactions screen (HTML reference)
│           └── transactions.png
└── .gitignore
```

**Planned** (see [CLAUDE.md §8](CLAUDE.md)):

```
src/
├── app/          # router, providers, app shell
├── pages/        # one lazily loaded folder per screen
├── engine/       # PURE financial logic: ledger, performance, scenario, orders, scanner, fx
├── data/         # Supabase client, query hooks
├── components/   # shared UI (KpiTile, MoneyCell, ZoneBadge…)
└── lib/          # formatting, dates, Zod schemas
supabase/
├── migrations/   # every schema change, versioned
├── functions/    # the 14 Edge Functions
└── tests/        # RLS coverage and two-user isolation
```

---

## Installation

### Read the project today

```bash
git clone https://github.com/Arisck007/InferenceOS.git
```

```bash
cd InferenceOS
```

Start with this README, then [`CLAUDE.md`](CLAUDE.md) for the full rules, then [`docs/design/DESIGN.md`](docs/design/DESIGN.md) for the UI.

### Development setup (planned)

> These steps will work once the app scaffold (Phase 4) is in place.

**Prerequisites:** Node.js 20 LTS or newer, npm, the [Supabase CLI](https://supabase.com/docs/guides/cli), Docker (for local Supabase), and a Git client.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file from the template. It holds public values only:

   ```bash
   cp .env.example .env
   ```

   ```dotenv
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=<from `supabase start` output>
   ```

3. Start local Supabase and apply all migrations:

   ```bash
   supabase start
   ```

   ```bash
   supabase db reset
   ```

4. Run the Edge Functions and the app:

   ```bash
   supabase functions serve
   ```

   ```bash
   npm run dev
   ```

### Planned scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Production build |
| `npm test` | Run Vitest unit and integration tests |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |

---

## Usage examples

### 1. Build a buy ladder with a guardrail (the canonical case)

Daniel has a **net liquidity of $100,000** and **$12,000** in cash. He owns **50 ADBE shares at $150**, and ADBE's 200-week moving average is **$120**.

In the **Scenario Book** he adds ADBE with a **20% hard cap** and three rungs:

| Rung | Limit | Shares | Spend | Cumulative shares | Worst-case weight |
|---|---|---|---|---|---|
| Buy Point | $140.00 | 20 | $2,800 | 70 | 10.5% |
| Lower Buy Point | $125.00 | 30 | $3,750 | 100 | 15.0% |
| Deep Technical Target | $110.00 | 40 | $4,400 | 140 | **21.0% → BREACH** |

**Total spend $10,950 · projected cash $1,050.** The third rung pushes ADBE past its cap, so **Send to Orders** stays disabled.

He lowers the third rung to **30 shares**:

| | Before | After |
|---|---|---|
| Total spend | $10,950 | **$9,850** |
| Projected cash | $1,050 | **$2,150** |
| Worst-case weight | 21.0% (BREACH) | **19.5% (OK)** |

He sends the rungs to Orders, places them at his broker, and marks them **Submitted**. When the first rung fills, he clicks **Fill**. InferenceOS books `BUY 20 ADBE @ $140.00`, and holdings, cash and the Dashboard update at once.

> This case is the required test fixture for the Scenario Book engine ([CLAUDE.md §5.5](CLAUDE.md)).

### 2. Record a dividend correctly

A dividend stores the **gross** amount and the **tax withheld**. Cash receives the **net**:

```
DIVIDEND  MSFT   gross $41.50   tax withheld $10.38 (25% default for Israeli residents)   →   cash +$31.12
```

### 3. See true performance

Deposits and withdrawals are external flows. The Dashboard's **time-weighted return** removes them, so a $12,000 deposit never shows up as a gain.

### 4. Find holdings near a buy zone

**Find the Dip** ranks every holding by its distance from the 50-, 100- and 200-day and 200-week moving averages. It groups them into zones: Very Cheap, Cheap, Near MA, Below MA and Above MA. The thresholds are your own settings. The zones are **measurements, not recommendations**.

---

## Design system

The interface style is **"trading terminal, made calm"**: dense with data, quiet in color, so that profit, loss and warnings stand out.

| Token | Value |
|---|---|
| Canvas / Card / Sidebar | `#1B1F2A` / `#2A2F3B` / `#12141C` |
| Brand | `#3C83F6` |
| Profit / Loss / Warning | `#22C35D` / `#F0425F` / `#F5A524` |
| Type | Space Grotesk (headings) · Plus Jakarta Sans (body) · **DM Mono (every number)** |
| Shape | 0.9rem cards, inputs and dialogs · 10px buttons · 6px badges |

Rules that matter most:
- Color never carries meaning alone; it always comes with a sign or a label.
- Numbers are never cut off.
- Every page has the disclaimer footer.

The full specification is in [`docs/design/DESIGN.md`](docs/design/DESIGN.md). High-fidelity screens, the Core User Flow board, the Component Library and the Interface States board live in the Google Stitch project "InferenceOS Investment Portfolio Terminal" (see [CLAUDE.md §11.7](CLAUDE.md)).

---

## Roadmap

- [x] Product specification v0.2, with problem validation, business model and success metrics
- [x] `CLAUDE.md` working rules and the open-decisions list
- [x] Design system and core-flow screens in Google Stitch
- [ ] Settle the open decisions ([CLAUDE.md §15](CLAUDE.md)): FX conversion transactions, the executed price on fills, partial fills, the worst-case convention
- [ ] Phase 4: scaffold the app, Supabase project, migrations and CI
- [ ] Phase 6: build the V1 features in this order: schema + RLS → auth and shell → ledger engine → holdings and prices → Dashboard → USD/ILS → Scenario Book → Orders → Find the Dip → Health Center
- [ ] Pilot with 20–30 analytical investors
- [ ] Phase 5: AI analyst crew (CrewAI) and an InferenceOS MCP server, read-only

**Pilot targets:** ≥ 60% weekly retention at week 8 · ≥ 3 hours saved per user per month · ≥ 40% build a ladder · ≥ 5% upgrade from free to Pro · fewer than 5% of users report a mismatch with their broker.

---

## Contributing

### Branching

| Branch | Purpose |
|---|---|
| `main` | Production. Changes reach it only through a pull request from `dev`. |
| `dev` | Integration and pre-release testing. Has its own Vercel preview. |
| `feature/<short-name>`, `fix/<short-name>` | One feature or fix each, branched from `dev`. |

```bash
git switch dev
```

```bash
git pull
```

```bash
git switch -c feature/scenario-book-engine
```

Open the pull request into **`dev`**. Once it has been checked there, a release pull request goes from `dev` into `main`.

### Rules for every change

1. **One feature or fix per pull request**, with its tests in the same change.
2. **Financial math needs hand-calculated tests.** Expected values are written as literals, with the arithmetic in a comment, and never computed with the function under test.
3. **Every user table has row-level security.** A table without RLS blocks the release.
4. **No secrets in the repository or in client code, and mock market data only.** Never commit a `.env` file or a real portfolio.
5. **Schema changes only through new files in `supabase/migrations/`.** Never edit a migration that has already been applied.
6. **Copy rules:** never present a signal as a recommendation, and never use the words "advice", "alpha" or "buy now" in the UI.
7. Before you push, tests, lint and type-check must all pass.

### Commit messages

Use the imperative mood and a short subject; add a body that explains *why*. For example:

```
Add FIFO lot replay with split adjustment

Splits before a sell must adjust open lots first, otherwise realized
P&L is overstated. Covers the "split between two buys" fixture.
```

### Working with Claude Code

This repo is set up for [Claude Code](https://claude.com/claude-code). [`CLAUDE.md`](CLAUDE.md) holds:
- the non-negotiable rules
- the financial conventions
- the open decisions that must be settled by a person, not guessed in code

Review every AI-written change as a diff before committing.

---

## Security

- Authentication through Supabase Auth with short-lived JWTs. Row-level security on every user table.
- InferenceOS **never asks for or stores** broker logins, bank details or ID numbers.
- Every connection uses HTTPS, and inputs are validated both in the browser (Zod) and in the database (constraints, enums).
- Before every release: an automated test that every user table has RLS, a check that one user can never see another's data, and a scan of the client bundle for secrets.

To report a vulnerability, use GitHub private vulnerability reporting where it is available, rather than opening a public issue.

---

## Documentation

| Document | What's inside |
|---|---|
| [Product Specification v0.2](InferenceOS%20-%20Product%20Specification%20%28v0.2%29.docx) | Problem, users, MVP, UX journeys, UI, architecture, business model, success metrics |
| [CLAUDE.md](CLAUDE.md) | Rules, glossary, financial engine, data model, security, testing, open decisions |
| [docs/decisions.md](docs/decisions.md) | Decisions made after the spec, with reasons |
| [docs/design/DESIGN.md](docs/design/DESIGN.md) | Design tokens, components, badge families, interface states, copy rules |
| [docs/design/reference/](docs/design/reference/) | Corrected screen references |

---

## License

No license has been chosen yet. Until one is added, all rights are reserved by the author.

---

<sub>InferenceOS is a planning and tracking tool, not investment advice.</sub>
