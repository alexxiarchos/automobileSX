/* Automobile SX - keeping the listing pages current between builds.

   The inventory page and the homepage carry their vehicle cards in the HTML,
   so a crawler arriving with no JavaScript still sees the cars and, more
   importantly, still sees links to every vehicle page. build/build.js bakes
   those cards in when the site is built.

   But stock does not change at build time. It changes when Spiro publishes a
   car or marks one sold, which commits data/vehicles.json and never touches
   those pages. Left alone, the baked cards would be right the day of a deploy
   and wrong the day after, which is worse than not having them: a crawler
   would be handed a confidently stale list.

   So /api/save rewrites the same region on every save. The region is fenced by
   sentinel comments written into the templates, and only what is between them
   is replaced. Nothing else about the page is regenerated here, which matters:
   these are the site's most heavily indexed pages and this file has no business
   rewriting their copy, their metadata or their structured data.

   If the fences are missing, the page is left exactly as it was. A page that
   silently keeps working is a better failure than one rewritten by a function
   that could not find its footing. */

const cards = require("../../js/cards.js");

const OPEN = "<!--SX:CARDS-->";
const CLOSE = "<!--/SX:CARDS-->";

/* Which files carry a card region, and how many cards each one wants. The
   homepage shows a handful; the inventory page shows everything. */
const TARGETS = [
  { path: "index.html", lang: "en", limit: 6 },
  { path: "fr/index.html", lang: "fr", limit: 6 },
  { path: "inventory.html", lang: "en", limit: 0 },
  { path: "fr/inventaire.html", lang: "fr", limit: 0 }
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
async function renderListingPages(vehicles, readFile) {
  const out = [];
  for (const t of TARGETS) {
    let html;
    try {
      html = await readFile(t.path);
    } catch (e) {
      continue;                       /* page not in the repo yet: skip it */
    }
    if (!html) continue;

    const inner = cards.grid(vehicles, t.lang, t.limit || 0);
    const next = replaceRegion(html, inner);
    if (next === null || next === html) continue;   /* no fences, or no change */
    out.push({ path: t.path, content: next });
  }
  return out;
}

module.exports = { renderListingPages, TARGETS, OPEN, CLOSE };
