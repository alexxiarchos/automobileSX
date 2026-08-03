const { isAuthed } = require("./_lib/auth.js");

module.exports = async function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = isAuthed(req) ? 200 : 401;
  res.end(JSON.stringify({ ok: isAuthed(req) }));
};
