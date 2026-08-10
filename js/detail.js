/* Automobile SX — vehicle detail page */
SX.ready.then(function () {
  "use strict";

  document.body.classList.add("has-detail-bar");

  /* id comes from /vehicles/<id> (or ?id= as a fallback) */
  var parts = location.pathname.replace(/\/+$/, "").split("/");
  var id = decodeURIComponent(parts[parts.length - 1] || "");
  if (!id || id === "vehicles" || id === "vehicules") {
    id = new URLSearchParams(location.search).get("id") || "";
  }

  var v = SX.getVehicle(id);
  if (!v) { location.replace(SX.url("inventory")); return; }

  var title = SX.vehicleTitle(v);
  var fullName = title + (v.trim ? " " + v.trim : "");

  /* On a pre-rendered page the head is already correct; only fill it in
     when this template was served as a fallback. */
  if (!window.SX_PRERENDERED) {
    document.title = fullName + (SX.lang === "fr"
      ? " à vendre | Automobile SX Dorval"
      : " for sale | Automobile SX Dorval");

    var canon = document.createElement("link");
    canon.rel = "canonical";
    canon.href = "https://www.automobilesx.ca" + SX.vehicleUrl(v);
    document.head.appendChild(canon);

    var alt = document.createElement("link");
    alt.rel = "alternate";
    alt.hreflang = SX.lang === "en" ? "fr-CA" : "en-CA";
    alt.href = "https://www.automobilesx.ca" + SX.vehicleUrl(v, SX.lang === "en" ? "fr" : "en");
    document.head.appendChild(alt);
    window.SX_ALT = SX.vehicleUrl(v, SX.lang === "en" ? "fr" : "en");
  }

  /* Breadcrumb */
  document.getElementById("breadcrumb").innerHTML =
    '<li><a href="' + SX.url("inventory") + '">' + SX.t("bc.inventory") + "</a></li>" +
    '<li><a href="' + SX.url("inventory") + "?body=" + encodeURIComponent(v.body) + '">' + SX.bodyLabel(v.body) + "</a></li>" +
    '<li aria-current="page">' + fullName + "</li>";

  document.getElementById("v-title").textContent = fullName;
  if (v.status === "sold") {
    var soldTag = document.createElement("p");
    soldTag.innerHTML = '<span class="vc-tag" style="position:static;display:inline-block">' + SX.t("veh.sold") +
      '</span> <span style="color:var(--slate);font-size:14px">' + SX.t("veh.soldNote") + "</span>";
    document.getElementById("v-title").after(soldTag);
  }
  document.getElementById("v-subtitle").textContent =
    (v.extColor ? v.extColor + " · " : "") + SXUI.specLine(v) + (v.stock ? " · " + SX.t("veh.stock") + " " + v.stock : "");

  /* ---------- Gallery ---------- */
  var images = SXUI.vehicleImages(v);
  var idx = 0;
  var galImg = document.getElementById("gal-img");
  var counter = document.getElementById("gal-counter");
  var strip = document.getElementById("thumb-strip");
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");

  function altFor(i) { return fullName + " — " + (i + 1); }

  strip.innerHTML = images.map(function (src, i) {
    return '<button type="button" aria-label="' + (i + 1) + '"><img loading="lazy" src="' + src + '" alt="" width="512" height="288"></button>';
  }).join("");
  var thumbs = Array.prototype.slice.call(strip.children);

  function show(i) {
    idx = (i + images.length) % images.length;
    galImg.src = images[idx];
    galImg.alt = altFor(idx);
    counter.textContent = (idx + 1) + " / " + images.length;
    thumbs.forEach(function (t, j) { t.setAttribute("aria-current", String(j === idx)); });
    if (lightbox.classList.contains("open")) { lbImg.src = images[idx]; lbImg.alt = altFor(idx); }
  }
  thumbs.forEach(function (t, i) { t.addEventListener("click", function () { show(i); }); });
  document.getElementById("gal-prev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("gal-next").addEventListener("click", function () { show(idx + 1); });

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
    var open = lightbox.classList.contains("open");
    if (e.key === "Escape" && open) { closeLB(); return; }
    if (e.key === "ArrowLeft" && (open || document.activeElement.closest("#gallery-main, #thumb-strip"))) show(idx - 1);
    if (e.key === "ArrowRight" && (open || document.activeElement.closest("#gallery-main, #thumb-strip"))) show(idx + 1);
  });

  if (images.length < 2) {
    ["gal-prev", "gal-next", "lb-prev", "lb-next"].forEach(function (i) { document.getElementById(i).hidden = true; });
    counter.hidden = true;
    strip.hidden = true;
  }
  show(0);

  /* ---------- Overview ---------- */
  var descParas = Array.isArray(v.desc) ? v.desc : (v.desc ? String(v.desc).split(/\n\s*\n/) : []);
  document.getElementById("v-overview").innerHTML =
    descParas.filter(Boolean).map(function (p) { return "<p>" + p + "</p>"; }).join("") ||
    "<p>" + SX.t("veh.noDesc") + "</p>";

  /* ---------- Specifications ---------- */
  var L = SX.lang === "fr"
    ? { engine: "Moteur", trans: "Transmission", drive: "Rouage", fuel: "Carburant",
        city: "Consommation ville", hwy: "Consommation route", ext: "Couleur extérieure",
        intr: "Intérieur", doors: "Portes", seats: "Places", km: "Kilométrage", vin: "NIV" }
    : { engine: "Engine", trans: "Transmission", drive: "Drivetrain", fuel: "Fuel type",
        city: "Fuel economy (city)", hwy: "Fuel economy (highway)", ext: "Exterior colour",
        intr: "Interior", doors: "Doors", seats: "Seats", km: "Kilometres", vin: "VIN" };

  var locale = SX.lang === "fr" ? "fr-CA" : "en-CA";
  var specs = [
    [L.engine, v.engine],
    [L.trans, SX.specLabel("transmission", v.transmission)],
    [L.drive, SX.specLabel("drivetrain", v.drivetrain)],
    [L.fuel, SX.specLabel("fuel", v.fuel)],
    [L.city, v.econCity != null ? Number(v.econCity).toFixed(1) + " L/100 km" : null],
    [L.hwy, v.econHwy != null ? Number(v.econHwy).toFixed(1) + " L/100 km" : null],
    [L.ext, v.extColor],
    [L.intr, v.intColor],
    [L.doors, v.doors != null ? String(v.doors) : null],
    [L.seats, v.seats != null ? String(v.seats) : null],
    [L.km, Number(v.km || 0).toLocaleString(locale) + " km"],
    [L.vin, v.vin]
  ].filter(function (r) { return r[1]; });

  function specTable(rows) {
    return '<table class="spec-table"><tbody>' + rows.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>";
    }).join("") + "</tbody></table>";
  }
  var half = Math.ceil(specs.length / 2);
  document.getElementById("v-specs").innerHTML = specTable(specs.slice(0, half)) + specTable(specs.slice(half));

  /* ---------- Features ---------- */
  var groups;
  if (Array.isArray(v.features)) {
    groups = v.features.length ? [[SX.t("veh.features"), v.features]] : [];
  } else if (v.features) {
    groups = [["Safety", v.features.safety], ["Comfort", v.features.comfort],
      ["Technology", v.features.technology], ["Exterior", v.features.exterior]]
      .filter(function (g) { return g[1] && g[1].length; });
  } else { groups = []; }
  document.getElementById("v-features").innerHTML = groups.map(function (g) {
    return '<div class="feature-group"><ul class="feature-chips">' +
      g[1].map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul></div>";
  }).join("") || '<p style="color:var(--slate)">' + SX.t("veh.featuresSoon") + "</p>";

  /* ---------- Price rail (price is the dominant figure) ---------- */
  document.getElementById("r-price").textContent = SX.money(v.price);
  document.getElementById("r-mo").textContent = SX.t("veh.plusTaxes");
  document.getElementById("r-facts").innerHTML =
    "<li><span>" + SX.t("veh.kilometres") + "</span><span>" + Number(v.km || 0).toLocaleString(locale) + " km</span></li>" +
    (v.stock ? "<li><span>" + SX.t("veh.stock") + "</span><span>" + v.stock + "</span></li>" : "") +
    (v.vin ? "<li><span>" + SX.t("veh.vin") + "</span><span>" + v.vin + "</span></li>" : "");

  document.getElementById("r-testdrive").href = SX.url("contact") + "?interest=test-drive&vehicle=" + v.id;
  document.getElementById("r-availability").href = SX.url("contact") + "?interest=vehicle&vehicle=" + v.id;
  document.getElementById("r-preapproved").href = SX.url("financing");

  document.getElementById("dm-price").textContent = SX.money(v.price);
  document.getElementById("dm-testdrive").href = SX.url("contact") + "?interest=test-drive&vehicle=" + v.id;

  /* ---------- Estimator, pre-filled ---------- */
  document.getElementById("v-calculator").appendChild(
    SXUI.paymentCalculator({ price: v.price, fixedPrice: true, onLight: true })
  );

  /* ---------- Similar vehicles ---------- */
  var similar = SX.vehicles
    .filter(function (o) { return o.id !== v.id && o.body === v.body; })
    .sort(function (a, b) { return Math.abs(a.price - v.price) - Math.abs(b.price - v.price); })
    .slice(0, 3);
  if (similar.length < 3) {
    SX.vehicles.filter(function (o) { return o.id !== v.id && similar.indexOf(o) === -1; })
      .sort(function (a, b) { return Math.abs(a.price - v.price) - Math.abs(b.price - v.price); })
      .slice(0, 3 - similar.length)
      .forEach(function (o) { similar.push(o); });
  }
  var sg = document.getElementById("similar-grid");
  if (similar.length) similar.forEach(function (o) { sg.appendChild(SXUI.vehicleCard(o)); });
  else sg.closest("section").hidden = true;

  /* ---------- Structured data (skipped when already in the page) ---------- */
  try {
    if (window.SX_PRERENDERED) throw 0;
    var ld = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": fullName,
      "brand": { "@type": "Brand", "name": v.make },
      "model": v.model,
      "vehicleModelDate": String(v.year),
      "mileageFromOdometer": { "@type": "QuantitativeValue", "value": v.km, "unitCode": "KMT" },
      "bodyType": v.body,
      "vehicleTransmission": v.transmission,
      "fuelType": v.fuel,
      "driveWheelConfiguration": v.drivetrain,
      "color": v.extColor || undefined,
      "vehicleIdentificationNumber": v.vin || undefined,
      "image": (v.images && v.images.length)
        ? v.images.map(function (p) { return "https://www.automobilesx.ca/" + p.replace(/^\//, ""); })
        : undefined,
      "offers": {
        "@type": "Offer",
        "price": v.price,
        "priceCurrency": "CAD",
        "availability": v.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        "url": "https://www.automobilesx.ca" + SX.vehicleUrl(v),
        "seller": {
          "@type": "AutoDealer",
          "name": "Automobile SX",
          "telephone": "+1-514-824-9117",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "2044 Avenue Chartier",
            "addressLocality": "Dorval",
            "addressRegion": "QC",
            "addressCountry": "CA"
          }
        }
      }
    };
    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(ld);
    document.head.appendChild(tag);
  } catch (e) { /* non-critical */ }

  SXUI.initReveal();
});
