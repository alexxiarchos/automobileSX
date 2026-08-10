/* POST the full inventory + any newly uploaded image blobs → ONE git commit.
   Vercel auto-deploys that commit, so the public site updates by itself.
   Body: { vehicles: [...], newImages: [{path, sha}], deletePaths: [...], message } */
const { requireAuth } = require("./_lib/auth.js");
const { commitInventory, readInventory } = require("./_lib/github.js");
const { renderVehiclePages, vehiclePagePaths } = require("./_lib/vehiclePage.js");
const readBody = require("./_lib/body.js");

const MAX_VEHICLES = 200;

function sanitizeVehicle(v) {
  // keep only known fields; prevents junk from ballooning the JSON
  const KEEP = ["id", "year", "make", "model", "trim", "body", "price", "km",
    "transmission", "fuel", "drivetrain", "extColor", "extHex", "intColor",
    "engine", "econCity", "econHwy", "doors", "seats", "vin", "stock", "tag",
    "features", "desc", "images", "status", "createdAt", "updatedAt", "slugHistory"];
  const out = {};
  KEEP.forEach(function (k) { if (v[k] !== undefined) out[k] = v[k]; });
  return out;
}

module.exports = async function (req, res) {
  if (req.method !== "POST") { res.statusCode = 405; return res.end(); }
  if (!requireAuth(req, res)) return;
  res.setHeader("Content-Type", "application/json");
  try {
    const body = await readBody(req, 4 * 1024 * 1024);
    const vehicles = (body.vehicles || []).slice(0, MAX_VEHICLES).map(sanitizeVehicle);

    // basic validation: every non-draft vehicle needs the essentials
    for (const v of vehicles) {
      if (!v.id) throw new Error("A vehicle is missing its id");
      if (v.status !== "draft" && (!v.year || !v.make || !v.model || !v.price)) {
        throw new Error((v.id || "A vehicle") + " is missing year/make/model/price. Save it as a draft instead.");
      }
    }

    const json = { updatedAt: new Date().toISOString(), vehicles: vehicles };

    /* Pre-render a crawlable page per published vehicle, in both languages,
       so search engines see real titles and specs without running JavaScript. */
    const live = vehicles.filter(function (v) { return v.status !== "draft"; });
    const newFiles = [];
    live.forEach(function (v) {
      renderVehiclePages(v).forEach(function (page) {
        newFiles.push({ path: page.path, content: page.html });
      });
    });

    /* Remove pages for vehicles that were deleted or moved back to draft */
    const liveIds = new Set(live.map(function (v) { return v.id; }));
    let stalePages = [];
    try {
      const previous = await readInventory();
      (previous.vehicles || []).forEach(function (v) {
        if (v && v.id && !liveIds.has(v.id)) stalePages = stalePages.concat(vehiclePagePaths(v.id));
      });
    } catch (e) { /* first run, or unreadable: nothing to clean up */ }

    const imageDeletes = (body.deletePaths || []).filter(function (p) {
      return typeof p === "string" && p.indexOf("images/vehicles/") === 0;
    });

    const result = await commitInventory({
      json: json,
      newImages: body.newImages || [],
      newFiles: newFiles,
      deletePaths: imageDeletes.concat(stalePages),
      message: body.message || "Inventory update via admin panel"
    });
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
