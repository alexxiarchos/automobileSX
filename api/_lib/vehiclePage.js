/* Renders a complete, crawlable HTML page for one vehicle.
   Used by api/save.js so that publishing a car from /admin commits a real page
   with its own title, description, price and specs already in the source.
   detail.js still runs on top for the gallery, calculator and similar vehicles. */

const SITE = "https://www.automobilesx.ca";

const PATHS = {
  en: { dir: "vehicles", inventory: "/inventory", contact: "/contact", financing: "/financing" },
  fr: { dir: "fr/vehicules", inventory: "/fr/inventaire", contact: "/fr/contact", financing: "/fr/financement" }
};

const L = {
  en: {
    locale: "en_CA", htmlLang: "en-CA",
    overview: "Overview", specs: "Specifications", features: "Features",
    similar: "Similar vehicles", estimate: "Estimate your payment",
    bookTestDrive: "Book a Test Drive", checkAvailability: "Check Availability",
    getPreApproved: "Ask about financing", viewAll: "View all inventory →",
    inventory: "Inventory", kilometres: "Kilometres", stock: "Stock #", vin: "VIN",
    plusTaxes: "plus applicable taxes and licensing",
    hoursShort: "Open 10 to 6, seven days, by appointment",
    sold: "Sold", soldNote: "This vehicle has found a new home. Browse our current inventory below.",
    forSale: "for sale", noDesc: "Call us for full details on this vehicle.",
    featuresSoon: "Feature list available at your appointment.",
    engine: "Engine", trans: "Transmission", drive: "Drivetrain", fuel: "Fuel type",
    city: "Fuel economy (city)", hwy: "Fuel economy (highway)", ext: "Exterior colour",
    intr: "Interior", doors: "Doors", seats: "Seats",
    descIntro: (t, city) => `${t} available now at Automobile SX in ${city}, Quebec.`
  },
  fr: {
    locale: "fr_CA", htmlLang: "fr-CA",
    overview: "Aperçu", specs: "Fiche technique", features: "Équipements",
    similar: "Véhicules semblables", estimate: "Estimez votre paiement",
    bookTestDrive: "Réserver un essai", checkAvailability: "Vérifier la disponibilité",
    getPreApproved: "Info financement", viewAll: "Voir tout l'inventaire →",
    inventory: "Inventaire", kilometres: "Kilométrage", stock: "N° de stock", vin: "NIV",
    plusTaxes: "plus taxes applicables et immatriculation",
    hoursShort: "Ouvert de 10 h à 18 h, 7 jours, sur rendez-vous",
    sold: "Vendu", soldNote: "Ce véhicule a trouvé preneur. Consultez notre inventaire actuel ci-dessous.",
    forSale: "à vendre", noDesc: "Appelez-nous pour tous les détails sur ce véhicule.",
    featuresSoon: "Liste des équipements disponible lors de votre rendez-vous.",
    engine: "Moteur", trans: "Transmission", drive: "Rouage", fuel: "Carburant",
    city: "Consommation ville", hwy: "Consommation route", ext: "Couleur extérieure",
    intr: "Intérieur", doors: "Portes", seats: "Places",
    descIntro: (t, city) => `${t} disponible chez Automobile SX à ${city}, au Québec.`
  }
};

const BODY_FR = { Sedan: "Berline", SUV: "VUS", Truck: "Camionnette", Coupe: "Coupé", Hatchback: "Hayon" };

/* Spec values are stored in English by the admin form and displayed translated
   on the French pages. Must stay in sync with SX.specFR in js/data.js so the
   pre-rendered page and the script that hydrates it agree. */
const SPEC_FR = {
  transmission: { "Automatic": "Automatique", "Manual": "Manuelle", "CVT": "CVT", "e-CVT": "e-CVT" },
  fuel: {
    "Gasoline": "Essence", "Hybrid": "Hybride", "Diesel": "Diesel",
    "Electric": "Électrique", "Plug-in Hybrid": "Hybride rechargeable"
  },
  drivetrain: { "FWD": "Traction avant", "AWD": "Intégrale", "RWD": "Propulsion", "4x4": "4x4" }
};

function specLabel(kind, value, lang) {
  if (lang !== "fr" || !value) return value;
  return (SPEC_FR[kind] && SPEC_FR[kind][value]) || value;
}

/* Same crawlable footer the generated pages carry, so a vehicle page is not a
   dead end for a crawler that does not run JavaScript. components.js replaces
   it with the real footer on boot. Mirrors staticFooter() in build/layout.js. */
const FOOTER_NAV = {
  en: [
    ["/inventory", "Used car inventory"], ["/financing", "Financing"],
    ["/sell-your-car", "Sell or trade your car"], ["/guides", "Buying guides"],
    ["/faq", "Questions and answers"], ["/used-cars-west-island", "Used cars in the West Island"],
    ["/about", "About Automobile SX"], ["/contact", "Contact and directions"]
  ],
  fr: [
    ["/fr/inventaire", "Inventaire de véhicules"], ["/fr/financement", "Financement"],
    ["/fr/vendre-votre-auto", "Vendre ou échanger votre auto"], ["/fr/guides", "Guides d'achat"],
    ["/fr/faq", "Questions et réponses"], ["/fr/autos-usagees-west-island", "Autos usagées dans le West Island"],
    ["/fr/a-propos", "À propos d'Automobile SX"], ["/fr/contact", "Contact et itinéraire"]
  ]
};

function staticFooter(lang) {
  const other = lang === "en" ? "fr" : "en";
  const links = FOOTER_NAV[lang].map(l => `<li><a href="${l[0]}">${l[1]}</a></li>`).join("");
  const switchLabel = lang === "en" ? "Voir ce site en français" : "View this site in English";
  const home = lang === "en" ? "/fr" : "/";
  return `<div class="container footer-static">
<p><strong>Automobile SX</strong>, 2044 Avenue Chartier, Dorval, QC H9P 1H2. <a href="tel:+1-514-824-9117">514-824-9117</a></p>
<ul>${links}<li><a href="${home}" hreflang="${other}" lang="${other}">${switchLabel}</a></li></ul>
</div>`;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n, lang) {
  const v = Math.round(Number(n) || 0);
  return lang === "fr"
    ? v.toLocaleString("fr-CA").replace(/ /g, " ") + " $"
    : "$" + v.toLocaleString("en-CA");
}

function km(n, lang) {
  return Number(n || 0).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA") + " km";
}

function title(v) {
  return [v.year, v.make, v.model].filter(Boolean).join(" ");
}

function fullName(v) {
  return (title(v) + " " + (v.trim || "")).trim();
}

function flatFeatures(v) {
  if (Array.isArray(v.features)) return v.features;
  if (v.features && typeof v.features === "object") {
    return [].concat(v.features.safety || [], v.features.comfort || [],
      v.features.technology || [], v.features.exterior || []);
  }
  return [];
}

function descParagraphs(v) {
  if (Array.isArray(v.desc)) return v.desc.filter(Boolean);
  if (typeof v.desc === "string" && v.desc.trim()) return v.desc.split(/\n\s*\n/).filter(Boolean);
  return [];
}

function metaDescription(v, lang) {
  const t = L[lang];
  const parts = [
    t.descIntro(fullName(v), "Dorval"),
    km(v.km, lang),
    specLabel("transmission", v.transmission, lang),
    specLabel("drivetrain", v.drivetrain, lang),
    money(v.price, lang)
  ].filter(Boolean);
  return parts.join(" · ").slice(0, 300);
}

function specRows(v, lang) {
  const t = L[lang];
  return [
    [t.engine, v.engine],
    [t.trans, specLabel("transmission", v.transmission, lang)],
    [t.drive, specLabel("drivetrain", v.drivetrain, lang)],
    [t.fuel, specLabel("fuel", v.fuel, lang)],
    [t.city, v.econCity != null ? Number(v.econCity).toFixed(1) + " L/100 km" : null],
    [t.hwy, v.econHwy != null ? Number(v.econHwy).toFixed(1) + " L/100 km" : null],
    [t.ext, v.extColor],
    [t.intr, v.intColor],
    [t.doors, v.doors != null ? String(v.doors) : null],
    [t.seats, v.seats != null ? String(v.seats) : null],
    [t.kilometres, km(v.km, lang)],
    [t.vin, v.vin]
  ].filter(r => r[1]);
}

function specTable(rows) {
  return '<table class="spec-table"><tbody>' +
    rows.map(r => "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td></tr>").join("") +
    "</tbody></table>";
}

function imageUrls(v) {
  return (v.images || []).map(p => SITE + "/" + String(p).replace(/^\//, ""));
}

function schema(v, lang) {
  const imgs = imageUrls(v);
  const car = {
    "@type": "Car",
    name: fullName(v),
    brand: { "@type": "Brand", name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year || ""),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.km, unitCode: "KMT" },
    bodyType: v.body,
    vehicleTransmission: v.transmission,
    fuelType: v.fuel,
    driveWheelConfiguration: v.drivetrain,
    color: v.extColor || undefined,
    vehicleIdentificationNumber: v.vin || undefined,
    image: imgs.length ? imgs : undefined,
    offers: {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "CAD",
      availability: v.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: SITE + "/" + PATHS[lang].dir + "/" + v.id,
      seller: { "@id": SITE + "/#dealer" }
    }
  };
  const dealer = {
    "@type": "AutoDealer",
    "@id": SITE + "/#dealer",
    name: "Automobile SX",
    url: SITE,
    telephone: "+1-514-824-9117",
    email: "Automobilesx@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2044 Avenue Chartier",
      addressLocality: "Dorval",
      addressRegion: "QC",
      postalCode: "H9P 1H2",
      addressCountry: "CA"
    }
  };
  const crumbs = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: L[lang].inventory, item: SITE + PATHS[lang].inventory },
      { "@type": "ListItem", position: 2, name: fullName(v), item: SITE + "/" + PATHS[lang].dir + "/" + v.id }
    ]
  };
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [dealer, car, crumbs] });
}

/**
 * Render one vehicle page.
 * @returns {{path: string, html: string}}
 */
function renderVehiclePage(v, lang) {
  const t = L[lang];
  const P = PATHS[lang];
  const name = fullName(v);
  const pageTitle = `${name} ${t.forSale} | Automobile SX Dorval`;
  const desc = metaDescription(v, lang);
  const canonical = SITE + "/" + P.dir + "/" + v.id;
  const altLang = lang === "en" ? "fr" : "en";
  const altUrl = "/" + PATHS[altLang].dir + "/" + v.id;
  const bodyLabel = lang === "fr" ? (BODY_FR[v.body] || v.body) : v.body;
  const paras = descParagraphs(v);
  const feats = flatFeatures(v);
  const rows = specRows(v, lang);
  const half = Math.ceil(rows.length / 2);
  const ogImage = (v.images && v.images.length)
    ? SITE + "/" + String(v.images[0]).replace(/^\//, "")
    : SITE + "/assets/og-image.jpg";

  const subtitle = [v.extColor, km(v.km, lang),
    specLabel("transmission", v.transmission, lang),
    specLabel("fuel", v.fuel, lang),
    specLabel("drivetrain", v.drivetrain, lang)]
    .filter(Boolean).join(" · ") + (v.stock ? " · " + t.stock + " " + v.stock : "");

  const html = `<!DOCTYPE html>
<html lang="${t.htmlLang}" data-route="vehicle">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en-CA" href="${SITE}/${PATHS.en.dir}/${v.id}">
<link rel="alternate" hreflang="fr-CA" href="${SITE}/${PATHS.fr.dir}/${v.id}">
<link rel="alternate" hreflang="x-default" href="${SITE}/${PATHS.en.dir}/${v.id}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Automobile SX">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0D0D0D">
<script>window.SX_ALT=${JSON.stringify(altUrl)};window.SX_PRERENDERED=true;</script>
<script type="application/ld+json">${schema(v, lang)}</script>
</head>
<body>

<header class="site-header" id="site-header"></header>

<main id="main">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol id="breadcrumb">
        <li><a href="${P.inventory}">${esc(t.inventory)}</a></li>
        <li><a href="${P.inventory}?body=${encodeURIComponent(v.body || "")}">${esc(bodyLabel)}</a></li>
        <li aria-current="page">${esc(name)}</li>
      </ol>
    </nav>
  </div>

  <div class="container detail-layout">
    <div>
      <h1 id="v-title" style="font-size:clamp(1.6rem,3vw,2.2rem);margin-bottom:4px">${esc(name)}</h1>
      ${v.status === "sold" ? `<p><span class="vc-tag" style="position:static;display:inline-block">${esc(t.sold)}</span> <span style="color:var(--slate);font-size:14px">${esc(t.soldNote)}</span></p>` : ""}
      <p id="v-subtitle" style="color:var(--slate);margin-bottom:20px">${esc(subtitle)}</p>

      <div class="gallery-main" id="gallery-main">
        <img id="gal-img" src="${esc(imageUrls(v)[0] || "")}" alt="${esc(name)}">
        <button class="gal-btn gal-prev" id="gal-prev" type="button" aria-label="‹">‹</button>
        <button class="gal-btn gal-next" id="gal-next" type="button" aria-label="›">›</button>
        <span class="gal-counter" id="gal-counter"></span>
      </div>
      <div class="thumb-strip" id="thumb-strip"></div>

      <div class="detail-sections">
        <section aria-labelledby="h-overview">
          <h2 id="h-overview">${esc(t.overview)}</h2>
          <div id="v-overview">${paras.length
            ? paras.map(p => "<p>" + esc(p) + "</p>").join("")
            : "<p>" + esc(t.noDesc) + "</p>"}</div>
        </section>
        <section aria-labelledby="h-specs">
          <h2 id="h-specs">${esc(t.specs)}</h2>
          <div class="spec-cols" id="v-specs">${specTable(rows.slice(0, half))}${specTable(rows.slice(half))}</div>
        </section>
        <section aria-labelledby="h-features">
          <h2 id="h-features">${esc(t.features)}</h2>
          <div id="v-features">${feats.length
            ? '<div class="feature-group"><ul class="feature-chips">' +
              feats.map(f => "<li>" + esc(f) + "</li>").join("") + "</ul></div>"
            : '<p style="color:var(--slate)">' + esc(t.featuresSoon) + "</p>"}</div>
        </section>
        <section aria-labelledby="h-calc">
          <h2 id="h-calc">${esc(t.estimate)}</h2>
          <div id="v-calculator" style="max-width:560px"></div>
        </section>
      </div>
    </div>

    <aside class="detail-rail">
      <div class="rail-card">
        <div class="rail-price" id="r-price">${esc(money(v.price, lang))}</div>
        <p class="rail-mo" id="r-mo">${esc(t.plusTaxes)}</p>
        <ul class="rail-facts" id="r-facts">
          <li><span>${esc(t.kilometres)}</span><span>${esc(km(v.km, lang))}</span></li>
          ${v.stock ? `<li><span>${esc(t.stock)}</span><span>${esc(v.stock)}</span></li>` : ""}
          ${v.vin ? `<li><span>${esc(t.vin)}</span><span>${esc(v.vin)}</span></li>` : ""}
        </ul>
        <a class="btn btn-red btn-block" id="r-testdrive" href="${P.contact}?interest=test-drive&amp;vehicle=${encodeURIComponent(v.id)}">${esc(t.bookTestDrive)}</a>
        <a class="btn btn-outline btn-block" id="r-availability" href="${P.contact}?interest=vehicle&amp;vehicle=${encodeURIComponent(v.id)}">${esc(t.checkAvailability)}</a>
        <a class="text-link" id="r-preapproved" href="${P.financing}">${esc(t.getPreApproved)}</a>
      </div>
      <div class="rail-card dealer-card">
        <strong>Automobile SX</strong> · Spiro Xiarchos<br>
        2044 Avenue Chartier, Dorval, QC<br>
        <a href="tel:+15148249117">514-824-9117</a><br>
        <a href="mailto:Automobilesx@gmail.com">Automobilesx@gmail.com</a><br>
        <span style="color:var(--slate)">${esc(t.hoursShort)}</span>
      </div>
    </aside>
  </div>

  <section class="section section-mist" aria-labelledby="h-similar">
    <div class="container">
      <div class="section-head">
        <h2 id="h-similar">${esc(t.similar)}</h2>
        <a class="text-link" href="${P.inventory}">${esc(t.viewAll)}</a>
      </div>
      <div class="vehicle-grid" id="similar-grid"></div>
    </div>
  </section>

  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true">
    <button class="lightbox-close" id="lb-close" type="button" aria-label="×">×</button>
    <button class="gal-btn gal-prev" id="lb-prev" type="button" aria-label="‹">‹</button>
    <img id="lb-img" src="" alt="">
    <button class="gal-btn gal-next" id="lb-next" type="button" aria-label="›">›</button>
  </div>

  <div class="detail-mobile-bar" id="detail-mobile-bar">
    <div><div class="dm-price" id="dm-price">${esc(money(v.price, lang))}</div></div>
    <a class="btn btn-red" id="dm-testdrive" href="${P.contact}?interest=test-drive&amp;vehicle=${encodeURIComponent(v.id)}">${esc(t.bookTestDrive)}</a>
  </div>
</main>

<footer class="site-footer" id="site-footer">${staticFooter(lang)}</footer>
<div class="mobile-cta-bar" id="mobile-cta-bar"></div>

<script src="/js/data.js"></script>
<script src="/js/components.js"></script>
<script src="/js/detail.js" defer></script>
</body>
</html>
`;

  return { path: P.dir + "/" + v.id + ".html", html };
}

/** Both language pages for one vehicle */
function renderVehiclePages(v) {
  return [renderVehiclePage(v, "en"), renderVehiclePage(v, "fr")];
}

/** File paths for a vehicle, used when deleting */
function vehiclePagePaths(id) {
  return [PATHS.en.dir + "/" + id + ".html", PATHS.fr.dir + "/" + id + ".html"];
}

module.exports = { renderVehiclePages, vehiclePagePaths, PATHS };
