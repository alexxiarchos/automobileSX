/* Automobile SX — vehicle detail page */
(function () {
  "use strict";

  SXUI.init("inventory");
  document.body.classList.add("has-detail-bar");

  var id = new URLSearchParams(location.search).get("id");
  var v = SX.getVehicle(id) || SX.vehicles[0];
  var title = SX.vehicleTitle(v);

  document.title = title + " " + v.trim + " — Automobile SX";

  /* Breadcrumb */
  var bodyPlural = { Sedan: "Sedans", SUV: "SUVs", Truck: "Trucks", Coupe: "Coupes", Hatchback: "Hatchbacks" }[v.body] || v.body;
  document.getElementById("breadcrumb").innerHTML =
    '<li><a href="inventory.html">Inventory</a></li>' +
    '<li><a href="inventory.html?body=' + encodeURIComponent(v.body) + '">' + bodyPlural + "</a></li>" +
    '<li aria-current="page">' + title + " " + v.trim + "</li>";

  document.getElementById("v-title").textContent = title + " " + v.trim;
  document.getElementById("v-subtitle").textContent =
    v.extColor + " · " + SXUI.specLine(v) + " · Stock " + v.stock;

  /* ---------- Gallery ---------- */
  var images = SXUI.vehicleImages(v);
  var idx = 0;
  var galImg = document.getElementById("gal-img");
  var counter = document.getElementById("gal-counter");
  var strip = document.getElementById("thumb-strip");

  function altFor(i) {
    return title + " " + v.trim + " — " + SX.photoViews[i] + " placeholder photo";
  }

  strip.innerHTML = images.map(function (src, i) {
    return '<button type="button" role="tab" aria-label="Photo ' + (i + 1) + ": " + SX.photoViews[i] + '">' +
      '<img loading="lazy" src="' + src + '" alt="" width="512" height="288"></button>';
  }).join("");
  var thumbs = Array.prototype.slice.call(strip.children);

  function show(i) {
    idx = (i + images.length) % images.length;
    galImg.src = images[idx];
    galImg.alt = altFor(idx);
    counter.textContent = (idx + 1) + " / " + images.length;
    thumbs.forEach(function (t, j) { t.setAttribute("aria-current", String(j === idx)); });
    if (lightbox.classList.contains("open")) {
      lbImg.src = images[idx];
      lbImg.alt = altFor(idx);
    }
  }
  thumbs.forEach(function (t, i) { t.addEventListener("click", function () { show(i); }); });
  document.getElementById("gal-prev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("gal-next").addEventListener("click", function () { show(idx + 1); });

  /* Lightbox */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lastFocus = null;

  function openLB() {
    lastFocus = document.activeElement;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    show(idx);
    document.getElementById("lb-close").focus();
  }
  function closeLB() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  galImg.addEventListener("click", openLB);
  document.getElementById("lb-close").addEventListener("click", closeLB);
  document.getElementById("lb-prev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("lb-next").addEventListener("click", function () { show(idx + 1); });
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLB(); });

  document.addEventListener("keydown", function (e) {
    var lbOpen = lightbox.classList.contains("open");
    if (e.key === "Escape" && lbOpen) { closeLB(); return; }
    if (e.key === "ArrowLeft" && (lbOpen || document.activeElement.closest("#gallery-main, #thumb-strip"))) show(idx - 1);
    if (e.key === "ArrowRight" && (lbOpen || document.activeElement.closest("#gallery-main, #thumb-strip"))) show(idx + 1);
  });

  show(0);

  /* ---------- Overview ---------- */
  document.getElementById("v-overview").innerHTML =
    v.desc.map(function (p) { return "<p>" + p + "</p>"; }).join("");

  /* ---------- Specs ---------- */
  var specs = [
    ["Engine", v.engine],
    ["Transmission", v.transmission],
    ["Drivetrain", v.drivetrain],
    ["Fuel type", v.fuel],
    ["Fuel economy (city)", v.econCity.toFixed(1) + " L/100 km"],
    ["Fuel economy (highway)", v.econHwy.toFixed(1) + " L/100 km"],
    ["Exterior colour", v.extColor],
    ["Interior", v.intColor],
    ["Doors", String(v.doors)],
    ["Seats", String(v.seats)],
    ["Kilometres", v.km.toLocaleString("en-CA") + " km"],
    ["VIN", v.vin]
  ];
  var half = Math.ceil(specs.length / 2);
  function specTable(rows) {
    return '<table class="spec-table"><tbody>' + rows.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>";
    }).join("") + "</tbody></table>";
  }
  document.getElementById("v-specs").innerHTML = specTable(specs.slice(0, half)) + specTable(specs.slice(half));

  /* ---------- Features ---------- */
  var groups = [["Safety", v.features.safety], ["Comfort", v.features.comfort], ["Technology", v.features.technology], ["Exterior", v.features.exterior]];
  document.getElementById("v-features").innerHTML = groups.map(function (g) {
    return '<div class="feature-group"><h3>' + g[0] + '</h3><ul class="feature-chips">' +
      g[1].map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul></div>";
  }).join("");

  /* ---------- History (sample, deterministic per vehicle) ---------- */
  var owners = (v.desc[0] + v.desc[1]).indexOf("one owner") > -1 || v.desc[0].indexOf("One owner") > -1 ? 1 : 2;
  document.getElementById("v-history").innerHTML =
    '<div class="history-item"><div class="h-label">Owners</div><div class="h-value">' + owners + "</div></div>" +
    '<div class="history-item"><div class="h-label">Accidents reported</div><div class="h-value"><span class="trust-dot"></span>None</div></div>' +
    '<div class="history-item"><div class="h-label">Service records</div><div class="h-value">' + (8 + (v.km % 7)) + " records</div></div>" +
    '<div class="history-item"><div class="h-label">Title</div><div class="h-value"><span class="badge-trust">✓ Clean title</span></div></div>';

  /* ---------- Rail ---------- */
  document.getElementById("r-price").textContent = SX.money(v.price);
  document.getElementById("r-mo").textContent = SX.estMoLabel(v.price) + " · plus taxes & licensing";
  document.getElementById("r-facts").innerHTML =
    "<li><span>Kilometres</span><span>" + v.km.toLocaleString("en-CA") + " km</span></li>" +
    "<li><span>Stock #</span><span>" + v.stock + "</span></li>" +
    "<li><span>VIN</span><span>" + v.vin + "</span></li>";
  document.getElementById("r-testdrive").href = "contact.html?interest=test-drive&vehicle=" + v.id;
  document.getElementById("r-availability").href = "contact.html?interest=vehicle&vehicle=" + v.id;
  document.getElementById("r-preapproved").href = "contact.html?interest=financing";

  /* Mobile bar */
  document.getElementById("dm-price").textContent = SX.money(v.price);
  document.getElementById("dm-mo").textContent = SX.estMoLabel(v.price);
  document.getElementById("dm-testdrive").href = "contact.html?interest=test-drive&vehicle=" + v.id;

  /* ---------- Calculator pre-filled with this vehicle ---------- */
  document.getElementById("v-calculator").appendChild(
    SXUI.paymentCalculator({ price: v.price, fixedPrice: true, onLight: true })
  );

  /* ---------- Similar vehicles: same body type, closest price ---------- */
  var similar = SX.vehicles
    .filter(function (o) { return o.id !== v.id && o.body === v.body; })
    .sort(function (a, b) { return Math.abs(a.price - v.price) - Math.abs(b.price - v.price); })
    .slice(0, 3);
  if (similar.length < 3) {
    SX.vehicles
      .filter(function (o) { return o.id !== v.id && similar.indexOf(o) === -1; })
      .sort(function (a, b) { return Math.abs(a.price - v.price) - Math.abs(b.price - v.price); })
      .slice(0, 3 - similar.length)
      .forEach(function (o) { similar.push(o); });
  }
  var sg = document.getElementById("similar-grid");
  similar.forEach(function (o) { sg.appendChild(SXUI.vehicleCard(o)); });
})();
