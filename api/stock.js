/* Public feed for interactive features, from the same snapshot as the HTML. */
const { readPublicInventory, CACHE_CONTROL } = require("./_lib/publicInventory.js");
const contact = require("./_lib/contact.js");

module.exports = async function (req, res) {
  /* /api/contact rewrites here with an internal query marker. Keeping the
     marker explicit prevents a GET to that route from exposing stock instead
     of returning the contact handler's normal 405 response. */
  const url = new URL(req.url || "/", "http://x");
  if (url.searchParams.get("action") === "contact") return contact(req, res);

  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const data = await readPublicInventory();
    res.statusCode = 200;
    res.setHeader("Cache-Control", CACHE_CONTROL);
    if (req.method === "HEAD") return res.end();
    res.end(JSON.stringify(data));
  } catch (error) {
    res.statusCode = 503;
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ error: "Inventory is temporarily unavailable" }));
  }
};
