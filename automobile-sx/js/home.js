/* Automobile SX — home page */
(function () {
  "use strict";

  function render() {
    SXUI.init("home");

    /* Hero background */
    document.getElementById("hero-bg").innerHTML =
      '<img src="' + SXUI.heroImage() + '" alt="A coupe parked on the Automobile SX lot at dusk (placeholder photo)">';

    /* Translate simple keys */
    document.querySelectorAll("[data-t]").forEach(function (el) {
      el.textContent = SX.t(el.getAttribute("data-t"));
    });

    /* Search card: makes + dependent models */
    var makeSel = document.getElementById("hs-make");
    var modelSel = document.getElementById("hs-model");
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
      location.href = "inventory.html" + (params.toString() ? "?" + params.toString() : "");
    });

    /* Trust strip */
    var ICONS = {
      inspect: '<svg viewBox="0 0 34 34" fill="none" stroke-width="1.8"><path d="M17 3l11 4v8c0 7-4.6 12.5-11 16-6.4-3.5-11-9-11-16V7l11-4z"/><path d="M11.5 17l4 4 7-8"/></svg>',
      carfax: '<svg viewBox="0 0 34 34" fill="none" stroke-width="1.8"><rect x="6" y="4" width="22" height="26" rx="2"/><path d="M11 11h12M11 16h12M11 21h7"/></svg>',
      returns: '<svg viewBox="0 0 34 34" fill="none" stroke-width="1.8"><path d="M6 14a12 12 0 1 1 3 9"/><path d="M6 7v7h7"/></svg>',
      credit: '<svg viewBox="0 0 34 34" fill="none" stroke-width="1.8"><rect x="4" y="8" width="26" height="18" rx="2"/><path d="M4 14h26M9 21h6"/></svg>'
    };
    var trust = [
      { icon: "inspect", h: "150-Point Inspection", p: "Mechanical, electrical, body — checked and documented before listing." },
      { icon: "carfax", h: "History on Every Listing", p: "Full specs, kilometres and vehicle history disclosed up front." },
      { icon: "returns", h: "By Appointment", p: "Call " + SX.dealer.phone + " to book — one-on-one, no crowds. Reservations welcome." },
      { icon: "credit", h: "Financing for All Credit", p: "A dozen Canadian lenders. Honest rates, told to you up front." }
    ];
    document.getElementById("trust-strip").innerHTML = trust.map(function (t) {
      return '<div class="trust-item">' + ICONS[t.icon] + "<div><h3>" + t.h + "</h3><p>" + t.p + "</p></div></div>";
    }).join("");

    /* Featured: 6 vehicles (tagged ones first, then newest) */
    var featured = SX.vehicles.slice().sort(function (a, b) {
      return (b.tag ? 1 : 0) - (a.tag ? 1 : 0) || b.year - a.year;
    }).slice(0, 6);
    var grid = document.getElementById("featured-grid");
    grid.innerHTML = "";
    featured.forEach(function (v) { grid.appendChild(SXUI.vehicleCard(v)); });

    /* Body type tiles */
    document.getElementById("body-tiles").innerHTML = SX.bodyTypes.map(function (b) {
      var count = SX.vehicles.filter(function (v) { return v.body === b; }).length;
      return '<a class="body-tile" href="inventory.html?body=' + encodeURIComponent(b) + '">' +
        SXUI.bodyTypeIcon(b) +
        '<div class="bt-name">' + b + '</div><div class="bt-count">' + count + " in stock</div></a>";
    }).join("");

    /* Financing calculator */
    var calcWrap = document.getElementById("home-calculator");
    calcWrap.innerHTML = "";
    calcWrap.appendChild(SXUI.paymentCalculator({ price: 28000, minPrice: 12000, maxPrice: 50000 }));

    /* Trade-in photo */
    document.getElementById("trade-photo").innerHTML = SXUI.lotPhotoSVG();

    /* Testimonials */
    document.getElementById("testimonial-grid").innerHTML = SX.testimonials.map(function (t) {
      return '<figure class="testimonial">' +
        '<div class="stars" aria-label="5 out of 5 stars">★★★★★</div>' +
        "<blockquote>“" + t.quote + "”</blockquote>" +
        "<figcaption><strong>" + t.name + "</strong><span>Purchased a " + t.vehicle + "</span></figcaption></figure>";
    }).join("");

    /* Visit block */
    document.getElementById("visit-map").innerHTML = SXUI.mapSVG();
    document.getElementById("visit-hours").innerHTML = "<tbody>" + SX.dealer.hours.map(function (h) {
      var name = SX.lang === "fr" ? h.fr : h.day;
      return "<tr" + (h.open ? "" : ' class="closed"') + "><td>" + name + "</td><td>" +
        (h.open ? h.open + " – " + h.close : SX.t("closed")) + "</td></tr>";
    }).join("") + "</tbody>";
    document.getElementById("visit-note").textContent = SX.dealer.apptNote[SX.lang];

    SXUI.initReveal();
  }

  document.addEventListener("sx:lang", render);
  render();
})();
