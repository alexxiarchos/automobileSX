/* Automobile SX — the printable window sheet.

   What this is: an advertisement, and only that. Price, photo, specifications,
   equipment and a code a passer-by can scan at nine at night when the office is
   shut. It carries no warranty statement and no legal wording of any kind, by
   instruction and by design — the label the law requires is a separate document
   with prescribed contents, and mixing the two would produce something that is
   neither.

   Printing is the browser's own Print dialogue rather than a PDF generated on a
   server. That means no dependency to install, no function to time out, it
   works from a phone, and "Save as PDF" is one item in the same menu as the
   printer. The CSS is written for one vehicle per page on Letter and A4 alike.

   Several vehicles can be printed in one go: /admin/sheet?ids=a,b,c gives one
   page each, which is how you re-sticker the whole lot after a price change. */

(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var ids = (params.get("ids") || params.get("id") || "")
    .split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  var lang = params.get("lang") === "fr" ? "fr" : "en";

  var SITE = "https://www.automobilesx.ca";
  var DEALER = {
    name: "Automobile SX",
    phone: "514-824-9117",
    street: "2044 Avenue Chartier",
    city: "Dorval, QC H9P 1H2"
  };

  var T = {
    en: {
      hours: "Open seven days a week, by appointment",
      km: "Kilometres", trans: "Transmission", drive: "Drivetrain", fuel: "Fuel",
      engine: "Engine", colour: "Colour", interior: "Interior", seats: "Seats",
      doors: "Doors", city: "Fuel, city", hwy: "Fuel, highway",
      equipment: "Equipment",
      scan: "Scan for all the photos",
      call: "Call or text Spiro",
      stock: "Stock",
      noPhoto: "No photo on this listing",
      missing: "That vehicle is not in the inventory."
    },
    fr: {
      hours: "Ouvert sept jours sur sept, sur rendez-vous",
      km: "Kilométrage", trans: "Transmission", drive: "Rouage", fuel: "Carburant",
      engine: "Moteur", colour: "Couleur", interior: "Intérieur", seats: "Places",
      doors: "Portes", city: "Consommation ville", hwy: "Consommation route",
      equipment: "Équipements",
      scan: "Scannez pour toutes les photos",
      call: "Appelez ou textez Spiro",
      stock: "Stock",
      noPhoto: "Aucune photo pour cette fiche",
      missing: "Ce véhicule n'est pas dans l'inventaire."
    }
  };

  var SPEC_FR = {
    transmission: { "Automatic": "Automatique", "Manual": "Manuelle", "CVT": "CVT", "e-CVT": "e-CVT" },
    fuel: { "Gasoline": "Essence", "Hybrid": "Hybride", "Diesel": "Diesel",
            "Electric": "Électrique", "Plug-in Hybrid": "Hybride rechargeable" },
    drivetrain: { "FWD": "Traction avant", "AWD": "Intégrale", "RWD": "Propulsion", "4x4": "4x4" }
  };

  /* Colours are typed in by hand in English. The description writer already
     knows how to say them in French, so the sheet borrows that rather than
     printing "Grey cloth" on a French sticker. */
  function colour(value) {
    if (lang !== "fr" || !value) return value || "";
    return window.SX_DESCRIBE ? SX_DESCRIBE.colourFr(value) : value;
  }

  function spec(kind, value) {
    if (lang !== "fr" || !value) return value || "";
    var m = SPEC_FR[kind];
    return (m && m[value]) || value;
  }

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function money(n) {
    var v = Math.round(Number(n) || 0);
    return lang === "fr"
      ? v.toLocaleString("fr-CA") + " $"
      : "$" + v.toLocaleString("en-CA");
  }

  function km(n) {
    return Number(n || 0).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA") + " km";
  }

  function vehicleUrl(v) {
    return SITE + (lang === "fr" ? "/fr/vehicules/" : "/vehicles/") + encodeURIComponent(v.id);
  }

  function specCell(label, value) {
    if (!value) return "";
    return '<div class="spec"><dt>' + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  function sheet(v) {
    var t = T[lang];
    var name = [v.year, v.make, v.model].filter(Boolean).join(" ");
    var sub = [v.trim, spec("drivetrain", v.drivetrain), spec("fuel", v.fuel)]
      .filter(Boolean).join(" · ");

    var cells = [
      specCell(t.km, km(v.km)),
      specCell(t.trans, spec("transmission", v.transmission)),
      specCell(t.drive, spec("drivetrain", v.drivetrain)),
      specCell(t.engine, v.engine),
      specCell(t.fuel, spec("fuel", v.fuel)),
      specCell(t.colour, colour(v.extColor)),
      specCell(t.interior, colour(v.intColor)),
      specCell(t.doors, v.doors),
      specCell(t.seats, v.seats),
      specCell(t.city, v.econCity != null && v.econCity !== "" ? Number(v.econCity).toFixed(1) + " L/100 km" : ""),
      specCell(t.hwy, v.econHwy != null && v.econHwy !== "" ? Number(v.econHwy).toFixed(1) + " L/100 km" : "")
    ].filter(Boolean);
    while (cells.length % 4) cells.push('<div class="spec"></div>');

    /* Grouped by the shared catalogue and translated with it, so the French
       sheet says "caméra de recul" without a second list to maintain. */
    var groups = window.SX_FEATURES ? SX_FEATURES.grouped(v.features || [], lang) : [];
    var feats = [];
    groups.forEach(function (g) { feats = feats.concat(g.items); });

    var url = vehicleUrl(v);
    var photo = (v.images && v.images.length)
      ? '<img class="photo" src="/' + esc(String(v.images[0]).replace(/^\//, "")) + '" alt="">'
      : '<div class="photo noPhoto">' + esc(t.noPhoto) + "</div>";

    return '<div class="sheet">' +
      '<div class="head">' +
        '<img src="/assets/logo-mark.png" alt="">' +
        '<div class="brand">AUTOMOBILE <span>SX</span>' +
          "<small>" + esc(DEALER.street) + " · " + esc(DEALER.city) + "</small></div>" +
        '<div class="head-contact"><b>' + esc(DEALER.phone) + "</b><br>" + esc(t.hours) + "</div>" +
      "</div>" +

      '<h1 class="title">' + esc(name) + "</h1>" +
      (sub ? '<p class="subtitle">' + esc(sub) + "</p>" : "") +

      /* No fine print of any kind on this sheet: it is an advertisement, not a
         disclosure document, and the two do different jobs. */
      '<div class="priceRow"><div class="price">' + esc(money(v.price)) + "</div></div>" +

      photo +

      '<div class="specs">' + cells.join("") + "</div>" +

      (feats.length
        ? '<div class="featuresBlock"><p class="blockTitle">' + esc(t.equipment) + "</p>" +
          '<ul class="features">' + feats.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") +
          "</ul></div>"
        : "") +

      '<div class="foot">' +
        '<div class="qr">' + SX_QR.svg(url, { quiet: 2, label: name }) + "</div>" +
        '<div class="footText"><div class="big">' + esc(t.scan) + "</div>" +
          '<div class="url">' + esc(url.replace(/^https:\/\//, "")) + "</div>" +
          "<div>" + esc(t.call) + " · <b>" + esc(DEALER.phone) + "</b></div></div>" +
        (v.stock ? '<div class="stock">' + esc(t.stock) + "<b>" + esc(v.stock) + "</b></div>" : "") +
      "</div>" +
    "</div>";
  }

  function render(vehicles) {
    var byId = {};
    vehicles.forEach(function (v) { byId[v.id] = v; });
    var wanted = ids.length ? ids : vehicles
      .filter(function (v) { return (v.status || "available") === "available"; })
      .map(function (v) { return v.id; });

    var html = wanted.map(function (id) {
      var v = byId[id];
      return v ? sheet(v) : '<div class="sheet"><p class="missing">' + esc(T[lang].missing) +
        " (" + esc(id) + ")</p></div>";
    }).join("");

    document.getElementById("sheets").innerHTML = html ||
      '<div class="sheet"><p class="missing">' + esc(T[lang].missing) + "</p></div>";
    document.documentElement.lang = lang === "fr" ? "fr-CA" : "en-CA";
  }

  /* The public inventory file, which is what the website itself reads. No
     credentials involved, so a sheet can be printed from any device that is
     already signed in to nothing at all. */
  fetch("/data/vehicles.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (d) { render(d.vehicles || []); })
    .catch(function (e) {
      document.getElementById("sheets").innerHTML =
        '<div class="sheet"><p class="missing">Could not load the inventory: ' + esc(e.message) + "</p></div>";
    });

  document.getElementById("print").addEventListener("click", function () { window.print(); });

  function switchTo(next) {
    params.set("lang", next);
    location.search = params.toString();
  }
  document.getElementById("lang-en").addEventListener("click", function () { switchTo("en"); });
  document.getElementById("lang-fr").addEventListener("click", function () { switchTo("fr"); });
  document.getElementById("lang-" + lang).classList.add("on");
  document.getElementById("lang-" + (lang === "fr" ? "en" : "fr")).classList.remove("on");
})();
