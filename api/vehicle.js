/* Resolver for /vehicles/:id and /fr/vehicules/:id.
   Vercel only reaches this after the filesystem check, so every published
   vehicle is still served as the pre-rendered static file committed by
   /api/save. This function is what happens when there is no file:

     1. the id is a current vehicle  -> serve the client-rendered shell (200)
     2. the id is a retired address  -> 301 straight to the current address
     3. the id is unknown            -> the branded 404 page, with a real 404

   Case 2 is the point: when the owner corrects a misspelled address in the
   admin panel, the old id is kept in that vehicle's slugHistory, its old
   pre-rendered files are deleted, and every old link lands here and is sent
   once (never a chain) to the new URL. */

const fs = require("fs");
const path = require("path");

const BASE = { en: "/vehicles/", fr: "/fr/vehicules/" };

/* Shells are written by build/build.js so this function never depends on
   includeFiles globs or on reading HTML off the deployment filesystem. */
let SHELLS = null;
try { SHELLS = require("./_lib/shells.json"); } catch (e) { SHELLS = null; }

async function readVehicles(req) {
  const candidates = [
    path.join(__dirname, "..", "data", "vehicles.json"),
    path.join(process.cwd(), "data", "vehicles.json")
  ];
  for (const file of candidates) {
    try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { /* next */ }
  }
  try {
    const host = (req && req.headers && req.headers.host) || "www.automobilesx.ca";
    const proto = /localhost|127\.0\.0\.1/.test(host) ? "http" : "https";
    const r = await fetch(proto + "://" + host + "/data/vehicles.json", { cache: "no-store" });
    if (r.ok) return await r.json();
  } catch (e) { /* fall through */ }
  return { vehicles: [] };
}

async function shell(req, which) {
  if (SHELLS && SHELLS[which]) return SHELLS[which];
  const files = { en: "vehicle.html", fr: "fr/vehicule.html", notFound: "404.html" };
  try {
    return fs.readFileSync(path.join(__dirname, "..", files[which]), "utf8");
  } catch (e) { /* fall through to the network copy */ }
  try {
    const host = (req && req.headers && req.headers.host) || "www.automobilesx.ca";
    const proto = /localhost|127\.0\.0\.1/.test(host) ? "http" : "https";
    const urls = { en: "/vehicle", fr: "/fr/vehicule", notFound: "/404.html" };
    const r = await fetch(proto + "://" + host + urls[which]);
    if (r.ok) return await r.text();
  } catch (e) { /* fall through */ }
  return null;
}

function html(res, body, status) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(body);
}

module.exports = async function (req, res) {
  const url = new URL(req.url || "/", "http://x");
  const q = req.query || {};
  const id = String(q.id || url.searchParams.get("id") || "").trim();
  const lang = (q.lang || url.searchParams.get("lang")) === "fr" ? "fr" : "en";

  let data = { vehicles: [] };
  try { data = await readVehicles(req); } catch (e) { /* treated as empty */ }

  const listed = (data.vehicles || []).filter(v => v && v.id && v.status !== "draft");

  /* 1. Known, current address: hand back the shell and let detail.js render it. */
  if (id && listed.some(v => v.id === id)) {
    const body = await shell(req, lang);
    if (body) {
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
      return html(res, body, 200);
    }
    res.statusCode = 302;                       /* shell unavailable: don't 404 a real car */
    res.setHeader("Location", lang === "fr" ? "/fr/inventaire" : "/inventory");
    return res.end();
  }

  /* 2. Retired address: one permanent hop to wherever that vehicle lives now. */
  if (id) {
    const moved = listed.find(v => Array.isArray(v.slugHistory) && v.slugHistory.indexOf(id) !== -1);
    if (moved) {
      res.statusCode = 301;
      res.setHeader("Location", BASE[lang] + encodeURIComponent(moved.id));
      /* max-age=0 so a corrected address is never stuck in a browser cache;
         s-maxage lets the CDN serve the redirect without re-running this. */
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
      return res.end();
    }
  }

  /* 3. Genuinely gone. A real 404 beats a soft 404 for crawlers. */
  const nf = await shell(req, "notFound");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
  return html(res, nf || "Not found", 404);
};
