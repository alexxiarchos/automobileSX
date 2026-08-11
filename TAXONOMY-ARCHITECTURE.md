# Make taxonomy: recommended architecture

Design only. Nothing implemented. This supersedes the earlier review where the
two differ, and it is written against the code as it actually stands.

---

## 0. The three findings that shaped this design

**Establishment cannot be derived from inventory.** Whether a page has been
indexed, when its stock last hit zero, and whether it has been written for are
facts about history, not about current stock. If the system recomputes
everything from `vehicles.json` on each publish, an indexed page silently
de-indexes the moment a car sells. This is the single most important constraint,
and it is why the design adds a small persisted state file rather than deriving
everything.

**The commit layer already supports this for free.** `commitInventory()` takes a
generic `newFiles: [{path, content}]` array, so a second state file needs no
change to `api/_lib/github.js` at all. It rides along in the same atomic commit
as the inventory and the generated pages.

**Normalization must never write back to inventory.** You require free-text make
and model. So normalization is a *read-only projection*: given the text a human
typed, compute a key, a slug and a display name. The vehicle record keeps
exactly what was typed. Nothing in the taxonomy layer ever mutates a vehicle.
That is what makes routine edits safe by construction rather than by care.

---

## 1. Recommended architecture

Confirmed: `/inventory/<make-slug>` in English and `/fr/inventaire/<make-slug>`
in French, linking to the existing `/vehicles/<id>`. Vehicle URLs are not
touched. I verified the routing works with no `vercel.json` change:
`/inventory` → 200, `/inventory/bmw` → 200, `/inventory/nope` → 404, with
`inventory.html` and an `inventory/` directory coexisting.

Four pieces:

**A normalization module**, `api/_lib/taxonomy.js`, pure and dependency-free,
shared by the page generator, the sitemap and the admin preview. Given free text
it returns `{ key, slug, display }`.

**A persisted taxonomy state file**, `data/taxonomy.json`, written in the same
commit as `data/vehicles.json`. It holds only what cannot be derived:
establishment, slug history, the zero-stock clock, and the curated copy.

**A page generator**, `api/_lib/makePage.js`, mirroring the existing
`api/_lib/vehiclePage.js`, producing fully server-rendered HTML for both
languages.

**A resolver**, `api/inventory-page.js`, mirroring `api/vehicle.js`, which serves
301s for renamed slugs and a real 404 for unknown ones.

The shape deliberately mirrors what already exists. Every mechanism here has a
working precedent in your codebase, which is the main reason I am confident it
will not destabilise anything.

---

## 2. Changes I would make to your proposal

**Replace the "3 live vehicles" gate.** A count alone is the wrong gate, in both
directions. Three templated pages are still three thin pages, and a two-car page
with 400 words of true, specific writing is a legitimate landing page. Count
measures the wrong thing.

Promotion should require **curated content in both languages, and at least two
live vehicles**. Content is the binding condition; the count is a floor. Since
writing the content is a deliberate human act, **a page can never be promoted by
accident** — which is precisely the guarantee you asked for about accidental
edits not creating indexed URLs.

**Your evergreen instinct is right, and I would formalise it as a ratchet.**
Once established, a page stays indexable through stock dips. It does not
re-evaluate the promotion rule ever again. Flapping between indexable and
noindex as cars sell is worse than either state held steadily: it wastes
recrawls, and you lose the accumulated history of a URL that has been ranking.
Demotion happens only after sustained zero stock, and even then the URL survives.

**Add IndexNow, with a caveat.** Google does not use it. Bing, Yandex and Seznam
do, and for inventory that turns over weekly it is genuinely useful there. It
must be fire-and-forget and must never be able to fail a publish.

**No model pages.** Thirteen cars, thirteen distinct models, every model holding
exactly one vehicle. There is nothing to demonstrate. I would key the state file
by `type` so a model tier can be added later with no migration, and leave it at
that.

---

## 3. The normalization layer

Two tiers, deliberately. A deterministic function handles formatting; a small
curated registry handles the cases no function can know.

### Tier 1: the key function, for formatting variants

    key(text) =
      lowercase
      → strip diacritics (Citroën → citroen)
      → replace &, +, ., ', -, / and whitespace runs with nothing
      → trim

So `BMW`, `Bmw`, `bmw`, ` bmw ` all key to `bmw`. `Mercedes-Benz`,
`Mercedes Benz`, `mercedes benz` and `MERCEDES–BENZ` all key to `mercedesbenz`.
Removing separators entirely, rather than normalising them to a hyphen, is what
makes the Mercedes variants collapse. This handles every case in your
requirement list.

The key is for **matching only**. It is never shown and never used in a URL.

### Tier 2: the registry, for identity

A table of roughly forty makes he could plausibly stock:

    { key: "mercedesbenz", slug: "mercedes-benz", display: "Mercedes-Benz",
      aliases: ["mercedes", "benz", "mb"] }
    { key: "bmw",          slug: "bmw",           display: "BMW" }
    { key: "volkswagen",   slug: "volkswagen",    display: "Volkswagen",
      aliases: ["vw"] }

The registry supplies correct casing (`BMW`, not `Bmw`), the human-readable slug
(`mercedes-benz`, not `mercedesbenz`), and aliases for strings no algorithm could
unify — `VW` and `Volkswagen` share no characters in common order, so only a
lookup can join them.

**Fallback for unknown makes.** If the key is not in the registry, the make still
works: slug is the kebab-case of the typed text, display is the typed text with
whitespace collapsed. An unknown make behaves correctly from the first vehicle;
it simply does not get curated casing. Since unknown makes are rare and will
never be promoted without someone writing copy, this is safe. Adding the make to
the registry later is a one-line change, and if that changes its slug the rename
path in section 6 covers it.

### What normalization does not do

It does not touch `vehicles.json`. The admin keeps storing whatever was typed.
If the registry improves later, pages regenerate on the next publish and no
inventory data is rewritten. This is what keeps "free text stays free text" and
"routine edits are safe" from being in tension.

### Admin feedback, not admin management

The vehicle editor shows one read-only line under the Make field: *"Groups under
`/inventory/bmw` (BMW)"*, or *"New make — will create `/inventory/genesis`"*.
That is the whole admin surface. No canonical, robots, sitemap, redirect or
schema controls are exposed, per your requirement. The line exists so a typo is
visible at the moment it is made rather than discovered in a crawl.

---

## 4. How vehicle URLs stay immutable

They already are, and the taxonomy layer adds no new coupling.

`collectForm()` in `admin/admin.js` guards with `if (!v.id)`, so the id is
generated once at first save and never regenerated. Editing make, model, year,
price, mileage, description, photos or status cannot change it. The only way a
vehicle URL moves is the deliberate Page address field, which records the old
value in `slugHistory` and 301s it.

Taxonomy membership is computed at render time from the make text. A vehicle
whose make is corrected moves from one make page to another and its breadcrumb
updates. **Its own URL does not change**, because the id never derives from the
make after creation. These two facts are independent by design, and I would add
a regression test asserting exactly that: edit every editable field on a vehicle
and assert the id is byte-identical.

---

## 5. Exact state behaviour

Three states. `pending` (exists, not indexed), `established` (indexed),
`dormant` (established but long empty).

| Transition | Page | Robots | Sitemap | Internal links | IndexNow |
|---|---|---|---|---|---|
| **0 → 1** (new make) | created, 200 | `noindex, follow` | no | inventory "browse by make" only | no |
| **1 → 2** | unchanged, still `pending` | `noindex, follow` | no | same | no |
| **2 → 3** with copy in both languages | **promoted to `established`** | `index, follow` | **added** | + footer, + breadcrumbs | **submitted** |
| **2 → 3** without copy | unchanged, stays `pending` | `noindex, follow` | no | same | no |
| **3 → 2** | unchanged, stays `established` | `index, follow` | stays | stays | no |
| **1 → 0** if `pending` | **deleted** | — | — | removed | no |
| **1 → 0** if `established` | kept, 200, `zeroSince` stamped | `index, follow` | stays | stays | no |
| **0 for 60 days** if `established` | kept, 200, → `dormant` | `noindex, follow` | removed | footer only | no |
| **0 → 1** if `dormant` | `zeroSince` cleared, → `established` | `index, follow` | re-added | restored | **submitted** |

Three points worth drawing out.

**Promotion is a ratchet.** Nothing in the table ever moves a page from
`established` back to `pending`. The promotion rule is evaluated once.

**A `pending` page that empties is deleted, and this is safe** precisely because
it was `noindex` and absent from the sitemap for its whole life. Nothing that was
ever indexed is ever auto-deleted. This is what makes typo cleanup free: a
`/inventory/suabru` page created by a misspelling is born `noindex`, never enters
the sitemap, and vanishes the moment the typo is corrected, having never been
eligible for the index.

**An empty established page is a real page, not a stub.** It says plainly that
there is no Subaru in stock right now, shows the closest current alternatives,
offers the "tell me when one arrives" contact route, and keeps its written
content. That is a legitimate 200, not a soft 404, and it is why a 60-day grace
is defensible on a lot where a make reliably returns.

Nothing is ever automatically redirected or deleted once established. Retiring a
make is a deliberate action.

---

## 6. Intentional renames

Two different things, and conflating them is a common mistake.

**Correcting a vehicle's make** (`Suabru` → `Subaru`) is not a taxonomy rename.
The vehicle moves between groups. The wrong group, having been `pending`, is
deleted with no SEO consequence. No redirect is needed because no indexed URL
existed.

**Changing an established page's slug** is a genuine rename, and it needs the
same treatment vehicle slugs already get. The taxonomy entry carries
`slugHistory: []`. On rename the old slug is pushed onto it, the old files are
removed, and `api/inventory-page.js` resolves any historical slug with a **single
301 to the current URL** — direct, never chained, because history maps every old
slug to the current one rather than to its immediate successor. This is exactly
the mechanism already proven for `/vehicles/<id>`, and I would reuse the code
rather than write a second one.

Renaming an established page is deliberately not exposed in the vehicle editor.
It belongs on the taxonomy screen, next to the copy, where it is an obvious
decision rather than a side effect of fixing a spelling.

---

## 7. English and French

The slug is language-neutral — brand names are not translated — so the pair is
always `/inventory/<slug>` ↔ `/fr/inventaire/<slug>`. Reciprocal `en-CA`,
`fr-CA` and `x-default` tags are emitted by the same shell used everywhere else.

**Promotion requires copy in both languages, and both pages promote together or
neither does.** This is not tidiness. If the English page were indexable while
the French one was `noindex`, the hreflang pair would point at a page search
engines are told to ignore, which is a broken annotation. Coupling them keeps the
pair coherent at every moment, and it means the state machine in section 5 has
one state per make, not one per language.

Vehicle counts, listings and empty-state behaviour are computed from the same
inventory for both languages, so they cannot drift. Spec values already translate
through `SX.specFR`.

---

## 8. Effects on existing SEO systems

**Canonicals.** Each make page self-canonicalises to its own clean URL. The
existing query-string filters are already safe: `/inventory?make=Subaru` serves
`inventory.html`, whose canonical is written server-side as
`https://www.automobilesx.ca/inventory`, so facets already collapse to the
inventory page and cannot fragment the index. This behaviour must be preserved,
not changed. Make pages therefore do not compete with filter URLs, because filter
URLs do not exist as canonical entities.

**Sitemap.** `api/sitemap.js` gains one additive loop after the vehicle loop,
emitting only `established` makes with the same `<xhtml:link>` hreflang pairs
every other entry has. The existing loops are untouched.

**Structured data.** `BreadcrumbList` on the make page (Home > Inventory > Make)
and an `ItemList` of the current vehicles. On vehicle pages the existing
breadcrumb array gains one element, Make, between Inventory and the vehicle. The
`AutoDealer` and `Car` objects are not modified. Breadcrumbs describe the
conceptual path, so the vehicle keeps `/vehicles/<id>` while appearing under its
make — this is well supported and needs no URL change.

**Internal links.** A "Browse by make" row on the inventory page with live
counts; the make in each vehicle page's breadcrumb; and established makes only in
the crawlable static footer. `pending` pages are linked from the inventory page
so visitors can use them, but stay out of the footer so they do not accumulate
site-wide signals.

**IndexNow.** A key file at `/<key>.txt`, and a submission from `api/save.js`
after a successful commit, covering changed vehicle URLs and any make page that
just promoted or refilled. It must be wrapped so that a failure or timeout cannot
affect the publish, and it must only ever submit indexable URLs. Bing and Yandex
act on it; Google does not, so this is an addition for the smaller engines, not a
Google strategy.

---

## 9. Risks

**The stale-deletion sweep is the sharpest trap.** `api/save.js` currently
removes pages for any vehicle no longer live. The obvious way to extend that to
makes — delete pages for makes with no stock — would auto-delete an established,
indexed page the first time Spiro sells his last Subaru. The sweep must consult
`data/taxonomy.json` and skip anything established. I would write the test for
this before the feature.

**Regenerating everything on every publish.** Currently ~28 vehicle pages per
commit; this adds roughly 16 more. Comfortable, and the existing
delete-path guard against non-existent files already protects the commit.

**Two files must stay consistent.** `vehicles.json` and `taxonomy.json` are
written in one commit, so they cannot diverge on disk. The code must still
tolerate a taxonomy entry whose make has no vehicles, and a make with vehicles
but no taxonomy entry, and treat both as ordinary states rather than errors.

**Dilution.** Adding pages when four already have a single incoming internal
link works against the link consolidation you are trying to achieve. Gating on
curated content keeps the count low, which is the mitigation.

**Registry drift.** If a make is added to the registry later and its slug
changes, that is a rename. The rename path handles it, but the registry should be
treated as append-mostly and slug changes made deliberately.

**Crawl budget is not a risk here** and I would not use it as a justification for
anything. At this size Google crawls everything comfortably. The real risks are
thin content and dilution.

---

## 10. Phased plan

Each phase ships and is verified independently. Any phase can be the last one.

**Phase 1 — normalization, no user-visible change.** Add `api/_lib/taxonomy.js`
with the key function and registry, plus unit tests over the real cases: `BMW`,
`Bmw`, `bmw`, `Mercedes Benz`, `Mercedes-Benz`, `VW`, `Volkswagen`, `Suabru`,
`Xc60`, unknown makes, empty and punctuation-only input. Add the read-only
grouping line to the admin editor. Nothing is generated, no URL exists yet, and
the risk is close to zero. Also correct the two live data errors here: the Subaru
Legacy recorded as an SUV, and `Xc60`.

**Phase 2 — state file and generator, all pages `noindex`.** Add
`data/taxonomy.json`, `api/_lib/makePage.js` and the `api/save.js` hook. Every
page ships `noindex, follow`, absent from the sitemap, linked only from the
inventory page. This proves generation, cleanup and the publish flow against real
inventory with **no indexation exposure at all**. Verify: publish, add, remove,
correct a make, mark sold, delete, and confirm no vehicle URL changed and the
sitemap still returns exactly its current 32 URLs.

**Phase 3 — content and promotion.** A small taxonomy screen in the admin for
per-make copy in both languages, stored in `data/taxonomy.json`. Write real copy
for Subaru first. Promote one page. Watch it in Search Console before promoting a
second. This is the phase where SEO exposure begins, and it begins with a single
URL.

**Phase 4 — resolver and renames.** `api/inventory-page.js` for 301s and real
404s, and the rename control. Only needed once an established page exists.

**Phase 5 — IndexNow.** Independent of everything above and safe to skip.

**Phase 6 — reassess.** Revisit model pages only if a model reaches three
vehicles and holds it. On current data that is not close.

---

## 11. Summary

The architecture is your proposal with three corrections: promotion gated on
written content rather than a vehicle count, establishment persisted and
ratcheted so pages do not flap in and out of the index, and normalization built
as a read-only projection so free-text editing stays genuinely free. It reuses
mechanisms already proven in this codebase — the pre-render-on-publish flow, the
`slugHistory` 301 resolver, the generic commit layer, the server-rendered shell —
rather than introducing new ones.

The honest expectation: at 13 vehicles this earns you one strong page now, maybe
three or four within a year, and a system that promotes them automatically as the
lot grows. That is a real but modest gain. It is worth doing because the
machinery is cheap and safe, not because it will transform the site's traffic.
