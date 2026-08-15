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
const DESCRIBE = require("../../js/describe.js");
const MAKES = require("../../js/makes.js");
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
  return [v.year, MAKES.fixMake(v.make), MAKES.fixModel(v.model), MAKES.displayTrim(v.trim)].filter(Boolean).join(" ");
}
function vehicleUrl(v) {
  return SITE + "/vehicles/" + encodeURIComponent(v.id);
}
function firstImage(v) {
  if (!v.images || !v.images.length) return null;
  return SITE + "/" + String(v.images[0]).replace(/^\//, "");
}

const CATALOGUE = require("../../js/features.js");

/* The equipment worth naming in a caption. A shopper scrolling past decides on
   four or five things, not on twenty, and a caption that lists every feature
   reads as a spec sheet and gets skipped. Catalogue order puts the safety and
   comfort items people actually search for at the front. */
function topFeatures(v, lang, limit) {
  const groups = CATALOGUE.grouped(v.features || [], lang);
  let flat = [];
  groups.forEach(g => { flat = flat.concat(g.items); });
  return flat.slice(0, limit || 5);
}

function specLine(v, lang) {
  const fr = lang === "fr";
  const bits = [
    v.km ? km(v.km) : "",
    /* The year is the first word of the title above, so it is not repeated. */
    v.transmission ? (fr ? FR_SPEC.transmission[v.transmission] || v.transmission : v.transmission) : "",
    v.drivetrain ? (fr ? FR_SPEC.drivetrain[v.drivetrain] || v.drivetrain : v.drivetrain) : "",
    v.fuel && v.fuel !== "Gasoline" ? (fr ? FR_SPEC.fuel[v.fuel] || v.fuel : v.fuel) : "",
    v.engine || "",
    v.extColor ? (fr ? DESCRIBE.colourFr(v.extColor) : v.extColor) : ""
  ].filter(Boolean);
  return bits.join(" · ");
}

const FR_SPEC = {
  transmission: { "Automatic": "Automatique", "Manual": "Manuelle", "CVT": "CVT", "e-CVT": "e-CVT" },
  fuel: { "Gasoline": "Essence", "Hybrid": "Hybride", "Diesel": "Diesel",
          "Electric": "Électrique", "Plug-in Hybrid": "Hybride rechargeable" },
  drivetrain: { "FWD": "Traction avant", "AWD": "Intégrale", "RWD": "Propulsion", "4x4": "4x4" }
};

const ADDRESS = "2044 Avenue Chartier, Dorval, QC H9P 1H2";
const PHONE = "514-824-9117";

function coreDescription(v, lang) {
  return DESCRIBE.coreText ? DESCRIBE.coreText(v, lang) : DESCRIBE.text(v, lang);
}

function actionLines(v, lang, target) {
  const fr = lang === "fr";
  const lines = [
    "Automobile SX · " + ADDRESS
  ];

  if (target === "marketplace") {
    lines.push(fr
      ? "Envoyez un message sur cette annonce pour confirmer la disponibilité ou réserver un essai routier."
      : "Send a message on this listing to confirm availability or book a test drive.");
    lines.push(fr ? "Vous pouvez aussi appeler ou texter le " + PHONE + "." : "You can also call or text " + PHONE + ".");
  } else {
    lines.push(fr
      ? "Appelez ou textez le " + PHONE + " pour confirmer la disponibilité ou réserver un essai routier."
      : "Call or text " + PHONE + " to confirm availability or book a test drive.");
  }

  lines.push(fr
    ? "Ouvert sept jours sur sept sur rendez-vous. Financement disponible. Nous acceptons les véhicules en échange."
    : "Open seven days a week by appointment. Financing is available and trade-ins are welcome.");

  if (target === "instagram") {
    lines.push(fr
      ? "Tous les détails et les photos sont accessibles par le lien dans notre bio" + (v.stock ? ". Demandez le stock " + v.stock + "." : ".")
      : "Full details and every photo are available through the link in our bio" + (v.stock ? ". Ask for stock " + v.stock + "." : "."));
  } else {
    lines.push((fr ? "Tous les détails et les photos : " : "Full details and every photo: ") + vehicleUrl(v));
    if (v.stock) lines.push((fr ? "Stock " : "Stock ") + v.stock);
  }
  return lines;
}

function hashtags(v) {
  const tags = ["#AutomobileSX", "#Dorval", "#WestIsland", "#Montreal",
    "#UsedCars", "#AutosUsagees", "#VoitureUsagee"];
  const clean = s => "#" + String(s).replace(/[^A-Za-z0-9]/g, "");
  if (v.make) tags.push(clean(v.make));
  if (v.make && v.model) tags.push(clean(v.make + v.model));
  if (v.body) tags.push(clean(v.body));
  return tags.join(" ");
}

/* Two captions, because the two platforms behave differently.

   On a Facebook Page a URL in the text is a working link, so the post can send
   people straight to the vehicle page. Instagram caption links are not
   clickable, so its version keeps the phone and address as useful reference
   information, points at the profile link and gives the stock number a buyer
   can quote when they call or message.

   Both open with the facts a person needs to decide whether to keep reading:
   year, model, price, kilometres. Instagram hides everything after roughly the
   first line behind "more", so nothing that matters goes below it. */

function captionFacebook(v) {
  return [
    title(v) + " - " + money(v.price),
    specLine(v, "en"),
    "",
    coreDescription(v, "en"),
    "",
    actionLines(v, "en", "facebook").join("\n"),
    "",
    "· · ·",
    "",
    title(v) + " - " + money(v.price),
    specLine(v, "fr"),
    "",
    coreDescription(v, "fr"),
    "",
    actionLines(v, "fr", "facebook").join("\n"),
    "",
    hashtags(v)
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function instagramText(v, includeHashtags, maxCoreParagraphs) {
  const coreEn = maxCoreParagraphs && DESCRIBE.coreParagraphs
    ? DESCRIBE.coreParagraphs(v, "en").slice(0, maxCoreParagraphs).join("\n\n")
    : coreDescription(v, "en");
  const coreFr = maxCoreParagraphs && DESCRIBE.coreParagraphs
    ? DESCRIBE.coreParagraphs(v, "fr").slice(0, maxCoreParagraphs).join("\n\n")
    : coreDescription(v, "fr");
  return [
    title(v) + " - " + money(v.price),
    specLine(v, "en"),
    "",
    coreEn,
    "",
    actionLines(v, "en", "instagram").join("\n"),
    "",
    "· · ·",
    "",
    title(v) + " - " + money(v.price),
    specLine(v, "fr"),
    "",
    coreFr,
    "",
    actionLines(v, "fr", "instagram").join("\n"),
    "",
    includeHashtags ? hashtags(v) : ""
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function captionInstagram(v) {
  /* Instagram caps captions at 2,200 characters. Keep the complete canonical
     description whenever it fits, then drop optional hashtags, then only the
     owner-written extra paragraphs. Vehicle facts and both CTA blocks stay. */
  let out = instagramText(v, true, 0);
  if (out.length <= 2200) return out;
  out = instagramText(v, false, 0);
  if (out.length <= 2200) return out;
  return instagramText(v, false, 2);
}

/* Kept for anything that just wants "the caption". */
function caption(v, target) {
  return target === "instagram" ? captionInstagram(v) : captionFacebook(v);
}

/* Marketplace is filled in by hand, so give the owner each field separately
   rather than one blob they have to pick apart. */
function marketplaceListing(v) {
  const header = title(v) + " - " + money(v.price);
  return {
    title: title(v),
    price: String(Math.round(Number(v.price) || 0)),
    year: String(v.year || ""),
    make: MAKES.fixMake(v.make),
    model: [MAKES.fixModel(v.model), MAKES.displayTrim(v.trim)].filter(Boolean).join(" "),
    mileage: String(Math.round(Number(v.km) || 0)),
    transmission: v.transmission || "",
    exteriorColour: v.extColor || "",
    description: [
      header,
      specLine(v, "en"),
      "",
      coreDescription(v, "en"),
      "",
      actionLines(v, "en", "marketplace").join("\n"),
      "",
      "Price excludes applicable taxes and licensing.",
      "",
      "· · ·",
      "",
      header,
      specLine(v, "fr"),
      "",
      coreDescription(v, "fr"),
      "",
      actionLines(v, "fr", "marketplace").join("\n"),
      "",
      "Le prix exclut les taxes applicables et les frais d'immatriculation."
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

/* Instagram does not give back a link when it publishes, so it is asked for
   one. Failing to get it must not turn a successful post into a failure, so
   this returns null rather than throwing. */
async function instagramPermalink(id) {
  const c = cfg();
  try {
    const out = await call(GRAPH + "/" + encodeURIComponent(id) +
      "?fields=permalink&access_token=" + encodeURIComponent(c.token));
    return out.permalink || null;
  } catch (e) {
    return null;
  }
}

/* Deleting a post we made.

   Meta's own documentation disagrees with itself here: the Page feed reference
   says a post can be deleted through the /{post-id} node, while the post node
   reference says the operation is not available on that endpoint. Instagram's
   media reference documents deletion as supported, but only on the Instagram
   API with Facebook Login - which is the path this app uses - and asks for the
   instagram_manage_contents permission, which a token issued before that
   permission existed will not carry.

   Rather than pick a side, this asks and passes Meta's own answer straight
   through. If it refuses, the owner sees the exact reason and can delete the
   post in the app in ten seconds instead. */
/* ---------- announcing a sale on a post that is already up ----------

   When a car sells, the post that advertised it is still live and still reads
   as for sale. That is where the "is this still available?" messages come from,
   and it is worth more than a fresh post: it reaches the people already looking
   at that car rather than asking the feed for attention a second time.

   The two platforms need opposite treatment, and not by preference:

   Facebook can edit a published post, so the sold notice goes on top of the
   original text where everyone sees it, carrying a real clickable link to the
   inventory. That needs pages_manage_posts, which this app already holds to
   publish in the first place, so it works with the token in use today.

   Instagram cannot edit a caption after publishing. Not a permission problem,
   the API has no such operation. The only way to mark a sold post is to add a
   comment, which needs instagram_manage_comments, a permission a token issued
   before it existed will not carry. And nothing in an Instagram comment is
   clickable, so that text sends people to the bio and the stock number rather
   than printing a URL nobody can tap. */

/* Bilingual, like every other caption this file writes. English first then
   French, same order and same separator as captionFacebook, because a post
   that suddenly speaks one language reads as though somebody else wrote it. */
function soldNotice(v, target) {
  const name = title(v);
  const stock = v.stock ? " Stock " + v.stock + "." : "";

  if (target === "instagram") {
    /* No URL: nothing in an Instagram comment is clickable, so a link printed
       here is a string people have to retype. The bio is where they can tap. */
    return [
      "SOLD - " + name + " has found a new home." + stock,
      "We get similar vehicles regularly, link in bio.",
      "",
      "VENDU - Ce véhicule a trouvé preneur." + stock,
      "Nous recevons régulièrement des véhicules semblables, lien en bio."
    ].join("\n");
  }

  return [
    "SOLD - " + name + " has found a new home. Thank you!",
    "We get similar vehicles regularly. See our current inventory: " + SITE_INVENTORY.en,
    "",
    "VENDU - Ce véhicule a trouvé preneur. Merci !",
    "Nous recevons régulièrement des véhicules semblables. Voyez notre inventaire : " + SITE_INVENTORY.fr
  ].join("\n");
}

const SITE_INVENTORY = {
  en: "https://www.automobilesx.ca/inventory",
  fr: "https://www.automobilesx.ca/fr/inventaire"
};

/* Prepend, never replace. The original copy is what gives the post its value
   as proof that cars move here, and a post whose text has been swapped for two
   lines about a car that is gone is worth less than one that still shows what
   was sold. Read the current message first, put the notice above it. */
async function markSoldOnFacebook(v, postId) {
  const c = cfg();
  if (!c.token) throw new Error("Facebook is not configured");
  if (!postId) throw new Error("No Facebook post id on this vehicle");

  const notice = soldNotice(v, "facebook");

  let existing = "";
  try {
    const cur = await call(GRAPH + "/" + postId + "?fields=message&access_token=" +
      encodeURIComponent(c.token), { method: "GET" });
    existing = (cur && cur.message) || "";
  } catch (e) {
    /* Readable or not, the notice is still worth writing. Losing the original
       text is the cost, and it beats leaving the post saying "for sale". */
    existing = "";
  }

  /* Already done. Saying it twice on the same post looks like a mistake. */
  const already = existing.indexOf("VENDU") === 0 || existing.indexOf("SOLD") === 0;
  if (already) return { id: postId, skipped: true };

  const params = new URLSearchParams({
    message: existing ? notice + "\n\n" + existing : notice,
    access_token: c.token
  });
  await call(GRAPH + "/" + postId, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  return { id: postId, edited: true };
}

/* A comment, because Instagram has no edit. Errors are passed back word for
   word: if the token predates instagram_manage_comments, Meta's own sentence
   explains it better than a guess would. */
async function markSoldOnInstagram(v, mediaId) {
  const c = cfg();
  if (!c.token) throw new Error("Instagram is not configured");
  if (!mediaId) throw new Error("No Instagram media id on this vehicle");

  const params = new URLSearchParams({
    message: soldNotice(v, "instagram"),
    access_token: c.token
  });
  await call(GRAPH + "/" + mediaId + "/comments", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  return { id: mediaId, commented: true };
}

async function deletePost(target, id) {
  const c = cfg();
  if (!c.token) throw new Error("Posting is not configured, so there is no token to delete with.");
  if (!id) throw new Error("No post id");
  if (target !== "facebook" && target !== "instagram") throw new Error("Unknown target " + target);

  const url = GRAPH + "/" + encodeURIComponent(id) + "?access_token=" + encodeURIComponent(c.token);
  try {
    return await call(url, { method: "DELETE" });
  } catch (e) {
    /* Some Graph nodes only accept the POST override rather than the DELETE
       verb. Worth one retry; if that fails too, the first message was the
       more informative one. */
    if (!/method|not supported|unsupported/i.test(e.message)) throw e;
    try {
      return await call(url + "&method=delete", { method: "POST" });
    } catch (e2) {
      throw e;
    }
  }
}

module.exports = {
  caption, captionFacebook, captionInstagram, topFeatures, marketplaceListing, configured,
  postToFacebook, postToInstagram, instagramPermalink, deletePost,
  soldNotice, markSoldOnFacebook, markSoldOnInstagram,
  vehicleUrl, firstImage, title
};
