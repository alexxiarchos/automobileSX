/* GitHub-as-storage layer.
   The inventory JSON and vehicle photos live in the same repo as the site.
   Publishing = one git commit via the GitHub API → Vercel auto-deploys.

   Env vars (set in Vercel → Project → Settings → Environment Variables):
     GITHUB_TOKEN   - fine-grained personal access token, Contents: Read+Write on this repo only
     GITHUB_REPO    - "owner/repo", e.g. "spiro/automobile-sx"
     GITHUB_BRANCH  - usually "main"

   Local development / testing: set SX_MOCK_DIR=/path/to/site to read/write the
   local filesystem instead of GitHub (no token needed). */

const fs = require("fs");
const path = require("path");

const MOCK = process.env.SX_MOCK_DIR;
const API = "https://api.github.com";

function cfg() {
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!repo || !token) throw new Error("GITHUB_REPO / GITHUB_TOKEN env vars are not set");
  return { repo, token, branch };
}

async function gh(pathname, options) {
  const { token } = cfg();
  const res = await fetch(API + pathname, Object.assign({
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "User-Agent": "automobile-sx-admin",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }, options, {
    headers: Object.assign({
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "User-Agent": "automobile-sx-admin",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    }, (options && options.headers) || {})
  }));
  if (!res.ok) {
    const body = await res.text();
    throw new Error("GitHub API " + res.status + " on " + pathname + ": " + body.slice(0, 300));
  }
  return res.json();
}

/* ---------- Read the current inventory JSON (latest committed version) ---------- */
async function readInventory() {
  if (MOCK) {
    const p = path.join(MOCK, "data/vehicles.json");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  const { repo, branch } = cfg();
  const data = await gh("/repos/" + repo + "/contents/data/vehicles.json?ref=" + branch);
  return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
}

/* ---------- Read any text file from the repo (or the mock dir) ----------
   Used by the listing pages, which are edited in place rather than
   regenerated: /api/save has to see the current HTML before it can swap the
   card region inside it. Returns null when the file is not there, because a
   missing page is a reason to skip that page, not to fail the save. */
async function readTextFile(filePath) {
  if (MOCK) {
    try { return fs.readFileSync(path.join(MOCK, filePath), "utf8"); }
    catch (e) { return null; }
  }
  const { repo, branch } = cfg();
  try {
    const data = await gh("/repos/" + repo + "/contents/" + filePath + "?ref=" + branch);
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch (e) {
    return null;
  }
}

/* ---------- Store an uploaded image as a git blob; returns { sha } ---------- */
async function createImageBlob(base64) {
  if (MOCK) {
    // In mock mode the caller passes the target path via saveMockImage instead.
    return { sha: "mock" };
  }
  const { repo } = cfg();
  const out = await gh("/repos/" + repo + "/git/blobs", {
    method: "POST",
    body: JSON.stringify({ content: base64, encoding: "base64" })
  });
  return { sha: out.sha };
}

function saveMockImage(relPath, base64) {
  const abs = path.join(MOCK, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, Buffer.from(base64, "base64"));
}

/* ---------- One commit: updated JSON + new image blobs + deletions ---------- */
async function commitInventory({ json, newImages, newFiles, deletePaths, message }) {
  if (MOCK) {
    fs.writeFileSync(path.join(MOCK, "data/vehicles.json"), JSON.stringify(json, null, 2));
    (newFiles || []).forEach(function (f) {
      const abs = path.join(MOCK, f.path);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, f.content);
    });
    (deletePaths || []).forEach(function (p) {
      const abs = path.join(MOCK, p);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    });
    return { commit: "mock-commit", mock: true };
  }

  const { repo, branch } = cfg();
  const ref = await gh("/repos/" + repo + "/git/ref/heads/" + branch);
  const headSha = ref.object.sha;
  const headCommit = await gh("/repos/" + repo + "/git/commits/" + headSha);

  /* GitHub rejects the whole commit if you try to delete a path that is not in
     the tree, so only ask to remove files that actually exist. */
  let existing = null;
  if ((deletePaths || []).length) {
    try {
      const full = await gh("/repos/" + repo + "/git/trees/" + headCommit.tree.sha + "?recursive=1");
      existing = new Set((full.tree || [])
        .filter(function (n) { return n.type === "blob"; })
        .map(function (n) { return n.path; }));
    } catch (e) {
      existing = null; /* could not list: fall through and skip deletions */
    }
  }
  const safeDeletes = (deletePaths || []).filter(function (p) {
    return existing ? existing.has(p) : false;
  });

  const tree = [];
  tree.push({
    path: "data/vehicles.json",
    mode: "100644",
    type: "blob",
    content: JSON.stringify(json, null, 2)
  });
  (newImages || []).forEach(function (img) {
    tree.push({ path: img.path, mode: "100644", type: "blob", sha: img.sha });
  });
  (newFiles || []).forEach(function (f) {
    tree.push({ path: f.path, mode: "100644", type: "blob", content: f.content });
  });
  safeDeletes.forEach(function (p) {
    tree.push({ path: p, mode: "100644", type: "blob", sha: null });
  });

  const newTree = await gh("/repos/" + repo + "/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: tree })
  });

  const commit = await gh("/repos/" + repo + "/git/commits", {
    method: "POST",
    body: JSON.stringify({
      message: message || "Inventory update via admin panel",
      tree: newTree.sha,
      parents: [headSha]
    })
  });

  await gh("/repos/" + repo + "/git/refs/heads/" + branch, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha })
  });

  return { commit: commit.sha };
}

module.exports = { readInventory, readTextFile, createImageBlob, saveMockImage, commitInventory, MOCK: !!MOCK };
