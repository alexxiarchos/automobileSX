# Admin panel — one-time setup (about 10 minutes)

After this setup, the owner manages everything at **yoursite.com/admin** and never
touches GitHub or Vercel again. Publishing a vehicle creates a git commit
automatically, and Vercel redeploys the site on its own (~1 minute).

## How it works (30 seconds)

- The inventory lives in `data/vehicles.json` and photos in `images/vehicles/` — inside this repo.
- The admin panel (`/admin`) talks to five tiny serverless functions (`/api`) that run free on Vercel.
- "Publish" = the function commits the changes to GitHub → Vercel auto-deploys → site updated.
- Login is a username/password checked server-side, with a signed HttpOnly session cookie.
- **Cost: $0.** No database, no subscriptions. Everything runs on Vercel's free tier + GitHub.

## Step 1 — Create a GitHub token (so the site can commit to itself)

1. Go to <https://github.com/settings/personal-access-tokens/new> (logged in as the repo owner).
2. Token name: `automobile-sx-admin`. Expiration: 1 year (set a reminder to renew).
3. Repository access: **Only select repositories** → choose this repo.
4. Permissions → Repository permissions → **Contents: Read and write**. Nothing else.
5. Generate, and copy the token (starts with `github_pat_…`). You'll paste it in Step 2.

## Step 2 — Add environment variables in Vercel

Vercel → your project → **Settings → Environment Variables**. Add these five
(Environment: Production — add to Preview too if you use preview deploys):

| Name | Value |
|---|---|
| `ADMIN_USER` | login username, e.g. `spiro` |
| `ADMIN_PASSWORD` | a long password — 16+ characters, not reused anywhere |
| `SESSION_SECRET` | any random string, 32+ characters (mash the keyboard) |
| `GITHUB_TOKEN` | the token from Step 1 |
| `GITHUB_REPO` | `your-github-username/your-repo-name` |

Optional: `GITHUB_BRANCH` if your default branch isn't `main`.

## Step 3 — Push this code and redeploy

Push these new files to GitHub (same as any update). Vercel deploys, and
`yoursite.com/admin` is live. Sign in with the credentials from Step 2. Done.

## Daily use (what the owner does)

1. Go to `yoursite.com/admin` and sign in.
2. **Add Vehicle** → drag in photos → fill the form → **Publish**.
3. The site shows the new listing about a minute later. That's it.

Also available: **Edit**, **Mark Sold** (removes it from the public listings instantly
on next deploy), **Duplicate** (copies a listing as a draft), **Delete**, and
**Save Draft** (kept in the system, hidden from customers).

> The site currently contains 24 sample vehicles. Delete them from the admin
> panel as real inventory goes in — or delete them all on day one.

## Testing locally (optional, for developers)

```bash
node dev-server.js
# → http://localhost:3000        (site)
# → http://localhost:3000/admin  (user: spiro, pass: test123)
```

Locally the API writes to the local files instead of GitHub (no token needed).
`dev-server.js` is never used by Vercel in production.

## New files reference

| File | What it does |
|---|---|
| `data/vehicles.json` | The inventory — single source of truth |
| `images/vehicles/…` | Uploaded photos (compressed to ~1600px JPEG in the browser before upload) |
| `admin/index.html`, `admin.css`, `admin.js` | The admin panel (static, no framework) |
| `api/login.js`, `logout.js`, `me.js` | Sign-in / sign-out / session check |
| `api/inventory.js` | Returns the latest inventory (admin only, reads from GitHub) |
| `api/upload.js` | Receives one photo, stores it as a git blob |
| `api/save.js` | Writes everything as ONE git commit → triggers the auto-deploy |
| `api/_lib/` | Shared code: sessions (`auth.js`), GitHub commits (`github.js`), body parsing (`body.js`) |
| `dev-server.js` | Local testing only |

## Good to know

- Photos are compressed in the browser before upload, so the repo stays small
  (roughly 200–400 KB per photo; ~10 vehicles ≈ a few MB).
- Deleting a vehicle also deletes its photos from the repo.
- If the owner forgets the password, change `ADMIN_PASSWORD` in Vercel and redeploy.
- The GitHub token expires (max 1 year) — renew it in GitHub and update
  `GITHUB_TOKEN` in Vercel when publishing stops working with a GitHub error.
- Everything the admin does is a git commit, so **git history is your undo button**:
  any mistake can be reverted from GitHub's history if ever needed.
