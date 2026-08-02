/* Automobile SX — shared UI components (no dependencies, no browser storage) */

window.SXUI = (function () {
  "use strict";

  /* In-memory saved-vehicle state (deliberately not persisted) */
  SX.saved = new Set();

  /* ============ Placeholder imagery (generated SVG, data URLs) ============ */

  var BODY_PATHS = {
    /* All drawn in a 400x150 box, ground at y=132 */
    Sedan:
      "M28,118 C24,118 22,112 24,106 L34,98 C60,92 78,88 108,84 C136,62 168,52 210,52 C252,52 282,64 302,84 C330,88 352,94 366,100 C376,104 380,110 378,116 L372,120 L28,118 Z",
    SUV:
      "M26,118 C22,118 20,110 23,102 L30,88 C36,66 60,50 100,46 L250,44 C296,44 330,58 348,84 C364,90 374,98 376,108 C377,114 374,119 368,120 L26,118 Z",
    Truck:
      "M22,118 C18,118 17,110 20,104 L26,92 L28,64 L36,60 L150,60 L162,44 C168,38 176,36 190,36 L246,36 C258,36 264,42 268,50 L280,66 L368,70 C376,72 380,80 380,92 L378,112 C378,116 374,119 370,120 L22,118 Z",
    Coupe:
      "M30,116 C24,116 22,110 25,104 L40,96 C70,88 96,84 128,80 C154,58 190,48 226,50 C266,52 296,66 314,84 C338,90 356,96 366,102 C374,106 377,112 374,116 L30,116 Z",
    Hatchback:
      "M30,118 C24,118 22,110 25,104 L36,94 C60,88 82,84 110,80 C134,58 164,48 204,48 C240,48 268,58 288,76 C310,60 322,58 330,64 L340,86 C352,92 362,98 366,104 C372,110 370,116 364,118 L30,118 Z"
  };
  /* hatch: simpler custom shape below overrides */
  BODY_PATHS.Hatchback =
    "M30,118 C24,118 22,110 25,104 L36,94 C62,88 84,84 112,80 C136,58 168,48 208,48 C246,48 290,54 316,74 L330,86 C348,92 360,98 365,104 C371,110 368,116 362,118 L30,118 Z";

  function wheelPair(front, rear) {
    return (
      '<circle cx="' + front + '" cy="118" r="22" fill="#101113"/>' +
      '<circle cx="' + front + '" cy="118" r="12" fill="#3a3d42"/>' +
      '<circle cx="' + front + '" cy="118" r="5" fill="#191a1c"/>' +
      '<circle cx="' + rear + '" cy="118" r="22" fill="#101113"/>' +
      '<circle cx="' + rear + '" cy="118" r="12" fill="#3a3d42"/>' +
      '<circle cx="' + rear + '" cy="118" r="5" fill="#191a1c"/>'
    );
  }

  function exteriorScene(v, flip) {
    var wheels = { Sedan: [108, 306], SUV: [104, 302], Truck: [92, 316], Coupe: [116, 300], Hatchback: [108, 300] }[v.body] || [108, 306];
    var g =
      '<g transform="translate(56,60)' + (flip ? ' translate(400,0) scale(-1,1)' : "") + '">' +
      '<path d="' + (BODY_PATHS[v.body] || BODY_PATHS.Sedan) + '" fill="' + v.extHex + '" stroke="rgba(255,255,255,0.28)" stroke-width="2"/>' +
      '<ellipse cx="205" cy="140" rx="180" ry="9" fill="rgba(0,0,0,0.45)"/>' +
      wheelPair(wheels[0], wheels[1]) +
      "</g>";
    return g;
  }

  function interiorScene(kind) {
    if (kind === "dash") {
      return (
        '<g transform="translate(60,80)">' +
        '<rect x="0" y="60" width="392" height="70" rx="14" fill="#26282c"/>' +
        '<rect x="18" y="24" width="150" height="44" rx="8" fill="#1b1d20"/>' +
        '<rect x="196" y="16" width="120" height="52" rx="8" fill="#101113"/>' +
        '<rect x="206" y="24" width="100" height="36" rx="4" fill="#2c3038"/>' +
        '<circle cx="86" cy="112" r="34" fill="#101113"/><circle cx="86" cy="112" r="26" fill="#1f2124"/>' +
        "</g>"
      );
    }
    if (kind === "wheels") {
      return (
        '<g transform="translate(200,150)">' +
        '<circle r="78" fill="#101113"/><circle r="60" fill="#2e3136"/>' +
        '<circle r="16" fill="#101113"/>' +
        '<g fill="#101113"><rect x="-7" y="-58" width="14" height="44" rx="6"/><rect x="-7" y="14" width="14" height="44" rx="6"/>' +
        '<rect x="-58" y="-7" width="44" height="14" rx="6"/><rect x="14" y="-7" width="44" height="14" rx="6"/></g>' +
        "</g>"
      );
    }
    if (kind === "cargo") {
      return (
        '<g transform="translate(90,84)">' +
        '<path d="M0,120 L40,20 L280,20 L320,120 Z" fill="#232528"/>' +
        '<path d="M40,20 L280,20 L268,64 L52,64 Z" fill="#17181a"/>' +
        '<rect x="52" y="70" width="216" height="44" rx="6" fill="#2b2d31"/>' +
        "</g>"
      );
    }
    /* seats */
    return (
      '<g transform="translate(96,60)">' +
      '<rect x="0" y="30" width="88" height="130" rx="20" fill="#232528"/>' +
      '<rect x="10" y="8" width="68" height="44" rx="14" fill="#2b2d31"/>' +
      '<rect x="120" y="30" width="88" height="130" rx="20" fill="#232528"/>' +
      '<rect x="130" y="8" width="68" height="44" rx="14" fill="#2b2d31"/>' +
      "</g>"
    );
  }

  function svgURL(svg) {
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  /* Build one placeholder photo for a vehicle + view index */
  function vehicleImage(v, i) {
    var view = SX.photoViews[i % SX.photoViews.length];
    var inner;
    if (view === "Interior") inner = interiorScene("seats");
    else if (view === "Dashboard") inner = interiorScene("dash");
    else if (view === "Wheels") inner = interiorScene("wheels");
    else if (view === "Cargo / Trunk") inner = interiorScene("cargo");
    else inner = exteriorScene(v, view === "Rear 3/4");

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 288">' +
      '<rect width="512" height="288" fill="#1d1f22"/>' +
      '<rect y="212" width="512" height="76" fill="#17181a"/>' +
      inner +
      '<text x="20" y="266" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="600" fill="#8b8f96">' +
      v.year + " " + v.make + " " + v.model + " — " + view + "</text>" +
      '<text x="492" y="266" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#5a5e65">Photo placeholder</text>' +
      "</svg>";
    return svgURL(svg);
  }

  function vehicleImages(v) {
    var n = SX.photoViews.length;
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(vehicleImage(v, i));
    return arr;
  }

  function heroImage() {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#1a1c22"/><stop offset="0.65" stop-color="#3a2f33"/><stop offset="1" stop-color="#57404a"/></linearGradient></defs>' +
      '<rect width="1440" height="700" fill="url(#sky)"/>' +
      '<rect y="520" width="1440" height="180" fill="#141517"/>' +
      '<circle cx="1120" cy="470" r="150" fill="#c9a67a" opacity="0.18"/>' +
      '<g transform="translate(760,330) scale(1.5)">' +
      '<path d="' + BODY_PATHS.Coupe + '" fill="#0e0f11"/>' +
      wheelPair(116, 300) +
      '<path d="M128,80 C154,58 190,48 226,50 C260,52 286,62 304,78 L296,82 C276,68 252,58 226,56 C194,54 162,62 140,80 Z" fill="#2a2d33" opacity="0.9"/>' +
      "</g>" +
      '<g transform="translate(120,560)"><rect width="1200" height="3" fill="#26282c"/></g>' +
      "</svg>";
    return svgURL(svg);
  }

  function mapSVG(w, h) {
    w = w || 640; h = h || 360;
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Static map showing the dealership location at 2044 Avenue Chartier, Dorval">' +
      '<rect width="640" height="360" fill="#e9e6e1"/>' +
      '<g stroke="#d6d2cc" stroke-width="10" fill="none">' +
      '<path d="M-20,90 L660,60"/><path d="M-20,210 L660,190"/><path d="M-20,320 L660,330"/>' +
      '<path d="M120,-20 L150,380"/><path d="M330,-20 L320,380"/><path d="M520,-20 L560,380"/></g>' +
      '<g stroke="#ffffff" stroke-width="16" fill="none"><path d="M-20,150 C200,140 420,170 660,130"/></g>' +
      '<path d="M-20,150 C200,140 420,170 660,130" stroke="#cfccc6" stroke-width="2" fill="none" stroke-dasharray="14 10"/>' +
      '<rect x="20" y="230" width="130" height="70" rx="4" fill="#dcd8d2"/>' +
      '<rect x="420" y="40" width="150" height="90" rx="4" fill="#dcd8d2"/>' +
      '<path d="M-20,352 L660,344 L660,360 L-20,360 Z" fill="#bcd3de"/>' +
      '<g transform="translate(320,148)">' +
      '<path d="M0,-34 C-15,-34 -24,-23 -24,-11 C-24,4 0,26 0,26 C0,26 24,4 24,-11 C24,-23 15,-34 0,-34 Z" fill="#BA1D26"/>' +
      '<circle cy="-12" r="8" fill="#fff"/></g>' +
      '<text x="320" y="204" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="700" fill="#3c3f44">Automobile SX</text>' +
      '<text x="320" y="222" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#6B6F76">2044 Avenue Chartier, Dorval</text>' +
      "</svg>";
    return svg;
  }

  function lotPhotoSVG() {
    /* used for the trade-in split section */
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="Placeholder photo of two cars parked on the dealership lot">' +
      '<rect width="640" height="420" fill="#26282d"/>' +
      '<rect y="300" width="640" height="120" fill="#1b1d20"/>' +
      '<g transform="translate(30,160) scale(0.72)"><path d="' + BODY_PATHS.SUV + '" fill="#5c6066"/>' + wheelPair(104, 302) + "</g>" +
      '<g transform="translate(330,180) scale(0.72)"><path d="' + BODY_PATHS.Sedan + '" fill="#8f1a24"/>' + wheelPair(108, 306) + "</g>" +
      '<text x="24" y="396" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="600" fill="#8b8f96">Your trade, our lot — photo placeholder</text>' +
      "</svg>"
    );
  }

  function bodyTypeIcon(body) {
    return (
      '<svg viewBox="0 0 512 200" aria-hidden="true"><g transform="translate(56,20)">' +
      '<path d="' + (BODY_PATHS[body] || BODY_PATHS.Sedan) + '" fill="#3c3f44"/>' +
      wheelPair.apply(null, { Sedan: [108, 306], SUV: [104, 302], Truck: [92, 316], Coupe: [116, 300], Hatchback: [108, 300] }[body] || [108, 306]) +
      "</g></svg>"
    );
  }

  /* ============ Header / footer / chrome ============ */

  var NAV = [
    { key: "nav.home", href: "index.html", page: "home" },
    { key: "nav.inventory", href: "inventory.html", page: "inventory" },
    { key: "nav.financing", href: "index.html#financing", page: "financing" },
    { key: "nav.about", href: "contact.html#about", page: "about" },
    { key: "nav.contact", href: "contact.html", page: "contact" }
  ];

  function navLinks(current, cls) {
    return NAV.map(function (n) {
      var cur = n.page === current ? ' aria-current="page"' : "";
      return '<a href="' + n.href + '"' + cur + ">" + SX.t(n.key) + "</a>";
    }).join("");
  }

  function renderHeader(current) {
    var el = document.getElementById("site-header");
    if (!el) return;
    el.innerHTML =
      '<a class="skip-link" href="#main">Skip to main content</a>' +
      '<div class="container">' +
      '<a class="brand" href="index.html" aria-label="Automobile SX — home">' +
      '<img src="assets/logo.png" alt="" width="44" height="44">' +
      '<span class="brand-text"><span class="brand-name">AUTOMOBILE <span>SX</span></span><br>' +
      '<span class="brand-sub">Used Car Sales · Vente d’autos usagées</span></span></a>' +
      '<nav class="main-nav" aria-label="Main">' + navLinks(current) + "</nav>" +
      '<div class="header-actions">' +
      '<button class="lang-toggle" type="button" aria-label="Switch language">' + (SX.lang === "en" ? "FR" : "EN") + "</button>" +
      '<a class="header-phone" href="' + SX.dealer.phoneHref + '">' + SX.dealer.phone + "</a>" +
      '<a class="btn btn-red" href="contact.html?interest=test-drive">' + SX.t("cta.bookTestDrive") + "</a>" +
      '<button class="nav-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">' +
      "<span></span><span></span><span></span></button>" +
      "</div></div>";

    var menu = document.createElement("nav");
    menu.className = "mobile-menu";
    menu.id = "mobile-menu";
    menu.setAttribute("aria-label", "Mobile");
    menu.innerHTML = navLinks(current) +
      '<a class="btn btn-red" href="contact.html?interest=test-drive">' + SX.t("cta.bookTestDrive") + "</a>" +
      '<a class="btn btn-outline-light" href="' + SX.dealer.phoneHref + '">' + SX.t("cta.call") + " " + SX.dealer.phone + "</a>";
    el.after(menu);

    var burger = el.querySelector(".nav-burger");
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        document.body.style.overflow = "";
      }
    });

    el.querySelector(".lang-toggle").addEventListener("click", function () {
      SX.lang = SX.lang === "en" ? "fr" : "en";
      document.documentElement.lang = SX.lang;
      /* Re-render chrome; page scripts re-render their own translated bits via event */
      renderHeader(current);
      renderFooter();
      renderMobileBar();
      document.dispatchEvent(new CustomEvent("sx:lang"));
    });
  }

  function hoursRows(cls) {
    return SX.dealer.hours.map(function (h) {
      var name = SX.lang === "fr" ? h.fr : h.day;
      var val = h.open ? h.open + " – " + h.close : SX.t("closed");
      return "<tr" + (h.open ? "" : ' class="closed"') + "><td>" + name + "</td><td>" + val + "</td></tr>";
    }).join("");
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML =
      '<div class="container">' +
      '<div class="footer-main">' +
      "<div>" +
      '<h3>' + SX.dealer.name + "</h3>" +
      '<address style="font-style:normal">' + SX.dealer.address1 + "<br>" + SX.dealer.address2 + "<br>" +
      '<a href="' + SX.dealer.phoneHref + '">' + SX.dealer.phone + "</a><br>" +
      '<a href="mailto:' + SX.dealer.email + '">' + SX.dealer.email + "</a></address>" +
      '<div class="footer-map" aria-hidden="true">' + mapSVG() + "</div>" +
      "</div>" +
      "<div><h3>" + SX.t("footer.hours") + '</h3><table class="footer-hours"><tbody>' + hoursRows() + "</tbody></table>" +
      '<p style="font-size:13px;color:var(--slate);margin:10px 0 0">' + SX.dealer.apptNote[SX.lang] + "</p></div>" +
      "<div><h3>" + SX.t("footer.quickLinks") + '</h3><ul class="footer-links">' +
      '<li><a href="inventory.html">' + SX.t("nav.inventory") + "</a></li>" +
      '<li><a href="index.html#financing">' + SX.t("nav.financing") + "</a></li>" +
      '<li><a href="index.html#trade">Sell or Trade</a></li>' +
      '<li><a href="contact.html">' + SX.t("nav.contact") + "</a></li>" +
      '<li><a href="contact.html#faq">FAQ</a></li></ul></div>' +
      "<div><h3>" + SX.t("footer.newArrivals") + "</h3><p style=\"font-size:14px;color:var(--slate)\">" + SX.t("footer.newArrivalsSub") + "</p>" +
      '<form class="newsletter" novalidate><label class="visually-hidden" for="nl-email">Email address</label>' +
      '<input id="nl-email" type="email" placeholder="you@email.com" autocomplete="email">' +
      '<button class="btn btn-red" type="submit">Sign up</button></form>' +
      '<p class="msg" role="status"></p></div>' +
      "</div>" +
      '<div class="footer-bottom">' +
      "<span>© " + new Date().getFullYear() + " " + SX.dealer.name + ". Demo site — sample inventory.</span>" +
      '<span><a href="#">Privacy</a> · <a href="#">Terms</a></span>' +
      "<span>" + SX.t("footer.taxNote") + "</span>" +
      "</div></div>";

    var form = el.querySelector(".newsletter");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      var msg = el.querySelector(".msg");
      if (!input.value || input.value.indexOf("@") < 1) {
        msg.style.color = "var(--red)";
        msg.textContent = "Please enter a valid email address.";
        return;
      }
      msg.style.color = "var(--trust)";
      msg.textContent = "Thanks — you’re on the list. (Demo only; nothing was sent.)";
      input.value = "";
    });
  }

  function renderMobileBar() {
    var el = document.getElementById("mobile-cta-bar");
    if (!el) return;
    document.body.classList.add("has-cta-bar");
    el.innerHTML =
      '<a class="btn btn-outline-light" href="' + SX.dealer.phoneHref + '">' + SX.t("cta.call") + "</a>" +
      '<a class="btn btn-red" href="inventory.html">' + SX.t("cta.browse") + "</a>";
  }

  /* ============ Vehicle card ============ */

  function specLine(v) {
    return v.km.toLocaleString("en-CA") + " km · " + v.transmission + " · " + v.fuel + " · " + v.drivetrain;
  }

  function heartSVG(filled) {
    return '<svg viewBox="0 0 24 24" fill="' + (filled ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21c-4.8-3.6-8.4-6.8-9.6-9.9C1.2 8 2.6 4.6 6 4.1c1.9-.3 3.8.6 6 2.9 2.2-2.3 4.1-3.2 6-2.9 3.4.5 4.8 3.9 3.6 7-1.2 3.1-4.8 6.3-9.6 9.9z"/></svg>';
  }

  function vehicleCard(v) {
    var card = document.createElement("article");
    card.className = "vehicle-card";
    var img = vehicleImage(v, 0);
    card.innerHTML =
      '<div class="vc-media">' +
      '<img loading="lazy" src="' + img + '" alt="' + SX.vehicleTitle(v) + " " + v.trim + " in " + v.extColor + ', front three-quarter placeholder photo" width="512" height="288">' +
      (v.tag ? '<span class="vc-tag">' + v.tag + "</span>" : "") +
      '<span class="vc-photo-count" aria-label="' + SX.photoViews.length + ' photos">▣ ' + SX.photoViews.length + "</span>" +
      "</div>" +
      '<div class="vc-body">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
      "<div>" +
      '<h3 class="vc-title"><a href="vehicle.html?id=' + v.id + '">' + SX.vehicleTitle(v) + "</a></h3>" +
      '<p class="vc-trim">' + v.trim + "</p>" +
      "</div>" +
      '<button class="vc-save" type="button" aria-pressed="' + SX.saved.has(v.id) + '" aria-label="Save this vehicle">' + heartSVG(SX.saved.has(v.id)) + "</button>" +
      "</div>" +
      '<p class="vc-specs">' + specLine(v) + "</p>" +
      '<div class="vc-price-row"><div>' +
      '<div class="vc-price">' + SX.money(v.price) + "</div>" +
      '<div class="vc-mo">' + SX.estMoLabel(v.price) + "</div>" +
      "</div></div></div>";

    card.querySelector(".vc-save").addEventListener("click", function () {
      var on = !SX.saved.has(v.id);
      if (on) SX.saved.add(v.id); else SX.saved.delete(v.id);
      this.setAttribute("aria-pressed", String(on));
      this.innerHTML = heartSVG(on);
    });
    return card;
  }

  /* ============ Payment calculator ============ */

  function paymentCalculator(opts) {
    opts = opts || {};
    var price = opts.price || 30000;
    var minPrice = opts.minPrice || 10000;
    var maxPrice = opts.maxPrice || 50000;
    var down = opts.down != null ? opts.down : Math.round(price * 0.1 / 500) * 500;
    var term = opts.term || 72;
    var fixedPrice = !!opts.fixedPrice;

    var wrap = document.createElement("div");
    wrap.className = "calculator" + (opts.onLight ? " on-light" : "");
    wrap.innerHTML =
      (fixedPrice ? "" :
        '<div class="calc-row"><label>Vehicle price <output name="price-out"></output></label>' +
        '<input type="range" name="price" min="' + minPrice + '" max="' + maxPrice + '" step="500" value="' + price + '" aria-label="Vehicle price"></div>') +
      '<div class="calc-row"><label>Down payment <output name="down-out"></output></label>' +
      '<input type="range" name="down" min="0" max="' + Math.min(20000, price) + '" step="500" value="' + down + '" aria-label="Down payment"></div>' +
      '<div class="calc-row"><label>Term <output name="term-out"></output></label>' +
      '<input type="range" name="term" min="24" max="96" step="12" value="' + term + '" aria-label="Term in months"></div>' +
      '<div class="calc-result"><span class="calc-monthly" aria-live="polite"></span><span class="calc-per">/mo est. @ ' + SX.finance.apr.toFixed(2) + "% APR</span></div>" +
      '<p class="calc-disclaimer">Estimate only. Taxes, licensing and fees extra. Rate and approval subject to credit; on approved credit (OAC).</p>';

    function $(n) { return wrap.querySelector('[name="' + n + '"]'); }

    function update() {
      var p = fixedPrice ? price : Number($("price").value);
      var d = Number($("down").value);
      var t = Number($("term").value);
      if (!fixedPrice) $("price-out").textContent = SX.money(p);
      $("down-out").textContent = SX.money(d);
      $("term-out").textContent = t + " months";
      var m = SX.monthly(p, d, t);
      wrap.querySelector(".calc-monthly").textContent = SX.money(m);
    }
    wrap.querySelectorAll("input").forEach(function (r) { r.addEventListener("input", update); });
    update();
    return wrap;
  }

  /* ============ Scroll reveal ============ */

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ============ Init ============ */

  function init(page) {
    renderHeader(page);
    renderFooter();
    renderMobileBar();
    initReveal();
  }

  return {
    init: init,
    vehicleCard: vehicleCard,
    vehicleImage: vehicleImage,
    vehicleImages: vehicleImages,
    heroImage: heroImage,
    mapSVG: mapSVG,
    lotPhotoSVG: lotPhotoSVG,
    bodyTypeIcon: bodyTypeIcon,
    paymentCalculator: paymentCalculator,
    specLine: specLine,
    initReveal: initReveal
  };
})();
