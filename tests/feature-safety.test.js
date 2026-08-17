"use strict";

const assert = require("assert");
const FEATURES = require("../js/features.js");
const DESCRIBE = require("../js/describe.js");
const SOCIAL = require("../api/_lib/social.js");

const golf = {
  id: "2017-volkswagen-golf-iftqk",
  year: 2017,
  make: "Volkswagen",
  model: "Golf",
  trim: "Trendline",
  body: "Hatchback",
  km: 188000,
  transmission: "Manual",
  drivetrain: "FWD",
  fuel: "Gasoline",
  features: ["Backup Camera", "Heated Seats", "Bluetooth", "Cruise Control", "AWD"],
  descMode: "auto"
};

assert.deepStrictEqual(
  FEATURES.publicList(golf.features),
  ["Backup Camera", "Heated Seats", "Bluetooth", "Cruise Control"],
  "legacy AWD must not be treated as equipment"
);

const groups = FEATURES.grouped(golf.features, "en");
assert(!JSON.stringify(groups).includes("AWD"), "vehicle pages and social feature lists must omit legacy AWD");

const description = DESCRIBE.text(golf, "en");
assert(description.includes("front-wheel drive"), "the authoritative drivetrain must remain in the description");
assert(!/\bAWD\b/.test(description), "the description must not contradict FWD with legacy AWD equipment");

const caption = SOCIAL.captionFacebook(Object.assign({ price: 6499, stock: "" }, golf));
assert(caption.includes("FWD"), "the social caption must keep the authoritative FWD specification");
assert(!/Includes:[^\n]*\bAWD\b/.test(caption), "social equipment must not reintroduce legacy AWD");

console.log("Feature safety tests passed.");
