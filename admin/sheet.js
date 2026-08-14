/* Automobile SX - the printable window sheet.

   What this is: an advertisement, and only that. Price, photo, specifications,
   equipment and a code a passer-by can scan at nine at night when the office is
   shut. It carries no warranty statement and no legal wording of any kind, by
   instruction and by design - the label the law requires is a separate document
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
    city: "Dorval, QC H9P 1H2",

    /* The dealer permit number, printed on every sheet. Fill this in once and
       it appears on all of them. It is an identifying number and nothing more:
       it makes no promise and states no condition of sale, so it does not drag
       the prescribed label onto what is still an advertisement. Left blank it
       simply does not print, like every other empty field here. */
    opc: "2100424-1"
  };

  var T = {
    en: {
      km: "Kilometres", trans: "Transmission", drive: "Drivetrain", fuel: "Fuel",
      engine: "Engine", colour: "Colour", interior: "Interior", seats: "Seats",
      doors: "Doors and seats", doorsShort: "doors", seatsShort: "seats",
      body: "Body style", city: "Fuel, city", hwy: "Fuel, highway", vin: "Serial number",
      equipment: "Equipment",
      scan: "Scan for all the photos",
      call: "Call or text Spiro at",
      finance: "Financing available, contact dealer",
      opc: "OPC permit",
      stock: "Stock",
      missing: "That vehicle is not in the inventory."
    },
    fr: {
      km: "Kilométrage", trans: "Transmission", drive: "Rouage", fuel: "Carburant",
      engine: "Moteur", colour: "Couleur", interior: "Intérieur", seats: "Places",
      doors: "Portes et places", doorsShort: "portes", seatsShort: "places",
      body: "Carrosserie", city: "Consommation ville", hwy: "Consommation route", vin: "No de série",
      equipment: "Équipements",
      scan: "Scannez pour toutes les photos",
      call: "Appelez ou textez Spiro au",
      finance: "Financement disponible, contactez le marchand",
      opc: "Permis OPC",
      stock: "Stock",
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

  var BODY_FR = { Sedan: "Berline", SUV: "VUS", Truck: "Camionnette", Coupe: "Coupé", Hatchback: "Hayon" };
  function bodyLabel(value) {
    if (!value) return "";
    return lang === "fr" ? (BODY_FR[value] || value) : value;
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

  /* Small line icons, drawn here rather than loaded, so the sheet has no
     dependency that could fail to arrive before the print dialogue opens. */
  var ICON = {
    odometer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 12l4.5-3"/><path d="M12 3v2M21 12h-2M3 12h2"/></svg>',
    vin: '<svg viewBox="0 0 24 24"><path d="M4 6v12M7 6v12M10 7v10M13 6v12M16 7v10M20 6v12"/></svg>',
    stock: '<svg viewBox="0 0 24 24"><path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/></svg>',
    opc: '<svg viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 12h6M9 16h6"/></svg>'
  };

  function idBlock(icon, label, value, mono) {
    if (!value) return "";
    return '<div class="id">' + ICON[icon] + "<div>" +
      '<dt>' + esc(label) + "</dt>" +
      '<dd' + (mono ? ' class="mono"' : "") + ">" + esc(value) + "</dd></div></div>";
  }

  function specCell(label, value) {
    if (!value) return "";
    return '<div class="spec"><dt>' + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  /* ---------- the prescribed label ----------

     Everything below this line is the OPC half of the sheet. It is a legal
     disclosure and it obeys a different rule from the rest of the page: where
     the advertisement hides a field that is empty, the label prints "Aucune".
     A blank beside "Reparations" says nothing; "Aucune" is the disclosure. */

  function opcOf(v) {
    var o = (v && v.opc) || {};
    return {
      classOverride: o.classOverride || "",
      priorUse: o.priorUse || "",
      priorOwner: o.priorOwner || "",
      extended: o.extended || "",
      powertrain: o.powertrain || "",
      manufacturer: o.manufacturer || "",
      repairs: o.repairs || "",
      remarks: o.remarks || ""
    };
  }

  function opcPair(label, value) {
    return '<div class="opcPair"><dt>' + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  function opcBlock(v) {
    if (!window.SX_OPC) return "";
    var o = opcOf(v);
    var L = SX_OPC.T[lang];
    var code = o.classOverride || SX_OPC.classify(v.year, v.km);
    var none = L.none;

    /* Without a year or a mileage there is no class to state, and inventing one
       is the single worst thing this file could do. The card is left off and
       the sheet stays an advertisement until somebody fills the fields in. */
    if (!code) return "";

    var warranty =
      '<div class="card opcCard">' +
        '<h2 class="cardTitle">' + esc(L.warranty) + "</h2>" +
        '<div class="opcGrid">' +
          opcPair(L.working, L.classLabel + " " + code) +
          opcPair(L.legal, L.yes) +
          opcPair(L.extended, o.extended || none) +
          opcPair(L.powertrain, o.powertrain || none) +
          opcPair(L.manufacturer, o.manufacturer || none) +
        "</div>" +
      "</div>";

    var priorUse = SX_OPC.priorUse(o.priorUse, lang);
    var disclosure =
      '<div class="opcText">' +
        (priorUse ? "<p><b>" + esc(L.usedAs) + "</b> " + esc(priorUse) + "</p>" : "") +
        "<p><b>" + esc(L.priorOwner) + "</b> " + esc(o.priorOwner || L.onRequest) + "</p>" +
        '<p class="opcStatute">' + esc(SX_OPC.statute(code, lang)) + "</p>" +
      "</div>";

    var notes =
      '<div class="card opcCard">' +
        '<h2 class="cardTitle">' + esc(L.remark) + "</h2>" +
        "<p>" + esc(o.remarks || none) + "</p>" +
        '<h2 class="cardTitle" style="margin-top:4mm">' + esc(L.repairs) + "</h2>" +
        "<p>" + esc(o.repairs || none) + "</p>" +
      "</div>";

    var acceptance =
      '<div class="card tinted opcCard opcAccept">' +
        '<h2 class="cardTitle">' + esc(L.acceptance) + "</h2>" +
        "<p>" + esc(L.received) + "</p>" +
        '<div class="opcSign">' +
          '<div><span>' + esc(L.date) + "</span><i></i></div>" +
          '<div><span>' + esc(L.signature) + "</span><i></i></div>" +
        "</div>" +
      "</div>";

    /* Two columns, not four stacked cards. Full width, this block ran to
       161mm on its own and pushed the sheet onto a second page; side by side
       it is half that and the sheet stays one page per car, which is the whole
       point of a window sheet. */
    return '<div class="opc">' +
        '<div class="opcCol">' + warranty + disclosure + "</div>" +
        '<div class="opcCol">' + notes + acceptance + "</div>" +
      "</div>";
  }

  function sheet(v) {
    var t = T[lang];
    var url = vehicleUrl(v);

    var specs = [
      specCell(t.engine, v.engine),
      specCell(t.body, bodyLabel(v.body)),
      specCell(t.fuel, spec("fuel", v.fuel)),
      specCell(t.colour, colour(v.extColor)),
      specCell(t.trans, spec("transmission", v.transmission)),
      specCell(t.interior, colour(v.intColor)),
      specCell(t.drive, spec("drivetrain", v.drivetrain)),
      specCell(t.doors, [v.doors ? v.doors + " " + t.doorsShort : "",
                         v.seats ? v.seats + " " + t.seatsShort : ""].filter(Boolean).join(" · ")),
      specCell(t.city, v.econCity != null && v.econCity !== "" ? Number(v.econCity).toFixed(1) + " L/100 km" : ""),
      specCell(t.hwy, v.econHwy != null && v.econHwy !== "" ? Number(v.econHwy).toFixed(1) + " L/100 km" : "")
    ].filter(Boolean);

    /* Grouped by the shared catalogue and translated with it, so the French
       sheet says "caméra de recul" without a second list to maintain. */
    var groups = window.SX_FEATURES ? SX_FEATURES.grouped(v.features || [], lang) : [];
    var feats = [];
    groups.forEach(function (g) { feats = feats.concat(g.items); });

    var idBlocks = [
      idBlock("odometer", t.km, v.km === "" || v.km === null || v.km === undefined ? "" : km(v.km)),
      idBlock("stock", t.stock, v.stock),
      idBlock("vin", t.vin, v.vin ? String(v.vin).toUpperCase() : "", true),
      /* Sits beside the serial number because that is where a buyer already
         looks for the numbers that identify who they are dealing with. */
      idBlock("opc", t.opc, DEALER.opc)
    ].filter(Boolean);

    /* No photograph. This sheet is taped to the car it describes, so a picture
       of that same car taken from two metres away is the one thing on the page
       the reader does not need: they are looking at the real thing. The QR code
       already opens every photo for anyone who wants them, and the space it
       frees is what buys the legal label its place on page one. */

    /* Two columns that each pack from the top, rather than two rows of two.
       As two rows, the dealer card was stretched to match the price card beside
       it and ended up a mostly empty rectangle; packed into a column it is only
       as tall as the address inside it, and the equipment list below simply
       starts higher. Nothing is stretched to fit anything else. */
    return '<div class="sheet"><div class="sheetInner">' +

      '<div class="main">' +
        '<div class="col">' +

        '<div class="card brand">' +
          '<div class="brandRow"><img src="/assets/logo-mark.png" alt="">' +
            '<div class="brandName">AUTOMOBILE <span>SX</span></div></div>' +
          '<div class="brandLines">' +
            '<div class="row"><svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>' +
              "<span>" + esc(DEALER.street) + ", " + esc(DEALER.city) + "</span></div>" +
            '<div class="row"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.25 1z"/></svg>' +
              "<b>" + esc(DEALER.phone) + "</b></div>" +
            '<div class="row"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2c1.4 0 3 2.5 3 6h-6c0-3.5 1.6-6 3-6zM4.3 11h3.4c.05-2 .5-3.8 1.2-5.2A8 8 0 0 0 4.3 11zm0 2a8 8 0 0 0 4.6 5.2c-.7-1.4-1.15-3.2-1.2-5.2H4.3zm5.4 0h4.6c-.05 3.5-1.6 6-3 6s-2.95-2.5-3-6zm6.6 0h3.4a8 8 0 0 1-4.6 5.2c.7-1.4 1.15-3.2 1.2-5.2zm0-2c-.05-2-.5-3.8-1.2-5.2A8 8 0 0 1 19.7 11h-3.4z"/></svg>' +
              "<span>automobilesx.ca</span></div>" +
          "</div>" +
        "</div>" +

        (feats.length
          ? '<div class="card"><h2 class="cardTitle">' + esc(t.equipment) + "</h2>" +
            '<ul class="features">' + feats.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") +
            "</ul></div>"
          : "") +

        "</div>" +

        '<div class="col">' +

        '<div class="card tinted headline">' +
          '<div class="price">' + esc(money(v.price)) + "</div>" +
          '<div class="finance">' + esc(t.finance) + "</div>" +
          (v.make ? '<div class="make">' + esc(v.make) + "</div>" : "") +
          (v.model ? '<div class="model">' + esc(v.model) + "</div>" : "") +
          (v.trim ? '<div class="trim">' + esc(v.trim) + "</div>" : "") +
          (v.year ? '<div class="year">' + esc(v.year) + "</div>" : "") +
        "</div>" +

        /* The rule between the numbers and the specifications is drawn by the
           specifications, and the gap above it by the numbers. On a thin
           listing either half can be empty, so each one is asked for before it
           is drawn and the card itself disappears if neither has anything to
           say. An empty panel with a line across it reads as a fault. */
        (idBlocks.length || specs.length
          ? '<div class="card">' +
            (idBlocks.length
              ? '<div class="ids"' + (specs.length ? "" : ' style="margin-bottom:0"') + ">" +
                idBlocks.join("") + "</div>"
              : "") +
            (specs.length
              ? '<div class="specs"' + (idBlocks.length ? "" : ' style="border-top:0;padding-top:0"') + ">" +
                specs.join("") + "</div>"
              : "") +
            "</div>"
          : "") +

        "</div>" +
      "</div>" +

      opcBlock(v) +

      '<div class="foot">' +
        '<div class="qr">' + SX_QR.svg(url, { quiet: 2, label: [v.year, v.make, v.model].filter(Boolean).join(" ") }) + "</div>" +
        '<div class="footText"><div class="big">' + esc(t.scan) + "</div>" +
          '<div class="url">' + esc(url.replace(/^https:\/\//, "")) + "</div>" +
          "<div>" + esc(t.call) + " <b>" + esc(DEALER.phone) + "</b></div></div>" +
        (v.stock ? '<div class="stock">' + esc(t.stock) + "<b>" + esc(v.stock) + "</b></div>" : "") +
      "</div>" +
    "</div></div>";
  }

  /* ---------- one car, one page ----------

     This used to be a JavaScript problem and it is now a CSS one, which is a
     better place for it. The old version measured each sheet after rendering
     and scaled it to fit a page whose size it had to assume, in millimetres.
     That assumption held on the machine it was written on and broke on a
     phone, where the print dialogue chooses its own paper and its own margins:
     the sheet overhung the right edge and the bottom fell onto a second page.

     It also had to fight the browser for a measurement worth trusting. The web
     font arrives late and changes every height; Chrome's print path ignores the
     zoom property; iOS Safari never fires beforeprint. Each of those needed its
     own workaround, and every workaround was another thing to be wrong.

     None of it exists any more. The print stylesheet says the sheet is one page
     tall and one page wide, in vh and per cent, and scales the contents by a
     fixed factor chosen so the fullest listing still fits. The browser knows
     the paper size; asking it is more reliable than guessing. */

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
