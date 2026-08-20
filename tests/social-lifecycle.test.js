"use strict";

const assert = require("node:assert/strict");
const SOCIAL = require("../api/_lib/social.js");
const { renderVehiclePages } = require("../api/_lib/vehiclePage.js");

process.env.FB_PAGE_ID = "page-1";
process.env.IG_USER_ID = "ig-1";
process.env.FB_PAGE_TOKEN = "test-token";

const originalFetch = global.fetch;
const vehicle = {
  id: "2017-bmw-x3-cqgmi", year: 2017, make: "BMW", model: "X3", trim: "xDrive28i",
  body: "SUV", price: 12999, km: 131000, transmission: "Automatic", fuel: "Gasoline",
  drivetrain: "AWD", extColor: "Blue", stock: "SX-1002", status: "sold",
  images: ["images/vehicles/2017-bmw-x3-cqgmi/photo-1.jpg"], features: [], descMode: "auto"
};

function response(body, ok) {
  return {
    ok: ok !== false,
    status: ok === false ? 400 : 200,
    json: async function () { return body || {}; }
  };
}

async function testSoldUpdates() {
  let facebookEdit = null;
  let instagramComment = null;
  global.fetch = async function (url, options) {
    if (url.includes("fb-post?fields=message")) return response({ message: "Original listing" });
    if (url.endsWith("/fb-post")) {
      facebookEdit = new URLSearchParams(options.body);
      return response({ success: true });
    }
    if (url.endsWith("/ig-post/comments")) {
      instagramComment = new URLSearchParams(options.body);
      return response({ id: "comment-1" });
    }
    throw new Error("Unexpected request: " + url);
  };

  await SOCIAL.markSoldOnFacebook(vehicle, "fb-post");
  await SOCIAL.markSoldOnInstagram(vehicle, "ig-post");
  assert(facebookEdit.get("message").startsWith("SOLD - 2017 BMW X3 xDrive28i"));
  assert(facebookEdit.get("message").endsWith("Original listing"));
  assert(instagramComment.get("message").includes("VENDU"));
}

async function testPriceDropUpdates() {
  let facebookEdit = null;
  let instagramComment = null;
  global.fetch = async function (url, options) {
    if (url.includes("fb-post?fields=message")) {
      return response({ message: "2017 BMW X3 xDrive28i - $13,999\nOriginal listing" });
    }
    if (url.endsWith("/fb-post")) {
      facebookEdit = new URLSearchParams(options.body);
      return response({ success: true });
    }
    if (url.endsWith("/ig-post/comments")) {
      instagramComment = new URLSearchParams(options.body);
      return response({ id: "comment-2" });
    }
    throw new Error("Unexpected request: " + url);
  };

  await SOCIAL.markPriceDropOnFacebook(vehicle, "fb-post", 13999);
  await SOCIAL.markPriceDropOnInstagram(vehicle, "ig-post", 13999);
  const message = facebookEdit.get("message");
  assert(message.startsWith("PRICE REDUCED - 2017 BMW X3 xDrive28i is now $12,999 (was $13,999)."));
  assert(message.includes("2017 BMW X3 xDrive28i - $12,999"), "old price in the original Facebook text must be refreshed");
  assert(instagramComment.get("message").includes("PRIX RÉDUIT"));
  assert(instagramComment.get("message").includes("$12,999"));
}

function testSoldVehiclePage() {
  for (const page of renderVehiclePages(vehicle)) {
    const expectedInventory = page.path.startsWith("fr/") ? "/fr/inventaire" : "/inventory";
    assert.equal((page.html.match(/id="sold-summary"/g) || []).length, 1,
      "the server-rendered sold summary must appear exactly once");
    assert(page.html.includes('id="gallery-sold"'), "the main image must carry a visible sold overlay");
    assert(page.html.includes('class="gallery-sold"'));
    assert(page.html.includes('href="' + expectedInventory + '"'));
    assert(page.html.includes("https://schema.org/SoldOut"));
    assert(!page.html.includes("to confirm availability or book a test drive"));
    assert(!page.html.includes("pour confirmer la disponibilité ou réserver un essai routier"));
  }
}

function testRefreshRecommendation() {
  const now = Date.parse("2026-08-20T12:00:00Z");
  const fresh = Object.assign({}, vehicle, { status: "available", publishedAt: "2026-08-10T12:00:00Z" });
  const old = Object.assign({}, vehicle, { status: "available", publishedAt: "2026-07-20T12:00:00Z" });

  assert.equal(SOCIAL.priceRefreshRecommendation(fresh, 13999, now).recommended, false,
    "a fresh listing must not be recommended for reposting");
  assert.equal(SOCIAL.priceRefreshRecommendation(old, 13499, now).recommended, false,
    "a small decrease must update the old post without recommending a duplicate");
  const meaningful = SOCIAL.priceRefreshRecommendation(old, 13999, now);
  assert.equal(meaningful.recommended, true);
  assert.equal(meaningful.decrease, 1000);
  assert.equal(meaningful.daysLive, 31);
}

(async function () {
  try {
    await testSoldUpdates();
    await testPriceDropUpdates();
    testSoldVehiclePage();
    testRefreshRecommendation();
    console.log("Social lifecycle tests passed.");
  } finally {
    global.fetch = originalFetch;
  }
})().catch(function (e) {
  console.error(e);
  process.exitCode = 1;
});
