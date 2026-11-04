"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

const root = path.join(__dirname, "..");
const css = fs.readFileSync(path.join(root, "css/styles.css"), "utf8");

test("article photos are not cropped on mobile", () => {
  const mobileSection = css.slice(css.indexOf("/* --- Mobile: tighter hero, compact search card, less scroll --- */"));
  const nextSection = mobileSection.indexOf("/* --- Very small phones --- */");
  assert.ok(nextSection !== -1, "mobile section exists");
  const rules = mobileSection.slice(0, nextSection);
  const rule = rules.match(/\.article-hero img\s*\{([^}]*)\}/);
  assert.ok(rule, "article hero has a mobile-specific image rule");
  assert.match(rule[1], /aspect-ratio:\s*auto\s*;/);
  assert.match(rule[1], /height:\s*auto\s*;/);
  assert.match(rule[1], /object-fit:\s*contain\s*;/);
});

test("both guides in both languages use the shared article image class", () => {
  for (const file of [
    "guides/used-car-budget-quebec.html",
    "guides/used-car-inspection-dorval.html",
    "fr/guides/budget-auto-usagee-quebec.html",
    "fr/guides/inspection-auto-usagee-dorval.html"
  ]) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(html, /<figure class="article-hero">/);
    assert.match(html, /<img[^>]*width="1600" height="1200"/);
  }
});
