# POS UI adjustments — plan

Six adjustments to `apps/pos`. Plan only; no implementation until you say go.

## Confirmed decisions

- **Item 1 — Save model:** *Fully local until Save.* Ticket edits live in the browser; nothing is written to the backend until **Save** is clicked. No draft order is created and the table shows no open bill until then.
- **Item 3 — Card actions:** *Only Open table / Reserve / Close* appear as buttons. Every other action lives in the kebab (⋮). An OCCUPIED/JOINED card shows only the kebab.

## Constraints discovered

- The Terminal (`TerminalView.vue`) currently **auto-saves every tap**: `add()` → `orders.addItem`, `setQty()` → `orders.updateItem`, `removeLine()` → `orders.removeItem`. Each call returns the full `Transaction`.
- The backend has **no bulk save**: no `PUT /orders/{id}`, no "replace all items", and `customerInfo` can only be set at creation (`POST /orders`, `POST /tables/{id}/open`). Saving a cart = create if absent, then reconcile line diffs.
- Only `DRAFT` orders are mutable; server recomputes `taxAmount`/`totalAmount` on every item mutation.
- `POST /tables/{id}/release` is immediate, **no server-side confirmation**, and it sends the table to **CLEANING** (not AVAILABLE). It cancels any open DRAFT bill.
- **Icon library available:** `@primevue/icons@4.1.1` ships transitively with PrimeVue 4 (already in `package-lock.json`). It exposes SVG Vue components (`pencil`, `trash`, `times`, `plus`, `check`, `ban`, `refresh`, …), 14×14, `fill: currentColor`. It has **no kebab/ellipsis icon**, so ⋮ needs a tiny inline SVG. `primeicons` is **not** installed.

---

## Item 1 — Terminal: stage the ticket locally, persist on Save

**File:** `src/views/TerminalView.vue` (main change).

Replace the server-coupled `lines` with a local cart:

```
const cart = ref([])            // [{ menuItemId, name, unitPrice, quantity }]
const dirty = ref(false)        // unsaved local edits
```

- **Tap menu item** → increment the matching cart line (create at qty 1). No network.
- **+/−** → mutate the cart line locally. `−` at qty 1 removes the line.
- `lines`, `subtotal`, `tax`, `total` are computed from the **cart** + the order's tax rate, so the ticket totals update instantly and offline.
- **Save button** (new, primary, next to Settle) → `saveCart()`:
  1. If no `order` yet: `order = await orders.create(customerInfo)`.
  2. Diff local cart against `order.items` by `menuItemId`:
     - in cart, not on server → `orders.addItem(order.id, menuItemId, qty)`
     - on server, qty differs → `orders.updateItem(order.id, line.id, qty)`
     - on server, not in cart → `orders.removeItem(order.id, line.id)`
  3. Re-fetch `order = await orders.get(order.id)` (several calls each return a snapshot; refetch is cleanest), `dirty = false`.
- **Settle** → if `dirty`, run `saveCart()` first, then `orders.complete(...)` (settlement needs a server order id). Button label reflects this ("Save & settle" when dirty).
- **Unsaved-changes guard** → `onBeforeRouteLeave` + `beforeunload` while `dirty`; prompt "Discard unsaved changes to this ticket?".
- **New** → resets cart + order + dirty (with the same guard).
- Customer/table field: editable only while no order exists (as today); used at create time.

**Table flow (unchanged, by design):** the Tables view *Open table* action still calls `tables.open()` (an explicit action that creates the draft and seats the table) and navigates with `?order=<id>`. That order is edited with the same buffer-until-Save semantics.

**Open detail to confirm:** whether the customer field should also be editable before an order exists *and* carry into Save — with "fully local until Save" it simply feeds `orders.create`.

---

## Item 2 — Menu: text actions become icons

**Files:** `src/views/MenuView.vue`, `src/assets/main.css`, `package.json`.

- Add `@primevue/icons": "^4.1.1"` as an explicit dependency (it's already resolved transitively; declaring it removes reliance on a transitive dep).
- Items table actions: **Edit → `Pencil`**, **Remove → `Trash`** (`text-ember` on hover). Category **Retire → `Ban`**.
- Icons imported per-icon: `import Pencil from '@primevue/icons/pencil'`.
- Add a modifier to the design system in `main.css` (keeps the app's own button system, no PrimeVue Button component):

  ```css
  .btn-icon {
    @apply inline-flex items-center justify-center h-8 w-8 rounded-card border border-transparent
      text-ink-2 transition-colors hover:bg-paper-2 hover:border-line hover:text-ink
      disabled:opacity-40 disabled:pointer-events-none;
  }
  .btn-icon-danger { @apply hover:text-ember; }
  ```

- Each icon button carries `aria-label` and `title` (accessible name + tooltip), since there is no visible text.

---

## Item 3 — Table cards: Open / Reserve / Close inline, rest in kebab

**File:** `src/views/TablesView.vue`.

Visible buttons (each conditional, as today's conditions):

| Button | Shown when |
|---|---|
| Open table | `AVAILABLE`, `RESERVED` |
| Reserve | `AVAILABLE` |
| Close | `AVAILABLE`, `RESERVED`, `CLEANING` |

Kebab (⋮) dropdown — shown when at least one applies:

- Unreserve (`RESERVED`)
- Take order (`OCCUPIED`/`JOINED` with `currentTransactionId`)
- Join… (`AVAILABLE`/`RESERVED`/`OCCUPIED`)
- Unjoin (`JOINED`)
- Release (`OCCUPIED`)
- Mark ready (`CLEANING`)
- Return to service (`OUT_OF_SERVICE`)
- Rename / Remove (canEdit && no open bill && `AVAILABLE`/`RESERVED`/`CLEANING`)

Implementation:

- Tiny inline **kebab SVG** (three dots) — `@primevue/icons` has no ellipsis icon. Either inline in the template or a small `components/KebabIcon.vue`.
- Menu state: `openMenuId = ref(null)`; positioned `absolute` under the trigger; closes on outside click, `Escape`, route change, and after any action runs.
- Menu item styling reuses `.btn-ghost`-like rows (left-aligned, full width, `text-sm`, destructive ones in `text-ember`).

---

## Item 4 — Table cards: larger

**File:** `src/views/TablesView.vue` (card markup + grid).

- Card: `p-4` → `p-5`, add `min-h-[210px]`, more vertical rhythm between name / bill / actions.
- Table name: `text-3xl` → `text-4xl`; status hint bumped from `text-[10px]` → `text-[11px]`.
- Open-bill row: `text-sm` → `text-base`.
- Grid: drop the 4-column tier so cards stay big — `sm:grid-cols-2 lg:grid-cols-3` (remove `xl:grid-cols-4`), `gap-4` → `gap-5`.
- Action row: keep `flex-wrap`; primary button slightly taller so the card reads as a bigger target.

---

## Item 5 — Tables page: bigger status summary

**File:** `src/views/TablesView.vue` (header legend).

- Legend text `mono text-[10px] tracking-widest` → `text-xs` (or `text-sm`) with reduced tracking; dots `h-2 w-2` → `h-2.5 w-2.5`; container `gap-4` → `gap-5`. Keep the md-and-up visibility and the `STATUS · count` format.

---

## Item 6 — Confirm before releasing an occupied table

**File:** `src/views/TablesView.vue`.

- `releaseTable(t)` no longer fires immediately: it opens an in-app confirmation modal (same `plate` modal pattern as the Join/Add dialogs) — "Release **T3**? Its open bill will be cancelled and the table goes to Cleaning." → **Release table** / **Cancel**.
- Chosen over `window.confirm` for visual consistency with the existing Join/Add modals; destructive action styled `btn-ember`.
- Release is now reached from the kebab (Item 3); the modal opens after the menu closes.

---

## Cross-cutting

- **Icons:** `@primevue/icons` where a matching icon exists; inline SVG for ⋮. No new icon font.
- **Design system:** all new controls reuse existing tokens/classes (`plate`, `btn`, `tag`, `.field`); only additive classes in `main.css`.
- **No backend change** is required for any of the six items.

## Verification

1. `npm run build` in `apps/pos` (must pass).
2. Run the app against the local backend and exercise: stage/undo unsaved ticket, Save create + Save reconcile, Save-and-settle, leave-with-unsaved guard; Menu icon actions; every table status's inline buttons + kebab contents; release confirmation; larger cards/legend at sm/lg widths.
3. Capture a screenshot of each affected page (Terminal, Menu, Tables — each table status, plus the release dialog and open kebab) into an `evidence/` folder as the visual deliverable.
4. Run an independent verifier pass over the diff before calling it done.

## Out of scope

- Backend endpoints (no bulk-save / draft-customer-update added).
- `OrderDetailView` settle/cancel flow.
- Changing `window.confirm` on Remove table.
