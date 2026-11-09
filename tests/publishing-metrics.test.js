"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { renderListingPages } = require("../api/_lib/listingPages.js");
const { renderVehiclePages } = require("../api/_lib/vehiclePage.js");
const { renderPage } = require("../build/layout.js");
const vehicleFixture = require("../data/vehicles.json").vehicles.find(function (v) {
  return v && v.id && v.status !== "draft";
});


test("missing crawlable listing pages report warnings without losing save compatibility", async function () {
  const warnings = [];
  const pages = await renderListingPages([], async function () { return null; }, function (message) {
    warnings.push(message);
  });
  assert.deepEqual(pages, []);
  assert.equal(warnings.length, 4);
  assert(warnings.some(function (message) { return message.includes("inventory.html"); }));
});

test("missing listing card markers report a warning", async function () {
  const warnings = [];
  const pages = await renderListingPages([], async function () {
    return "<html><body>Missing card markers</body></html>";
  }, function (message) { warnings.push(message); });
  assert.deepEqual(pages, []);
  assert.equal(warnings.length, 4);
  assert(warnings.every(function (message) { return message.includes("markers"); }));
});

test("valid listing card markers are refreshed in both languages", async function () {
  const warnings = [];
  const pages = await renderListingPages([], async function () {
    return "<main><!--SX:CARDS-->outdated<!--/SX:CARDS--></main>";
  }, function (message) { warnings.push(message); });
  assert.equal(pages.length, 4);
  assert.deepEqual(warnings, []);
  assert(pages.every(function (page) { return !page.content.includes("outdated"); }));
});

function runMetrics(options = {}) {
  const stored = options.stored || {};
  const scripts = [];
  const controls = {
    "[data-metrics-status]": [{getAttribute: k => k === "data-on" ? "On" : "Off"}],
    "[data-metrics-opt-out]": [{}],
    "[data-metrics-opt-in]": [{}]
  };
  let reloads = 0;
  const doc = {
    readyState: "complete",
    head: {appendChild: script => scripts.push(script.src)},
    querySelectorAll: k => controls[k] || [],
    getElementById: () => null,
    createElement: () => ({}),
    addEventListener: () => {}
  };
  const win = {doNotTrack: options.dnt ? "1" : "0"};
  const loc = {hostname: options.hostname || "www.automobilesx.ca", reload: () => {reloads++;}};
  const ctx = {
    document: doc, window: win, location: loc,
    navigator: {globalPrivacyControl: !!options.gpc, doNotTrack: options.dnt ? "1" : "0"},
    localStorage: {
      getItem: k => stored[k] || null,
      setItem: (k,v) => {stored[k] = v;},
      removeItem: k => {delete stored[k];}
    },
    URL: URL
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../js/metrics.js"), "utf8"), ctx);
  return {scripts, controls, stored, vaq: win.vaq || [], reloads: () => reloads};
}

test("production loads Vercel Web Analytics and Speed Insights", () => {
  assert.deepEqual(runMetrics().scripts, ["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"]);
});

test("privacy signals, opt-out and previews suppress measurement", () => {
  for (const options of [{gpc:true}, {dnt:true}, {hostname:"preview.vercel.app"},
    {stored:{sx_metrics_disabled:"1"}}]) assert.deepEqual(runMetrics(options).scripts, []);
});

test("a visitor can disable and reenable analytics", () => {
  const a = runMetrics();
  a.controls["[data-metrics-opt-out]"][0].onclick();
  assert.equal(a.stored.sx_metrics_disabled, "1");
  assert.equal(a.reloads(), 1);
  const b = runMetrics({stored:a.stored});
  b.controls["[data-metrics-opt-in]"][0].onclick();
  assert.equal(b.stored.sx_metrics_disabled, undefined);
  assert.equal(b.reloads(), 1);
});

test("Vercel analytics removes query strings and ignores admin views", () => {
  const a = runMetrics();
  assert.equal(a.vaq.length, 1);
  assert.equal(a.vaq[0][0], "beforeSend");
  const beforeSend = a.vaq[0][1];
  assert.equal(beforeSend({url:"https://www.automobilesx.ca/vehicles/car?email=secret#fragment"}).url,
    "https://www.automobilesx.ca/vehicles/car");
  assert.equal(beforeSend({url:"https://www.automobilesx.ca/admin"}), null);
});

test("English and French pages have no Google Analytics tags", () => {
  assert(vehicleFixture);
  for (const lang of ["en", "fr"]) {
    const html = renderPage({route:"contact", lang, title:"Contact", description:"Contact", body:""});
    assert.doesNotMatch(html, /sx-ga4-id|googletagmanager|gtag/i);
    assert.match(html, /\/js\/metrics\.js/);
  }
  for (const page of renderVehiclePages(vehicleFixture)) {
    assert.doesNotMatch(page.html, /sx-ga4-id|googletagmanager|gtag/i);
    assert.match(page.html, /\/js\/metrics\.js/);
  }
});
