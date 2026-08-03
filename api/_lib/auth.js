/* Session auth for the admin panel.
   Credentials + secret live in Vercel environment variables:
     ADMIN_USER      — login username
     ADMIN_PASSWORD  — login password (use a long, unique one)
     SESSION_SECRET  — random string used to sign session cookies (32+ chars)
   No database: the session is a signed, expiring token in an HttpOnly cookie. */

const crypto = require("crypto");

const COOKIE = "sx_admin";
const SESSION_HOURS = 24 * 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET env var is not set");
  return s;
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

function sign(data) {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

function timingSafeEq(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) {
    // compare against self to keep timing constant, then fail
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

function checkCredentials(username, password) {
  const u = process.env.ADMIN_USER;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return false;
  const uOk = timingSafeEq(username || "", u);
  const pOk = timingSafeEq(password || "", p);
  return uOk && pOk;
}

function createSessionCookie() {
  const payload = b64url(JSON.stringify({ exp: Date.now() + SESSION_HOURS * 3600 * 1000 }));
  const token = payload + "." + sign(payload);
  const secure = process.env.SX_MOCK_DIR ? "" : " Secure;";
  return (
    COOKIE + "=" + token + "; HttpOnly;" + secure +
    " SameSite=Lax; Path=/; Max-Age=" + SESSION_HOURS * 3600
  );
}

function clearSessionCookie() {
  return COOKIE + "=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

function isAuthed(req) {
  const raw = req.headers.cookie || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  if (!m) return false;
  const parts = m[1].split(".");
  if (parts.length !== 2) return false;
  if (!timingSafeEq(parts[1], sign(parts[0]))) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString());
    return payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}

function requireAuth(req, res) {
  if (isAuthed(req)) return true;
  res.statusCode = 401;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Not authenticated" }));
  return false;
}

/* Tiny in-memory brute-force damper (per serverless instance; best-effort) */
const attempts = new Map();
function throttle(ip) {
  const now = Date.now();
  const rec = attempts.get(ip) || { n: 0, t: now };
  if (now - rec.t > 15 * 60 * 1000) { rec.n = 0; rec.t = now; }
  rec.n += 1;
  attempts.set(ip, rec);
  return rec.n > 20; // >20 tries in 15 min → back off
}

module.exports = { checkCredentials, createSessionCookie, clearSessionCookie, isAuthed, requireAuth, throttle };
