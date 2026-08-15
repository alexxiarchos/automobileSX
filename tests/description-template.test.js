"use strict";

const assert = require("node:assert/strict");
const DESCRIBE = require("../js/describe.js");
const SOCIAL = require("../api/_lib/social.js");

const vehicle = {
  id: "2017-volkswagen-golf-iftqk",
  stock: "SX-1012",
  year: 2017,
  make: "Volkswagen",
  model: "Golf",
  trim: "Trendline",
  price: 6499,
  km: 188000,
  body: "Hatchback",
  doors: 5,
  seats: 5,
  engine: "1.8L Turbo I4",
  transmission: "Manual",
  drivetrain: "FWD",
  fuel: "Gasoline",
  extColor: "Black",
  intColor: "Grey",
  features: ["Backup Camera", "Heated Seats", "Bluetooth", "Cruise Control"],
  descMode: "auto"
};

const coreEn = DESCRIBE.coreText(vehicle, "en");
const coreFr = DESCRIBE.coreText(vehicle, "fr");
const websiteEn = DESCRIBE.text(vehicle, "en");
const websiteFr = DESCRIBE.text(vehicle, "fr");
const facebook = SOCIAL.captionFacebook(vehicle);
const instagram = SOCIAL.captionInstagram(vehicle);
const marketplace = SOCIAL.marketplaceListing(vehicle).description;

assert(websiteEn.includes(coreEn), "website must use the canonical English vehicle copy");
assert(websiteFr.includes(coreFr), "website must use the canonical French vehicle copy");
assert(websiteEn.includes("2044 Avenue Chartier, Dorval, QC H9P 1H2"));
assert(websiteEn.includes("Call or text 514-824-9117"));
assert(websiteEn.includes("book a test drive"));
assert(websiteFr.includes("Appelez ou textez le 514-824-9117"));

[facebook, instagram, marketplace].forEach(function (copy) {
  assert(copy.includes(coreEn), "platform copy must retain the canonical English facts");
  assert(copy.includes(coreFr), "platform copy must retain the canonical French facts");
  assert(copy.includes("2044 Avenue Chartier, Dorval, QC H9P 1H2"));
  assert(copy.includes("514-824-9117"));
  assert(copy.includes("Financing is available and trade-ins are welcome"));
  assert(!copy.includes("—"), "house style does not use em dashes");
});

assert(facebook.includes("https://www.automobilesx.ca/vehicles/2017-volkswagen-golf-iftqk"));
assert(instagram.includes("link in our bio"));
assert(instagram.includes("Ask for stock SX-1012"));
assert(instagram.length <= 2200, "Instagram copy must fit the platform caption limit");
assert(marketplace.includes("Send a message on this listing"));
assert(marketplace.includes("Envoyez un message sur cette annonce"));
assert(marketplace.includes("Price excludes applicable taxes and licensing"));
assert(marketplace.includes("Le prix exclut les taxes applicables"));

const copiedFooterVehicle = Object.assign({}, vehicle, {
  descNote: "Flexible hours by appointment.\n\nCall 514-824-9117 for more information.\n\nAutomobile SX\n2044 Avenue Chartier\nDorval, QC H9P 1H2"
});
const normalizedWebsite = DESCRIBE.text(copiedFooterVehicle, "en");
assert(!normalizedWebsite.includes("Flexible hours by appointment"), "old copied footers must not compete with the template");
assert.equal((normalizedWebsite.match(/514-824-9117/g) || []).length, 1, "the standard phone CTA must appear once");
assert(normalizedWebsite.includes("confirm availability or book a test drive"));

const longNoteVehicle = Object.assign({}, vehicle, {
  descNote: "A dealer-specific English note. ".repeat(80),
  descNoteFr: "Une note propre au concessionnaire. ".repeat(80)
});
const fittedInstagram = SOCIAL.captionInstagram(longNoteVehicle);
assert(fittedInstagram.length <= 2200, "long owner notes must not make Instagram reject the caption");
assert(fittedInstagram.includes("Call or text 514-824-9117"), "length fitting must preserve the English CTA");
assert(fittedInstagram.includes("Appelez ou textez le 514-824-9117"), "length fitting must preserve the French CTA");

console.log("Description template tests passed.");
