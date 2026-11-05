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

function runMetrics(options) {
  const stored = options.stored || {};
  const events = {};
  const scripts = [];
  const tags = [];
  const id = options.id || "";
  const cookiesSet = [];
  const controls = {
    "[data-ga4-revoke]": [{}],
    "[data-metrics-opt-out]": [{}]
  };
  let reloads = 0;
  const doc = {
    readyState: "complete",
    head: { appendChild: function (script) { scripts.push(script.src); } },
    querySelector: function () {
      return id ? { getAttribute: function () { return id; } } : null;
    },
    querySelectorAll: function (selector) { return controls[selector] || []; },
    getElementById: function () { return null; },
    createElement: function () { return {}; },
    addEventListener: function (name, fn) { events[name] = fn; },
    get cookie() { return options.cookies || ""; },
    set cookie(value) { cookiesSet.push(value); }
  };
  const window = { doNotTrack: "0" };
  const location = {
    hostname: options.hostname || "www.automobilesx.ca",
    origin: "https://www.automobilesx.ca",
    pathname: options.pathname || "/contact",
    search: "?vehicle=secret-id",
    hash: "#secret",
    reload: function () { reloads += 1; }
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
  return {
    events: events, scripts: scripts, tags: window.dataLayer || [], metrics: window.SXMetrics,
    stored: stored, controls: controls, cookieWrites: cookiesSet, reloadCount: function () { return reloads; }
  };
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
test("GA4 ID is emitted for generic and both vehicle detail pages, and omitted otherwise", function () {
  assert(vehicleFixture, "a published vehicle test fixture is required");
  const original = process.env.GA4_MEASUREMENT_ID;
  try {
    process.env.GA4_MEASUREMENT_ID = "G-TEST123";
    const generic = renderPage({ route: "contact", lang: "en", title: "Contact", description: "Contact", body: "" });
    assert.match(generic, /<meta name="sx-ga4-id" content="G-TEST123">/);
    assert(generic.includes('<meta name="theme-color" content="#0D0D0D">\n<meta name="sx-ga4-id"'), "the meta tag must be separate HTML markup, not a literal backslash-n");
    for (const page of renderVehiclePages(vehicleFixture)) {
      assert.match(page.html, /<meta name="sx-ga4-id" content="G-TEST123">/, page.path);
    }
    delete process.env.GA4_MEASUREMENT_ID;
    assert.doesNotMatch(renderPage({ route: "contact", lang: "fr", title: "Contact", description: "Contact", body: "" }), /sx-ga4-id/);
    for (const page of renderVehiclePages(vehicleFixture)) {
      assert.doesNotMatch(page.html, /sx-ga4-id/, page.path);
    }
    process.env.GA4_MEASUREMENT_ID = "INVALID";
    for (const page of renderVehiclePages(vehicleFixture)) {
      assert.doesNotMatch(page.html, /sx-ga4-id/, page.path);
    }
  } finally {
    if (original === undefined) delete process.env.GA4_MEASUREMENT_ID;
    else process.env.GA4_MEASUREMENT_ID = original;
  }
});

test("consented vehicle-page GA4 sends a sanitized view and tracks phone contact intent", function () {
  const result = runMetrics({
    id: "G-TEST123",
    pathname: "/vehicles/2021-example",
    stored: { sx_ga4_consent: "granted" }
  });
  assert(result.scripts.some(function (s) { return s.includes("googletagmanager"); }));
  result.events.click({ target: {
    closest: function () { return { getAttribute: function () { return "tel:+15145551234"; } }; }
  } });
  const view = Array.from(result.tags[1]);
  assert.equal(view[0], "config");
  assert.equal(view[2].page_location, "https://www.automobilesx.ca/vehicles/2021-example");
  const call = Array.from(result.tags[result.tags.length - 1]);
  assert.equal(call[1], "click_to_call");
  assert.equal(call[2].page_location, "https://www.automobilesx.ca/vehicles/2021-example");
});

test("withdrawal of GA4 consent removes permission and expires only GA4 cookies", function () {
  const result = runMetrics({
    id: "G-TEST123",
    stored: { sx_ga4_consent: "granted", unrelated: "keep" },
    cookies: "shopping-cart=keep; _ga=GA1.1.1.1; _ga_TEST123=GS1.1.2; _gid=keep"
  });
  assert.equal(typeof result.controls["[data-ga4-revoke]"][0].onclick, "function");
  result.controls["[data-ga4-revoke]"][0].onclick();
  assert.equal(result.stored.sx_ga4_consent, undefined);
  assert.equal(result.stored.unrelated, "keep");
  assert.equal(result.reloadCount(), 1);
  assert(result.cookieWrites.some(function (x) { return x.startsWith("_ga=; Max-Age=0;"); }));
  assert(result.cookieWrites.some(function (x) { return x.startsWith("_ga_TEST123=; Max-Age=0;"); }));
  assert(result.cookieWrites.some(function (x) { return x.includes("Domain=.automobilesx.ca"); }));
  assert(result.cookieWrites.every(function (x) { return /^_ga(?:_|=)/.test(x); }));
});

test("turning off all analytics also withdraws GA4 consent and expires cookies", function () {
  const result = runMetrics({
    id: "G-TEST123",
    stored: { sx_ga4_consent: "granted" },
    cookies: "_ga=GA1.1.1.1"
  });
  result.controls["[data-metrics-opt-out]"][0].onclick();
  assert.equal(result.stored.sx_metrics_disabled, "1");
  assert.equal(result.stored.sx_ga4_consent, undefined);
  assert.equal(result.reloadCount(), 1);
  assert(result.cookieWrites.some(function (x) { return x.startsWith("_ga=;"); }));
});
