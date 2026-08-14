/* POST the full inventory + any newly uploaded image blobs → ONE git commit.
   Vercel auto-deploys that commit, so the public site updates by itself.
   Body: { vehicles: [...], newImages: [{path, sha}], deletePaths: [...], message } */
const { requireAuth } = require("./_lib/auth.js");
const { commitInventory, readInventory, readTextFile } = require("./_lib/github.js");
const { submit, changedUrls } = require("./_lib/indexnow.js");
const { renderVehiclePages, vehiclePagePaths } = require("./_lib/vehiclePage.js");
const { renderListingPages } = require("./_lib/listingPages.js");
const readBody = require("./_lib/body.js");

const MAX_VEHICLES = 200;
const CONFLICT_MESSAGE = "Inventory changed since this page loaded. Reload the admin before saving so newer changes are not overwritten.";

function conflictError() {
  const err = new Error(CONFLICT_MESSAGE);
  err.statusCode = 409;
  err.code = "INVENTORY_CONFLICT";
  return err;
}

function assertFreshInventory(baseUpdatedAt, currentUpdatedAt) {
  if (!baseUpdatedAt || baseUpdatedAt !== currentUpdatedAt) throw conflictError();
}

function vinKey(vin) {
  return String(vin || "").trim().toUpperCase().replace(/[\s-]+/g, "");
}

function duplicateVinGroups(vehicles) {
  const groups = new Map();
  (vehicles || []).forEach(function (v) {
    const vin = vinKey(v && v.vin);
    if (!vin) return;
    if (!groups.has(vin)) groups.set(vin, []);
    groups.get(vin).push(v);
  });
  return groups;
}

function duplicateVinError(vehicles, previousVehicles) {
  const previous = duplicateVinGroups(previousVehicles);
  const submitted = duplicateVinGroups(vehicles);
  for (const [vin, group] of submitted) {
    if (group.length < 2) continue;
    const ids = group.map(function (v) { return String(v.id || ""); }).sort().join("|");
    const oldGroup = previous.get(vin) || [];
    const oldIds = oldGroup.map(function (v) { return String(v.id || ""); }).sort().join("|");
    /* Do not freeze every save because of a duplicate that already exists in
       production. The editor flags those records; the server blocks only a new
       duplicate or another vehicle being added to an existing duplicate. */
    if (oldGroup.length === group.length && oldIds === ids) continue;
    const labels = group.map(function (v) {
      return [v.year, v.make, v.model].filter(Boolean).join(" ") + " (stock " + (v.stock || "-") + ")";
    });
    return "VIN " + vin + " is used by both " + labels.join(" and ") + ".";
  }
  return "";
}

function sanitizeVehicle(v) {
  // keep only known fields; prevents junk from ballooning the JSON
  const KEEP = ["id", "year", "make", "model", "trim", "body", "price", "km",
    "transmission", "fuel", "drivetrain", "extColor", "extHex", "intColor",
    "engine", "econCity", "econHwy", "doors", "seats", "vin", "stock", "tag",
    "features", "desc", "descFr", "descMode", "descNote", "descNoteFr",
    "draftNotes", "images", "status", "opc",
    "createdAt", "updatedAt", "publishedAt", "soldAt", "soldAnnouncedAt",
    "posts", "slugHistory"];
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
    const current = await readInventory();
    assertFreshInventory(body.baseUpdatedAt, current.updatedAt);
    const vehicles = (body.vehicles || []).slice(0, MAX_VEHICLES).map(sanitizeVehicle);

    // basic validation: every non-draft vehicle needs the essentials
    for (const v of vehicles) {
      if (!v.id) throw new Error("A vehicle is missing its id");
      if (v.status !== "draft" && (!v.year || !v.make || !v.model || !v.price)) {
        throw new Error((v.id || "A vehicle") + " is missing year/make/model/price. Save it as a draft instead.");
      }
    }

    const vinError = duplicateVinError(vehicles, current.vehicles || []);
    if (vinError) {
      const err = new Error(vinError);
      err.statusCode = 400;
      throw err;
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

    /* The inventory page and the homepage carry their cards in the HTML so a
       crawler sees the stock and the links to it. Stock changes here, not at
       build time, so the card region is rewritten on every save. Failing to
       update them must never fail the save itself: the inventory JSON is the
       source of truth and the browser still fills the grid either way. */
    try {
      const listing = await renderListingPages(live, readTextFile);
      listing.forEach(function (page) {
        newFiles.push({ path: page.path, content: page.content });
      });
    } catch (e) { /* listing pages left as they were */ }

    /* Remove pages for vehicles that were deleted or moved back to draft */
    const liveIds = new Set(live.map(function (v) { return v.id; }));
    let stalePages = [];
    const previousVehicles = current.vehicles || [];
    previousVehicles.forEach(function (v) {
      if (v && v.id && !liveIds.has(v.id)) stalePages = stalePages.concat(vehiclePagePaths(v.id));
    });

    const imageDeletes = (body.deletePaths || []).filter(function (p) {
      return typeof p === "string" && p.indexOf("images/vehicles/") === 0;
    });

    const result = await commitInventory({
      json: json,
      newImages: body.newImages || [],
      newFiles: newFiles,
      deletePaths: imageDeletes.concat(stalePages),
      message: body.message || "Inventory update via admin panel",
      expectedUpdatedAt: body.baseUpdatedAt
    });
    /* Ping IndexNow after the commit has succeeded, never before. Failures are
       swallowed inside submit(), so this cannot affect the publish. */
    let indexNow = "skipped";
    try {
      const urls = changedUrls(previousVehicles, vehicles);
      indexNow = await submit(urls);
    } catch (e) {
      indexNow = "failed (ignored): " + e.message;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(Object.assign({}, result, { indexNow: indexNow, updatedAt: json.updatedAt })));
  } catch (e) {
    res.statusCode = e.statusCode || 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};

module.exports._test = { assertFreshInventory, duplicateVinError, vinKey };
