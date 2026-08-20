"use strict";

const assert = require("node:assert/strict");
const { changedUrls } = require("../api/_lib/indexnow.js");

const SITE = "https://www.automobilesx.ca";
const before = [{ id: "car-one", status: "available", updatedAt: "2026-08-01T00:00:00Z" }];

assert.deepEqual(changedUrls(before, before), [], "unchanged inventory must not ping IndexNow");

const edited = [{ id: "car-one", status: "available", updatedAt: "2026-08-02T00:00:00Z" }];
const urls = changedUrls(before, edited);
assert.deepEqual(urls, [
  SITE + "/vehicles/car-one",
  SITE + "/fr/vehicules/car-one",
  SITE + "/",
  SITE + "/fr",
  SITE + "/inventory",
  SITE + "/fr/inventaire"
]);
assert.equal(new Set(urls).size, urls.length, "IndexNow URLs must be unique");

const sold = [{ id: "car-one", status: "sold", updatedAt: "2026-08-02T00:00:00Z" }];
assert(changedUrls(edited, sold).includes(SITE + "/"), "a sale changes the crawlable homepage inventory");

console.log("IndexNow tests passed.");
