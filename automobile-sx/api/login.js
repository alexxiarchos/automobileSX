const { checkCredentials, createSessionCookie, throttle } = require("./_lib/auth.js");
const readBody = require("./_lib/body.js");

module.exports = async function (req, res) {
  if (req.method !== "POST") { res.statusCode = 405; return res.end(); }
  res.setHeader("Content-Type", "application/json");
  try {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "local";
    if (throttle(ip)) {
      res.statusCode = 429;
      return res.end(JSON.stringify({ error: "Too many attempts. Try again in 15 minutes." }));
    }
    const body = await readBody(req, 10 * 1024);
    if (!checkCredentials(body.username, body.password)) {
      await new Promise(function (r) { setTimeout(r, 600); });
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: "Wrong username or password." }));
    }
    res.setHeader("Set-Cookie", createSessionCookie());
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
