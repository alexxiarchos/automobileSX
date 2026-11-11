/* Static detail pages normally win. Resolve missing files and retired slugs
   against the same deployment snapshot used to build those pages. */
const fs = require("node:fs");
const path = require("node:path");
const { readPublicInventory, CACHE_CONTROL } = require("./_lib/publicInventory.js");
const { renderVehiclePage, PATHS } = require("./_lib/vehiclePage.js");

function html(req, res, body, status, cacheControl) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  return res.end(req.method === "HEAD" ? undefined : body);
}

function notFound() {
  try {
    return require("./_lib/shells.json").notFound;
  } catch (error) {
    return fs.readFileSync(path.join(__dirname, "../404.html"), "utf8");
  }
}

module.exports = async function (req, res) {
  const url = new URL(req.url || "/", "http://x");
  const q = req.query || {};
  const id = String(q.id || url.searchParams.get("id") || "").trim();
  const lang = (q.lang || url.searchParams.get("lang")) === "fr" ? "fr" : "en";

  let data;
  try {
    data = await readPublicInventory();
  } catch (error) {
    const message = lang === "fr" ? "Inventaire temporairement indisponible" : "Inventory temporarily unavailable";
    const link = lang === "fr" ? "Voir l'inventaire" : "Browse inventory";
    const body = '<!DOCTYPE html><html lang="' + lang + '"><title>' + message +
      '</title><h1>' + message + '</h1><a href="' + PATHS[lang].inventory + '">' + link + '</a></html>';
    res.setHeader("Retry-After", "60");
    return html(req, res, body, 503, "no-store");
  }

  const vehicle = data.vehicles.find(v => v.id === id);
  if (vehicle) {
    return html(req, res, renderVehiclePage(vehicle, lang, data.revision).html, 200, CACHE_CONTROL);
  }

  const moved = id && data.vehicles.find(v => Array.isArray(v.slugHistory) && v.slugHistory.includes(id));
  if (moved) {
    res.statusCode = 301;
    res.setHeader("Location", "/" + PATHS[lang].dir + "/" + encodeURIComponent(moved.id));
    res.setHeader("Cache-Control", CACHE_CONTROL);
    return res.end();
  }

  return html(req, res, notFound(), 404, CACHE_CONTROL);
};
