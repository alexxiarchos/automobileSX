/* Local development server. Not used by Vercel.
   Emulates the vercel.json routing (clean URLs, vehicle rewrites, sitemap)
   so local testing matches production.

   Usage: node dev-server.js   →   http://localhost:3000 */

process.env.SX_MOCK_DIR = process.env.SX_MOCK_DIR || __dirname;
process.env.ADMIN_USER = process.env.ADMIN_USER || "spiro";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test123";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-not-for-production";

const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".xml": "application/xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".md": "text/plain", ".webmanifest": "application/manifest+json"
};

const apis = {};
fs.readdirSync(path.join(__dirname, "api")).forEach(f => {
  if (f.endsWith(".js")) apis["/api/" + f.replace(/\.js$/, "")] = require("./api/" + f);
});

function send(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  let p = decodeURIComponent(url.pathname);

  /* API functions */
  if (apis[p]) return apis[p](req, res);

  /* vercel.json rewrites */
  if (p === "/sitemap.xml") return apis["/api/sitemap"](req, res);
  /* Vercel checks the filesystem before rewrites: a pre-rendered page wins,
     the JS template is only the fallback. */
  if (/^\/vehicles\/[^/]+$/.test(p) || /^\/fr\/vehicules\/[^/]+$/.test(p)) {
    const pre = path.join(__dirname, p.replace(/^\//, "") + ".html");
    if (fs.existsSync(pre)) return send(res, pre);
    const tpl = p.startsWith("/fr/") ? path.join(__dirname, "fr", "vehicule.html")
                                     : path.join(__dirname, "vehicle.html");
    return send(res, tpl);
  }

  /* redirects */
  if (p === "/vehicle") { res.writeHead(302, { Location: "/inventory" }); return res.end(); }
  if (p === "/fr/vehicule") { res.writeHead(302, { Location: "/fr/inventaire" }); return res.end(); }

  /* clean URLs */
  const candidates = [];
  if (p === "/") candidates.push("index.html");
  else {
    const rel = p.replace(/^\/+/, "");
    if (p.endsWith("/")) candidates.push(rel + "index.html");
    else {
      candidates.push(rel);
      candidates.push(rel + ".html");
      candidates.push(rel + "/index.html");
    }
  }

  for (const c of candidates) {
    const abs = path.join(__dirname, c);
    if (abs.startsWith(__dirname) && fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      return send(res, abs);
    }
  }

  /* Vercel serves 404.html for unmatched routes; mirror that locally */
  const nf = path.join(__dirname, "404.html");
  if (fs.existsSync(nf)) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end(fs.readFileSync(nf));
  }
  res.statusCode = 404;
  res.end("Not found: " + p);
});

server.listen(process.env.PORT || 3000, () => {
  const port = process.env.PORT || 3000;
  console.log("Site:  http://localhost:" + port);
  console.log("FR:    http://localhost:" + port + "/fr/");
  console.log("Admin: http://localhost:" + port + "/admin  (spiro / test123)");
});
