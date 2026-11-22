# Decisions

Technical decisions made after Product Specification v0.2, newest first.

## 2026-11-22: Currency conversion transactions

**Decision:** The ledger has an `FX_CONVERSION` transaction type with the amounts in both currencies and a fee.

**Rationale:** Users deposit ILS and convert to USD. Without a conversion record, USD cash cannot match the broker statement. A conversion is not an external flow, so it does not affect returns as a deposit would.

## 2026-11-22: Executed price and fees on fills

**Decision:** Filling an order asks for the executed price, which defaults to the limit price and can be edited, and for fees.

**Rationale:** A limit order can fill at a better price than its limit, and the booked cost must match the execution.

## 2026-11-22: Partial fills

**Decision:** Each fill books a transaction for the executed shares. The order stays Partially Filled until no shares remain.

**Rationale:** The ledger always matches what was executed, and the open remainder stays visible.

## 2026-11-22: One status before submission

**Decision:** Draft and Planned orders are one status, Draft.

**Rationale:** The two statuses had no defined difference.

## 2026-11-22: Exact decimal arithmetic

**Decision:** Money, prices and share counts are calculated with `decimal.js`.

**Rationale:** Binary floating-point numbers cannot represent most decimal amounts exactly, and rounding errors add up across a ledger.
