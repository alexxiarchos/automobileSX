/* POST one photo (client-side compressed JPEG, base64).
   Creates a git blob and returns { path, sha }; the blob only becomes part of
   the repo when /api/save commits it, so abandoned uploads cost nothing.
   Body: { vehicleId, filename, data }  (data = base64, no data: prefix) */
const { requireAuth } = require("./_lib/auth.js");
const { createImageBlob, saveMockImage, MOCK } = require("./_lib/github.js");
const readBody = require("./_lib/body.js");

module.exports = async function (req, res) {
  if (req.method !== "POST") { res.statusCode = 405; return res.end(); }
  if (!requireAuth(req, res)) return;
  res.setHeader("Content-Type", "application/json");
  try {
    const body = await readBody(req, 6 * 1024 * 1024);
    const id = String(body.vehicleId || "vehicle").replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "vehicle";
    const name = String(body.filename || "photo.jpg").replace(/[^a-z0-9.-]/gi, "").slice(0, 80);
    if (!body.data) throw new Error("No image data");
    const relPath = "images/vehicles/" + id + "/" + name;

    if (MOCK) {
      saveMockImage(relPath, body.data);
      res.statusCode = 200;
      return res.end(JSON.stringify({ path: relPath, sha: "mock" }));
    }
    const blob = await createImageBlob(body.data);
    res.statusCode = 200;
    res.end(JSON.stringify({ path: relPath, sha: blob.sha }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
