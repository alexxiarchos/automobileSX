# Technical SEO and routing pass

Nothing was rebuilt. No page was added or removed, no existing URL changed, no
feature was removed, and the admin panel, inventory, filtering, pre-rendering,
sitemap and bilingual routing all still work exactly as they did. Everything
below was done by changing existing files.

---

## Part 1. One canonical hostname, and the metadata around it

### Root cause

The site declared `https://automobilesx.ca` as its canonical hostname in four
places: `build/layout.js`, `api/sitemap.js`, `api/_lib/vehiclePage.js` and
`js/detail.js`. Every canonical tag, hreflang tag, Open Graph URL, sitemap entry
and schema `@id` was built from that constant.

### Changed

`SITE` is now `https://www.automobilesx.ca` in all four files, so canonicals,
hreflang, OG URLs, the sitemap, `robots.txt` and every schema `@id` agree on one
hostname. The dealer schema now also carries `postalCode: "H9P 1H2"`, which was
missing, so the address block is complete for local search.

Article schema on the four guides was thin. It now includes `image`,
`datePublished`, `dateModified`, `mainEntityOfPage` as a proper `WebPage` object
and an author `url`.

The hero image had no alt text of its own; it now has a real one per language
through `T.home.heroAlt`. The logo carried both an `alt` and a duplicate
`aria-label`, which screen readers announce twice; the `aria-label` is gone.

Twenty-two meta descriptions were over 160 characters and were being truncated
in results. All of them were rewritten. Verified: every page is now between 50
and 160 characters.

### One thing you have to do yourself

**In the Vercel dashboard, set `www.automobilesx.ca` as the primary domain** for
the project, so the bare `automobilesx.ca` 308s to it. I deliberately did not put
that redirect in `vercel.json`: if Vercel is currently configured the other way
round, a redirect in both places produces an infinite loop. The dashboard setting
is the safe place for it. Until you do that, both hostnames will serve, and the
canonical tags will point search engines at the www one anyway.

---

## Part 2. Vehicle addresses: how they work, and renaming with 301s

### How slug creation works today, exactly

In `admin/admin.js`, `collectForm()` contains:

```js
if (!v.id) {
  v.id = slug(v.year + "-" + v.make + "-" + v.model) + "-" + <5 random chars>;
}
```

The `if (!v.id)` guard is the whole story. The address is generated **once**,
when a vehicle is first saved, and after that editing the year, make, model,
price, kilometres, photos, description or status never touches it. So live URLs
have always been stable. What did not exist was a way to *deliberately* change
one, which is what the misspelled Subaru needs.

### Changed

The vehicle editor now has a **Page address** field showing the current address,
with a live preview of both the English and French URLs underneath it. It is only
meant to be used to fix a mistake, and the help text says so.

When that field is changed, `collectForm()` pushes the old address into a new
`slugHistory` array on the vehicle and sets the new one. `validate()` refuses an
empty address, and refuses an address already used by another vehicle or already
in another vehicle's history, so a rename can never collide with a live URL or
with an existing redirect. Duplicating a vehicle clears `slugHistory`, so a copy
never inherits someone else's redirects.

`api/save.js` already deleted the pre-rendered pages of any id no longer in the
live inventory, so after a rename the old pages disappear and the new ones are
written, in both languages, in the same commit.

### The redirect itself

`vercel.json` used to rewrite `/vehicles/:id` straight to the vehicle shell.
It now points at a new function, `api/vehicle.js`, which Vercel only reaches when
there is no pre-rendered file for that address, and which does three things:

1. **A current address** with no file yet: serves the shell, HTTP 200. This is
   the safety net that was fixed last time, and it still works.
2. **A retired address**: HTTP **301** straight to the vehicle's current URL,
   in the same language. Because `slugHistory` maps every old address directly to
   the current one, renaming twice still produces a single hop, never a chain.
3. **An unknown address**: the branded 404 page with a real 404 status, instead
   of the old behaviour of serving a page that then bounced you to the inventory
   in JavaScript. That soft 404 was worth removing.

The shells it needs are written to `api/_lib/shells.json` by `build/build.js`, so
the function never depends on reading HTML off the deployment filesystem.

### To fix the Subaru

Open the car in the admin panel, change **Suabru** to **Subaru** in the Make
field, change the **Page address** field from
`2019-suabru-impreza-62zb2` to `2019-subaru-impreza-62zb2`, and publish. Both old
URLs, English and French, will 301 to the corrected ones from that moment on.
I could not do it from here because the live inventory lives in your GitHub repo,
not in this zip.

Verified end to end through the real admin UI: published a car with the same
typo, renamed it, and confirmed the old id was kept in history, the old pages were
deleted, the new pages written, both old URLs returned 301, both targets returned
200 with no second hop, the canonical pointed at the new address, and the sitemap
listed the new address and not the old one.

---

## Part 3. The map

### Root cause

The map is a Google embed. A cross-origin iframe cannot be inspected from the
page, and a browser error page inside one **still fires the `load` event**, so the
old code marked the frame as loaded and faded it in over the address card
underneath. When the embed was blocked, by a privacy extension, an ad blocker, a
network filter or a TLS failure, the visitor got a grey rectangle covering the
address. That is what you were seeing, and it explains why it worked on one
device and not another.

The second problem was structural: the address card sat *behind* the map, so on
the occasions the map did work, the address disappeared.

### Changed

The block is now a map area with an address panel **below** it, not behind it.
The address, the appointment note, a directions button and a call button are
always on screen no matter what the map does.

Before mounting the frame, the page makes one cheap request to a Google asset. If
the browser cannot reach Google, the frame is never inserted and the map area
keeps a dark placeholder reading "The map is unavailable right now" with a direct
link to Google Maps. Every case that would break the embed also fails that probe.
On top of that the frame is dropped if it errors or has not loaded within eight
seconds.

Verified at desktop and mobile widths. The failure state is now a deliberate dark
panel with a working link rather than a grey box, and the address is visible in
both states.

---

## Part 4. English and French consistency

Vehicle specifications are stored in English because that is what the admin form
writes. The French pages were showing "Automatic", "Gasoline", "FWD" as a result.

There is now one translation map, `SX.specFR` in `js/data.js`, mirrored in
`api/_lib/vehiclePage.js` for the pre-rendered pages, used everywhere a spec value
is displayed: the vehicle cards, the specification table, the filter checkboxes,
the active-filter chips, the page subtitle and the meta description.

French pages now read Automatique, Manuelle, CVT, Essence, Hybride, Diesel,
Électrique, Hybride rechargeable, Traction avant, Intégrale, Propulsion, 4x4.
English pages are byte-for-byte unchanged, and the stored data is unchanged, so
filtering still works on the English values and nothing in the inventory file was
migrated. The structured data deliberately keeps the English values, because those
are machine-readable fields and consistency there matters more than translation.

**On the French text in the English footer**, which you asked about: that was
deliberate, not a bug. It is the link to the French site, and search engines use
it alongside the hreflang tags. But you were right that a full French sentence in
the middle of an English footer reads like a mistake. It is now a single link,
"Voir ce site en français", marked with the correct `lang` attribute, which is the
normal convention for a language switcher.

---

## Parts 5, 6, 8 and 9. Copy

- **H1.** "Quality used cars in Dorval" and "Autos usagées de qualité à Dorval",
  replacing "sold the honest way". Plain, and it carries the keyword and the city.
- **404 page.** "That page has moved on. Much like a good car on our lot." is
  gone. It now says "Page not found" and points to the inventory, contact and
  guides. That line was also, indirectly, what you saw when the vehicle links were
  broken.
- **Negative comparisons removed.** Lines that worked by putting other
  dealerships down were rewritten to say what you do instead. The customer-contact
  line now reads "You deal directly with Spiro throughout the buying process, in
  English or in French."
- **Appointments.** Softened from a requirement to "Appointments are
  recommended", which matches being open 10 to 6 every day.
- **Financing.** Every "same day" approval claim is gone, in both languages
  (verified: zero occurrences). There are no approval guarantees anywhere on the
  site. The payment estimator keeps its six-row Quebec disclosure block and its
  "not an offer of credit" wording untouched.
- **FAQ.** The "Can I change my mind after signing?" question is gone in both
  languages, since Quebec has no cooling-off period on a used-car sale at a
  dealership and the answer risked being read as a promise. Nine questions each,
  and the FAQ schema regenerates from the same list, so the structured data
  matches the page.
- **Em dashes.** The last four, in the legal-warranty category list in the
  buying guide, were rephrased with brackets. Zero remain in any generated page.

---

## Part 1.11. Weak internal linking, and why the crawl reported it

The header and footer are built by JavaScript. Google renders JavaScript, but
most other crawlers, including the one that produced your report, do not, so they
saw pages with almost no internal links. That is the actual cause of the "pages
with one inbound link" finding.

Every generated page and every pre-rendered vehicle page now ships a real HTML
link block inside the footer element, with the address, the phone number, links to
all eight main sections and the language switch. `components.js` replaces it with
the full footer the moment it runs, so a visitor never sees a difference, but every
crawler now sees the links.

The West Island page was also genuinely under-linked, so it was added to the
footer quick links in both languages.

Measured after the change, across all 26 static pages: no page has zero incoming
links, and **no internal link points at a URL that redirects**, so there are no
chains to clean up.

---

## What was verified

- 26 static pages, both languages: exactly one `h1`, a www canonical, three
  reciprocal hreflang tags, a meta description between 50 and 160 characters,
  every image carrying alt text, and JSON-LD that parses.
- Every internal link resolves to a direct 200. No redirect chains.
- Sitemap returns 32 URLs including vehicle pages, with the correct hostname.
- Vehicle rename: old English and French URLs both 301, both targets 200 with no
  second hop, canonical and sitemap follow the new address.
- Admin publish writes pre-rendered pages in both languages, delete removes them,
  and the no-file fallback still serves.
- Inventory filtering, sorting, chips and the language toggle: working, with
  French spec labels.
- Payment estimator: six-row disclosure block intact, total price still the
  dominant figure.
- No horizontal overflow and no non-200 responses on any page at any of eleven
  widths from 1600 px down to 360 px.
- No JavaScript errors on any page.

## Files changed

`build/layout.js`, `build/build.js`, `build/copy-en.js`, `build/copy-fr.js`,
`js/data.js`, `js/components.js`, `js/detail.js`, `js/inventory.js`,
`css/styles.css`, `admin/index.html`, `admin/admin.js`, `admin/admin.css`,
`api/save.js`, `api/sitemap.js`, `api/_lib/vehiclePage.js`, `vercel.json`,
`robots.txt`, `dev-server.js`.

Added: `api/vehicle.js`, `api/_lib/shells.json` (generated by the build).

Not touched: `api/_lib/auth.js`, `api/_lib/github.js`, `api/login.js`,
`api/logout.js`, `api/me.js`, `api/upload.js`, `api/inventory.js`,
`data/vehicles.json`, and every existing URL on the site.
