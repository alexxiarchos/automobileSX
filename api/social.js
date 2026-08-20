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
        imageCount: social.imageUrls(v).length,
        totalImageCount: Array.isArray(v.images) ? v.images.filter(Boolean).length : 0,
        caption: social.captionFacebook(v),      /* kept for older clients */
        captions: {
          facebook: social.captionFacebook(v),
          instagram: social.captionInstagram(v)
        },
        marketplace: social.marketplaceListing(v),
        status: v.status || "available",
        lifecycle: {
          sold: {
            facebook: social.soldNotice(v, "facebook"),
            instagram: social.soldNotice(v, "instagram")
          }
        },
        configured: social.configured()
      }));
    }

    if (req.method === "POST") {
      const body = await readBody(req, 256 * 1024);

      /* Removing a post we made. Deliberately not tied to a vehicle lookup:
         a post can outlive the listing it came from, and you should still be
         able to take it down after the car is gone. */
      if (body.action === "delete") {
        try {
          await social.deletePost(String(body.target || ""), String(body.postId || ""));
          res.statusCode = 200;
          return res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.statusCode = 200;
          return res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      }

      /* Announce a sale on the posts that are already up. One result per post
         so the panel can say exactly which platform refused and why, rather
         than collapsing a partial success into a single failure. */
      if (body.action === "sold") {
        const v = await findVehicle(String(body.id || ""));
        const posts = Array.isArray(body.posts) ? body.posts : [];
        const out = [];
        for (const p of posts) {
          const target = String(p.target || "");
          const postId = String(p.id || "");
          try {
            if (target === "facebook") {
              const r = await social.markSoldOnFacebook(v, postId);
              out.push({ target, postId, ok: true, skipped: !!r.skipped });
            } else if (target === "instagram") {
              await social.markSoldOnInstagram(v, postId);
              out.push({ target, postId, ok: true });
            } else {
              out.push({ target, postId, ok: false, error: "Unknown platform" });
            }
          } catch (e) {
            out.push({ target, postId, ok: false, error: e.message });
          }
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({ ok: out.some(function (r) { return r.ok; }), results: out }));
      }

      if (body.action === "price-drop") {
        const v = await findVehicle(String(body.id || ""));
        const oldPrice = Number(body.oldPrice);
        if (!(oldPrice > Number(v.price))) throw new Error("The saved price is not lower than the previous price");
        const posts = Array.isArray(body.posts) ? body.posts : [];
        const out = [];
        for (const p of posts) {
          const target = String(p.target || "");
          const postId = String(p.id || "");
          try {
            if (target === "facebook") {
              await social.markPriceDropOnFacebook(v, postId, oldPrice);
              out.push({ target, postId, ok: true });
            } else if (target === "instagram") {
              await social.markPriceDropOnInstagram(v, postId, oldPrice);
              out.push({ target, postId, ok: true });
            } else {
              out.push({ target, postId, ok: false, error: "Unknown platform" });
            }
          } catch (e) {
            out.push({ target, postId, ok: false, error: e.message });
          }
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({
          ok: out.some(function (r) { return r.ok; }),
          results: out,
          refresh: social.priceRefreshRecommendation(v, oldPrice)
        }));
      }

      const v = await findVehicle(String(body.id || ""));
      if ((v.status || "available") !== "available") {
        throw new Error("Only an available vehicle can be posted as a new listing");
      }
      const targets = Array.isArray(body.targets) ? body.targets : [];

      /* Each platform gets its own text. An override may be sent per platform,
         or as one string for both; anything not overridden is generated. */
      const given = body.captions && typeof body.captions === "object" ? body.captions : {};
      function textFor(t) {
        const own = typeof given[t] === "string" ? given[t].trim() : "";
        if (own) return own;
        if (typeof body.caption === "string" && body.caption.trim()) return body.caption.trim();
        return social.caption(v, t);
      }
      const results = {};

      /* Sequential on purpose: if Facebook fails on a bad token, the same
         token is about to fail on Instagram, and the owner gets two clear
         messages rather than two simultaneous timeouts. */
      for (const t of targets) {
        try {
          if (t === "facebook") {
            results.facebook = { ok: true, ...(await social.postToFacebook(v, textFor("facebook"))) };
          } else if (t === "instagram") {
            const out = await social.postToInstagram(v, textFor("instagram"));
            results.instagram = { ok: true, ...out, url: await social.instagramPermalink(out.id) };
          }
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
