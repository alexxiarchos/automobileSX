"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const ROOT = path.join(__dirname, "..");

function element(initialHtml) {
  const queried = {};
  return {
    innerHTML: initialHtml || "",
    textContent: "",
    disabled: false,
    hidden: false,
    style: {},
    children: [],
    addEventListener() {},
    appendChild(child) { this.children.push(child); },
    querySelector(selector) { return queried[selector] || (queried[selector] = element()); },
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

async function loadInventoryData(fetchImpl, revision) {
  const context = {
    SX: {},
    SX_INVENTORY_RULES: require("../js/inventory-rules.js"),
    document: { querySelector() { return revision ? { dataset: { inventoryRevision: revision } } : null; } },
    fetch: fetchImpl,
    location: { pathname: "/inventory" },
    console: { error() {} }
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8"), context, {
    filename: "js/data.js"
  });
  await context.SX.ready;
  return context.SX;
}

function makeSynchronous(sx) {
  return Object.assign({}, sx, { ready: { then(fn) { fn(); } } });
}

test("homepage preserves server-rendered vehicles when the API fails", () => {
  const grid = element('<article class="vehicle-card">Existing vehicle</article>');
  let writes = 0;
  let html = grid.innerHTML;
  Object.defineProperty(grid, "innerHTML", {
    get() { return html; },
    set(value) { writes++; html = value; }
  });
  const notices = [];
  grid.parentNode = { insertBefore(note) { notices.push(note); } };
  const nodes = runBrowserScript("js/home.js", {
    loadError: new Error("503"),
    vehicles: []
  }, { "featured-grid": grid });
  assert.match(nodes["featured-grid"].innerHTML, /Existing vehicle/);
  assert.equal(writes, 0, "the existing homepage card markup must not be replaced");
  assert.equal(notices.length, 1);
  assert.match(notices[0].textContent, /could not be refreshed/);
});

test("inventory preserves server-rendered vehicles after the real data fetch rejects", async () => {
  const sx = await loadInventoryData(async function () {
    throw new Error("network unavailable");
  });
  assert(sx.loadError);

  const grid = element('<article class="vehicle-card">Existing vehicle</article>');
  let writes = 0;
  let html = grid.innerHTML;
  Object.defineProperty(grid, "innerHTML", {
    get() { return html; },
    set(value) { writes++; html = value; }
  });
  const result = element();
  const more = element();
  const filters = element();
  const sort = element();
  const controls = [element(), element()];
  const sidebar = element();
  sidebar.querySelectorAll = () => controls;
  const nodes = runBrowserScript("js/inventory.js", makeSynchronous(sx), {
    "inventory-grid": grid,
    "result-count": result,
    "load-more": more,
    "filters-open": filters,
    "sort": sort,
    "filter-sidebar": sidebar
  });
  assert.match(nodes["inventory-grid"].innerHTML, /Existing vehicle/);
  assert.equal(writes, 0, "the existing inventory card markup must not be replaced");
  assert.match(result.textContent, /Live inventory unavailable/);
  assert.equal(result.children[0].href, "/inventory");
  assert.equal(more.style.display, "none");
  assert.equal(filters.disabled, true);
  assert.equal(sort.disabled, true);
  assert(controls.every(c => c.disabled));
});

test("a malformed successful response is treated as a feed failure, not zero stock", async () => {
  const sx = await loadInventoryData(async function () {
    return { ok: true, json: async function () { return {}; } };
  });
  assert(sx.loadError);
  assert.match(sx.loadError.message, /vehicles array/);
});

test("a response from a different deployment cannot replace the HTML snapshot", async () => {
  const sx = await loadInventoryData(async () => ({
    ok: true, json: async () => ({ revision: "new-release", vehicles: [] })
  }), "old-release");
  assert.match(sx.loadError.message, /deployment changed/);
});

test("a legitimate zero-vehicle response still renders the actual no-stock state", async () => {
  const sx = await loadInventoryData(async function () {
    return { ok: true, json: async function () { return { vehicles: [] }; } };
  });
  assert.equal(sx.loadError, undefined);

  const nodes = new Proxy({}, {
    get(target, key) {
      if (typeof key !== "string") return undefined;
      if (!target[key]) target[key] = element();
      return target[key];
    }
  });
  runBrowserScript("js/inventory.js", makeSynchronous(sx), nodes);
  const empty = nodes["empty-state"];
  assert.equal(empty.hidden, false);
  assert.equal(empty.querySelector("h2").textContent, "New inventory arriving");
});

test("a build with genuine zero inventory emits a crawlable no-stock state", () => {
  const { inventoryBody } = require("../build/blocks.js");
  for (const copyFile of ["copy-en.js", "copy-fr.js"]) {
    const copy = require(path.join(ROOT, "build", copyFile));
    const html = inventoryBody(copy, "", 0, "test");
    assert.match(html, /<div class="empty-state" id="empty-state">/);
    assert.match(html, new RegExp(copy.ui.noStockTitle));
    assert.match(html, /id="empty-reset"[^>]+style="display:none"/);
  }
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
