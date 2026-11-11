const { createHash } = require("node:crypto");
const rules = require("../../js/inventory-rules.js");

const CACHE_CONTROL = "public, max-age=0, must-revalidate";

function snapshot(data) {
  const vehicles = rules.validate(data).vehicles.filter(rules.isPublic).map(function (vehicle) {
    const { draftNotes, posts, ...published } = vehicle;
    return published;
  });
  const revision = createHash("sha256").update(JSON.stringify(vehicles)).digest("hex");
  return { revision, updatedAt: data.updatedAt, vehicles };
}

let deployed;

async function readPublicInventory() {
  if (!process.env.SX_MOCK_DIR || process.env.SX_USE_BUILD_SNAPSHOT === "1") {
    if (!deployed) deployed = rules.validate(require("./inventory-snapshot.json"));
    return deployed;
  }
  return snapshot(await require("./github.js").readInventory());
}

module.exports = { snapshot, readPublicInventory, CACHE_CONTROL };
