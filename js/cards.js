/* Automobile SX - the vehicle card, rendered as a string.

   Why this exists. The inventory page and the homepage used to ship an empty
   <div> and let js/components.js fill it in the browser. A person saw the cars;
   a crawler saw an empty grid, and with it no links to any of the vehicle
   pages. Every vehicle page was pre-rendered and indexable, and nothing on the
   site pointed at them in the initial HTML.

   So the same card is now written twice over: as a DOM node by components.js
   for anything the browser builds after a filter, and as a string here for
   anything baked into a page before it is served. The markup has to match, or
   the grid would visibly reflow the moment the script ran, which is why this
   file mirrors vehicleCard() in components.js class for class. Change one and
   change the other.

   Loaded by Node from build/build.js and api/_lib/inventoryPage.js. It is kept
   free of DOM calls for that reason. */

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./makes.js"));
  else root.SX_CARDS = factory(root.SX_MAKES);
})(typeof self !== "undefined" ? self : this, function (makes) {
  "use strict";

  var T = {
    en: {
      photosSoon: "PHOTOS COMING SOON",
      sold: "Sold",
      saved: "Save this vehicle",
      auto: "Automatic", manual: "Manual", cvt: "CVT", ecvt: "e-CVT",
      gas: "Gasoline", hybrid: "Hybrid", diesel: "Diesel",
      electric: "Electric", plugin: "Plug-in Hybrid",
      fwd: "FWD", awd: "AWD", rwd: "RWD", fourbyfour: "4x4"
    },
    fr: {
      photosSoon: "PHOTOS À VENIR",
      sold: "Vendu",
      saved: "Enregistrer ce véhicule",
      auto: "Automatique", manual: "Manuelle", cvt: "CVT", ecvt: "e-CVT",
      gas: "Essence", hybrid: "Hybride", diesel: "Diesel",
      electric: "Électrique", plugin: "Hybride rechargeable",
      fwd: "Traction avant", awd: "Intégrale", rwd: "Propulsion", fourbyfour: "4x4"
    }
  };

  var TRANS = { Automatic: "auto", Manual: "manual", CVT: "cvt", "e-CVT": "ecvt" };
  var FUEL = { Gasoline: "gas", Hybrid: "hybrid", Diesel: "diesel",
               Electric: "electric", "Plug-in Hybrid": "plugin" };
  var DRIVE = { FWD: "fwd", AWD: "awd", RWD: "rwd", "4x4": "fourbyfour" };

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function money(n, lang) {
    var v = Math.round(Number(n) || 0);
    return lang === "fr"
      ? v.toLocaleString("fr-CA") + " $"
      : "$" + v.toLocaleString("en-CA");
  }

  function label(map, value, lang) {
    var key = map[value];
    return key ? T[lang][key] : (value || "");
  }

  function title(v) {
    var make = makes && makes.fixMake ? makes.fixMake(v.make) : v.make;
    var model = makes && makes.fixModel ? makes.fixModel(v.model) : v.model;
    return [v.year, make, model].filter(Boolean).join(" ");
  }

  function url(v, lang) {
    return (lang === "fr" ? "/fr/vehicules/" : "/vehicles/") + encodeURIComponent(v.id);
  }

  /* The placeholder is an inline SVG data URL rather than a file, so a listing
     with no photograph yet still lays out at the right aspect ratio and never
     requests an image that does not exist. */
  function image(v, lang) {
    if (v.images && v.images.length) return "/" + String(v.images[0]).replace(/^\//, "");
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 288">' +
      '<rect width="512" height="288" fill="#141517"/>' +
      '<rect x="216" y="118" width="80" height="3" fill="#BA1D26"/>' +
      '<text x="256" y="152" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="700" letter-spacing="3" fill="#F2EFED">AUTOMOBILE SX</text>' +
      '<text x="256" y="176" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="12" letter-spacing="2" fill="#6B6F76">' +
      T[lang].photosSoon + "</text></svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function specLine(v, lang) {
    var km = Number(v.km || 0).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");
    return [km + " km",
      label(TRANS, v.transmission, lang),
      label(FUEL, v.fuel, lang),
      label(DRIVE, v.drivetrain, lang)].filter(Boolean).join(" · ");
  }

  var HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21c-4.8-3.6-8.4-6.8-9.6-9.9C1.2 8 2.6 4.6 6 4.1c1.9-.3 3.8.6 6 2.9 2.2-2.3 4.1-3.2 6-2.9 3.4.5 4.8 3.9 3.6 7-1.2 3.1-4.8 6.3-9.6 9.9z"/></svg>';

  /* index matters: the first few cards are the largest thing above the fold on
     the inventory page, so they load eagerly and everything after them waits.
     Lazy-loading the lead image is the classic way to make a page score worse
     while looking like an optimisation. */
  function card(v, lang, index, eagerCount) {
    var t = T[lang];
    var name = title(v);
    var trim = makes && makes.displayTrim ? makes.displayTrim(v.trim) : (v.trim || "");
    var alt = [name, trim, v.extColor].filter(Boolean).join(" ").trim();
    var tag = (v.status === "sold") ? t.sold : (v.tag || "");
    var priorityCount = eagerCount === undefined ? 3 : eagerCount;
    var eager = (index || 0) < priorityCount;
    var count = (v.images && v.images.length) || 1;

    return '<article class="vehicle-card">' +
      '<div class="vc-media">' +
        '<a href="' + esc(url(v, lang)) + '" tabindex="-1" aria-hidden="true">' +
        '<img ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') +
          ' decoding="async" src="' + esc(image(v, lang)) + '" alt="' + esc(alt) +
          '" width="512" height="288"></a>' +
        (tag ? '<span class="vc-tag">' + esc(tag) + "</span>" : "") +
        '<span class="vc-photo-count">▣ ' + count + "</span>" +
      "</div>" +
      '<div class="vc-body">' +
        '<div class="vc-head"><div>' +
          '<h3 class="vc-title"><a href="' + esc(url(v, lang)) + '">' + esc(name) + "</a></h3>" +
          '<p class="vc-trim">' + esc(trim) + "</p>" +
        "</div>" +
        '<button class="vc-save" type="button" aria-pressed="false" aria-label="' +
          esc(t.saved) + '">' + HEART + "</button>" +
        "</div>" +
        '<p class="vc-specs">' + esc(specLine(v, lang)) + "</p>" +
        '<div class="vc-price">' + esc(money(v.price, lang)) + "</div>" +
      "</div>" +
    "</article>";
  }

  /* Available stock only, newest first, which is the order the inventory page
     itself settles on once it has sorted. */
  function available(vehicles) {
    return (vehicles || [])
      .filter(function (v) { return v && v.id && (!v.status || v.status === "available"); })
      .sort(function (a, b) {
        return String(b.publishedAt || b.createdAt || "")
          .localeCompare(String(a.publishedAt || a.createdAt || ""));
      });
  }

  function grid(vehicles, lang, limit, eagerCount) {
    var list = available(vehicles);
    if (limit) list = list.slice(0, limit);
    return list.map(function (v, i) { return card(v, lang, i, eagerCount); }).join("");
  }

  return {
    card: card, grid: grid, available: available,
    title: title, url: url, image: image, specLine: specLine, money: money
  };
});
