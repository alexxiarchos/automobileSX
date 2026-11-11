"use strict";

const assert = require("node:assert/strict");
const { spawn, spawnSync } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const ROOT = path.join(__dirname, "..");
const sample = require("../data/vehicles.json").vehicles.find(v => v.status === "available");
const { CACHE_CONTROL } = require("../api/_lib/publicInventory.js");
const active = Array.from({ length: 14 }, (_, index) => ({
  ...sample, id: "fixture-" + (index + 1), images: [], stock: "FIXTURE-" + (index + 1),
  status: index ? "available" : undefined, slugHistory: index ? [] : ["old-fixture"],
  draftNotes: { ownership: "internal fixture" }
}));
const excluded = ["sold", "draft", "hidden", "inactive"].map(status => ({
  ...sample, id: "fixture-" + status, status, images: []
}));

function writeSource(folder, vehicles) {
  fs.writeFileSync(path.join(folder, "data", "vehicles.json"), JSON.stringify({ vehicles }));
}

function build(folder) {
  return spawnSync(process.execPath, ["--require", "./github-fixture.cjs", "build/build.js"], {
    cwd: folder, encoding: "utf8",
    env: { ...process.env, VERCEL: "1", GITHUB_REPO: "fixture/site", GITHUB_TOKEN: "" }
  });
}

async function withServer(folder, run) {
  const server = spawn(process.execPath, ["dev-server.js"], {
    cwd: folder, env: { ...process.env, PORT: "0", SX_USE_BUILD_SNAPSHOT: "1", SX_MOCK_DIR: folder },
    stdio: ["ignore", "pipe", "inherit"]
  });
  try {
    const port = await new Promise((resolve, reject) => {
      let output = "";
      server.stdout.on("data", chunk => {
        output += chunk;
        const match = /Site: +http:\/\/localhost:(\d+)/.exec(output);
        if (match) resolve(match[1]);
      });
      server.once("error", reject);
      server.once("exit", code => reject(new Error("Server exited with " + code)));
    });
    const request = (route, options) => fetch("http://127.0.0.1:" + port + route, options);
    await run(request);
  } finally {
    if (server.exitCode === null) {
      const exit = once(server, "exit");
      server.kill();
      await exit;
    }
  }
}

function vehicleLinks(html, prefix) {
  return new Set([...html.matchAll(/class="vc-title"><a href="([^"]+)"/g)]
    .map(match => match[1]).filter(href => href.startsWith(prefix)));
}

function revision(html) {
  return html.match(/data-inventory-revision="([a-f0-9]{64})"/)[1];
}

function schema(html) {
  const [, json] = html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/);
  return JSON.parse(json)["@graph"];
}

async function assertInventory(request, expectedCount) {
  const responses = await Promise.all(["/", "/inventory", "/fr", "/fr/inventaire"].map(route => request(route)));
  assert(responses.every(response => response.status === 200));
  const pages = await Promise.all(responses.map(response => response.text()));
  for (const [index, html] of pages.entries()) {
    const language = index < 2 ? "en" : "fr";
    const label = language === "en" ? " vehicles in stock" : " v&#233;hicules en stock";
    assert.match(html, new RegExp(">" + expectedCount + label + "</p>"));
    assert.equal([...html.matchAll(/data-inventory-count="(\d+)"/g)].map(match => match[1]).join(), String(expectedCount));
    const listing = index % 2 === 1;
    assert.equal(vehicleLinks(html, language === "en" ? "/vehicles/" : "/fr/vehicules/").size,
      listing ? expectedCount : Math.min(6, expectedCount));
    assert(!/fixture-(sold|draft|hidden|inactive)/.test(html));
    assert.equal(revision(html), revision(pages[0]));
  }
  return pages;
}

test("production build publishes one crawlable inventory snapshot and replaces it on rebuild", { timeout: 20000 }, async t => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "sx-inventory-"));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  for (const directory of ["api", "build", "js"]) {
    fs.cpSync(path.join(ROOT, directory), path.join(folder, directory), { recursive: true });
  }
  for (const filename of ["dev-server.js", "vercel.json"]) {
    fs.copyFileSync(path.join(ROOT, filename), path.join(folder, filename));
  }
  fs.mkdirSync(path.join(folder, "data"));
  fs.mkdirSync(path.join(folder, "vehicles"));
  fs.writeFileSync(path.join(folder, "vehicles", "fixture-draft.html"), "Stale public listing");
  fs.writeFileSync(path.join(folder, "github-fixture.cjs"), `
    const fs = require("node:fs");
    const sha = "a".repeat(40);
    global.fetch = async url => {
      if (url.endsWith("/git/ref/heads/main")) {
        return { ok: true, json: async () => ({ object: { sha } }) };
      }
      if (!url.endsWith("/contents/data/vehicles.json?ref=" + sha)) throw Error(url);
      if (!fs.existsSync("data/vehicles.json")) return { ok: false, status: 503 };
      const content = fs.readFileSync("data/vehicles.json").toString("base64");
      return { ok: true, json: async () => ({ content, encoding: "base64" }) };
    };
  `);

  writeSource(folder, [...active, ...excluded]);
  let built = build(folder);
  assert.equal(built.status, 0, built.stderr);
  const first = fs.readFileSync(path.join(folder, "index.html"), "utf8");

  await withServer(folder, async request => {
    const [, inventory] = await assertInventory(request, 14);
    assert.match(inventory, /vc-price/);
    const detailUrl = "/vehicles/fixture-1";
    assert(vehicleLinks(inventory, "/vehicles/").has(detailUrl));
    const detail = await request(detailUrl);
    assert.equal(detail.status, 200);
    const html = await detail.text();
    assert.match(html, /<h1 id="v-title"[^>]*>/);
    assert(html.includes('<link rel="canonical" href="https://www.automobilesx.ca' + detailUrl + '">'));
    assert.equal(revision(html), revision(inventory));
    const [dealer, car] = schema(html);
    assert.equal(dealer["@type"], "AutoDealer");
    assert.deepEqual(car["@type"], ["Product", "Car"]);
    assert.equal(car.offers.seller["@id"], dealer["@id"]);
    assert.equal(car.offers.price, active[0].price);
    assert.equal(car.offers.priceCurrency, "CAD");
    assert.equal(car.offers.availability, "https://schema.org/InStock");
    assert.equal(car.mileageFromOdometer.value, active[0].km);
    assert.equal(car.mileageFromOdometer.unitCode, "KMT");
    assert.equal(car.vehicleIdentificationNumber, active[0].vin);
    assert.equal(car.sku, "FIXTURE-1");

    const fallback = await request("/api/vehicle?id=fixture-1");
    assert.equal(await fallback.text(), html);
    const sold = await request("/vehicles/fixture-sold");
    assert.equal(schema(await sold.text())[1].offers.availability, "https://schema.org/SoldOut");
    for (const status of ["draft", "hidden", "inactive"]) {
      assert.equal((await request("/vehicles/fixture-" + status)).status, 404);
    }
    const redirect = await request("/vehicles/old-fixture", { redirect: "manual" });
    assert.equal(redirect.status, 301);
    assert.equal(redirect.headers.get("location"), detailUrl);

    const stock = await request("/api/stock");
    assert.equal(stock.headers.get("cache-control"), CACHE_CONTROL);
    const data = await stock.json();
    assert.equal(data.revision, revision(html));
    assert.equal(data.vehicles.length, 15);
    assert.equal(data.vehicles[0].draftNotes, undefined);
    const sitemap = await request("/sitemap.xml");
    assert.equal(sitemap.headers.get("cache-control"), CACHE_CONTROL);
    const xml = await sitemap.text();
    assert.equal([...xml.matchAll(/<loc>[^<]+\/vehicles\//g)].length, 14);
    assert.equal([...xml.matchAll(/<loc>[^<]+\/fr\/vehicules\//g)].length, 14);
    assert(!/fixture-(sold|draft|hidden|inactive)/.test(xml));

    // An authoritative change alone cannot split the existing deployment.
    writeSource(folder, [...active.slice(0, 12), ...excluded]);
    await assertInventory(request, 14);
    assert.equal((await (await request("/api/stock")).json()).revision, data.revision);
  });

  built = build(folder);
  assert.equal(built.status, 0, built.stderr);
  await withServer(folder, async request => {
    const [home] = await assertInventory(request, 12);
    assert.notEqual(revision(home), revision(first));
    assert.equal((await request("/vehicles/fixture-14")).status, 404);
  });

  // A failed publish keeps the last confirmed pages and never creates zero.
  const published = fs.readFileSync(path.join(folder, "index.html"), "utf8");
  fs.unlinkSync(path.join(folder, "data", "vehicles.json"));
  built = build(folder);
  assert.notEqual(built.status, 0);
  assert.match(built.stderr, /HTTP 503/);
  assert.equal(fs.readFileSync(path.join(folder, "index.html"), "utf8"), published);
  fs.writeFileSync(path.join(folder, "data", "vehicles.json"), "{}");
  built = build(folder);
  assert.notEqual(built.status, 0);
  assert.match(built.stderr, /vehicles array/);

  writeSource(folder, excluded);
  built = build(folder);
  assert.equal(built.status, 0, built.stderr);
  await withServer(folder, async request => {
    const [, inventory] = await assertInventory(request, 0);
    assert.match(inventory, /New inventory arriving/);
  });

  fs.unlinkSync(path.join(folder, "api", "_lib", "inventory-snapshot.json"));
  await withServer(folder, async request => {
    for (const route of ["/api/stock", "/sitemap.xml", "/vehicles/unknown"]) {
      const response = await request(route);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const body = await response.text();
      assert.doesNotMatch(body, /0 vehicles|"vehicles":\[\]/);
      if (route.startsWith("/vehicles/")) assert.match(body, /href="\/inventory"/);
    }
  });
});
