/* Refresh the checked-in listing markup on admin saves. Vercel still
   regenerates the deployed pages from its authoritative build snapshot.
   The markers let an admin save update inventory without rewriting page copy. */

const cards = require("../../js/cards.js");
const { snapshot } = require("./publicInventory.js");
const COPY = { en: require("../../build/copy-en.js"), fr: require("../../build/copy-fr.js") };

function inventoryCount(lang, count, revision) {
  const label = lang === "fr"
    ? count + (count === 1 ? " v&#233;hicule en stock" : " v&#233;hicules en stock")
    : count + (count === 1 ? " vehicle in stock" : " vehicles in stock");
  return '<p class="result-count" data-inventory-count="' + count +
    '" data-inventory-revision="' + revision + '">' + label + "</p>";
}

function emptyState(T, count) {
  const hasCards = count > 0;
  return `<div class="empty-state" id="empty-state"${hasCards ? " hidden" : ""}>
        <h2>${hasCards ? "" : T.ui.noStockTitle}</h2>
        <p>${hasCards ? "" : T.ui.noStockBody}</p>
        <button class="btn btn-red" id="empty-reset" type="button"${hasCards ? "" : ' style="display:none"'}>${T.ui.emptyReset}</button>
      </div>`;
}

const OPEN = "<!--SX:CARDS-->";
const CLOSE = "<!--/SX:CARDS-->";

/* Which files carry a card region, and how many cards each one wants. The
   homepage shows a handful; the inventory page shows everything. */
const TARGETS = [
  { path: "index.html", lang: "en", limit: 6, eagerCount: 0 },
  { path: "fr/index.html", lang: "fr", limit: 6, eagerCount: 0 },
  { path: "inventory.html", lang: "en", limit: 0, eagerCount: 3 },
  { path: "fr/inventaire.html", lang: "fr", limit: 0, eagerCount: 3 }
];

function replaceRegion(html, inner) {
  const start = html.indexOf(OPEN);
  if (start === -1) return null;
  const end = html.indexOf(CLOSE, start);
  if (end === -1) return null;
  return html.slice(0, start + OPEN.length) + inner + html.slice(end);
}

/* readFile is passed in rather than imported so this stays testable without a
   network, and so the caller decides which branch is being read. */
async function renderListingPages(vehicles, readFile, reportWarning) {
  function warn(message) {
    if (typeof reportWarning === "function") reportWarning(message);
  }
  const inventory = snapshot({ vehicles });
  const count = cards.available(inventory.vehicles).length;
  const out = [];
  for (const t of TARGETS) {
    let html;
    try {
      html = await readFile(t.path);
    } catch (e) {
      warn("Could not read " + t.path + " for listing regeneration");
      continue;
    }
    if (!html) {
      warn("Missing " + t.path + " during listing regeneration");
      continue;
    }

    const inner = cards.grid(inventory.vehicles, t.lang, t.limit || 0, t.eagerCount);
    let next = replaceRegion(html, inner);
    if (next === null) {
      warn("Missing inventory card markers in " + t.path);
      continue;
    }
    next = next.replace(/<!--SX:COUNT-->[\s\S]*?<!--\/SX:COUNT-->/,
      "<!--SX:COUNT-->" + inventoryCount(t.lang, count, inventory.revision) + "<!--/SX:COUNT-->");
    if (!t.limit) {
      const copy = COPY[t.lang];
      next = next.replace(/<!--SX:EMPTY-->[\s\S]*?<!--\/SX:EMPTY-->/,
        () => "<!--SX:EMPTY-->" + emptyState(copy, count) + "<!--/SX:EMPTY-->");
    }
    if (next === html) continue;
    out.push({ path: t.path, content: next });
  }
  return out;
}

module.exports = { renderListingPages, inventoryCount, emptyState, TARGETS, OPEN, CLOSE };
