/* GET the full inventory (including drafts) - admin only.
   Reads the latest committed data/vehicles.json from GitHub so the admin
   always edits the source of truth, not a stale deployment. */
const { requireAuth } = require("./_lib/auth.js");
const { readInventory } = require("./_lib/github.js");

module.exports = async function (req, res) {
  if (!requireAuth(req, res)) return;
  res.setHeader("Content-Type", "application/json");
  try {
    const data = await readInventory();
    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
