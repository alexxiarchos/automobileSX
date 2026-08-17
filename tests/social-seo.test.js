"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { renderPage, dealerSchema } = require("../build/layout.js");
const { renderVehiclePages } = require("../api/_lib/vehiclePage.js");

const FACEBOOK = "https://www.facebook.com/SXautomobile/";
const INSTAGRAM = "https://www.instagram.com/automobile_sx";
const MAPS = "https://www.google.com/maps?cid=5771215062979680514";

function assertDealer(dealer) {
  assert.equal(dealer["@type"], "AutoDealer");
  assert.equal(dealer["@id"], "https://www.automobilesx.ca/#dealer");
  assert.equal(dealer.name, "Automobile SX");
  assert.equal(dealer.telephone, "+1-514-824-9117");
  assert.deepEqual(dealer.address, {
    "@type": "PostalAddress",
    streetAddress: "2044 Avenue Chartier",
    addressLocality: "Dorval",
    addressRegion: "QC",
    postalCode: "H9P 1H2",
    addressCountry: "CA"
  });
  assert.equal(dealer.openingHoursSpecification.opens, "10:00");
  assert.equal(dealer.openingHoursSpecification.closes, "18:00");
  assert.equal(dealer.openingHoursSpecification.dayOfWeek.length, 7);
  assert.deepEqual(dealer.geo, {
    "@type": "GeoCoordinates",
    latitude: 45.46418333788317,
    longitude: -73.72416031436669
  });
  assert.equal(dealer.hasMap, MAPS);
  assert(dealer.areaServed.includes("Dorval"));
  assert.deepEqual(dealer.contactPoint.availableLanguage, ["en", "fr"]);
  assert.deepEqual(dealer.sameAs, [MAPS, FACEBOOK, INSTAGRAM]);
  assert.equal(new Set(dealer.sameAs).size, dealer.sameAs.length, "sameAs values must be unique");
}

function schemaFrom(html) {
  const match = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  assert(match, "page must contain JSON-LD");
  return JSON.parse(match[1]);
}

assertDealer(dealerSchema());

for (const lang of ["en", "fr"]) {
  const page = renderPage({
    route: "home",
    lang,
    title: "Test",
    description: "Test",
    body: "<p>Test</p>"
  });
  assert(page.includes(`href="${FACEBOOK}"`));
  assert(page.includes(`href="${INSTAGRAM}"`));
  assert(page.includes(lang === "en" ? "Automobile SX on Facebook" : "Automobile SX sur Facebook"));
  const graph = schemaFrom(page)["@graph"];
  const dealers = graph.filter(item => item["@type"] === "AutoDealer");
  assert.equal(dealers.length, 1, "shared page JSON-LD must contain one AutoDealer entity");
  assertDealer(dealers[0]);
}

const vehicle = {
  id: "2020-test-model-abc12", year: 2020, make: "Test", model: "Model", trim: "Base",
  price: 10000, km: 100000, status: "available", images: [], features: [], descMode: "auto"
};
for (const page of renderVehiclePages(vehicle)) {
  assert(page.html.includes(`href="${FACEBOOK}"`));
  assert(page.html.includes(`href="${INSTAGRAM}"`));
  const graph = schemaFrom(page.html)["@graph"];
  const dealers = graph.filter(item => item["@type"] === "AutoDealer");
  assert.equal(dealers.length, 1, "vehicle JSON-LD must contain one AutoDealer entity");
  assertDealer(dealers[0]);
}

const detailSource = fs.readFileSync(path.join(__dirname, "../js/detail.js"), "utf8");
assert(detailSource.includes('"seller": { "@id": "https://www.automobilesx.ca/#dealer" }'));
assert(!detailSource.includes('"seller": {\n          "@type": "AutoDealer"'),
  "client fallback must reference, not duplicate, the dealer entity");

console.log("Social SEO tests passed.");
