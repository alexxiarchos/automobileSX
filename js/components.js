/* Automobile SX — shared UI: header, footer, vehicle card, payment estimator.
   No dependencies, no browser storage. All paths absolute so /fr/ pages work. */

window.SXUI = (function () {
  "use strict";

  SX.saved = new Set();               /* in-memory only, by design */

  /* ============ Imagery ============ */

  function svgURL(svg) { return "data:image/svg+xml," + encodeURIComponent(svg); }

  /* Branded tile used until a vehicle has real photos */
  function vehicleImage(v, i) {
    if (v.images && v.images.length) return "/" + v.images[Math.min(i, v.images.length - 1)].replace(/^\//, "");
    var label = SX.t("veh.photosSoon").toUpperCase();
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 288">' +
      '<rect width="512" height="288" fill="#141517"/>' +
      '<rect x="216" y="118" width="80" height="3" fill="#BA1D26"/>' +
      '<text x="256" y="152" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="700" letter-spacing="3" fill="#F2EFED">AUTOMOBILE SX</text>' +
      '<text x="256" y="176" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="12" letter-spacing="2" fill="#6B6F76">' + label + "</text>" +
      "</svg>";
    return svgURL(svg);
  }

  function vehicleImages(v) {
    if (v.images && v.images.length) {
      return v.images.map(function (p) { return "/" + p.replace(/^\//, ""); });
    }
    return [vehicleImage(v, 0)];
  }

  function photoCount(v) { return (v.images && v.images.length) || 1; }

  /* Drop a live Google map into a .map-canvas element.
     The canvas already contains a placeholder with the address and a link, so
     if the embed never arrives the visitor still gets something useful. The
     frame is only faded in once it loads, and is removed if it errors or has
     not loaded within eight seconds. */
  function mountMapFrame(canvas, addr, FR) {
    if (!canvas) return;
    var f = document.createElement("iframe");
    var settled = false;

    f.className = "map-frame";
    f.title = FR ? "Carte : " + addr : "Map: " + addr;
    f.loading = "lazy";
    f.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    f.setAttribute("allowfullscreen", "");
    /* The official place embed Google generates for this listing. The old
       "maps?q=...&output=embed" form is undocumented and is the one that was
       intermittently refusing to frame. */
    f.src = (SX.dealer.mapEmbed && SX.dealer.mapEmbed[SX.lang]) || SX.dealer.mapEmbed.en;

    function remove() { if (f.parentNode) f.parentNode.removeChild(f); }
    function drop() {
      if (settled) return;
      settled = true;
      remove();                                        /* leaves the placeholder */
    }
    var giveUp = setTimeout(drop, 8000);

    f.addEventListener("load", function () {
      if (settled) return;
      settled = true;
      clearTimeout(giveUp);
      f.classList.add("loaded");
    });
    f.addEventListener("error", function () { clearTimeout(giveUp); drop(); });

    canvas.appendChild(f);

    /* The frame is mounted straight away, so anyone who can see a map gets one.
       This probe only ever takes a map away: a browser error page inside a
       cross-origin iframe still fires "load", so a blocked or unreachable
       Google leaves a grey rectangle we cannot detect from the frame itself.
       If the probe fails we know the embed cannot have worked, and we fall back
       to the placeholder. If it succeeds, times out or never answers, the map
       is left exactly as it is. Failing this way round means a strict privacy
       setting can never hide a map that would otherwise have loaded. */
    var probe = new Image();
    probe.onerror = function () {
      clearTimeout(giveUp);
      settled = true;
      remove();
    };
    probe.referrerPolicy = "no-referrer";
    probe.src = "https://www.google.com/favicon.ico";
  }

  function mapPlaceholder(FR) {
    return '<div class="map-canvas"><p class="map-placeholder">' +
      (FR ? "Carte indisponible pour le moment." : "The map is unavailable right now.") +
      ' <a href="' + SX.dealer.mapsUrl + '" target="_blank" rel="noopener">' +
      (FR ? "Ouvrir dans Google Maps" : "Open in Google Maps") + "</a></p></div>";
  }

  /* Location block: a live map on top, the address underneath.
     The address panel is real markup that is always on screen, so the block
     is complete and useful whether or not the embed loads. */
  function mapBlock(el) {
    if (!el) return;
    var FR = SX.lang === "fr";
    var addr = SX.dealer.address1 + ", " + SX.dealer.address2;

    el.innerHTML =
      mapPlaceholder(FR) +
      '<div class="map-info">' +
        '<p class="map-fb-label">' + (FR ? "Nous trouver" : "Find us") + "</p>" +
        '<address class="map-fb-addr">' + SX.dealer.address1 + "<br>" + SX.dealer.address2 + "</address>" +
        '<p class="map-fb-meta">' + SX.dealer.apptNote[SX.lang] + "</p>" +
        '<div class="map-actions">' +
          '<a class="btn btn-red" href="' + SX.dealer.mapsUrl + '" target="_blank" rel="noopener">' +
            (FR ? "Itinéraire" : "Get directions") + "</a>" +
          '<a class="btn btn-outline-light" href="' + SX.dealer.phoneHref + '">' +
            (FR ? "Appeler le " : "Call ") + SX.dealer.phone + "</a>" +
        "</div>" +
      "</div>";

    mountMapFrame(el.querySelector(".map-canvas"), addr, FR);
  }

  /* ============ Header ============ */

  var NAV = [
    { key: "nav.inventory", route: "inventory" },
    { key: "nav.financing", route: "financing" },
    { key: "nav.sell", route: "sell" },
    { key: "nav.about", route: "about" },
    { key: "nav.contact", route: "contact" }
  ];

  function currentRoute() {
    return document.documentElement.getAttribute("data-route") || "";
  }

  function navLinks() {
    var cur = currentRoute();
    return NAV.map(function (n) {
      var isCur = n.route === cur ? ' aria-current="page"' : "";
      return '<a href="' + SX.url(n.route) + '"' + isCur + ">" + SX.t(n.key) + "</a>";
    }).join("");
  }

  /* The page tells us its counterpart in the other language (set in each page's head) */
  function altLangUrl() {
    if (window.SX_ALT) return window.SX_ALT;
    return SX.lang === "en" ? SX.routes.fr.home : SX.routes.en.home;
  }

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var other = SX.lang === "en" ? "FR" : "EN";

    el.innerHTML =
      '<a class="skip-link" href="#main">' + (SX.lang === "fr" ? "Aller au contenu principal" : "Skip to main content") + "</a>" +
      '<div class="container">' +
      '<a class="brand" href="' + SX.url("home") + '">' +
      '<img src="/assets/logo-mark.png" alt="Automobile SX" width="759" height="297">' +
      '<span class="brand-text"><span class="brand-name">AUTOMOBILE <span>SX</span></span><br>' +
      '<span class="brand-sub">Vente · Achat · Échange</span></span></a>' +
      '<nav class="main-nav" aria-label="' + (SX.lang === "fr" ? "Navigation principale" : "Main") + '">' + navLinks() + "</nav>" +
      '<div class="header-actions">' +
      '<a class="lang-toggle" href="' + altLangUrl() + '" hreflang="' + (SX.lang === "en" ? "fr" : "en") + '" lang="' + (SX.lang === "en" ? "fr" : "en") + '">' + other + "</a>" +
      '<a class="header-phone" href="' + SX.dealer.phoneHref + '">' + SX.dealer.phone + "</a>" +
      '<a class="btn btn-red" href="' + SX.url("contact") + '?interest=test-drive">' + SX.t("cta.bookTestDrive") + "</a>" +
      '<button class="nav-burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobile-menu">' +
      "<span></span><span></span><span></span></button>" +
      "</div></div>";

    var menu = document.createElement("nav");
    menu.className = "mobile-menu";
    menu.id = "mobile-menu";
    menu.innerHTML =
      navLinks() +
      '<a href="' + SX.url("guides") + '">' + SX.t("nav.guides") + "</a>" +
      '<a href="' + altLangUrl() + '">' + (SX.lang === "en" ? "Français" : "English") + "</a>" +
      '<a class="btn btn-red" href="' + SX.url("contact") + '?interest=test-drive">' + SX.t("cta.bookTestDrive") + "</a>" +
      '<a class="btn btn-outline-light" href="' + SX.dealer.phoneHref + '">' + SX.t("cta.call") + " " + SX.dealer.phone + "</a>";
    el.after(menu);

    var burger = el.querySelector(".nav-burger");
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { menu.classList.remove("open"); document.body.style.overflow = ""; }
    });
  }

  /* ============ Footer ============ */

  function hoursRows() {
    return SX.dealer.hours.map(function (h) {
      var name = SX.lang === "fr" ? h.fr : h.day;
      return "<tr><td>" + name + "</td><td>" + h.open + " – " + h.close + "</td></tr>";
    }).join("");
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var links = [
      ["inventory", "nav.inventory"], ["financing", "nav.financing"], ["sell", "nav.sell"],
      ["guides", "nav.guides"], ["faq", "nav.faq"], ["local", "nav.local"],
      ["about", "nav.about"], ["contact", "nav.contact"], ["privacy", "nav.privacy"]
    ].map(function (l) {
      return '<li><a href="' + SX.url(l[0]) + '">' + SX.t(l[1]) + "</a></li>";
    }).join("");

    el.innerHTML =
      '<div class="container">' +
      '<div class="footer-main">' +
      "<div>" +
      "<h3>" + SX.dealer.name + "</h3>" +
      '<address style="font-style:normal">' + SX.dealer.address1 + "<br>" + SX.dealer.address2 + "<br>" +
      '<a href="' + SX.dealer.phoneHref + '">' + SX.dealer.phone + "</a><br>" +
      '<a href="mailto:' + SX.dealer.email + '">' + SX.dealer.email + "</a></address>" +
      '<div class="footer-map">' + mapPlaceholder(SX.lang === "fr") +
      '<a class="footer-map-cta" href="' + SX.dealer.mapsUrl + '" target="_blank" rel="noopener">' +
      (SX.lang === "fr" ? "Itinéraire ↗" : "Get directions ↗") + "</a></div>" +
      "</div>" +
      "<div><h3>" + SX.t("footer.hours") + '</h3><table class="footer-hours"><tbody>' + hoursRows() + "</tbody></table>" +
      '<p style="font-size:13px;color:var(--slate);margin:10px 0 0">' + SX.dealer.apptNote[SX.lang] + "</p></div>" +
      "<div><h3>" + SX.t("footer.quickLinks") + '</h3><ul class="footer-links">' + links + "</ul></div>" +
      "<div><h3>" + SX.t("footer.newArrivals") + '</h3><p style="font-size:14px;color:var(--slate)">' + SX.t("footer.newArrivalsSub") + "</p>" +
      '<a class="btn btn-red" href="mailto:' + SX.dealer.email + '?subject=' + encodeURIComponent(SX.lang === "fr" ? "Nouveaux arrivages" : "New arrivals") + '">' + SX.t("footer.newArrivalsCta") + "</a>" +
      '<p style="font-size:13px;color:var(--slate);margin-top:10px">' + SX.t("footer.orCall") + ' <a href="' + SX.dealer.phoneHref + '">' + SX.dealer.phone + "</a></p>" +
      '<p style="font-size:13px;margin-top:14px">' +
      '<a href="' + altLangUrl() + '" hreflang="' + (SX.lang === "en" ? "fr" : "en") + '" lang="' +
      (SX.lang === "en" ? "fr" : "en") + '">' + SX.t("footer.langLink") + "</a></p></div>" +
      "</div>" +
      '<div class="footer-bottom">' +
      "<span>© " + new Date().getFullYear() + " " + SX.dealer.name + ".</span>" +
      "<span>" + SX.t("footer.taxNote") + "</span>" +
      "</div></div>";

    mountMapFrame(el.querySelector(".footer-map .map-canvas"),
      SX.dealer.address1 + ", " + SX.dealer.address2, SX.lang === "fr");
  }

  function renderMobileBar() {
    var el = document.getElementById("mobile-cta-bar");
    if (!el) return;
    document.body.classList.add("has-cta-bar");
    el.innerHTML =
      '<a class="btn btn-outline-light" href="' + SX.dealer.phoneHref + '">' + SX.t("cta.call") + "</a>" +
      '<a class="btn btn-red" href="' + SX.url("inventory") + '">' + SX.t("cta.browse") + "</a>";
  }

  /* ============ Vehicle card ============ */

  function specLine(v) {
    var km = Number(v.km || 0).toLocaleString(SX.lang === "fr" ? "fr-CA" : "en-CA");
    return [km + " km",
      SX.specLabel("transmission", v.transmission),
      SX.specLabel("fuel", v.fuel),
      SX.specLabel("drivetrain", v.drivetrain)].filter(Boolean).join(" · ");
  }

  function heartSVG(filled) {
    return '<svg viewBox="0 0 24 24" fill="' + (filled ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21c-4.8-3.6-8.4-6.8-9.6-9.9C1.2 8 2.6 4.6 6 4.1c1.9-.3 3.8.6 6 2.9 2.2-2.3 4.1-3.2 6-2.9 3.4.5 4.8 3.9 3.6 7-1.2 3.1-4.8 6.3-9.6 9.9z"/></svg>';
  }

  function vehicleCard(v) {
    var card = document.createElement("article");
    card.className = "vehicle-card";
    var alt = SX.vehicleTitle(v) + " " + (v.trim || "") + (v.extColor ? ", " + v.extColor : "");
    var tag = v.status === "sold" ? SX.t("veh.sold") : v.tag;

    card.innerHTML =
      '<div class="vc-media">' +
      '<img loading="lazy" src="' + vehicleImage(v, 0) + '" alt="' + alt + '" width="512" height="288">' +
      (tag ? '<span class="vc-tag">' + tag + "</span>" : "") +
      '<span class="vc-photo-count">▣ ' + photoCount(v) + "</span>" +
      "</div>" +
      '<div class="vc-body">' +
      '<div class="vc-head">' +
      "<div>" +
      '<h3 class="vc-title"><a href="' + SX.vehicleUrl(v) + '">' + SX.vehicleTitle(v) + "</a></h3>" +
      '<p class="vc-trim">' + (v.trim || "") + "</p>" +
      "</div>" +
      '<button class="vc-save" type="button" aria-pressed="false" aria-label="' + SX.t("veh.savedLabel") + '">' + heartSVG(false) + "</button>" +
      "</div>" +
      '<p class="vc-specs">' + specLine(v) + "</p>" +
      '<div class="vc-price">' + SX.money(v.price) + "</div>" +
      "</div>";

    card.querySelector(".vc-save").addEventListener("click", function () {
      var on = !SX.saved.has(v.id);
      if (on) SX.saved.add(v.id); else SX.saved.delete(v.id);
      this.setAttribute("aria-pressed", String(on));
      this.innerHTML = heartSVG(on);
    });
    return card;
  }

  /* ============ Payment estimator ============
     Quebec's Consumer Protection Act requires that when a periodic payment is
     shown, the total price appears MORE prominently, and that the down payment,
     credit rate, number of payments, credit charges and total obligation are all
     disclosed together. This component is built to that shape. */

  function paymentCalculator(opts) {
    opts = opts || {};
    var price = opts.price || 20000;
    var minPrice = opts.minPrice || 5000;
    var maxPrice = opts.maxPrice || 60000;
    var down = opts.down != null ? opts.down : Math.round(price * SX.finance.defaultDownPct / 500) * 500;
    var term = opts.term || SX.finance.defaultTermMonths;
    var fixedPrice = !!opts.fixedPrice;
    var rate = SX.finance.rate;

    var wrap = document.createElement("div");
    wrap.className = "calculator" + (opts.onLight ? " on-light" : "");
    wrap.innerHTML =
      (fixedPrice ? "" :
        '<div class="calc-row"><label for="calc-price">' + SX.t("calc.vehiclePrice") + ' <output name="price-out"></output></label>' +
        '<input type="range" id="calc-price" name="price" min="' + minPrice + '" max="' + maxPrice + '" step="500" value="' + price + '"></div>') +
      '<div class="calc-row"><label for="calc-down">' + SX.t("calc.downPayment") + ' <output name="down-out"></output></label>' +
      '<input type="range" id="calc-down" name="down" min="0" max="' + Math.min(20000, price) + '" step="500" value="' + down + '"></div>' +
      '<div class="calc-row"><label for="calc-term">' + SX.t("calc.term") + ' <output name="term-out"></output></label>' +
      '<input type="range" id="calc-term" name="term" min="24" max="84" step="12" value="' + term + '"></div>' +

      /* Total price is the dominant figure, as required */
      '<div class="calc-headline">' +
      '<span class="calc-headline-label">' + SX.t("calc.priceLabel") + "</span>" +
      '<span class="calc-price-big" name="total-price" aria-live="polite"></span>' +
      "</div>" +

      '<dl class="calc-disclosure">' +
      "<div><dt>" + SX.t("calc.paymentAmount") + '</dt><dd name="pay-out"></dd></div>' +
      "<div><dt>" + SX.t("calc.downPayment") + '</dt><dd name="down2-out"></dd></div>' +
      "<div><dt>" + SX.t("calc.creditRate") + '</dt><dd name="rate-out"></dd></div>' +
      "<div><dt>" + SX.t("calc.numPayments") + '</dt><dd name="n-out"></dd></div>' +
      "<div><dt>" + SX.t("calc.creditCharges") + '</dt><dd name="charges-out"></dd></div>' +
      "<div><dt>" + SX.t("calc.totalObligation") + '</dt><dd name="oblig-out"></dd></div>' +
      "</dl>" +
      '<p class="calc-disclaimer">' + SX.t("calc.disclaimer", SX.num(rate)) + "</p>";

    function q(n) { return wrap.querySelector('[name="' + n + '"]'); }

    function update() {
      var p = fixedPrice ? price : Number(q("price").value);
      var d = Math.min(Number(q("down").value), p);
      var t = Number(q("term").value);
      var m = SX.monthly(p, d, t, rate);
      var totalPaid = m * t + d;
      var charges = Math.max(totalPaid - p, 0);

      if (!fixedPrice) q("price-out").textContent = SX.money(p);
      q("down-out").textContent = SX.money(d);
      q("term-out").textContent = SX.t("calc.months", t);

      q("total-price").textContent = SX.money(p);
      q("pay-out").textContent = SX.money(m) + " / " + SX.t("calc.monthly");
      q("down2-out").textContent = SX.money(d);
      q("rate-out").textContent = SX.num(rate) + " %";
      q("n-out").textContent = String(t);
      q("charges-out").textContent = SX.money(charges);
      q("oblig-out").textContent = SX.money(totalPaid);
    }

    wrap.querySelectorAll("input").forEach(function (r) { r.addEventListener("input", update); });
    update();
    return wrap;
  }

  /* ============ Scroll reveal ============ */

  function initReveal() {
    var els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function init() {
    renderHeader();
    renderFooter();
    renderMobileBar();
    initReveal();
  }

  return {
    init: init,
    mapBlock: mapBlock,
    vehicleCard: vehicleCard,
    vehicleImage: vehicleImage,
    vehicleImages: vehicleImages,
    paymentCalculator: paymentCalculator,
    specLine: specLine,
    initReveal: initReveal
  };
})();

/* Every page boots the same way */
(function () {
  function boot() { SXUI.init(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
