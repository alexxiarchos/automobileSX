/* Automobile SX - home page dynamic bits (static content lives in the HTML) */
SX.ready.then(function () {
  "use strict";

  /* Search card */
  var makeSel = document.getElementById("hs-make");
  var modelSel = document.getElementById("hs-model");
  if (makeSel && modelSel) {
    var makes = Array.from(new Set(SX.vehicles.map(function (v) { return v.make; }))).sort();
    makeSel.innerHTML = '<option value="">' + SX.t("search.any") + "</option>" +
      makes.map(function (m) { return '<option value="' + m + '">' + m + "</option>"; }).join("");

    function fillModels() {
      var mk = makeSel.value;
      var models = Array.from(new Set(SX.vehicles
        .filter(function (v) { return !mk || v.make === mk; })
        .map(function (v) { return v.model; }))).sort();
      modelSel.innerHTML = '<option value="">' + SX.t("search.any") + "</option>" +
        models.map(function (m) { return '<option value="' + m + '">' + m + "</option>"; }).join("");
    }
    fillModels();
    makeSel.addEventListener("change", fillModels);

    document.getElementById("hero-search").addEventListener("submit", function (e) {
      e.preventDefault();
      var params = new URLSearchParams();
      if (makeSel.value) params.set("make", makeSel.value);
      if (modelSel.value) params.set("model", modelSel.value);
      var p = document.getElementById("hs-price").value;
      if (p) params.set("maxPrice", p);
      location.href = SX.url("inventory") + (params.toString() ? "?" + params.toString() : "");
    });
  }

  /* Featured vehicles */
  var grid = document.getElementById("featured-grid");
  if (grid) {
    var featured = SX.vehicles.slice().sort(function (a, b) {
      return (b.tag ? 1 : 0) - (a.tag ? 1 : 0) || b.year - a.year;
    }).slice(0, 6);
    grid.innerHTML = "";
    if (!featured.length) {
      var msg = document.createElement("p");
      msg.className = "muted-note";
      msg.innerHTML = SX.t("inv.noStockBody", '<a href="' + SX.dealer.phoneHref + '">' + SX.dealer.phone + "</a>");
      grid.replaceWith(msg);
    } else {
      featured.forEach(function (v) { grid.appendChild(SXUI.vehicleCard(v)); });
    }
  }

  /* Body type tiles */
  var tiles = document.getElementById("body-tiles");
  if (tiles) {
    tiles.innerHTML = SX.bodyTypes.map(function (b) {
      var count = SX.vehicles.filter(function (v) { return v.body === b; }).length;
      return '<a class="body-tile" href="' + SX.url("inventory") + "?body=" + encodeURIComponent(b) + '">' +
        '<span class="bt-name">' + SX.bodyLabel(b) + '</span><span class="bt-count">' + count + " " + SX.t("inv.inStock") + "</span></a>";
    }).join("");
  }

  /* Payment estimator */
  var calc = document.getElementById("home-calculator");
  if (calc) {
    calc.innerHTML = "";
    calc.appendChild(SXUI.paymentCalculator({ price: 18000, minPrice: 5000, maxPrice: 60000 }));
  }

  /* Hours */
  var hours = document.getElementById("visit-hours");
  if (hours) {
    hours.innerHTML = "<tbody>" + SX.dealer.hours.map(function (h) {
      return "<tr><td>" + (SX.lang === "fr" ? h.fr : h.day) + "</td><td>" + h.open + " - " + h.close + "</td></tr>";
    }).join("") + "</tbody>";
  }
  var note = document.getElementById("visit-note");
  if (note) note.textContent = SX.dealer.apptNote[SX.lang];

  SXUI.mapBlock(document.getElementById("visit-map"));

  SXUI.initReveal();
});
