"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { renderListingPages } = require("../api/_lib/listingPages.js");

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

function runMetrics(options) {
  const stored = options.stored || {};
  const events = {};
  const scripts = [];
  const tags = [];
  const id = options.id || "";
  const doc = {
    readyState: "complete",
    head: { appendChild: function (script) { scripts.push(script.src); } },
    querySelector: function () {
      return id ? { getAttribute: function () { return id; } } : null;
    },
    querySelectorAll: function () { return []; },
    getElementById: function () { return null; },
    createElement: function () { return {}; },
    addEventListener: function (name, fn) { events[name] = fn; }
  };
  const window = { doNotTrack: "0" };
  const location = {
    hostname: options.hostname || "www.automobilesx.ca",
    origin: "https://www.automobilesx.ca",
    pathname: "/contact",
    search: "?vehicle=secret-id",
    hash: "#secret"
  };
  const ctx = {
    document: doc,
    window: window,
    location: location,
    navigator: { globalPrivacyControl: !!options.gpc, doNotTrack: "0" },
    localStorage: {
      getItem: function (key) { return stored[key] || null; },
      setItem: function (key, value) { stored[key] = value; },
      removeItem: function (key) { delete stored[key]; }
    },
    URL: URL,
    Date: Date,
    encodeURIComponent: encodeURIComponent
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../js/metrics.js"), "utf8"), ctx);
  return { events: events, scripts: scripts, tags: window.dataLayer || [], metrics: window.SXMetrics };
}

test("GA4 is off by default and does not load without consent", function () {
  const result = runMetrics({ id: "G-TEST123" });
  assert(!result.scripts.some(function (src) { return src.includes("googletagmanager"); }));
  result.metrics.event("generate_lead", { lead_type: "contact_form" });
  assert.equal(result.tags.length, 0);
});

test("consented GA4 sends a sanitized page URL and lead event", function () {
  const result = runMetrics({ id: "G-TEST123", stored: { sx_ga4_consent: "granted" } });
  assert(result.scripts.some(function (src) { return src.includes("googletagmanager"); }));
  result.events["sx:contact-success"]();
  const args = Array.from(result.tags[result.tags.length - 1]);
  assert.equal(args[0], "event");
  assert.equal(args[1], "generate_lead");
  assert.equal(args[2].page_location, "https://www.automobilesx.ca/contact");
  assert(!JSON.stringify(result.tags.map(function (item) { return Array.from(item); })).includes("secret"));
});

test("privacy signals and preview deployments disable GA4", function () {
  for (const options of [
    { id: "G-TEST123", gpc: true, stored: { sx_ga4_consent: "granted" } },
    { id: "G-TEST123", hostname: "preview.vercel.app", stored: { sx_ga4_consent: "granted" } },
    { id: "G-TEST123", stored: { sx_ga4_consent: "granted", sx_metrics_disabled: "1" } }
  ]) {
    const result = runMetrics(options);
    assert(!result.scripts.some(function (src) { return src.includes("googletagmanager"); }));
  }
});