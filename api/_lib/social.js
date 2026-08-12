/* Social posting: captions, plus Facebook Page and Instagram publishing.

   Design notes that matter:

   - Nothing here runs automatically on save. Instagram fetches the image from
     the live site at the moment of publishing, and a car's photos are only on
     the CDN a minute or so after the commit. Posting is a deliberate button
     press after the car is live, which also means a human sees the caption
     before customers do.
   - Credentials come from environment variables only. They are never written
     into the repo, never reach the browser, and never appear in generated HTML.
   - Marketplace has no API for personal profiles, so we produce paste-ready
     text for it rather than pretending to automate it. */

const SITE = "https://www.automobilesx.ca";
const GRAPH = "https://graph.facebook.com/v21.0";
const TIMEOUT_MS = 20000;

function cfg() {
  return {
    pageId: process.env.FB_PAGE_ID || "",
    igUserId: process.env.IG_USER_ID || "",
    token: process.env.FB_PAGE_TOKEN || ""
  };
}

function configured() {
  const c = cfg();
  return { facebook: !!(c.pageId && c.token), instagram: !!(c.igUserId && c.token) };
}

/* ---------- text ---------- */

function money(n) {
  return "$" + Math.round(Number(n) || 0).toLocaleString("en-CA");
}
function km(n) {
  return Number(n || 0).toLocaleString("en-CA") + " km";
}
function title(v) {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
}
function vehicleUrl(v) {
  return SITE + "/vehicles/" + encodeURIComponent(v.id);
}
function firstImage(v) {
  if (!v.images || !v.images.length) return null;
  return SITE + "/" + String(v.images[0]).replace(/^\//, "");
}

/* Facts first, no invented enthusiasm. Bilingual, because half the market is. */
function caption(v) {
  const specs = [km(v.km), v.transmission, v.drivetrain, v.extColor]
    .filter(Boolean).join(" · ");

  const en = [
    title(v) + " — " + money(v.price),
    specs,
    "",
    "Available now at Automobile SX in Dorval. Kilometres and condition disclosed up front, and you deal directly with Spiro.",
    "Full details and photos: " + vehicleUrl(v),
    "Call 514-824-9117 to arrange a viewing."
  ];

  const fr = [
    "",
    "———",
    "",
    title(v) + " — " + money(v.price),
    "Disponible chez Automobile SX à Dorval. Kilométrage et état divulgués d'avance.",
    "Appelez le 514-824-9117 pour un rendez-vous."
  ];

  const tags = [
    "", "",
    "#AutomobileSX #Dorval #WestIsland #Montreal #UsedCars #AutosUsagees",
    v.make ? "#" + String(v.make).replace(/[^A-Za-z0-9]/g, "") : ""
  ];

  return en.concat(fr).concat(tags).filter(l => l !== undefined).join("\n").trim();
}

/* Marketplace is filled in by hand, so give the owner each field separately
   rather than one blob they have to pick apart. */
function marketplaceListing(v) {
  return {
    title: title(v),
    price: String(Math.round(Number(v.price) || 0)),
    year: String(v.year || ""),
    make: v.make || "",
    model: [v.model, v.trim].filter(Boolean).join(" "),
    mileage: String(Math.round(Number(v.km) || 0)),
    transmission: v.transmission || "",
    exteriorColour: v.extColor || "",
    description: [
      title(v) + " at Automobile SX, 2044 Avenue Chartier, Dorval.",
      "",
      (Array.isArray(v.desc) ? v.desc.join("\n\n") : (v.desc || "")).trim(),
      "",
      [km(v.km), v.transmission, v.drivetrain, v.fuel].filter(Boolean).join(" · "),
      "",
      "More photos and full details: " + vehicleUrl(v),
      "Call or text Spiro at 514-824-9117. Viewings seven days a week.",
      "",
      "Price excludes applicable taxes and licensing."
    ].filter(l => l !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim()
  };
}

/* ---------- posting ---------- */

async function call(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, Object.assign({ signal: controller.signal }, options || {}));
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) {
      const msg = (body.error && body.error.message) || ("HTTP " + res.status);
      throw new Error(msg);
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function postToFacebook(v, text) {
  const c = cfg();
  if (!c.pageId || !c.token) throw new Error("Facebook is not configured");
  const params = new URLSearchParams({
    message: text,
    link: vehicleUrl(v),
    access_token: c.token
  });
  const out = await call(GRAPH + "/" + c.pageId + "/feed", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  return { id: out.id, url: out.id ? "https://www.facebook.com/" + out.id : null };
}

/* Meta has to fetch and process the photo between creating the container and
   publishing it. Publishing too early returns "Media ID is not available", so
   the container's status_code is polled until it reports FINISHED. */
async function waitForContainer(id, token) {
  const started = Date.now();
  let lastStatus = "IN_PROGRESS";
  while (Date.now() - started < 40000) {
    const s = await call(GRAPH + "/" + id + "?fields=status_code,status&access_token=" +
      encodeURIComponent(token));
    lastStatus = s.status_code || lastStatus;
    if (lastStatus === "FINISHED") return;
    if (lastStatus === "ERROR" || lastStatus === "EXPIRED") {
      throw new Error("Instagram could not process the photo" + (s.status ? ": " + s.status : ""));
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error("Instagram was still processing the photo after 40 seconds. Try again in a minute.");
}

/* A photo committed by a publish is not on the CDN until Vercel finishes
   deploying, and Meta fetches the URL itself. Checking first turns a cryptic
   Meta error into a sentence that says what to do. */
async function imageIsReachable(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function postToInstagram(v, text) {
  const c = cfg();
  if (!c.igUserId || !c.token) throw new Error("Instagram is not configured");
  const image = firstImage(v);
  if (!image) throw new Error("This vehicle has no photo, and Instagram requires one");

  if (!(await imageIsReachable(image))) {
    throw new Error("The photo is not live on the site yet (" + image +
      "). Wait a minute for the site to finish updating, then try again.");
  }

  const create = new URLSearchParams({
    image_url: image,
    caption: text,
    access_token: c.token
  });
  const container = await call(GRAPH + "/" + c.igUserId + "/media", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: create.toString()
  });
  if (!container.id) throw new Error("Instagram did not return a container id");

  await waitForContainer(container.id, c.token);

  const publish = new URLSearchParams({
    creation_id: container.id,
    access_token: c.token
  });
  const out = await call(GRAPH + "/" + c.igUserId + "/media_publish", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: publish.toString()
  });
  return { id: out.id, url: null };
}

module.exports = {
  caption, marketplaceListing, configured,
  postToFacebook, postToInstagram,
  vehicleUrl, firstImage, title
};
