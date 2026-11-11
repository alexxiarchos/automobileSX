/* Sitemap for the deployed pages and active vehicle listings. */
const { readPublicInventory, CACHE_CONTROL } = require("./_lib/publicInventory.js");
const { isActive } = require("../js/inventory-rules.js");

const SITE = "https://www.automobilesx.ca";

const ROUTES = {
  en: {
    home: "/", inventory: "/inventory", financing: "/financing", sell: "/sell-your-car",
    about: "/about", contact: "/contact", faq: "/faq", guides: "/guides",
    local: "/used-cars-west-island", privacy: "/privacy",
    g1: "/guides/buying-a-used-car-in-quebec",
    g2: "/guides/car-financing-with-bad-credit-quebec",
    g3: "/guides/what-is-my-trade-in-worth-quebec",
    g4: "/guides/registering-a-used-car-in-quebec",
    g5: "/guides/used-car-budget-quebec",
    g6: "/guides/used-car-inspection-dorval",
    g7: "/guides/buying-a-used-car-in-winter-quebec"
  },
  fr: {
    home: "/fr", inventory: "/fr/inventaire", financing: "/fr/financement", sell: "/fr/vendre-votre-auto",
    about: "/fr/a-propos", contact: "/fr/contact", faq: "/fr/faq", guides: "/fr/guides",
    local: "/fr/autos-usagees-west-island", privacy: "/fr/confidentialite",
    g1: "/fr/guides/acheter-une-voiture-usagee-au-quebec",
    g2: "/fr/guides/financement-auto-mauvais-credit-quebec",
    g3: "/fr/guides/valeur-de-reprise-quebec",
    g4: "/fr/guides/immatriculer-une-voiture-usagee-quebec",
    g5: "/fr/guides/budget-auto-usagee-quebec",
    g6: "/fr/guides/inspection-auto-usagee-dorval",
    g7: "/fr/guides/acheter-auto-usagee-hiver-quebec"
  }
};

const VEHICLE_PATH = { en: "/vehicles/", fr: "/fr/vehicules/" };

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function urlEntry(loc, altEn, altFr, changefreq, priority, lastmod, images) {
  return [
    "  <url>",
    "    <loc>" + esc(loc) + "</loc>",
    '    <xhtml:link rel="alternate" hreflang="en-CA" href="' + esc(altEn) + '"/>',
    '    <xhtml:link rel="alternate" hreflang="fr-CA" href="' + esc(altFr) + '"/>',
    '    <xhtml:link rel="alternate" hreflang="x-default" href="' + esc(altEn) + '"/>',
    lastmod ? "    <lastmod>" + esc(lastmod) + "</lastmod>" : "",
    ...(images || []).map(function (url) {
      return "    <image:image><image:loc>" + esc(url) + "</image:loc></image:image>";
    }),
    "    <changefreq>" + changefreq + "</changefreq>",
    "    <priority>" + priority + "</priority>",
    "  </url>"
  ].filter(Boolean).join("\n");
}

module.exports = async function (req, res) {
  const parts = [];

  Object.keys(ROUTES.en).forEach(function (route) {
    const priority = route === "home" ? "1.0" : route === "inventory" ? "0.9"
      : route === "privacy" ? "0.3" : "0.7";
    const freq = route === "inventory" ? "daily" : route === "home" ? "weekly"
      : route === "privacy" ? "yearly" : "monthly";
    const en = SITE + ROUTES.en[route];
    const fr = SITE + ROUTES.fr[route];
    parts.push(urlEntry(en, en, fr, freq, priority));
    parts.push(urlEntry(fr, en, fr, freq, priority));
  });

  let data;
  try {
    data = await readPublicInventory();
  } catch (error) {
    res.statusCode = 503;
    res.setHeader("Cache-Control", "no-store");
    return res.end("Sitemap is temporarily unavailable");
  }

  data.vehicles
    .filter(isActive)
    .forEach(function (v) {
      const en = SITE + VEHICLE_PATH.en + encodeURIComponent(v.id);
      const fr = SITE + VEHICLE_PATH.fr + encodeURIComponent(v.id);
      const lastmod = (v.updatedAt || v.publishedAt || data.updatedAt || "").slice(0, 10) || undefined;
      const images = (v.images || []).slice(0, 1000).map(function (p) {
        return SITE + "/" + String(p).replace(/^\//, "");
      });
      parts.push(urlEntry(en, en, fr, "weekly", "0.8", lastmod, images));
      parts.push(urlEntry(fr, en, fr, "weekly", "0.8", lastmod, images));
    });

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
    parts.join("\n") + "\n</urlset>\n";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", CACHE_CONTROL);
  res.statusCode = 200;
  res.end(xml);
};
