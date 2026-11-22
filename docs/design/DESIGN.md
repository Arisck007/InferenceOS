---
name: InferenceOS
colors:
  # Brand surfaces (from spec v0.2, Step 5)
  canvas: '#1B1F2A'
  card: '#2A2F3B'
  sidebar: '#12141C'
  overlay: '#2F3543'
  hover: '#333948'
  border: '#3A4050'
  border-strong: '#485064'
  scrim: '#0D0F14'
  # Brand + meaning
  brand: '#3C83F6'
  brand-hover: '#2563EB'
  profit: '#22C35D'
  loss: '#F0425F'
  warning: '#F5A524'
  # Text tiers
  text-primary: '#F3F4F6'
  text-secondary: '#9CA3AF'
  text-muted: '#6B7280'
  # Material roles used by Stitch
  surface: '#0f131e'
  surface-container: '#1b1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313440'
  on-surface: '#dfe2f1'
  on-surface-variant: '#c2c6d6'
  outline: '#8c909f'
  outline-variant: '#424753'
  primary: '#adc6ff'
  primary-container: '#4c8eff'
  secondary: '#4ce177'
  secondary-container: '#00b652'
  tertiary: '#ffb2b7'
  tertiary-container: '#ff506b'
  error: '#ffb4ab'
  background: '#0f131e'
  on-background: '#dfe2f1'
typography:
  headline-xl: { fontFamily: Space Grotesk, fontSize: 36px, fontWeight: '600', lineHeight: 44px, letterSpacing: -0.02em }
  headline-lg: { fontFamily: Space Grotesk, fontSize: 24px, fontWeight: '600', lineHeight: 32px, letterSpacing: -0.01em }
  headline-md: { fontFamily: Space Grotesk, fontSize: 18px, fontWeight: '500', lineHeight: 26px, letterSpacing: -0.01em }
  body-lg: { fontFamily: Plus Jakarta Sans, fontSize: 16px, fontWeight: '400', lineHeight: 24px }
  body-md: { fontFamily: Plus Jakarta Sans, fontSize: 14px, fontWeight: '400', lineHeight: 20px }
  body-sm: { fontFamily: Plus Jakarta Sans, fontSize: 12px, fontWeight: '400', lineHeight: 18px }
  label-md: { fontFamily: Plus Jakarta Sans, fontSize: 12px, fontWeight: '600', lineHeight: 16px, letterSpacing: 0.04em }
  label-sm: { fontFamily: Plus Jakarta Sans, fontSize: 11px, fontWeight: '500', lineHeight: 14px, letterSpacing: 0.02em }
  metric-xl: { fontFamily: DM Mono, fontSize: 32px, fontWeight: '500', lineHeight: 40px, letterSpacing: -0.02em }
  metric-lg: { fontFamily: DM Mono, fontSize: 20px, fontWeight: '500', lineHeight: 28px, letterSpacing: -0.01em }
  metric-md: { fontFamily: DM Mono, fontSize: 14px, fontWeight: '400', lineHeight: 20px }
rounded:
  badge: 0.375rem     # 6px  badges, pills, chips
  control: 0.625rem   # 10px buttons, segmented controls
  DEFAULT: 0.9rem     # spec: cards, inputs, dialogs, sheets
  full: 9999px
spacing:
  grid: 8px
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  gutter-desktop: 1.5rem
  margin-desktop: 2rem
---

# InferenceOS Design System — "Trading terminal, made calm"

Dense with data but quiet in color, so that profit, loss and warnings stand out. Source: Product Specification v0.2, Step 5, and `CLAUDE.md` §11.

## 1. Brand

- **Wordmark:** the text "InferenceOS" in Space Grotesk 600, with the tagline "From data to decisions" in label-sm, secondary text color. **Never use an image logo** in the app shell. A small 8px brand-blue dot may follow the wordmark.
- **Tone:** methodical, exact, calm. No hype, no trading slang ("alpha", "pod", "desk", "telemetry"). Plain words a physician investor understands.

## 2. Color rules

- Surfaces: page canvas `#1B1F2A`, cards `#2A2F3B` with a `1px #3A4050` border, sidebar `#12141C`, popovers, sheets and dialogs `#2F3543` with border `#485064` and shadow `0 8px 24px rgba(0,0,0,.45)`, modal scrim `#0D0F14` at 70%.
- Brand blue `#3C83F6` only for: primary buttons, links, focus rings, the active nav item, the selected tab or segment, and chart lines.
- Meaning colors: profit `#22C35D`, loss `#F0425F`, warning amber `#F5A524`.
- **Color never carries meaning alone.** Always pair it with a sign (`+1.24%`, `−$412.00`) or a word label (`BREACH`, `Cheap`).
- Text: primary `#F3F4F6`, secondary `#9CA3AF`, muted `#6B7280`. Contrast must meet WCAG AA on the dark theme.

## 3. Typography

- Space Grotesk: page titles, card titles.
- Plus Jakarta Sans: body text, labels, navigation, buttons.
- **DM Mono: every number** (money, shares, %, dates in tables, times), with tabular figures.
- Numbers: currency symbol on every value, thousands separators, percentages to 2 decimals (1 decimal is allowed for weights in dense tables), a real minus sign `−`.
- **Numbers are never truncated or ellipsized.** If a value does not fit, the tile grows, wraps to a new row, or the font steps down one level.

## 4. Layout

- Desktop first, 1280px and wider. 8px grid.
- Shell: fixed 240px sidebar in four groups (DASHBOARD · PORTFOLIO · INTELLIGENCE · SYSTEM), plus a 56px global top bar: portfolio selector (single line, never wraps), USD | ILS segmented toggle, global search "Search tickers… Ctrl K", health badge, alerts bell, avatar.
- Page: header (title, one-line description, primary action at top right) → KPI row → main content.
- Inspectors and edit forms open as a **right side sheet** (420px), so page context is never lost.
- Footer on every page: "InferenceOS is a planning and tracking tool, not investment advice."
- Sample data uses 2026 dates and the user "Daniel K."

## 5. Components

### Buttons
| Variant | Style |
|---|---|
| Primary | `#3C83F6` fill, white text, 10px radius; hover `#2563EB`; 2px offset focus ring |
| Secondary | `#2A2F3B` fill, `1px #3A4050` border, primary text; hover `#333948` |
| Destructive | `#F0425F` text on a transparent fill, or a solid red fill inside confirmation dialogs only |
| Ghost / icon | Transparent; icon-only buttons always have an accessible label and a tooltip |
| Disabled | 50% opacity, `not-allowed` cursor, a tooltip explaining why |

### Inputs
42px height, `#1B1F2A` fill, `1px #3A4050` border, 0.9rem radius. Labels in label-md caps. Numeric values in DM Mono, right-aligned, with a unit suffix ($, shs, %). Focus border is brand blue. Error state: red border, an error icon and helper text below ("Name too short").

### Segmented controls
Used for: transaction type (Buy · Sell · Deposit · Withdraw · Dividend · Fee), USD | ILS, rung type, size mode, chart ranges (1W · 1M · YTD · ALL).

### KPI tile
Label (label-md caps, secondary color) + info icon (popover with a one-sentence definition) → value (metric-lg or metric-xl) → sub-line (delta with sign and color, or "as of 15:42 ET"). Equal widths in a row of 5. A sixth or later tile wraps to a new row.

### Badges (6px radius, label-sm, tinted 12% background + solid text)
| Family | Values |
|---|---|
| Transaction type | BUY (blue) · SELL (red) · DEPOSIT (neutral) · WITHDRAWAL (neutral) · DIVIDEND (green) · FEE (amber) |
| Order status | Draft (neutral) · Submitted (blue) · Partially Filled (blue, half-dot) · Filled (green) · Cancelled (muted) · Failed (red) · Expired (amber) |
| Order section | Action Needed (amber) · Working (blue) · Completed (green) · Exceptions (red) |
| Ladder status | OK (green) · BREACH (red, solid) · OFF (muted) · OVERBOOKED (amber) |
| Funding class | Protected (blue outline, lock icon) · Flex (neutral) · Cancel-First (amber) |
| Rung type | Buy Point · Lower Buy Point · Deep Technical Target (8px dot: blue / amber / red before the label) |
| MA zone | Very Cheap (solid green) · Cheap (green) · Near MA (amber) · Below MA (neutral) · Above MA (muted). Tooltip: "Distance from your chosen moving average. A measurement, not a recommendation." |
| Price freshness | Live (green dot) · Last session (neutral) · Stale (amber, with "as of" time) |
| Health | Operating normally (green) · Attention (amber) |

### Tables
44px rows, 16px horizontal padding, hairline row dividers, hover `#333948`. Text left-aligned, status centered, **numbers right-aligned in DM Mono**. Company logo circle (24px) plus ticker plus muted company name. Expandable groups have a chevron and Expand all / Collapse all. The table must fit its card. If there are too many columns, hide lower-priority ones behind a column picker instead of overflowing.

### Cards
`#2A2F3B` fill, `1px #3A4050` border, 0.9rem radius, 20–24px padding. Header: Space Grotesk title on the left, actions on the right, a hairline under the header when the card holds a table.

### Side sheet / dialog
`#2F3543` fill, 0.9rem radius (left corners only for sheets), title + subtitle, body, then a sticky footer with Cancel (secondary) and the primary action on the right. Destructive dialogs state exactly what will and will not change: "Deleting this order record does not affect transactions already booked."

### Toast
Bottom-right, `#2F3543`, icon (check, warning or error) + title + one-line detail + close. Auto-dismisses after 5s.

### Info popover
A 14px info icon next to a metric. Opens a 280px popover: the definition in one sentence, then how it is calculated.

## 6. Interface states

| State | Pattern |
|---|---|
| Loading | Skeleton blocks shaped like the final content (tile, chart, rows). Never a blank screen or a full-page spinner. |
| Empty | Icon + one sentence + one primary action ("No transactions. Add your first entry.") |
| Error | Card-level message + Retry. One failing panel never breaks the page. |
| Success | Toast |
| Stale data | Amber badge with the price's "as of" time on the affected values |
| Wrong scope | A portfolio-level page in "Total (All)" shows a centered prompt with the portfolio selector inline |

## 7. Copy rules (legal positioning)

- Signals describe measurements: "12.4% below 200WMA", not "Buy now".
- Suggestions come from the user's own rules: "Based on your 20% hard cap", "From your target allocation".
- Never write "recommendation", "advice", "alpha", "signal to buy".
- AI content (future) is labeled "AI-generated analysis".
