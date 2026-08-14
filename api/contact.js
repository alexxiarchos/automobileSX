/* Public contact-form endpoint. Sends dealership inquiries through Resend while
   keeping API credentials server-side in Vercel environment variables. */
const crypto = require("crypto");
const readBody = require("./_lib/body.js");

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map();
const INTERESTS = {
  general: { en: "General question", fr: "Question générale" },
  vehicle: { en: "Specific vehicle", fr: "Véhicule précis" },
  "test-drive": { en: "Test drive", fr: "Essai routier" },
  financing: { en: "Financing", fr: "Financement" },
  "trade-in": { en: "Sell or trade a vehicle", fr: "Vente ou échange d'un véhicule" }
};

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function string(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function requestIp(req) {
  const forwarded = req.headers && req.headers["x-forwarded-for"];
  return string(Array.isArray(forwarded) ? forwarded[0] : forwarded, 100).split(",")[0].trim() ||
    (req.socket && req.socket.remoteAddress) || "unknown";
}

function isSameSite(req) {
  const headers = req.headers || {};
  if (String(headers["sec-fetch-site"] || "").toLowerCase() === "cross-site") return false;
  if (!headers.origin || !headers.host) return true;
  try {
    return new URL(headers.origin).host.toLowerCase() === String(headers.host).toLowerCase();
  } catch (error) {
    return false;
  }
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter(function (time) { return now - time < WINDOW_MS; });
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 1000) {
    attempts.forEach(function (times, key) {
      if (!times.some(function (time) { return now - time < WINDOW_MS; })) attempts.delete(key);
    });
  }
  return recent.length > MAX_REQUESTS;
}

function validate(body) {
  const data = {
    name: string(body.name, 100),
    email: string(body.email, 254).toLowerCase(),
    phone: string(body.phone, 40),
    message: string(body.message, 3000),
    interest: string(body.interest, 30),
    vehicleId: string(body.vehicleId, 100),
    vehicleLabel: string(body.vehicleLabel, 160),
    lang: body.lang === "fr" ? "fr" : "en",
    submissionId: string(body.submissionId, 100),
    website: string(body.website, 200)
  };
  const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email);
  const phoneOK = data.phone.replace(/\D/g, "").length >= 10;
  const idOK = /^[A-Za-z0-9_-]{8,100}$/.test(data.submissionId);
  if (data.name.length < 2 || !emailOK || !phoneOK || data.message.length < 10 ||
      !INTERESTS[data.interest] || !idOK) return null;
  return data;
}

function emailContent(data) {
  const language = data.lang === "fr" ? "Français" : "English";
  const interest = INTERESTS[data.interest][data.lang];
  const vehicle = data.vehicleLabel || data.vehicleId;
  const rows = [
    ["Name / Nom", data.name],
    ["Email / Courriel", data.email],
    ["Phone / Téléphone", data.phone],
    ["Interest / Besoin", interest],
    ["Language / Langue", language]
  ];
  if (vehicle) rows.push(["Vehicle / Véhicule", vehicle]);
  const text = rows.map(function (row) { return row[0] + ": " + row[1]; }).join("\n") +
    "\n\nMessage:\n" + data.message;
  const table = rows.map(function (row) {
    return "<tr><th align=\"left\" style=\"padding:6px 14px 6px 0;vertical-align:top\">" +
      escapeHtml(row[0]) + "</th><td style=\"padding:6px 0\">" + escapeHtml(row[1]) + "</td></tr>";
  }).join("");
  const html = "<div style=\"font-family:Arial,sans-serif;color:#17202a;line-height:1.5\">" +
    "<h1 style=\"font-size:20px\">New Automobile SX website inquiry</h1>" +
    "<table style=\"border-collapse:collapse\">" + table + "</table>" +
    "<h2 style=\"font-size:16px;margin:24px 0 8px\">Message</h2>" +
    "<p style=\"white-space:pre-wrap\">" + escapeHtml(data.message) + "</p></div>";
  const subjectVehicle = vehicle ? " — " + vehicle.replace(/[\r\n]+/g, " ").slice(0, 70) : "";
  return { subject: "Website inquiry: " + interest + subjectVehicle, text, html };
}

module.exports = async function (req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "method_not_allowed" });
  }
  if (!isSameSite(req)) return sendJson(res, 403, { error: "forbidden" });

  let body;
  try {
    body = await readBody(req, 32 * 1024);
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Buffer.byteLength(JSON.stringify(body), "utf8") > 32 * 1024) throw new Error("Invalid body");
  } catch (error) {
    return sendJson(res, 400, { error: "invalid_request" });
  }

  /* Bots often fill fields that are visually hidden. Respond successfully so
     they do not learn how to bypass the trap, but do not send an email. */
  if (string(body.website, 200)) return sendJson(res, 200, { ok: true });

  const data = validate(body);
  if (!data) return sendJson(res, 400, { error: "invalid_fields" });
  if (isRateLimited(requestIp(req))) return sendJson(res, 429, { error: "too_many_requests" });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || "Automobilesx@gmail.com";
  if (!apiKey || !from) return sendJson(res, 503, { error: "not_configured" });

  const content = emailContent(data);
  const controller = new AbortController();
  const timeout = setTimeout(function () { controller.abort(); }, 10000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        "Idempotency-Key": "automobile-sx-contact-" + data.submissionId,
        "User-Agent": "AutomobileSX-Contact/1.0"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: content.subject,
        text: content.text,
        html: content.html,
        tags: [{ name: "source", value: "website-contact" }]
      }),
      signal: controller.signal
    });
    const result = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      console.error("Resend contact failure", response.status, result.name || result.type || "unknown");
      return sendJson(res, 502, { error: "send_failed" });
    }
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("Resend contact request failed", error && error.name ? error.name : "unknown");
    return sendJson(res, 502, { error: "send_failed" });
  } finally {
    clearTimeout(timeout);
  }
};

module.exports._test = { validate, emailContent, isSameSite };
