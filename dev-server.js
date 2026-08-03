/* Local development server — NOT deployed (Vercel only runs /api and serves static files).
   Usage:
     ADMIN_USER=spiro ADMIN_PASSWORD=test123 SESSION_SECRET=devsecret node dev-server.js
   Serves the site on http://localhost:3000 and runs the /api functions locally
   with SX_MOCK_DIR pointing at this folder (writes JSON/images to disk instead of GitHub). */

process.env.SX_MOCK_DIR = process.env.SX_MOCK_DIR || __dirname;
process.env.ADMIN_USER = process.env.ADMIN_USER || "spiro";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "test123";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-not-for-production";

const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".md": "text/plain" };

const apis = {};
fs.readdirSync(path.join(__dirname, "api")).forEach(function (f) {
  if (f.endsWith(".js")) apis["/api/" + f.replace(/\.js$/, "")] = require("./api/" + f);
});

const server = http.createServer(function (req, res) {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;

  if (apis[p]) return apis[p](req, res);

  let file = p === "/" ? "/index.html" : decodeURIComponent(p);
  if (file.endsWith("/")) file += "index.html";
  else if (fs.existsSync(path.join(__dirname, file)) && fs.statSync(path.join(__dirname, file)).isDirectory()) file += "/index.html";
  const abs = path.join(__dirname, file);
  if (!abs.startsWith(__dirname)) { res.statusCode = 403; return res.end(); }
  fs.readFile(abs, function (err, buf) {
    if (err) {
      // extensionless → try .html
      fs.readFile(abs + ".html", function (err2, buf2) {
        if (err2) { res.statusCode = 404; return res.end("Not found"); }
        res.setHeader("Content-Type", "text/html");
        res.end(buf2);
      });
      return;
    }
    res.setHeader("Content-Type", MIME[path.extname(abs)] || "application/octet-stream");
    res.end(buf);
  });
});

server.listen(process.env.PORT || 3000, function () {
  console.log("Dev server: http://localhost:" + (process.env.PORT || 3000));
  console.log("Admin:      http://localhost:" + (process.env.PORT || 3000) + "/admin/  (user: " +
    process.env.ADMIN_USER + ", pass: " + process.env.ADMIN_PASSWORD + ")");
});
