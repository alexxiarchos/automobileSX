# Review: make and model taxonomy pages

No code was changed. This is an assessment against the codebase as it stands
plus the live inventory as it was at the time of writing.

---

## 1. One premise in the brief does not match the deployed site

The brief says vehicle URLs look like `/inventory/2014-bmw-328d-[stock-number]`.
They do not. The real routes, from `build/layout.js` and `vercel.json`, are:

    English   /vehicles/<id>          e.g. /vehicles/2017-bmw-x3-cqgmi
    French    /fr/vehicules/<id>      e.g. /fr/vehicules/2017-bmw-x3-cqgmi

The id is `year-make-model-<5 random chars>`, created once and then never
changed. There is no `/inventory/<something>` route on the site at all today.

This matters in two ways, and both are in your favour.

**It removes the collision risk entirely.** If vehicles lived under
`/inventory/…`, then `/inventory/bmw` would sit in the same namespace as
`/inventory/2014-bmw-328d-1234`, and the router would need to tell a make slug
apart from a vehicle slug on every request. That is the single most common way
this kind of project goes wrong. It cannot happen here, because vehicles live
under `/vehicles/`.

**Your existing URLs are untouched by definition.** Nothing in this proposal
needs to go near `/vehicles/`, so the "preserve existing vehicle URLs"
requirement is satisfied for free rather than by careful engineering.

I verified the routing directly. With `inventory.html` present and a probe file
at `inventory/bmw.html`, the dev server (which parses `vercel.json` and applies
Vercel's real order: redirects → filesystem → rewrites → 404) returned:

    /inventory        200
    /inventory/bmw    200
    /inventory/nope   404

So a file and a directory of the same name coexist cleanly. The probe was
deleted. There is no routing conflict to solve.

The breadcrumb you want, `Home > Inventory > BMW > 3 Series > 2014 BMW 328d`,
does not require the URL to mirror it. Breadcrumb structured data describes a
conceptual path, not a directory tree, so you can have that trail while the
vehicle keeps `/vehicles/<id>`. That part of the idea is fine.

---

## 2. The inventory is what decides this, and it is small

Live inventory when I checked, 13 vehicles:

| Make | Count | Models |
|---|---|---|
| Subaru | 4 | Forester, Impreza, Legacy, Outback |
| Audi | 2 | A4, Q3 |
| Volkswagen | 2 | Golf, Tiguan |
| BMW | 1 | X3 |
| Hyundai | 1 | Santa Fe |
| Jeep | 1 | Grand Cherokee |
| Nissan | 1 | Murano |
| Volvo | 1 | XC60 |

**Every single model has exactly one vehicle. Thirteen cars, thirteen distinct
models.** There is no model in stock with two of anything.

Three consequences follow directly from that table, and they are the heart of
my answer.

**Model pages would each contain one listing.** A page whose entire body is a
single vehicle card, next to a vehicle page that has the photos, the full spec
table, the description and the payment estimator, is a thin page by any
definition. It competes with the very page it links to. Thirteen of them would
be thirteen thin pages.

**Your worked example has no inventory at all.** There is no BMW 3 Series on the
lot, and no 328d. `/inventory/bmw/3-series` would be an empty page on the day it
shipped. `/inventory/bmw` would hold exactly one car, an X3.

**Most facets are near-duplicates of the inventory page.** 10 of 13 vehicles are
SUVs (77%), 12 of 13 are AWD (92%), and 11 of 13 are under $14,000. A page that
returns nine tenths of your stock is not a distinct page, it is `/inventory`
with a different heading. That rules out the drivetrain and price-band angles I
would normally suggest for a Quebec dealership, at this inventory size.

The band of facets that is neither thin nor near-duplicate is narrow right now.
Essentially one thing clears it: Subaru, with 4 vehicles across 4 models.

---

## 3. Verdict

**Make pages: yes, but gated, and launching with very few.** The machinery is
worth building because it scales with the lot, and "used Subaru Dorval" is a
real search with real intent. But a make page should only exist as an indexable
page when it has enough stock to be worth landing on.

**Model pages: no, not yet.** Not because the idea is wrong, but because the
data cannot support it. Revisit when a single model reliably holds three or more
cars. On a lot of this size that may be some way off, and it may never be true
for most models.

**One more reason to be careful.** Your last Ahrefs crawl flagged "page has only
one dofollow incoming internal link" on 4 pages. Adding a dozen sparse taxonomy
pages makes exactly the problem you are trying to fix worse, and it dilutes the
internal link equity currently concentrated on `/inventory` and the vehicle
pages.

---

## 4. Risks, specific to this codebase

**Thin content.** Covered above. The mitigation is a stock threshold plus real
written copy per make, not templated filler with the make name substituted in.

**Duplicate content against the existing filters.** `/inventory?make=Subaru`
already works today, seeded by `js/inventory.js`. A `/inventory/subaru` page
would return the same set. Good news: this is already handled. Canonical tags
are written server-side as `SITE + path`, so `/inventory?make=Subaru` serves
`inventory.html` whose canonical is `https://www.automobilesx.ca/inventory`.
Query-string facets already self-canonicalise and cannot fragment the index. No
change needed, but it must not be broken.

**Faceted navigation.** The one live risk is that new taxonomy pages must not
themselves grow filter links that mint more URLs. The rule is that make pages
are reachable by clean paths only, and any filtering on them stays in query
strings that canonicalise back to the make page.

**Data hygiene, which becomes public the moment slugs are generated.** The admin
form stores `make` and `model` as free text. Two real problems are visible in
today's data:

- The Volvo is stored as model `Xc60`, not `XC60`. A model page would be titled
  "Volvo Xc60".
- We already saw `Suabru` typed instead of `Subaru`. Under this proposal that
  typo would have minted a live, indexable `/inventory/suabru` page.

Any taxonomy built on free-text fields inherits every typo as a URL. This needs
solving first, and it is a prerequisite rather than a nice-to-have.

There is also a genuine data error to fix regardless: the Subaru Legacy is
recorded with body type SUV. It is a sedan. Body-type facets would place it
wrongly.

**Zero-inventory behaviour.** Stock turns over, so every taxonomy page will hit
zero eventually. Deleting the page creates 404s on links Google has already
indexed. Leaving it returning an empty grid creates a soft 404. The page needs a
defined state for empty, covered in the plan below.

**Generation timing, the real integration risk.** This is the part that is easy
to get wrong. Static pages come from `node build/build.js`, which you never run;
you copy a zip. Vehicle pages are written by `api/save.js` at publish time,
committed to the repo. **Taxonomy pages must be generated by `api/save.js` too.**
If they are generated at build time they will be stale the moment Spiro sells a
car, showing vehicles that are gone and missing ones that arrived. This is the
same lesson as the stale `sitemap.xml`: anything derived from inventory has to
be regenerated on publish, not on deploy.

**Crawl budget: not a real concern here, and I want to be straight about that.**
At this size Google will crawl everything easily. The risks are thin content and
dilution, not budget. I mention it only because it gets invoked a lot in SEO
advice and it does not apply to you.

---

## 5. What I would recommend instead, given how the site is actually built

A smaller, sturdier version of the same idea.

**Build the make layer only, with a threshold.** One page template, generated on
publish, in both languages:

    /inventory/subaru              /fr/inventaire/subaru

A make page is created and linked whenever the make has at least one live
vehicle, so visitors always have a working page. It is included in the sitemap
and left indexable only when it has **three or more** live vehicles. Below that
it stays reachable and useful but carries `noindex, follow` and stays out of the
sitemap. Today that means exactly one indexable page: Subaru. Audi and
Volkswagen would sit one car below the line, ready to cross it.

That sounds conservative, and it is deliberately so. One page that ranks is
worth more than eight that do not, and this design promotes pages automatically
as the lot grows, with no further work from you.

**Skip the model layer.** Revisit if a model reaches three cars.

**Skip body, drivetrain and price pages for now.** SUV at 77% and AWD at 92% are
too close to the whole inventory to be distinct pages. When the lot grows and
diversifies, the SUV page becomes the strongest of these, because "used SUV
Dorval" and "used SUV West Island" are better local queries than any model term.

**Fix the data model first.** Add a controlled make list to the admin form
(datalist already exists for makes, it just is not enforced) so make values are
normalised before they can become URLs. Without this, the taxonomy is one typo
away from an indexable garbage page.

**Where the real SEO gain is, honestly.** Given a 13-car lot, the taxonomy layer
is a modest win. The larger wins available to you right now are the ones already
in flight: getting the stale `sitemap.xml` deleted so all 32 URLs are actually
submitted, and getting the vehicle pages regenerated so their canonicals point
at www. I would rather you did not treat taxonomy pages as the thing that moves
the needle, because at this inventory size they will not be.

---

## 6. Implementation plan, if you want to proceed

Scoped to the make layer only. Nothing here touches `/vehicles/`, the sitemap
structure, the schema, canonical logic, the admin panel's existing behaviour, or
any existing page.

### 6.1 Data normalisation, first, on its own

- Add a canonical make list to `admin/admin.js` and normalise on save
  (`Suabru` → rejected or corrected, `volkswagen` → `Volkswagen`).
- Add a `makeSlug` helper shared by the generator and the page template, so the
  slug is computed one way in one place.
- Correct the Subaru Legacy body type and the `Xc60` casing in the admin panel.

Ship and verify this before anything generates a URL from these fields.

### 6.2 Route and template

- New module `api/_lib/makePage.js`, mirroring `api/_lib/vehiclePage.js`, which
  already does exactly this job for vehicles. It exports
  `renderMakePages(make, vehicles)` returning both language variants, and
  `makePagePaths(slug)` for cleanup.
- Output paths `inventory/<slug>.html` and `fr/inventaire/<slug>.html`. Verified
  above that these coexist with `inventory.html` and need no `vercel.json`
  change. **No routing configuration is modified.**

### 6.3 Page content

Fully rendered into the HTML, not injected by JavaScript, matching how vehicle
pages already work:

- `h1`: "Used Subaru for sale in Dorval" / "Subaru d'occasion à vendre à Dorval"
- A written intro, per make, that says something true and specific: what these
  cars are like after a Quebec winter, what to check, what they cost to run.
  I would write these once with you; eight makes is a manageable amount of real
  copy, and it is what separates this from a thin page.
- The live vehicle cards for that make, in the HTML source.
- Links out to `/inventory`, to financing, and to the relevant guides.

### 6.4 Structured data

- `BreadcrumbList`: Home > Inventory > Subaru.
- On vehicle pages, extend the existing breadcrumb to Home > Inventory > Subaru >
  2017 Subaru Outback. This is an addition to an existing array, not a change to
  the `Car` or `AutoDealer` schema.
- `ItemList` of the vehicles on the make page.
- No change to `dealerSchema()`.

### 6.5 Indexation policy

| Live vehicles | Page exists | Linked | In sitemap | Robots |
|---|---|---|---|---|
| 3 or more | yes | yes | yes | index, follow |
| 1 to 2 | yes | yes | no | noindex, follow |
| 0, previously published | yes | footer only | no | noindex, follow |
| 0, never published | not generated | — | — | — |

A make page that empties out keeps its URL and returns 200 with an honest
message, the closest alternatives from current stock, and a link to the full
inventory. No 404, no soft 404, no redirect. If a make stays at zero for a long
time you can retire it deliberately, with a 301 to `/inventory`, using the same
`slugHistory` mechanism the vehicle pages already use.

### 6.6 Generation and cleanup

In `api/save.js`, alongside the existing vehicle page loop: group live vehicles
by make, render both language pages for each, and add them to `newFiles`. Reuse
the existing stale-page cleanup pattern to remove pages for makes that have
dropped out entirely. One publish regenerates every make page, exactly as it
already regenerates every vehicle page.

### 6.7 Sitemap

In `api/sitemap.js`, after the vehicle loop, add make pages that meet the
threshold, with the same `<xhtml:link>` hreflang pairs. Entirely additive; the
existing loops are untouched.

### 6.8 Internal linking

- Inventory page: a "Browse by make" row, counts included, linking to make pages.
- Vehicle pages: the make in the breadcrumb links to its make page.
- Footer: the crawlable static footer gains make links only for indexable makes.

### 6.9 Bilingual

Make slugs are brand names, so they are identical in both languages and the
hreflang pairing is trivial: `/inventory/subaru` ↔ `/fr/inventaire/subaru`, with
reciprocal tags and `x-default` on the English one, matching every other page.

### 6.10 Verification before you deploy

Extending the existing harnesses rather than writing new ones: every make page
in both languages returns 200 with one `h1`, a correct canonical, three hreflang
tags and valid JSON-LD; no existing URL changes; all 32 current sitemap entries
still present; the threshold correctly includes Subaru and excludes the
one-vehicle makes; an emptied make page returns 200 and is `noindex`; publish
from admin regenerates every make page; no horizontal overflow at the eleven
tested widths.

---

## 7. What I need from you before starting

1. Confirm the make layer only, no model pages for now.
2. Confirm the threshold of three. I can make it two, which would light up
   Subaru, Audi and Volkswagen immediately, at the cost of two weaker pages.
3. Agreement to write real per-make copy. If the answer is that there is no
   appetite for that, I would rather not build this at all than ship eight
   templated pages, because that is the version that does harm.
4. Whether to do the data normalisation as a separate, smaller change first. I
   recommend yes.
