/* Automobile SX — page shell generator.
   Every public HTML file is produced from this template so the head, header,
   footer and structured data stay identical across 28 pages and two languages. */

const SITE = "https://www.automobilesx.ca";

const ROUTES = {
  en: {
    home: "/", inventory: "/inventory", vehicle: "/vehicles", financing: "/financing",
    sell: "/sell-your-car", about: "/about", contact: "/contact", faq: "/faq",
    guides: "/guides", local: "/used-cars-west-island",
    g1: "/guides/buying-a-used-car-in-quebec",
    g2: "/guides/car-financing-with-bad-credit-quebec",
    g3: "/guides/what-is-my-trade-in-worth-quebec",
    g4: "/guides/registering-a-used-car-in-quebec"
  },
  fr: {
    home: "/fr", inventory: "/fr/inventaire", vehicle: "/fr/vehicules", financing: "/fr/financement",
    sell: "/fr/vendre-votre-auto", about: "/fr/a-propos", contact: "/fr/contact", faq: "/fr/faq",
    guides: "/fr/guides", local: "/fr/autos-usagees-west-island",
    g1: "/fr/guides/acheter-une-voiture-usagee-au-quebec",
    g2: "/fr/guides/financement-auto-mauvais-credit-quebec",
    g3: "/fr/guides/valeur-de-reprise-quebec",
    g4: "/fr/guides/immatriculer-une-voiture-usagee-quebec"
  }
};

/* Which physical file each route writes to */
const FILES = {
  en: {
    home: "index.html", inventory: "inventory.html", vehicle: "vehicle.html",
    financing: "financing.html", sell: "sell-your-car.html", about: "about.html",
    contact: "contact.html", faq: "faq.html", guides: "guides.html",
    local: "used-cars-west-island.html",
    g1: "guides/buying-a-used-car-in-quebec.html",
    g2: "guides/car-financing-with-bad-credit-quebec.html",
    g3: "guides/what-is-my-trade-in-worth-quebec.html",
    g4: "guides/registering-a-used-car-in-quebec.html"
  },
  fr: {
    home: "fr/index.html", inventory: "fr/inventaire.html", vehicle: "fr/vehicule.html",
    financing: "fr/financement.html", sell: "fr/vendre-votre-auto.html", about: "fr/a-propos.html",
    contact: "fr/contact.html", faq: "fr/faq.html", guides: "fr/guides.html",
    local: "fr/autos-usagees-west-island.html",
    g1: "fr/guides/acheter-une-voiture-usagee-au-quebec.html",
    g2: "fr/guides/financement-auto-mauvais-credit-quebec.html",
    g3: "fr/guides/valeur-de-reprise-quebec.html",
    g4: "fr/guides/immatriculer-une-voiture-usagee-quebec.html"
  }
};

const DEALER = {
  name: "Automobile SX",
  phone: "514-824-9117",
  phoneE164: "+1-514-824-9117",
  email: "Automobilesx@gmail.com",
  street: "2044 Avenue Chartier",
  city: "Dorval",
  region: "QC",
  postalCode: "H9P 1H2",
  country: "CA",
  maps: "https://www.google.com/maps/search/?api=1&query=2044+Avenue+Chartier+Dorval+QC",
  /* Verified from the Google listing: the feature id in the search URL
     (0x4cc917d2f1d98cd3:0x50177985c7499902) decodes to this place id, and the
     low half is the CID used by the maps link. */
  placeId: "ChIJ04zZ8dIXyUwRAplJx4V5F1A",
  reviewsUrl: "https://www.google.com/maps?cid=5771215062979680514",
  writeReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ04zZ8dIXyUwRAplJx4V5F1A"
};

const dealerSchema = () => ({
  "@type": "AutoDealer",
  "@id": SITE + "/#dealer",
  name: DEALER.name,
  alternateName: "Automobile SX Vente d'Autos Usagées",
  url: SITE,
  logo: SITE + "/assets/logo.png",
  image: SITE + "/assets/og-image.jpg",
  telephone: DEALER.phoneE164,
  email: DEALER.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: DEALER.street,
    addressLocality: DEALER.city,
    addressRegion: DEALER.region,
    postalCode: DEALER.postalCode,
    addressCountry: DEALER.country
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    /* Full schema.org enum URLs: strict validators reject the bare day names. */
    dayOfWeek: [
      "https://schema.org/Monday", "https://schema.org/Tuesday", "https://schema.org/Wednesday",
      "https://schema.org/Thursday", "https://schema.org/Friday", "https://schema.org/Saturday",
      "https://schema.org/Sunday"
    ],
    opens: "10:00",
    closes: "18:00"
  },
  priceRange: "$$",
  /* Only profiles verified to be this business. The Google listing was
     confirmed from the feature id in the owner's own search URL. */
  sameAs: ["https://www.google.com/maps?cid=5771215062979680514"],
  areaServed: ["Dorval", "West Island", "Pointe-Claire", "Lachine", "Montréal", "Laval"],
  /* availableLanguage is not in scope for AutoDealer: schema.org defines it on
     ContactPoint, Course, LodgingBusiness, ServiceChannel and TouristAttraction
     only, and none of those is on AutoDealer's supertype chain
     (Thing > Organization|Place > LocalBusiness > AutomotiveBusiness). It lives
     on a ContactPoint instead, which is where the vocabulary puts it. The
     telephone and email above stay on the dealer itself. */
  contactPoint: {
    "@type": "ContactPoint",
    telephone: DEALER.phoneE164,
    contactType: "customer service",
    availableLanguage: ["en", "fr"]
  }
});

function breadcrumbSchema(items, lang) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE + (it.route ? ROUTES[lang][it.route] : it.url)
    }))
  };
}

/* The header and footer are built by components.js at runtime. Crawlers that
   do not execute JavaScript therefore saw a page with almost no internal
   links, which is why an external crawl reported pages with a single inbound
   link. This block is written into the footer element as real HTML;
   components.js replaces it with the full footer as soon as it runs, so
   nothing changes for a visitor, but every crawler sees the links. */
const FOOTER_NAV = {
  en: [
    ["inventory", "Used car inventory"], ["financing", "Financing"],
    ["sell", "Sell or trade your car"], ["guides", "Buying guides"],
    ["faq", "Questions and answers"], ["local", "Used cars in the West Island"],
    ["about", "About Automobile SX"], ["contact", "Contact and directions"]
  ],
  fr: [
    ["inventory", "Inventaire de véhicules"], ["financing", "Financement"],
    ["sell", "Vendre ou échanger votre auto"], ["guides", "Guides d'achat"],
    ["faq", "Questions et réponses"], ["local", "Autos usagées dans le West Island"],
    ["about", "À propos d'Automobile SX"], ["contact", "Contact et itinéraire"]
  ]
};

function staticFooter(lang) {
  const other = lang === "en" ? "fr" : "en";
  const links = FOOTER_NAV[lang]
    .map(([route, label]) => `<li><a href="${ROUTES[lang][route]}">${label}</a></li>`)
    .join("");
  const switchLabel = lang === "en" ? "Voir ce site en français" : "View this site in English";
  return `<div class="container footer-static">
<p><strong>${DEALER.name}</strong>, ${DEALER.street}, ${DEALER.city}, ${DEALER.region} ${DEALER.postalCode}. <a href="tel:${DEALER.phoneE164}">${DEALER.phone}</a></p>
<ul>${links}<li><a href="${ROUTES[other].home}" hreflang="${other}" lang="${other}">${switchLabel}</a></li></ul>
</div>`;
}

/**
 * page = {
 *   route, lang, title, description, h1, body,
 *   scripts?: [], schema?: [], breadcrumb?: [{name, route}], noindex?: bool,
 *   ogImage?: string
 * }
 */
function renderPage(page) {
  const { route, lang } = page;
  const other = lang === "en" ? "fr" : "en";
  const path = ROUTES[lang][route];
  const altPath = ROUTES[other][route];
  const canonical = SITE + path;

  const graph = [dealerSchema()];
  if (page.breadcrumb) graph.push(breadcrumbSchema(page.breadcrumb, lang));
  if (page.schema) graph.push(...page.schema);

  const jsonld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });

  const scripts = (page.scripts || [])
    .map(s => `<script src="${s}" defer></script>`).join("\n");

  const ogImage = page.ogImage || "/assets/og-image.jpg";

  return `<!DOCTYPE html>
<html lang="${lang === "fr" ? "fr-CA" : "en-CA"}" data-route="${route}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
${page.skipCanonical ? "" : `<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en-CA" href="${SITE + ROUTES.en[route]}">
<link rel="alternate" hreflang="fr-CA" href="${SITE + ROUTES.fr[route]}">
<link rel="alternate" hreflang="x-default" href="${SITE + ROUTES.en[route]}">
`}${page.noindex ? '<meta name="robots" content="noindex, follow">\n' : ""}<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="Automobile SX">
<meta property="og:locale" content="${lang === "fr" ? "fr_CA" : "en_CA"}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}${ogImage}">
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
<script>window.SX_ALT=${JSON.stringify(altPath)};</script>
<script type="application/ld+json">${jsonld}</script>
</head>
<body>

<header class="site-header" id="site-header"></header>

<main id="main">
${page.body}
</main>

<footer class="site-footer" id="site-footer">${staticFooter(lang)}</footer>
<div class="mobile-cta-bar" id="mobile-cta-bar"></div>

<script src="/js/data.js"></script>
<script src="/js/components.js"></script>
${scripts}
</body>
</html>
`;
}

module.exports = { SITE, ROUTES, FILES, DEALER, renderPage, dealerSchema, breadcrumbSchema };
