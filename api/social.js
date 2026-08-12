/* Admin-only endpoint for the share panel.

   GET  /api/social?id=<vehicleId>
        Returns the caption, the Marketplace fields, and which platforms are
        configured. No credentials are ever returned.

   POST /api/social  { id, targets: ["facebook","instagram"], caption? }
        Posts and reports back per platform. One platform failing does not
        prevent the other from succeeding, and neither can affect inventory:
        this endpoint never writes to the repo. */

const { requireAuth } = require("./_lib/auth.js");
const { readInventory } = require("./_lib/github.js");
const readBody = require("./_lib/body.js");
const social = require("./_lib/social.js");

async function findVehicle(id) {
  const data = await readInventory();
  const v = (data.vehicles || []).find(x => x && x.id === id);
  if (!v) throw new Error("Vehicle not found");
  if (v.status === "draft") throw new Error("This vehicle is still a draft. Publish it first.");
  return v;
}

module.exports = async function (req, res) {
  if (!requireAuth(req, res)) return;
  res.setHeader("Content-Type", "application/json");

  try {
    const url = new URL(req.url || "/", "http://x");

    if (req.method === "GET") {
      const id = url.searchParams.get("id") || "";
      const v = await findVehicle(id);
      res.statusCode = 200;
      return res.end(JSON.stringify({
        title: social.title(v),
        url: social.vehicleUrl(v),
        image: social.firstImage(v),
        caption: social.caption(v),
        marketplace: social.marketplaceListing(v),
        configured: social.configured()
      }));
    }

    if (req.method === "POST") {
      const body = await readBody(req, 256 * 1024);
      const v = await findVehicle(String(body.id || ""));
      const text = (typeof body.caption === "string" && body.caption.trim())
        ? body.caption.trim()
        : social.caption(v);
      const targets = Array.isArray(body.targets) ? body.targets : [];
      const results = {};

      /* Sequential on purpose: if Facebook fails on a bad token, the same
         token is about to fail on Instagram, and the owner gets two clear
         messages rather than two simultaneous timeouts. */
      for (const t of targets) {
        try {
          if (t === "facebook") results.facebook = { ok: true, ...(await social.postToFacebook(v, text)) };
          else if (t === "instagram") results.instagram = { ok: true, ...(await social.postToInstagram(v, text)) };
        } catch (e) {
          results[t] = { ok: false, error: e.message };
        }
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({ results: results }));
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  } catch (e) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: e.message }));
  }
};
