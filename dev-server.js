/* Local development server. Not used by Vercel.
   It reads vercel.json and applies the same routing order Vercel does:
     redirects -> filesystem (with cleanUrls) -> rewrites -> filesystem -> 404
   so a broken rewrite or a self-conflicting redirect fails here too.

   Usage: node dev-server.js   ->   http://localhost:3000 */

process.env.SX_MOCK_DIR = process.env.SX_MOCK_DIR || __dirname;
process.env.ADMIN_USER = process.env.ADMIN_USER || "spiro";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test123";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-not-for-production";

const http = require("http");
const fs = require("fs");
const path = require("path");

const CONF = JSON.parse(fs.readFileSync(path.join(__dirname, "vercel.json"), "utf8"));
const CLEAN = CONF.cleanUrls === true;
const NO_SLASH = CONF.trailingSlash === false;

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".xml": "application/xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".webmanifest": "application/manifest+json",
  ".md": "text/plain", ".txt": "text/plain; charset=utf-8"
};

const apis = {};
fs.readdirSync(path.join(__dirname, "api")).forEach(f => {
  if (f.endsWith(".js")) apis["/api/" + f.replace(/\.js$/, "")] = require("./api/" + f);
});

/* "/vehicles/:id" -> regex with named params */
function toMatcher(source) {
  const names = [];
  const re = source.replace(/:([A-Za-z0-9_]+)/g, (_, n) => { names.push(n); return "([^/]+)"; });
  return { re: new RegExp("^" + re + "$"), names };
}
const REWRITES = (CONF.rewrites || []).map(r => Object.assign({}, r, toMatcher(r.source)));
const REDIRECTS = (CONF.redirects || []).map(r => Object.assign({}, r, toMatcher(r.source)));

/* Resolve a URL path to a file on disk, honouring cleanUrls */
function resolveFile(p) {
  const rel = p.replace(/^\/+/, "");
  const tries = [];
  if (p === "/") tries.push("index.html");
  else {
    tries.push(rel);                       // exact file (assets, favicon.ico…)
    if (CLEAN) tries.push(rel + ".html");  // /inventory -> inventory.html
    tries.push(path.join(rel, "index.html"));
  }
  for (const t of tries) {
    const abs = path.join(__dirname, t);
    if (abs.startsWith(__dirname) && fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  }
  return null;
}

function send(res, file, status) {
  res.statusCode = status || 200;
  res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
  res.end(fs.readFileSync(file));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const p = decodeURIComponent(url.pathname);
  const qs = url.search || "";

  /* --- API functions --- */
  if (apis[p]) return apis[p](req, res);

  /* --- Phase 1: redirects (including the ones cleanUrls implies) --- */
  if (CLEAN && /\.html$/.test(p)) {
    const to = p.replace(/(\/index)?\.html$/, "") || "/";
    res.writeHead(308, { Location: (to || "/") + qs });
    return res.end();
  }
  if (NO_SLASH && p.length > 1 && p.endsWith("/")) {
    res.writeHead(308, { Location: p.replace(/\/+$/, "") + qs });
    return res.end();
  }
  for (const r of REDIRECTS) {
    if (r.re.test(p)) {
      res.writeHead(r.permanent ? 308 : 307, { Location: r.destination + qs });
      return res.end();
    }
  }

  /* --- Phase 2: filesystem --- */
  let file = resolveFile(p);
  if (file) return send(res, file);

  /* --- Phase 3: rewrites, then filesystem again --- */
  for (const r of REWRITES) {
    const m = r.re.exec(p);
    if (!m) continue;
    let dest = r.destination;
    r.names.forEach((n, i) => { dest = dest.split(":" + n).join(encodeURIComponent(m[i + 1])); });
    const cut = dest.indexOf("?");
    const destPath = cut === -1 ? dest : dest.slice(0, cut);
    if (apis[destPath]) {
      req.url = dest;                 /* so the function sees its query string */
      return apis[destPath](req, res);
    }
    file = resolveFile(destPath);
    if (file) return send(res, file);
  }

  /* --- Phase 4: 404 --- */
  const nf = path.join(__dirname, "404.html");
  if (fs.existsSync(nf)) return send(res, nf, 404);
  res.statusCode = 404;
  res.end("Not found: " + p);
});

server.listen(process.env.PORT || 3000, () => {
  const port = process.env.PORT || 3000;
  console.log("Site:  http://localhost:" + port);
  console.log("FR:    http://localhost:" + port + "/fr");
  console.log("Admin: http://localhost:" + port + "/admin  (spiro / test123)");
});
