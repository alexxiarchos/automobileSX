"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");

const PAIRS = [
  {
    enFile: "guides/used-car-budget-quebec.html",
    frFile: "fr/guides/budget-auto-usagee-quebec.html",
    enUrl: "https://www.automobilesx.ca/guides/used-car-budget-quebec",
    frUrl: "https://www.automobilesx.ca/fr/guides/budget-auto-usagee-quebec"
  },
  {
    enFile: "guides/used-car-inspection-dorval.html",
    frFile: "fr/guides/inspection-auto-usagee-dorval.html",
    enUrl: "https://www.automobilesx.ca/guides/used-car-inspection-dorval",
    frUrl: "https://www.automobilesx.ca/fr/guides/inspection-auto-usagee-dorval"
  }
];

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function attr(html, selectorPattern, name) {
  const tag = html.match(selectorPattern);
  assert.ok(tag, "missing expected tag: " + selectorPattern);
  const value = tag[0].match(new RegExp(name + '="([^"]+)"'));
  assert.ok(value, "missing " + name + " on " + tag[0]);
  return value[1];
}

function jsonLdGraphs(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, "each article should have one combined JSON-LD graph");
  return JSON.parse(scripts[0][1])["@graph"];
}

function routeFile(href) {
  const pathname = href.split(/[?#]/)[0];
  if (pathname === "/") return "index.html";
  if (pathname === "/fr") return "fr/index.html";
  if (path.extname(pathname)) return pathname.replace(/^\//, "");
  return pathname.replace(/^\//, "") + ".html";
}

for (const pair of PAIRS) {
  for (const side of ["en", "fr"]) {
    const file = pair[side + "File"];
    const url = pair[side + "Url"];
    const counterpart = pair[(side === "en" ? "fr" : "en") + "Url"];
    const imagePath = pair.enFile.includes("budget") ? "/images/guides/used-car-budget-quebec.jpg" : "/images/guides/used-car-inspection-dorval.jpg";
    const html = read(file);

    assert.equal((html.match(/<h1\b/g) || []).length, 1, file + " must have one H1");
    assert.ok(/<title>[^<]+Automobile SX<\/title>/.test(html), file + " must have an SEO title");
    assert.ok(/<meta name="description" content="[^"]+">/.test(html), file + " must have a meta description");
    assert.equal(attr(html, /<link rel="canonical"[^>]+>/, "href"), url, file + " canonical");
    assert.equal(attr(html, /<link rel="alternate" hreflang="en-CA"[^>]+>/, "href"), pair.enUrl, file + " en-CA alternate");
    assert.equal(attr(html, /<link rel="alternate" hreflang="fr-CA"[^>]+>/, "href"), pair.frUrl, file + " fr-CA alternate");
    assert.equal(attr(html, /<link rel="alternate" hreflang="x-default"[^>]+>/, "href"), pair.enUrl, file + " x-default alternate");
    assert.ok(html.includes("window.SX_ALT=" + JSON.stringify(new URL(counterpart).pathname)), file + " language switcher");
    assert.ok(/class="article-byline"/.test(html), file + " visible byline");
    assert.ok(/<nav class="breadcrumb"/.test(html), file + " visible breadcrumb");
    assert.ok(html.includes(`<img src="${imagePath}" alt="`), file + " visible article image");
    assert.ok(fs.existsSync(path.join(ROOT, imagePath.replace(/^\//, ""))), file + " article image file");
    assert.equal(attr(html, /<meta property="og:image"[^>]+>/, "content"), "https://www.automobilesx.ca" + imagePath, file + " OG image");
    assert.ok(attr(html, /<meta property="og:image:alt"[^>]+>/, "content"), file + " OG image alt");
    assert.equal(attr(html, /<meta name="twitter:image"[^>]+>/, "content"), "https://www.automobilesx.ca" + imagePath, file + " Twitter image");
    assert.ok(attr(html, /<meta name="twitter:image:alt"[^>]+>/, "content"), file + " Twitter image alt");

    const graph = jsonLdGraphs(html);
    const dealer = graph.find(node => node["@type"] === "AutoDealer");
    const article = graph.find(node => node["@type"] === "BlogPosting");
    const breadcrumb = graph.find(node => node["@type"] === "BreadcrumbList");
    assert.equal(dealer["@id"], "https://www.automobilesx.ca/#dealer", file + " stable dealer ID");
    assert.equal(article.url, url, file + " BlogPosting URL");
    assert.equal(article.mainEntityOfPage["@id"], url, file + " mainEntityOfPage");
    assert.equal(article.inLanguage, side === "en" ? "en-CA" : "fr-CA", file + " language");
    assert.equal(article.publisher["@id"], dealer["@id"], file + " publisher reference");
    assert.deepEqual(article.image, ["https://www.automobilesx.ca" + imagePath], file + " structured image");
    assert.equal(article.datePublished, undefined, file + " draft must not invent a publication date");
    assert.equal(article.dateModified, undefined, file + " unpublished draft must not claim a modified publication date");
    assert.equal(breadcrumb.itemListElement.length, 3, file + " breadcrumb depth");

    const localLinks = [...html.matchAll(/href="(\/[^"]*)"/g)].map(match => match[1]);
    for (const href of localLinks) {
      assert.ok(fs.existsSync(path.join(ROOT, routeFile(href))), file + " broken internal link: " + href);
    }
  }
}

const existingGuide = read("guides/buying-a-used-car-in-quebec.html");
const existingArticle = jsonLdGraphs(existingGuide).find(node => node["@type"] === "Article");
assert.equal(existingArticle.datePublished, "2026-08-04", "existing guide publication date must remain stable");
assert.equal(existingArticle.dateModified, "2026-11-04", "existing guide must show this substantive update");
assert.match(existingGuide, /<time datetime="2026-08-04">August 4, 2026<\/time>/, "existing guide needs a visible publication date");
assert.match(existingGuide, /<time datetime="2026-11-04">November 4, 2026<\/time>/, "existing guide needs a visible modified date");

const sitemap = JSON.parse(read("sitemap-pages.json"));
for (const pair of PAIRS) {
  assert.ok(sitemap.some(item => item.loc === pair.enUrl && item.alt.fr === pair.frUrl), "missing EN sitemap pair");
  assert.ok(sitemap.some(item => item.loc === pair.frUrl && item.alt.en === pair.enUrl), "missing FR sitemap pair");
}

assert.equal(Math.round((14000 / 1.14975) * 100) / 100, 12176.56, "budget example changed");

const contentSources = read("build/copy-en.js") + "\n" + read("build/copy-fr.js");
for (const unsupported of [
  /high single digits/i,
  /mid-teens/i,
  /10% to 25%/i,
  /10 % à 25 %/i,
  /fastest way to build a credit file/i,
  /façon la plus rapide de bâtir un dossier/i,
  /tells you what is coming in the next year/i,
  /vous dit ce qui s'en vient dans la prochaine année/i
]) {
  assert.doesNotMatch(contentSources, unsupported, "unsupported financing or inspection claim remains");
}

assert.doesNotMatch(contentSources, /walk-ins are welcome|visites sans rendez-vous sont les bienvenues|appointments are recommended|rendez-vous est recommandé/i, "appointment-only policy must be consistent");
assert.match(contentSources, /Visits are by appointment/, "English appointment-only policy is missing");
assert.match(contentSources, /Les visites se font sur rendez-vous/, "French appointment-only policy is missing");
assert.doesNotMatch(contentSources, /we will hold it|we can usually work something out|we handle the registration paperwork|nous le garderons|on peut habituellement s'arranger|nous nous occupons de l'immatriculation/i, "unconfirmed operating promise remains");
assert.match(contentSources, /Any transport or other arrangement must be agreed case by case/, "neutral English inspection coordination is missing");
assert.match(contentSources, /Le transport ou toute autre modalité doit être convenu au cas par cas/, "neutral French inspection coordination is missing");

const frenchVehicle = read("fr/vehicules/2017-audi-q5-exl5w.html");
assert.doesNotMatch(frenchVehicle, /"color":"(?:Blue|Grey)"/, "French vehicle schema must localize colour");
assert.match(frenchVehicle, /Couleur extérieure<\/td><td>(?:Bleu|Gris|Noir|Brun|Rouge|Blanc)/, "French vehicle colour must be localized");
assert.match(frenchVehicle, /href="\/fr\/guides\/inspection-auto-usagee-dorval">Bienvenue<\/a>/, "vehicle page must link to inspection guide");

console.log("Content strategy validation tests passed.");
