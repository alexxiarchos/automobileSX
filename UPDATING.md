# Updating the site

## Applying a zip I send you

Every zip is built **without** your live data, so it can never overwrite it:

- `data/vehicles.json` (your inventory)
- `images/vehicles/` (photos uploaded through the admin)
- `vehicles/` and `fr/vehicules/` (the per-vehicle pages the admin generates)

Steps:

1. Extract the zip.
2. **Copy the contents into your repo folder and choose "replace".** Never delete the
   old folder first, or you lose the inventory along with everything else.
3. In the repo folder:

   ```bash
   git status          # data/vehicles.json should NOT appear here
   git add -A
   git commit -m "Site update"
   git push
   ```

Vercel redeploys automatically. If `data/vehicles.json` ever shows as modified or
deleted in `git status`, run `git checkout -- data/vehicles.json` before committing.

Nothing is ever truly lost: every admin change is a git commit, so any earlier
version can be restored from the file's History tab on GitHub.

## Site structure

| Path | What it is |
|---|---|
| `index.html`, `inventory.html`, … | English pages, **generated** |
| `fr/` | French pages, **generated** |
| `guides/`, `fr/guides/` | Article pages, **generated** |
| `build/` | The generator and all page copy. **This is where content is edited.** |
| `js/` | Front-end behaviour (routing, inventory, gallery, forms) |
| `css/styles.css` | All styling |
| `api/` | Serverless functions: admin login/save/upload, and the sitemap |
| `admin/` | The inventory manager |
| `data/vehicles.json` | The inventory (never edit by hand; use `/admin`) |
| `vehicles/`, `fr/vehicules/` | One ready-to-index HTML page per vehicle, written automatically when you publish from `/admin`. Never edit by hand. |
| `vercel.json` | Clean URLs, vehicle URL rewrites, sitemap rewrite |

## Editing page text

Text lives in `build/copy-en.js` and `build/copy-fr.js`, not in the HTML files.
After editing either, regenerate:

```bash
node build/build.js
```

That rewrites all 28 HTML pages. Commit the changes as usual. Editing the HTML
directly works until the next regeneration wipes it, so always edit the copy files.

## Adding a new page

1. Add the route to `ROUTES` and `FILES` in `build/layout.js` (both languages).
2. Add the copy block to both copy files.
3. Add it to the `pages` array in `build/build.js`.
4. Add the route to `ROUTES` in `api/sitemap.js` so it enters the sitemap.
5. Run `node build/build.js`.

## Local preview

```bash
node dev-server.js
# http://localhost:3000        English
# http://localhost:3000/fr/    French
# http://localhost:3000/admin  spiro / test123
```

The dev server mirrors the Vercel routing rules, so what you see locally matches
production.

## How vehicle pages work

When Spiro publishes a car, the same commit that saves the inventory also writes
a finished HTML page for it in both languages, at `/vehicles/<id>` and
`/fr/vehicules/<id>`. Those pages carry their own title, description, price,
kilometres, specs and structured data in the source, so search engines index them
correctly on the first crawl instead of waiting to run JavaScript.

Deleting a car, or moving it back to draft, removes its pages in the same commit.
`vehicle.html` remains as a fallback template for any URL that has no generated
page yet, so nothing 404s in the meantime.
