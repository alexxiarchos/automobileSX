# How to update the site safely

Every zip you receive is built **without** these two things:

- `data/vehicles.json` — your live inventory
- `images/vehicles/` — the photos uploaded through the admin panel

So they can never be overwritten by an update.

## The safe way to apply a zip

1. Extract the zip.
2. **Copy the contents into your repo folder and choose "replace" when asked.**
   Do NOT delete the old folder first, and do NOT delete anything the zip
   does not contain. Copying merges; deleting-then-pasting would wipe the
   inventory along with everything else.
3. In the repo folder:

   ```bash
   git status          # sanity check: data/vehicles.json should NOT be listed
   git add -A
   git commit -m "Site update"
   git push
   ```

The `git status` line is the safety net. If `data/vehicles.json` shows up as
modified or deleted there, stop and run `git checkout -- data/vehicles.json`
to restore it before committing.

## If something ever does go wrong

Every change the admin panel makes is a git commit, so nothing is truly lost.
On GitHub, open `data/vehicles.json`, click **History**, pick the version from
before the mistake, and restore it. The site redeploys automatically.
