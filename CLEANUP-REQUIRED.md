# Two files have to be deleted by hand, once

Copying a zip over the repo can only add and overwrite files. It can never
delete one. So anything left over from an older version of the site survives
every update forever, and keeps being served. That is exactly what happened
with the sitemap.

## 1. Delete `sitemap.xml` from the repo root

This is the whole cause of the "old sitemap" problem.

Vercel resolves a request in this order:

    redirects  →  real files on disk  →  rewrites  →  404

`vercel.json` rewrites `/sitemap.xml` to the generator at `/api/sitemap`, but a
rewrite is only reached **when no real file matches**. A `sitemap.xml` left in
the repo root from the first version of the site matches first, so Vercel serves
that file and the generator is never called.

The served file gives itself away: it has no `xmlns:xhtml` namespace, no
`<xhtml:link hreflang>` tags and no `<lastmod>`. The generator emits all three on
every entry, always, and it cannot produce a `.html` URL or a non-www URL at all,
because `SITE` is hard-coded to `https://www.automobilesx.ca` and no code path
appends `.html`.

**How to delete it**

On github.com, open the repository, click `sitemap.xml` in the root, then the
trash icon (or the `⋯` menu → Delete file), and commit. Vercel redeploys by
itself. Or from a terminal:

    git rm sitemap.xml
    git commit -m "Remove legacy static sitemap so the dynamic one is served"
    git push

Then load `https://www.automobilesx.ca/sitemap.xml` again. You should see roughly
32 URLs, all on `www`, each with `<xhtml:link>` alternates, plus one entry per
live vehicle in both languages. In Search Console, resubmit
`https://www.automobilesx.ca/sitemap.xml`.

## 2. Check for any other leftovers

Compare the repo root against this list. Anything present in the repo that is
**not** on this list is from an old version and can be deleted:

    404.html          contact.html      guides.html       sell-your-car.html
    about.html        css/              images/           site.webmanifest
    admin/            data/             index.html        sitemap-pages.json
    api/              dev-server.js     inventory.html    used-cars-west-island.html
    assets/           faq.html          js/               vehicle.html
    build/            favicon.ico       robots.txt        vercel.json
    fr/               financing.html
    guides/

    plus vehicles/ and fr/vehicules/, which the admin panel writes by itself,
    and the .md notes files.

Likely candidates for old files, if they exist: `sitemap.xml`, `sitemap_index.xml`,
`sitemap-0.xml`, `index.htm`, `cars.html`, `inventaire.html` at the root, or any
stray `.html` page that is not in the list above.

`sitemap-pages.json` is **not** a sitemap and should stay. It is a build artifact
listing the static pages; nothing serves it to crawlers.

## Why the vehicle pages needed a publish, same reason

The pre-rendered car pages under `vehicles/` and `fr/vehicules/` are committed
HTML written by the admin panel, so a code push does not touch them either. One
publish from `/admin` regenerates all of them, which is why correcting the Subaru
also fixes the canonicals and the French spec labels on every car page at once.
