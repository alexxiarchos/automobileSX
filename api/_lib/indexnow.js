/* IndexNow ping.
   Tells Bing, Yandex, Seznam and Naver that specific URLs changed, instead of
   waiting for them to recrawl. Google does not participate, so this does
   nothing for Google rankings.

   Two rules govern everything here:

   1. It must never be able to break a publish. Every failure path is swallowed
      and the whole thing runs behind a timeout. If IndexNow is down, slow, or
      returns nonsense, the car still goes live.
   2. It only ever submits URLs that genuinely changed. Firing the whole
      inventory at every save is the behaviour that earns a 429 for spam. */

const KEY = "8c0b32c3432e469dbfd28a24bd85f4a8";
const SITE = "https://www.automobilesx.ca";
const HOST = "www.automobilesx.ca";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const TIMEOUT_MS = 4000;

const VEHICLE_PATH = { en: "/vehicles/", fr: "/fr/vehicules/" };
/* These four pages all contain live inventory links or featured vehicles, so
   they genuinely change whenever a vehicle changes. */
const INVENTORY_SURFACES = ["/", "/fr", "/inventory", "/fr/inventaire"];

/* A vehicle is "live" if it is published, matching the sitemap's own rule.
   The fingerprint includes status as well as updatedAt: flipping a car to sold
   changes what its page says, and we should not depend on the admin also
   having bumped updatedAt for that to be noticed. */
function liveMap(vehicles) {
  const m = new Map();
  (vehicles || []).forEach(v => {
    if (v && v.id && v.status !== "draft") {
      m.set(v.id, (v.status || "available") + "|" + (v.updatedAt || ""));
    }
  });
  return m;
}

/**
 * Work out which URLs actually changed between two inventory states.
 * Returns absolute URLs, both languages, plus the home and inventory pages,
 * whose crawlable vehicle links change whenever inventory changes.
 */
function changedUrls(previousVehicles, currentVehicles) {
  const before = liveMap(previousVehicles);
  const after = liveMap(currentVehicles);
  const ids = new Set();

  after.forEach((updatedAt, id) => {
    if (!before.has(id) || before.get(id) !== updatedAt) ids.add(id);  // added or edited
  });
  before.forEach((_, id) => {
    if (!after.has(id)) ids.add(id);                                    // removed or sold off
  });

  if (!ids.size) return [];

  const urls = [];
  ids.forEach(id => {
    urls.push(SITE + VEHICLE_PATH.en + encodeURIComponent(id));
    urls.push(SITE + VEHICLE_PATH.fr + encodeURIComponent(id));
  });
  INVENTORY_SURFACES.forEach(p => urls.push(SITE + p));
  return urls;
}

/**
 * Submit a list of URLs. Resolves to a short status string either way and
 * never rejects, so callers can await it without a try/catch and without any
 * risk to the surrounding operation.
 */
async function submit(urls) {
  if (!Array.isArray(urls) || !urls.length) return "skipped: nothing changed";
  if (process.env.INDEXNOW_DISABLED === "1") return "skipped: disabled";

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: SITE + "/" + KEY + ".txt",
    urlList: urls.slice(0, 10000)          /* protocol maximum per request */
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    return "sent " + urls.length + " url(s), HTTP " + res.status;
  } catch (e) {
    return "failed (ignored): " + (e && e.message ? e.message : "unknown");
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { submit, changedUrls, KEY };
