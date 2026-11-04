"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const ROOT = path.join(__dirname, "..");

test("dynamic sitemap includes every generated EN/FR static page with reciprocal hreflang", async () => {
  // Stub inventory so the check is deterministic and does not contact GitHub.
  const sitemapPath = path.join(ROOT, "api", "sitemap.js");
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(sitemapPath, "utf8"), {
    module: mod,
    require(request) {
      assert.equal(request, "./_lib/github.js");
      return { readInventory: async () => ({ vehicles: [] }) };
    }
  }, { filename: sitemapPath });

  let xml = "";
  const headers = {};
  await mod.exports({}, {
    setHeader(name, value) { headers[name.toLowerCase()] = value; },
    end(body) { xml = body; },
    statusCode: 0
  });

  assert.match(headers["content-type"], /application\/xml/);
  const expected = JSON.parse(fs.readFileSync(path.join(ROOT, "sitemap-pages.json"), "utf8"));
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => m[1]);
  assert.equal(entries.length, expected.length, "static URL count differs from generated sitemap-pages.json");

  for (const page of expected) {
    const entry = entries.find(item => item.includes("<loc>" + page.loc + "</loc>"));
    assert.ok(entry, "missing static URL in dynamic sitemap: " + page.loc);
    for (const [lang, url] of [
      ["en-CA", page.alt.en],
      ["fr-CA", page.alt.fr],
      ["x-default", page.alt.en]
    ]) {
      assert.ok(entry.includes('hreflang="' + lang + '" href="' + url + '"'),
        "missing " + lang + " hreflang for " + page.loc);
    }
  }
});
