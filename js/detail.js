/* Automobile SX - vehicle detail page */
SX.ready.then(function () {
  "use strict";

  var FR = SX.lang === "fr";

  document.body.classList.add("has-detail-bar");

  /* id comes from /vehicles/<id> (or ?id= as a fallback) */
  var parts = location.pathname.replace(/\/+$/, "").split("/");
  var id = decodeURIComponent(parts[parts.length - 1] || "");
  /* "vehicle"/"vehicule" are the shell templates themselves: reaching one of
     those means the address carries no id, so fall back to the query string.
     Cleaned URLs rewrite /vehicle.html to /vehicle, which is how the shell ends
     up being asked for by name. */
  if (!id || id === "vehicles" || id === "vehicules" || id === "vehicle" || id === "vehicule") {
    id = new URLSearchParams(location.search).get("id") || "";
  }

  var v = SX.getVehicle(id);
  if (!v) { location.replace(SX.url("inventory")); return; }

  var title = SX.vehicleTitle(v);
  var publicTrim = SX.displayTrim(v);
  var fullName = title + (publicTrim ? " " + publicTrim : "");

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

  function altFor(i) { return fullName + " - " + (i + 1); }

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
  /* Composed from the vehicle's own fields by the shared template, exactly as
     the pre-rendered page did a moment ago, so hydrating cannot change a word
     of what the crawler already read. */
  var descParas = window.SX_DESCRIBE ? SX_DESCRIBE.paragraphs(v, SX.lang)
    : (v.desc ? String(v.desc).split(/\n\s*\n/) : []);
  document.getElementById("v-overview").innerHTML =
    descParas.filter(Boolean).map(function (p) { return "<p>" + p + "</p>"; }).join("") ||
    "<p>" + SX.t("veh.noDesc") + "</p>";

  /* ---------- History and buyer confidence ---------- */
  var buyerCopy = FR
    ? { title: "Historique et confiance de l'acheteur", inspection: "Inspection indépendante",
        welcome: "Bienvenue", warranty: "Étiquette de garantie du Québec", classLabel: "Classe",
        report: "Historique du véhicule", view: "Voir le rapport ↗", keys: "Clés incluses",
        tires: "Pneus d'hiver", included: "Inclus", notIncluded: "Non inclus",
        work: "Travaux récents ou note d'état", guide: "/fr/guides/acheter-une-voiture-usagee-au-quebec" }
    : { title: "History and buyer confidence", inspection: "Independent inspection",
        welcome: "Welcome", warranty: "Quebec warranty label", classLabel: "Class",
        report: "Vehicle history", view: "View report ↗", keys: "Keys included",
        tires: "Winter tires", included: "Included", notIncluded: "Not included",
        work: "Recent work or condition note", guide: "/guides/buying-a-used-car-in-quebec" };
  var buyerHeading = document.getElementById("h-buyer");
  var buyerTarget = document.getElementById("v-buyer");
  if (!buyerHeading || !buyerTarget) {
    var buyerSection = document.createElement("section");
    buyerSection.setAttribute("aria-labelledby", "h-buyer");
    buyerHeading = document.createElement("h2");
    buyerHeading.id = "h-buyer";
    buyerTarget = document.createElement("div");
    buyerTarget.id = "v-buyer";
    buyerSection.appendChild(buyerHeading);
    buyerSection.appendChild(buyerTarget);
    var specsHeading = document.getElementById("h-specs");
    var specsSection = specsHeading && specsHeading.closest("section");
    document.querySelector(".detail-sections").insertBefore(buyerSection, specsSection || null);
  }
  buyerHeading.textContent = buyerCopy.title;
  var buyerBox = document.createElement("div");
  buyerBox.className = "history-block";

  function buyerItem(label, value, href, trusted) {
    var item = document.createElement("div");
    item.className = "history-item";
    var labelEl = document.createElement("div");
    labelEl.className = "h-label";
    labelEl.textContent = label;
    var valueEl = document.createElement("div");
    valueEl.className = "h-value";
    if (trusted) {
      var dot = document.createElement("span");
      dot.className = "trust-dot";
      dot.setAttribute("aria-hidden", "true");
      valueEl.appendChild(dot);
    }
    if (href) {
      var link = document.createElement("a");
      link.href = href;
      link.textContent = value;
      if (/^https?:\/\//i.test(href)) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      valueEl.appendChild(link);
    } else {
      valueEl.appendChild(document.createTextNode(value));
    }
    item.appendChild(labelEl);
    item.appendChild(valueEl);
    buyerBox.appendChild(item);
  }

  buyerItem(buyerCopy.inspection, buyerCopy.welcome, "", true);
  var warrantyClass = (v.opc && v.opc.classOverride) ||
    (window.SX_OPC ? SX_OPC.classify(v.year, v.km) : "");
  if (warrantyClass) buyerItem(buyerCopy.warranty, buyerCopy.classLabel + " " + warrantyClass, buyerCopy.guide);

  var buyer = v.buyerInfo || {};
  var report = String(buyer.historyReport || "").trim();
  if (/^https?:\/\/[^\s]+$/i.test(report)) buyerItem(buyerCopy.report, buyerCopy.view, report);
  var keyCount = Number(buyer.keys);
  if (Number.isInteger(keyCount) && keyCount > 0 && keyCount < 10) buyerItem(buyerCopy.keys, String(keyCount));
  if (buyer.winterTires === "included" || buyer.winterTires === "not-included") {
    buyerItem(buyerCopy.tires, buyer.winterTires === "included" ? buyerCopy.included : buyerCopy.notIncluded);
  }
  var work = String(FR ? (buyer.workFr || "") : (buyer.work || "")).trim();
  if (work) {
    var noteEl = document.createElement("p");
    noteEl.className = "history-note";
    var noteLabel = document.createElement("strong");
    noteLabel.textContent = buyerCopy.work + ": ";
    noteEl.appendChild(noteLabel);
    noteEl.appendChild(document.createTextNode(work));
    buyerBox.appendChild(noteEl);
  }
  buyerTarget.innerHTML = "";
  buyerTarget.appendChild(buyerBox);

  /* ---------- Specifications ---------- */
  var L = SX.lang === "fr"
    ? { engine: "Moteur", trans: "Transmission", drive: "Rouage", fuel: "Carburant",
        city: "Consommation ville", hwy: "Consommation route", ext: "Couleur extérieure",
        intr: "Intérieur", doors: "Portes", seats: "Places", km: "Kilométrage", vin: "NIV" }
    : { engine: "Engine", trans: "Transmission", drive: "Drivetrain", fuel: "Fuel type",
        city: "Fuel economy (city)", hwy: "Fuel economy (highway)", ext: "Exterior colour",
        intr: "Interior", doors: "Doors", seats: "Seats", km: "Kilometres", vin: "VIN" };

  var locale = SX.lang === "fr" ? "fr-CA" : "en-CA";
  function economy(value) {
    var n = Number(value);
    return isFinite(n) && n > 0 ? n.toFixed(1) + " L/100 km" : null;
  }
  var specs = [
    [L.engine, v.engine],
    [L.trans, SX.specLabel("transmission", v.transmission)],
    [L.drive, SX.specLabel("drivetrain", v.drivetrain)],
    [L.fuel, SX.specLabel("fuel", v.fuel)],
    [L.city, economy(v.econCity)],
    [L.hwy, economy(v.econHwy)],
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
  var flatFeats = Array.isArray(v.features) ? v.features
    : v.features ? [].concat(v.features.safety || [], v.features.comfort || [],
        v.features.technology || [], v.features.exterior || [])
    : [];
  /* Grouped and translated by the shared catalogue, so a French visitor reads
     "Caméra de recul" even though the inventory stores "Backup Camera". */
  var groups = window.SX_FEATURES ? SX_FEATURES.grouped(flatFeats, SX.lang)
    : (flatFeats.length ? [{ title: SX.t("veh.features"), items: flatFeats }] : []);
  document.getElementById("v-features").innerHTML = groups.map(function (g) {
    return '<div class="feature-group"><h3 class="feature-group-title">' + g.title + "</h3>" +
      '<ul class="feature-chips">' +
      g.items.map(function (f) { return "<li>" + f + "</li>"; }).join("") + "</ul></div>";
  }).join("") || '<p style="color:var(--slate)">' + SX.t("veh.featuresSoon") + "</p>";

  /* ---------- Price rail (price is the dominant figure) ---------- */
  document.getElementById("r-price").textContent = SX.money(v.price);
  document.getElementById("r-mo").textContent = SX.t("veh.plusTaxes");
  document.getElementById("r-facts").innerHTML =
    "<li><span>" + SX.t("veh.kilometres") + "</span><span>" + Number(v.km || 0).toLocaleString(locale) + " km</span></li>" +
    (v.stock ? "<li><span>" + SX.t("veh.stock") + "</span><span>" + v.stock + "</span></li>" : "") +
    (v.vin ? "<li><span>" + SX.t("veh.vin") + "</span><span>" + v.vin + "</span></li>" : "");

  var soldPrimaryLabel = SX.lang === "fr" ? "Voir les véhicules disponibles" : "View available inventory";
  var soldSecondaryLabel = SX.lang === "fr" ? "Trouver un véhicule semblable" : "Find a similar vehicle";
  var railPrimary = document.getElementById("r-testdrive");
  var railSecondary = document.getElementById("r-availability");
  railPrimary.href = v.status === "sold"
    ? SX.url("inventory")
    : SX.url("contact") + "?interest=test-drive&vehicle=" + v.id;
  railPrimary.textContent = v.status === "sold" ? soldPrimaryLabel : SX.t("cta.bookTestDrive");
  railSecondary.href = SX.url("contact") + "?interest=vehicle&vehicle=" + v.id;
  railSecondary.textContent = v.status === "sold" ? soldSecondaryLabel : SX.t("cta.checkAvailability");
  document.getElementById("r-preapproved").href = SX.url("financing");

  document.getElementById("dm-price").textContent = v.status === "sold" ? SX.t("veh.sold") : SX.money(v.price);
  var mobilePrimary = document.getElementById("dm-testdrive");
  mobilePrimary.href = v.status === "sold"
    ? SX.url("inventory")
    : SX.url("contact") + "?interest=test-drive&vehicle=" + v.id;
  mobilePrimary.textContent = v.status === "sold" ? soldPrimaryLabel : SX.t("cta.bookTestDrive");

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
        "seller": { "@id": "https://www.automobilesx.ca/#dealer" }
      }
    };
    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(ld);
    document.head.appendChild(tag);
  } catch (e) { /* non-critical */ }

  SXUI.initReveal();
});
