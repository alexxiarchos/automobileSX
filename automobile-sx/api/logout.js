const { clearSessionCookie } = require("./_lib/auth.js");

module.exports = async function (req, res) {
  res.setHeader("Set-Cookie", clearSessionCookie());
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
};
