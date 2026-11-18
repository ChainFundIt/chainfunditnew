# Collections checkout: optional ChainFundIt support & fee coverage

**Product design draft**  
**Status:** For review — not implemented  
**Last updated:** 18 November 2026  
**Audience:** Product, engineering, operations, legal/compliance  

---

## Summary

We want a **Collctiv-style optional “Support ChainFundIt”** step in the **collections** payment flow. When a contributor opts in, they pay **their chosen collection amount plus the payment-provider fee**, so the **organiser receives the full contribution**. When they opt out, they pay **only the contribution amount**; fees are handled on settlement (organiser net may be lower unless we subsidise).

This document compares models, recommends a phased approach, and lists decisions needed before engineering starts. **No code has been shipped for this feature yet.**

---

## Reference UX (Collctiv)

Collctiv places an expandable **“Support [Platform]”** block after amount/identity and before card payment:

- Closed row: label + optional fee preview + help icon  
- Open panel: thank-you copy, **Yes** (preferred / highlighted), **Not this time**  
- Live breakdown: contribution, platform support fee, **total**  
- Copy emphasises: **organiser still gets the full contribution**

We would adapt layout to ChainFundIt (brand greens, existing `Button` / `rounded-3xl` patterns), not copy purple styling or exact wording.

---

## What we are optimising for

| Goal | Why it matters |
|------|----------------|
| **Organiser trust** | “£5 from Sam” should mean £5 toward the goal when supporters opt in |
| **Contributor clarity** | Total charge obvious before Paystack/PayPal |
| **Platform sustainability** | Processing and operations funded without surprising organisers |
| **Low friction** | One tap to decline; no lengthy fee explanations |

---

## The core tension

```
Contributor opts OUT
  Pays: collection amount only
  Pot records: full contribution (marketing)
  Organiser may receive: contribution minus fees (at payout/settlement)

Contributor opts IN ("support ChainFundIt")
  Pays: collection amount + payment-provider fee (+ optional platform tip later)
  Organiser receives: full contribution
  Fees: largely paid by contributor add-on
```

**Contributor inconvenience:** higher total, extra line items.  
**Collector inconvenience:** if fees always come from the pot, small contributions and fee-heavy methods erode the goal.

The feature should make **who pays fees** explicit at checkout, not only in payout screens.

---

## Fee components (definitions)

| Component | Recipient | Notes |
|-----------|-----------|--------|
| **Collection amount** | Organiser’s collection pot | Public “raised” should use this amount when opted in |
| **Payment provider fee** | Paystack / PayPal | % and/or fixed; varies by currency and method |
| **Platform support / tip** | ChainFundIt | Optional add-on (Collctiv-style); can be phase 2 |
| **Platform fee (%)** | ChainFundIt | May still apply on payout for campaigns today; collections policy TBD |

**Proposed rule (phase 1):** If the contributor **supports ChainFundIt**, charge **collection amount + estimated provider fee**. Platform tip is **out of scope** until phase 2.

---

## Implementation models

### Model 1 — Donor covers processing only (when opt-in)

| | Opt in | Opt out |
|---|--------|---------|
| **Charge** | Contribution + estimated provider fee | Contribution only |
| **Organiser (target)** | Full contribution | Full contribution in UI; net after fees at settlement |
| **ChainFundIt** | Less fee leakage from pot on opt-in | May rely on payout-time platform % |

**Pros:** Matches “provider fee + collection when supporting”; simpler than three line items.  
**Cons:** Opt-out still reduces organiser net unless we subsidise or accept lower net.

---

### Model 2 — Donor covers processing + platform tip (Collctiv-style)

| | Opt in | Opt out |
|---|--------|---------|
| **Charge** | Contribution + provider fee + platform tip (fixed or %) | Contribution only |

**Pros:** Clear sustainability story; familiar pattern.  
**Cons:** More UI and reconciliation; refunds more complex.

---

### Model 3 — Everyone pays provider fee; tip optional

| | All contributors |
|---|------------------|
| **Charge** | Contribution + provider fee always |
| **Optional** | + platform tip if “Yes” |

**Pros:** Organisers always get full contribution in the pot.  
**Cons:** Highest checkout friction; painful for very small amounts.

---

## Recommended approach

### Phase 1 (collections only): Model 1 + Collctiv-style UI

1. **Placement:** After amount + contributor details, before payment method / PayPal / Paystack.  
2. **Opt in:** Charge **contribution + estimated provider fee**; credit **contribution only** to `total_raised` / organiser-facing totals.  
3. **Opt out:** Charge **contribution only**; record fees as taken from contribution or at settlement (reporting TBD).  
4. **Copy:** Organiser name + “they still get your full [amount]” when opted in.  
5. **Default selection:** Product/legal decision (see open questions).  

### Phase 2

Add **optional platform tip** on top of phase 1 for contributors who opted in (Model 2 tip line only).

---

## Proposed checkout UI

**Collapsed**

- Label: `Support ChainFundIt`  
- Subtext when Yes: `+£X.XX` (estimated fee)  
- Help (`?`): short tooltip — fees, organiser still gets full amount when opted in  

**Expanded**

- **Thank you** — one paragraph (community + organiser name).  
- **Yes** — “Cover payment fees for [Organiser]” + fee amount.  
- **Not this time** — neutral decline (“We understand if you can’t”).  

**Summary (when amount selected)**

```text
Contribution to [Organiser name]     £50.00
Payment processing                   £ 1.25   (shown only if supporting)
─────────────────────────────────────────────
Total                                  £51.25
```

Checkbox **“Hide my name from public view”** can remain above this block (already on collection page).

---

## Data model (when implemented)

Store on each **collection contribution** (conceptual fields):

| Field | Purpose |
|-------|---------|
| `amount` | Amount credited to the collection (organiser-facing) |
| `total_charged` | Amount sent to PSP |
| `support_chainfundit` | boolean |
| `provider_fee_amount` | Estimated at checkout; reconciled on webhook where possible |
| `platform_tip_amount` | Phase 2 |
| `fee_paid_by` | `contributor` \| `collection` |

**Webhooks:** Prefer **actual** fees from Paystack/PayPal when available; do not change public contribution amount post-hoc.

---

## Fee calculation

- Reuse or align with existing provider fee logic (e.g. payout fee config) for **estimates** at checkout.  
- **Per method / currency:** Paystack (NGN), PayPal (GBP/USD/EUR), etc.  
- **Rounding:** Minor units (2 dp vs integer NGN).  
- **Add-on (recommended):** User picks £50 → fee computed on £50 → total = £50 + fee.  
- **Gross-up (optional later):** “Organiser must receive £50” → solve total; harder to explain in UI.

---

## Edge cases

| Case | Consideration |
|------|----------------|
| Small amounts | £1 + fixed fee feels harsh — minimum contribution or fee waiver under threshold |
| Refunds | Refund `total_charged` or contribution only; partial refunds |
| PayPal vs Paystack | Different fee structures; estimates must match what we charge |
| Failed payments | Do not increment `total_raised` |
| Anonymous + support | Same economics; receipt email still shows breakdown |
| Campaigns later | Reuse component vs collections-only experiment |

---

## Open decisions (sign-off checklist)

- [ ] **Default:** “Yes” vs “Not this time” at first visit  
- [ ] **Opt out:** Does organiser dashboard show gross raised, net-after-fees, or both?  
- [ ] **Platform fee on collections:** Payout-time % only, or also contributor tip in phase 2?  
- [ ] **Subsidise fees** on opt-out for launch (marketing cost) — yes/no  
- [ ] **Receipt / email** wording for personal collections vs charity-linked flows  
- [ ] **Legal:** Consumer-facing fee disclosure per market (UK, NG, etc.)  
- [ ] **Analytics:** Events for `support_opt_in`, `support_opt_out`, abandonment  

---

## Engineering touchpoints (future)

When approved, work likely spans:

- Collection checkout UI (`app/collections/[slug]/page.tsx`)  
- `POST /api/collections/[id]/payment-intent` — charge correct **total**  
- `collection_contributions` schema + webhooks (`verify-payment`, Paystack route)  
- Display rules for `total_raised` vs fees  
- Optional shared helper: `estimateCollectionCheckoutFees(amount, currency, method, supportOptIn)`  

---

## Related context

- Collections payments today charge a single **amount** with no checkout fee breakdown.  
- Campaign **payout** flows already reason about platform % and provider % (organiser side).  
- This feature shifts **some** of that narrative to **contributor checkout** for collections.

---

## Document history

| Date | Change |
|------|--------|
| 2026-11-18 | Initial draft from product/design discussion |

---

*Questions or comments: share this doc with annotations or open a ticket referencing **Collections — ChainFundIt support & fees**.*