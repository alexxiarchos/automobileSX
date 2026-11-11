"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const ROOT = path.join(__dirname, "..");

function element(initialHtml) {
  return {
    innerHTML: initialHtml || "",
    textContent: "",
    disabled: false,
    hidden: false,
    style: {},
    children: [],
    addEventListener() {},
    appendChild(child) { this.children.push(child); },
    querySelector() { return element(); },
    querySelectorAll() { return []; },
    classList: { toggle() {} },
    setAttribute() {}
  };
}

function runBrowserScript(file, sx, els) {
  const nodes = els || {};
  const document = {
    body: { style: {} },
    getElementById(id) { return nodes[id] || null; },
    createElement() { return element(); },
    addEventListener() {}
  };
  const context = {
    SX: Object.assign({
      ready: { then(fn) { fn(); } },
      lang: "en",
      vehicles: [],
      bodyTypes: ["SUV"],
      t(key) { return key; },
      dealer: { phoneHref: "tel:+15148249117", phone: "514-824-9117", hours: [], apptNote: { en: "", fr: "" } },
      money(n) { return "$" + n; },
      bodyLabel(b) { return b; },
      specLabel(k, v) { return v; },
      url() { return "/inventory"; }
    }, sx),
    SXUI: {
      mapBlock() {},
      initReveal() {},
      vehicleCard() { return element(); },
      paymentCalculator() { return element(); }
    },
    document,
    location: { search: "" },
    URLSearchParams
  };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), "utf8"), context, { filename: file });
  return nodes;
}

test("homepage preserves server-rendered vehicles when the API fails", () => {
  const grid = element('<article class="vehicle-card">Existing vehicle</article>');
  const notices = [];
  grid.parentNode = { insertBefore(note) { notices.push(note); } };
  const nodes = runBrowserScript("js/home.js", {
    loadError: new Error("503"),
    vehicles: []
  }, { "featured-grid": grid });
  assert.match(nodes["featured-grid"].innerHTML, /Existing vehicle/);
  assert.equal(notices.length, 1);
  assert.match(notices[0].textContent, /could not be refreshed/);
});

test("inventory preserves server-rendered vehicles and disables stale controls on API failure", () => {
  const grid = element('<article class="vehicle-card">Existing vehicle</article>');
  const result = element();
  const more = element();
  const filters = element();
  const sort = element();
  const controls = [element(), element()];
  const sidebar = element();
  sidebar.querySelectorAll = () => controls;
  const nodes = runBrowserScript("js/inventory.js", {
    loadError: new Error("503"),
    vehicles: []
  }, {
    "inventory-grid": grid,
    "result-count": result,
    "load-more": more,
    "filters-open": filters,
    "sort": sort,
    "filter-sidebar": sidebar
  });
  assert.match(nodes["inventory-grid"].innerHTML, /Existing vehicle/);
  assert.match(result.textContent, /Live inventory unavailable/);
  assert.equal(more.style.display, "none");
  assert.equal(filters.disabled, true);
  assert.equal(sort.disabled, true);
  assert(controls.every(c => c.disabled));
});

test("a legitimate zero-vehicle response still renders the actual no-stock state", () => {
  const nodes = new Proxy({}, {
    get(target, key) {
      if (typeof key !== "string") return undefined;
      if (!target[key]) target[key] = element();
      return target[key];
    }
  });
  runBrowserScript("js/inventory.js", { vehicles: [] }, nodes);
  const empty = nodes["empty-state"];
  assert.equal(empty.hidden, false);
  assert.equal(empty.querySelector("h2").textContent, "inv.noStockTitle");
});

test("inventory pages do not expose hidden zero-results copy in raw HTML", () => {
  for (const file of ["inventory.html", "fr/inventaire.html"]) {
    const html = fs.readFileSync(path.join(ROOT, file), "utf8");
    const match = html.match(/<div class="empty-state" id="empty-state" hidden>\s*<h2>([^<]*)<\/h2>\s*<p>([^<]*)<\/p>/);
    assert(match, file + " must include an initially blank empty state");
    assert.equal(match[1], "");
    assert.equal(match[2], "");
    assert.match(html, /<!--SX:CARDS--><article class="vehicle-card">/);
  }
});

test("public inventory feed is accessible to search crawlers but private API stays excluded", () => {
  const robots = fs.readFileSync(path.join(ROOT, "robots.txt"), "utf8");
  assert.match(robots, /^Disallow: \/api\/$/m);
  assert.match(robots, /^Allow: \/api\/stock$/m);
  assert.match(robots, /^Disallow: \/admin$/m);
});
