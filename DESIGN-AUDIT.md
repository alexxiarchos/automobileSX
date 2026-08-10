# Design audit — refinement pass

Scope: visual polish and responsive scaling on the existing production site.
No page was added or removed, no URL changed, no feature removed, and the
admin, inventory, filtering, vehicle pages, sitemap and structured data were
not modified.

## What was measured first

The site was rendered at 1920, 1600, 1440, 1280, 1024, 900, 768, 600, 430, 390
and 360 px and the container widths, type sizes, section padding, grid columns
and horizontal overflow were recorded at each. Two real bugs surfaced.

### Bug 1 — the hero never aligned with the page (fixed)

`.hero` is `display:flex`, and `.container` inside it had no width, so as a flex
item it shrink-wrapped to its content: **688 px at every viewport from 768 px
upward**. The headline therefore sat at an arbitrary offset while the search card
and everything below it sat on the real 1200 px grid. At 1920 px the headline
started 640 px from the left and the content below started at 385 px.

Fix: `.hero > .container { width: 100% }`.

### Bug 2 — header and body used different container widths (fixed)

The header was capped at 1360 px, the body at 1200 px, so the logo and nav never
lined up with the page content beneath them.

Fix: one `--container` token used by both. Measured after the fix, at 1920 px the
logo, hero eyebrow, headline, search card and trust strip all begin at **312 px**.

### Scaling faults (fixed)

| Symptom | Before | After |
|---|---|---|
| Body text | fixed 16 px at every width | fluid 16 → 17 px |
| Section padding | fixed 72 px from 768 px to 1920 px | fluid 52 → 96 px |
| Container gutter | fixed 24 px | fluid 20 → 32 px |
| Hero height | fixed 560 px | `clamp(30rem, 66vh, 44rem)` |
| Large screens | content stranded at 1200 px | 1280 px, 1360 px above 1600 px |
| Horizontal overflow | none | none (unchanged) |

## Reducing the "AI look"

Each change was made by adjusting an existing component, not replacing it.

- **Trust strip.** Four identical blocks each with an identical red dash above
  the heading. Replaced with a single rule across the row and hairline dividers
  between items; on mobile it becomes a stacked list with rules. Same four items,
  same copy, same order.
- **Hero overlay.** A flat 60 % black wash over the photo read as a template.
  Now a directional gradient: dense behind the text, clearing to the right so the
  car is actually visible. Also `object-position` tuned so the crop favours the
  vehicle and the storefront sign.
- **Hero measure.** The headline was set to a very narrow column and broke to five
  lines. Now three lines at desktop with a proper display measure.
- **Cards.** Lighter resting border, a single softer lift on hover, and a slightly
  larger easing curve instead of the uniform 150 ms everywhere.
- **Motion.** Scroll reveal kept, but the travel reduced from 14 px to 8 px so it
  reads as settle rather than animation.
- **Map.** Replaced the drawn SVG "map" — the strongest tell on the site — with a
  real Google Maps embed, lazy-loaded. See the flag below.

## Mobile

- Hero height reduced, headline and eyebrow scaled down, subhead measure tightened.
- The search card was consuming most of the first screen. Make and Model are now
  side by side with Max price and the button full width, keeping all four controls.
- Section padding and page headers tightened.
- Extra breakpoint at 380 px for small phones.

## Second pass — the map, the favicon and related gaps

### The drawn map is gone entirely

The illustrated SVG "map" has been removed from the codebase, not just hidden.
`mapSVG()` no longer exists and nothing references it.

- **Home and contact:** a real Google Maps embed, lazy-loaded, centred by
  geocoding the address string itself so the pin is accurate. No API key needed.
- **Underneath it:** an honest address card (label, address, hours note, "Open in
  Google Maps" button) on brand black. The iframe only fades in once it loads, so
  if the embed is ever blocked the visitor sees a deliberate location panel rather
  than an empty frame or a cartoon.
- **Footer:** the drawn thumbnail is now a real photo of the lot, linking to
  directions. A third map iframe on every page would have been a needless cost.

A static map image was considered and rejected: this build environment cannot
reach tile servers or geocoders, so the pin position would have been guesswork.
An embed that geocodes the real address is accurate by construction.

**Still worth one look after deploying:** open the home and contact pages and
confirm the map draws. If it does not, the address card behind it is already a
complete, working fallback, so nothing is broken either way.

### Favicon consistency (fixed)

An audit of every page type found two inconsistencies:

| Page type | Before | After |
|---|---|---|
| Generated pages (28) | full set | full set + manifest |
| Pre-rendered vehicle pages | missing the 192 px icon | full set + manifest |
| Admin | one 96 px icon only | full set + manifest |

All four page types now emit an identical icon block: `favicon.ico`, 96 px and
192 px PNGs, the Apple touch icon, `site.webmanifest` and the theme colour.
A `site.webmanifest` was added so the icon and brand colour are correct when the
site is saved to a phone home screen.

### Other gaps closed in this pass

- **Branded 404.** Unmatched URLs previously fell through to Vercel's default
  page. There is now a `404.html` generated from the same shell, with the real
  header and footer and routes to inventory, contact, guides and the French site.
  It is `noindex`, as a 404 should be. Verified returning HTTP 404 with the
  chrome intact.
- **Hero image weight.** The 1600 px hero was being sent to phones. A 900 px
  version was added and served via `srcset`, cutting the largest image on the
  page from 257 KB to 108 KB on mobile. This is the LCP element, so it is the
  single most useful performance change available here.

## Flagged — NOT changed, and why

- **The eyebrow/heading rhythm** repeats on several sections. It could be varied,
  but the eyebrows carry keyword text that reads naturally and removing them would
  edit live SEO copy for a purely stylistic reason. Say the word and I will vary
  the treatment instead of the text.
- **Page length on mobile** is still around 9,500 px on the home page. Shortening
  it means dropping or collapsing a section, which is a content decision, not a
  design one.
- **The body-type tiles** read sparse when stock is low, because each shows a
  count. That resolves itself as inventory grows.

## Verification after the pass

- All 28 pages, both languages: one `h1`, canonical present, 3 hreflang tags,
  header and footer rendering, zero JavaScript errors.
- Inventory filtering, sorting, language toggle: unchanged and working.
- Vehicle detail pages, both languages, including price formatting and the
  six-row payment disclosure: unchanged.
- Admin publish → pre-rendered page written in both languages → appears in the
  sitemap → delete removes both pages: unchanged.
- Sitemap still returns 32 URLs including vehicle pages.
- All 30 internal links resolve.
- No horizontal overflow at any of the 11 widths tested.

## Files touched

Changed: `css/styles.css`, `js/components.js`, `js/home.js`, `js/contact.js`,
`js/faq.js` (untouched logic), `build/blocks.js`, `build/build.js`,
`build/layout.js`, `build/copy-en.js`, `build/copy-fr.js`, `admin/index.html`
(icon block only), `api/_lib/vehiclePage.js` (icon block only), `dev-server.js`
(serves 404.html locally so it matches production).

Added: `404.html`, `site.webmanifest`, `assets/storefront-hero-900.jpg`,
`assets/storefront-thumb.jpg`.

Not touched: `vercel.json`, `api/save.js`, `api/sitemap.js`, `api/_lib/auth.js`,
`api/_lib/github.js`, `admin/admin.js`, `js/inventory.js`, `js/detail.js`,
`js/data.js`, `robots.txt`, and every URL on the site.

## Verified again after the second pass

All 28 pages in both languages clean, inventory filtering and sorting working,
language toggle working, vehicle detail pages and the six-row payment disclosure
unchanged, admin publish still writing pre-rendered pages in both languages,
delete still removing them, sitemap still returning 32 URLs, all 30 internal
links resolving, 404 returning the branded page, zero JavaScript errors.

## Follow-up fixes (reported after deploy)

### Vehicle links were falling through to the 404 page

`vercel.json` was self-conflicting. With `cleanUrls: true` Vercel serves
`vehicle.html` at `/vehicle` and redirects the `.html` form, but the rewrite
target was written as `/vehicle.html`, and a redirect `/vehicle → /inventory`
also existed — so the rewrite pointed at a path that was itself redirected.
With no pre-rendered file on disk yet, `/vehicles/<id>` ended at the 404 page.

Fixed by pointing the rewrites at the extensionless paths and deleting the two
redirects that were shadowing them. A bare visit to `/vehicle` still lands on the
inventory, because `detail.js` already redirects when no vehicle id resolves.

**Why updating one car appeared to fix it:** every admin save regenerates the
pre-rendered pages for the whole inventory, so that save put real files on disk
and the filesystem started serving them before the broken rewrite was ever
reached. That was the correct behaviour masking the config bug — the rewrite is
the fallback for any vehicle that has no file yet, and it now works too.

### The dev server was too forgiving to catch it

It special-cased vehicle URLs instead of following Vercel's routing order, so the
broken config passed locally. It now parses `vercel.json` and applies the real
order: redirects → filesystem (with cleanUrls) → rewrites → filesystem → 404.
A regression check confirms `/vehicles/<id>` returns 200 with **no** pre-rendered
file present, which is precisely the case that was failing in production.

### Phone number invisible until hover

`.text-link` was hard-coded to `color: var(--ink)`, which is near-black. Inside
the dark page header that made the link invisible; it only appeared on hover when
it turned red. It now inherits its colour from the surface, with explicit bone on
every dark context (page header, dark sections, hero, sidebar card, footer).

### Swept for the same class of fault

All 15 page types were checked at 11 widths from 1600 px down to 360 px for
horizontal overflow and non-200 responses. None found.
