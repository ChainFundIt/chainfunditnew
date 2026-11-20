# Collections checkout fees — executive summary

**1-page overview · 18 Nov 2026 · Not yet built**  
Full detail: [`collections-chainfundit-support-fees.md`](./collections-chainfundit-support-fees.md)

---

## What we want (decided)

Add **“Support ChainFundIt”** on **collections** checkout (Collctiv-style UI, ChainFundIt branding).

- **Yes — support ChainFundIt:** `total = contribution + processing fee + ChainFundIt fee`, where **processing % + ChainFundIt % = 5%** (e.g. provider 3.5% → ChainFundIt 1.5%). **Organiser gets full contribution.**  
- **Not this time:** `total = contribution + payment-provider fee only` (no ChainFundIt portion).

---

## Why

| Stakeholder | Benefit |
|-------------|---------|
| **Organisers** | Fewer “where did my £5 go?” moments when supporters opt in |
| **Contributors** | Clear total before Paystack/PayPal |
| **ChainFundIt** | Sustainable processing without quietly shaving every pot |

---

## Recommended plan

**Phase 1 (launch):** Opt-in **covers payment processing only** — no separate platform “tip” line yet.  
**Phase 2:** Optional small **platform tip** for contributors who already opted in.

Checkout shows a short **Yes / Not this time** panel plus a live **contribution + fee = total** breakdown.

---

## Three options (simplified)

| Approach | Contributor pays | Organiser gets |
|----------|------------------|----------------|
| **A — Opt-in covers fees** *(recommended phase 1)* | More when Yes; stated amount when No | Full amount when Yes |
| **B — Opt-in covers fees + tip** | Highest when Yes | Full amount when Yes |
| **C — Everyone pays fees** | Always amount + fees | Always full amount in pot |

We are **not** recommending C for launch — too harsh on small gifts.

---

## Decisions needed before build

1. Default selection: **Yes** or **Not this time**?  
2. When someone opts out, do we show **gross raised** only or **estimated net after fees** to organisers?  
3. Will we **subsidise fees** on opt-out at launch (marketing cost)?  
4. **Legal/copy** for UK vs Nigeria checkouts.  
5. **Collections-only** experiment or reuse on campaigns later?

---

## Next step

Sign off phase 1 scope + the five decisions above → engineering estimates payment intent, DB fields, and checkout UI.

**Status:** Design draft only — **no code shipped.**