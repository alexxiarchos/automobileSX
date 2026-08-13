/* GET /api/vin?vin=<17 chars>  — admin only.

   Proxied through the server rather than called from the browser for two
   reasons: it keeps the admin page free of cross-origin surprises, and it
   means a change of VIN provider later touches one file instead of the UI.

   This endpoint only reads. It never writes to the inventory, so a bad decode
   cannot damage anything: the worst case is the owner ignores the suggestion
   and types the fields in as before. */

const { requireAuth } = require("./_lib/auth.js");
const { decode } = require("./_lib/vin.js");

module.exports = async function (req, res) {
  if (!requireAuth(req, res)) return;
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  try {
    const url = new URL(req.url || "/", "http://x");
    const out = await decode(url.searchParams.get("vin") || "");
    res.statusCode = 200;
    res.end(JSON.stringify(out));
  } catch (e) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: e.message }));
  }
};
