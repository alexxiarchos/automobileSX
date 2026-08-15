/* Automobile SX - static page generator.
   Run:  node build/build.js
   Writes every public HTML page for both languages from the copy files.
   Inventory data (data/vehicles.json) and uploaded photos are never touched. */

const fs = require("fs");
const path = require("path");
const { SITE, ROUTES, FILES, DEALER, renderPage } = require("./layout.js");
const blocks = require("./blocks.js");
const { renderVehiclePages } = require("../api/_lib/vehiclePage.js");

const ROOT = path.join(__dirname, "..");
const COPY = { en: require("./copy-en.js"), fr: require("./copy-fr.js") };

/* Stable publication date for the guide articles (they are evergreen). */
const ARTICLE_DATE = "2026-08-04";

/* The inventory, baked into the pages that list it.

   These pages used to ship an empty grid for the browser to fill, which meant a
   crawler saw a listing page with no listings on it and, worse, no links to the
   vehicle pages underneath. Every one of those pages was already pre-rendered
   and indexable; nothing pointed at them.

   On Vercel, the admin-controlled GitHub copy is the source of truth. Never
   bake data from the deployment checkout there: a developer may be deploying
   code while the live inventory has moved on. A production build fails rather
   than silently publishing a stale or empty grid if that source is unavailable.

   Local builds still use data/vehicles.json when present, so development stays
   offline-friendly and a code-only checkout can still build empty grids. */
const HOME_FEATURED = 6;

async function loadVehicles() {
  if (process.env.VERCEL) {
    /* The repository is public, so the build can read the live branch without
       depending on an admin write token being exposed to the build process.
       GITHUB_REPO still wins when configured; Vercel's system repository
       variables and the known production repository are safe fallbacks. */
    const systemRepo = process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? process.env.VERCEL_GIT_REPO_OWNER + "/" + process.env.VERCEL_GIT_REPO_SLUG
      : "";
    const repo = process.env.GITHUB_REPO || systemRepo || "alexxiarchos/automobileSX";
    const branch = process.env.GITHUB_BRANCH || "main";
    const url = "https://raw.githubusercontent.com/" + repo + "/" + branch + "/data/vehicles.json";
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Live inventory request failed with HTTP " + response.status);
    const data = await response.json();
    if (!data || !Array.isArray(data.vehicles)) {
      throw new Error("Live inventory returned an invalid data shape");
    }
    return data.vehicles;
  }
  try {
    const raw = fs.readFileSync(path.join(ROOT, "data", "vehicles.json"), "utf8");
    return JSON.parse(raw).vehicles || [];
  } catch (e) {
    return [];
  }
}

function renderCards(vehicles) {
  const cards = require(path.join(ROOT, "js", "cards.js"));
  const out = {};
  ["en", "fr"].forEach(function (lang) {
    out[lang] = {
      all: cards.grid(vehicles, lang, 0, 3),
      /* The homepage hero is the LCP image. Its vehicle cards sit below the
         fold, so none of them should compete with it at high priority. */
      featured: cards.grid(vehicles, lang, HOME_FEATURED, 0)
    };
  });
  return out;
}

/* Wrap a written article in the standard page-head + prose layout */
function prosePage(T, key, extraSchema) {
  const c = T[key];
  return {
    body: `
  <div class="page-head">
    <div class="container"><h1>${c.h1}</h1><p class="sub">${c.sub}</p></div>
  </div>
  <div class="container prose-layout">
    <article class="prose">${c.body}</article>
    ${T.asideCard}
  </div>`,
    schema: extraSchema
  };
}

function articleSchema(T, key, lang) {
  const c = T[key];
  return {
    "@type": "Article",
    headline: c.h1,
    description: c.description,
    inLanguage: lang === "fr" ? "fr-CA" : "en-CA",
    mainEntityOfPage: { "@type": "WebPage", "@id": SITE + ROUTES[lang][key] },
    image: [SITE + "/assets/og-image.jpg"],
    datePublished: ARTICLE_DATE,
    dateModified: ARTICLE_DATE,
    author: { "@type": "Organization", name: "Automobile SX", url: SITE },
    publisher: { "@id": SITE + "/#dealer" }
  };
}

function guidesBody(T) {
  return `
  <div class="page-head">
    <div class="container"><h1>${T.guides.h1}</h1><p class="sub">${T.guides.sub}</p></div>
  </div>
  <div class="container section">
    <div class="card-grid">
      ${T.guides.cards.map(g => `
      <a class="link-card" href="${g.href}">
        <h2>${g.h}</h2>
        <p>${g.p}</p>
        <span class="link-card-cta">${T.ui.readMore}</span>
      </a>`).join("")}
    </div>
  </div>`;
}

function faqBody(T) {
  return `
  <div class="page-head">
    <div class="container"><h1>${T.faq.h1}</h1><p class="sub">${T.faq.sub}</p></div>
  </div>
  <div class="container prose-layout">
    <div class="prose">
      <div class="faq-list">
        ${T.faq.faqs.map((f, i) => `
        <div class="faq-item">
          <h2><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-${i}">${f.q}</button></h2>
          <div class="faq-a" id="faq-a-${i}"><p>${f.a}</p></div>
        </div>`).join("")}
      </div>
    </div>
    ${T.asideCard}
  </div>`;
}

function faqSchema(T, lang) {
  return {
    "@type": "FAQPage",
    inLanguage: lang === "fr" ? "fr-CA" : "en-CA",
    mainEntity: T.faq.faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };
}

async function build() {
  const vehicles = await loadVehicles();
  const CARDS = renderCards(vehicles);
  let written = 0;

  ["en", "fr"].forEach(lang => {
    const T = COPY[lang];
    const R = ROUTES[lang];
    const F = FILES[lang];
    T.R = R;

    /* the CTA card is defined inside the copy files via ctaCard; expose it */
    T.asideCard = T.asideCard || require("./copy-" + lang + ".js").asideCard || "";

    const home = T.home.h1;
    const bcHome = { name: lang === "fr" ? "Accueil" : "Home", route: "home" };

    const pages = [
      {
        route: "home", title: T.home.title, description: T.home.description,
        body: blocks.homeBody(T, R, CARDS[lang].featured), scripts: ["/js/home.js"],
        schema: [{
          "@type": "WebSite", name: "Automobile SX", url: SITE,
          inLanguage: lang === "fr" ? "fr-CA" : "en-CA"
        }]
      },
      {
        route: "inventory", title: T.inventory.title, description: T.inventory.description,
        body: blocks.inventoryBody(T, CARDS[lang].all), scripts: ["/js/inventory.js"],
        breadcrumb: [bcHome, { name: T.ui.filters ? T.inventory.h1 : "Inventory", route: "inventory" }]
      },
      {
        route: "vehicle", title: T.vehicle.title, description: T.vehicle.description,
        body: blocks.vehicleBody(T), scripts: ["/js/features.js", "/js/describe.js", "/js/opc.js", "/js/detail.js"], skipCanonical: true
      },
      {
        route: "contact", title: T.contact.title, description: T.contact.description,
        body: blocks.contactBody(T), scripts: ["/js/contact.js"],
        breadcrumb: [bcHome, { name: T.contact.h1, route: "contact" }]
      },
      {
        route: "financing", title: T.financing.title, description: T.financing.description,
        ...prosePage(T, "financing"),
        breadcrumb: [bcHome, { name: T.financing.h1, route: "financing" }]
      },
      {
        route: "sell", title: T.sell.title, description: T.sell.description,
        ...prosePage(T, "sell"),
        breadcrumb: [bcHome, { name: T.sell.h1, route: "sell" }]
      },
      {
        route: "about", title: T.about.title, description: T.about.description,
        ...prosePage(T, "about"),
        breadcrumb: [bcHome, { name: T.about.h1, route: "about" }]
      },
      {
        route: "local", title: T.local.title, description: T.local.description,
        ...prosePage(T, "local"),
        breadcrumb: [bcHome, { name: T.local.h1, route: "local" }]
      },
      {
        route: "faq", title: T.faq.title, description: T.faq.description,
        body: faqBody(T), scripts: ["/js/faq.js"],
        schema: [faqSchema(T, lang)],
        breadcrumb: [bcHome, { name: T.faq.h1, route: "faq" }]
      },
      {
        route: "privacy", title: T.privacy.title, description: T.privacy.description,
        ...prosePage(T, "privacy"),
        breadcrumb: [bcHome, { name: T.privacy.h1, route: "privacy" }]
      },
      {
        route: "guides", title: T.guides.title, description: T.guides.description,
        body: guidesBody(T),
        breadcrumb: [bcHome, { name: T.guides.h1, route: "guides" }]
      }
    ];

    ["g1", "g2", "g3", "g4"].forEach(g => {
      pages.push({
        route: g, title: T[g].title, description: T[g].description,
        ...prosePage(T, g),
        ogType: "article",
        schema: [articleSchema(T, g, lang)],
        breadcrumb: [bcHome, { name: T.guides.h1, route: "guides" }, { name: T[g].h1, route: g }]
      });
    });

    pages.forEach(p => {
      const html = renderPage({ ...p, lang });
      const out = path.join(ROOT, F[p.route]);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, html);
      written++;
    });
  });

  /* Refresh every crawlable vehicle detail page from the same inventory source
     used above. On Vercel that source is the live admin-controlled main branch,
     never the deployment checkout, so a code deploy can apply template and SEO
     improvements without reverting newer inventory changes. These files are
     deployment output only; this does not write back to the inventory source. */
  vehicles.filter(function (v) {
    return v && v.id && v.status !== "draft";
  }).forEach(function (v) {
    renderVehiclePages(v).forEach(function (page) {
      const out = path.join(ROOT, page.path);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, page.html);
      written++;
    });
  });

  /* ---------- Branded 404 (Vercel serves /404.html for unmatched routes) ---------- */
  const notFound = renderPage({
    route: "home", lang: "en", skipCanonical: true, noindex: true,
    title: "Page not found | Automobile SX",
    description: "That page could not be found. Browse our used car inventory in Dorval, Quebec.",
    body: `
  <div class="page-head">
    <div class="container">
      <h1>Page not found</h1>
      <p class="sub">The page you were looking for is not here. These links will get you where you were going.</p>
    </div>
  </div>
  <div class="container section">
    <div class="card-grid">
      <a class="link-card" href="/inventory"><h2>Browse the inventory</h2>
        <p>Every vehicle we currently have for sale in Dorval.</p>
        <span class="link-card-cta">View inventory →</span></a>
      <a class="link-card" href="/contact"><h2>Talk to us</h2>
        <p>Call 514-824-9117 or send a message and we will get back to you.</p>
        <span class="link-card-cta">Contact →</span></a>
      <a class="link-card" href="/guides"><h2>Buying guides</h2>
        <p>Taxes, the legal warranty, financing and registration in Quebec.</p>
        <span class="link-card-cta">Read the guides →</span></a>
      <a class="link-card" href="/fr" lang="fr"><h2>Version française</h2>
        <p>Ce site est aussi offert en français.</p>
        <span class="link-card-cta">Aller au site français →</span></a>
    </div>
  </div>`
  });
  fs.writeFileSync(path.join(ROOT, "404.html"), notFound);
  written++;

  /* ---------- Static sitemap of the fixed pages (vehicles are added by /api/sitemap) ---------- */
  const staticUrls = [];
  ["en", "fr"].forEach(lang => {
    Object.keys(ROUTES[lang]).forEach(route => {
      if (route === "vehicle") return;
      staticUrls.push({
        loc: SITE + ROUTES[lang][route],
        priority: route === "home" ? "1.0" : route === "inventory" ? "0.9" : "0.7",
        changefreq: route === "inventory" ? "daily" : route === "home" ? "weekly" : "monthly",
        alt: { en: SITE + ROUTES.en[route], fr: SITE + ROUTES.fr[route] }
      });
    });
  });
  fs.writeFileSync(path.join(ROOT, "sitemap-pages.json"), JSON.stringify(staticUrls, null, 2));

  /* ---------- Shells for /api/vehicle ----------
     api/vehicle.js resolves a vehicle URL that has no pre-rendered file yet
     (and 301s retired addresses). Bundling the three shells it may need as
     JSON means the function traces them automatically and never depends on
     reading HTML off the deployment filesystem. */
  const shells = {
    en: fs.readFileSync(path.join(ROOT, FILES.en.vehicle), "utf8"),
    fr: fs.readFileSync(path.join(ROOT, FILES.fr.vehicle), "utf8"),
    notFound: fs.readFileSync(path.join(ROOT, "404.html"), "utf8")
  };
  fs.writeFileSync(path.join(ROOT, "api/_lib/shells.json"), JSON.stringify(shells));

  console.log("Generated " + written + " HTML pages and sitemap-pages.json");
}

build().catch(function (error) {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
