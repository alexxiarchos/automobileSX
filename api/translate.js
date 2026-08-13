/* POST /api/translate  { text }  →  { text, provider }

   Admin-only, and read-only: it never touches the inventory. The admin panel
   decides what to do with the French that comes back, which means a bad
   translation is one Ctrl+Z away rather than something already committed. */

const { requireAuth } = require("./_lib/auth.js");
const { translate } = require("./_lib/translate.js");
const readBody = require("./_lib/body.js");

module.exports = async function (req, res) {
  if (req.method !== "POST") { res.statusCode = 405; return res.end(); }
  if (!requireAuth(req, res)) return;
  res.setHeader("Content-Type", "application/json");
  try {
    const body = await readBody(req, 64 * 1024);
    const out = await translate(body.text);
    res.statusCode = 200;
    res.end(JSON.stringify(out));
  } catch (e) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: e.message }));
  }
};
