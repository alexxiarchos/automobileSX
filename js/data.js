/* Automobile SX - site data, routing and translations.
   Inventory itself lives in /data/vehicles.json (managed by /admin). */

window.SX = window.SX || {};

/* ---------- Language: taken from the URL path, never guessed ---------- */
SX.lang = /^\/fr(\/|$)/.test(location.pathname) ? "fr" : "en";

/* ---------- Routes (one table, both languages) ---------- */
SX.routes = {
  en: {
    home: "/",
    inventory: "/inventory",
    vehicle: "/vehicles",
    financing: "/financing",
    sell: "/sell-your-car",
    about: "/about",
    contact: "/contact",
    faq: "/faq",
    guides: "/guides",
    local: "/used-cars-west-island",
    privacy: "/privacy"
  },
  fr: {
    home: "/fr",
    inventory: "/fr/inventaire",
    vehicle: "/fr/vehicules",
    financing: "/fr/financement",
    sell: "/fr/vendre-votre-auto",
    about: "/fr/a-propos",
    contact: "/fr/contact",
    faq: "/fr/faq",
    guides: "/fr/guides",
    local: "/fr/autos-usagees-west-island",
    privacy: "/fr/confidentialite"
  }
};

SX.url = function (key, lang) {
  return SX.routes[lang || SX.lang][key];
};

SX.vehicleUrl = function (v, lang) {
  return SX.url("vehicle", lang) + "/" + v.id;
};

/* ---------- Translations ---------- */
SX.strings = {
  en: {
    "nav.home": "Home",
    "nav.inventory": "Inventory",
    "nav.financing": "Financing",
    "nav.sell": "Sell or Trade",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.guides": "Guides",
    "nav.faq": "FAQ",
    "nav.local": "Used cars in the West Island",
    "nav.privacy": "Privacy policy",
    "cta.bookTestDrive": "Book a Test Drive",
    "cta.searchInventory": "Search Inventory",
    "cta.viewAll": "View all inventory →",
    "cta.call": "Call",
    "cta.browse": "Browse Inventory",
    "cta.checkAvailability": "Check Availability",
    "cta.getPreApproved": "Get Pre-Approved",
    "search.make": "Make",
    "search.model": "Model",
    "search.maxPrice": "Max Price",
    "search.any": "Any",
    "footer.hours": "Hours",
    "footer.quickLinks": "Quick links",
    "footer.newArrivals": "New arrivals",
    "footer.newArrivalsSub": "Want first call when fresh stock lands? Send us your email and we will keep you posted.",
    "footer.newArrivalsCta": "Email us",
    "footer.orCall": "Or call",
    "footer.taxNote": "All prices exclude applicable taxes and licensing.",
    "footer.langLink": "Voir ce site en français",
    "closed": "Closed",
    /* Inventory UI */
    "inv.filters": "Filters",
    "inv.keyword": "Search make, model, trim…",
    "inv.make": "Make",
    "inv.body": "Body type",
    "inv.price": "Price",
    "inv.year": "Year",
    "inv.maxKm": "Max kilometres",
    "inv.transmission": "Transmission",
    "inv.fuel": "Fuel",
    "inv.drivetrain": "Drivetrain",
    "inv.clearAll": "Clear all",
    "inv.showing": "Showing {0} of {1} vehicles",
    "inv.showingMatching": "Showing {0} of {1} matching vehicles",
    "inv.sortLabel": "Sort vehicles",
    "inv.sortPriceAsc": "Price: low to high",
    "inv.sortPriceDesc": "Price: high to low",
    "inv.sortKm": "Lowest kilometres",
    "inv.sortYear": "Newest year",
    "inv.loadMore": "Load more vehicles",
    "inv.loadMoreCount": "Load more vehicles ({0} remaining)",
    "inv.emptyTitle": "No vehicles match those filters",
    "inv.emptyBody": "Try widening the price or kilometre range, or clear everything and start over.",
    "inv.emptyReset": "Reset all filters",
    "inv.noStockTitle": "New inventory arriving",
    "inv.noStockBody": "We are updating our listings. Call {0} to hear what is on the lot right now.",
    /* Vehicle card / detail */
    "veh.photosSoon": "Photos coming soon",
    "veh.sold": "Sold",
    "veh.soldNote": "This vehicle has found a new home. Browse our current inventory below.",
    "veh.overview": "Overview",
    "veh.specs": "Specifications",
    "veh.features": "Features",
    "veh.similar": "Similar vehicles",
    "veh.estimatePayment": "Estimate your payment",
    "veh.kilometres": "Kilometres",
    "veh.stock": "Stock #",
    "veh.vin": "VIN",
    "veh.plusTaxes": "plus applicable taxes and licensing",
    "veh.noDesc": "Call us for full details on this vehicle.",
    "veh.featuresSoon": "Feature list available at your appointment.",
    "veh.savedLabel": "Save this vehicle",
    /* Payment calculator (Quebec disclosure requirements) */
    "calc.title": "Payment estimator",
    "calc.vehiclePrice": "Vehicle price",
    "calc.downPayment": "Down payment",
    "calc.term": "Term",
    "calc.months": "{0} months",
    "calc.creditRate": "Credit rate (annual)",
    "calc.paymentAmount": "Estimated monthly payment",
    "calc.numPayments": "Number of payments",
    "calc.creditCharges": "Total credit charges",
    "calc.totalObligation": "Total obligation",
    "calc.monthly": "monthly",
    "inv.inStock": "in stock",
    "calc.disclaimer": "Illustration only, not an offer of credit. Figures exclude applicable taxes, registration and fees, and assume an annual credit rate of {0}%. Your actual rate, term and approval depend on the lender and your credit file. Financing is never a condition of purchase.",
    "calc.priceLabel": "Total vehicle price",
    /* Misc */
    "bc.inventory": "Inventory",
    "readMore": "Read the guide →"
  },

  fr: {
    "nav.home": "Accueil",
    "nav.inventory": "Inventaire",
    "nav.financing": "Financement",
    "nav.sell": "Vendre ou échanger",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.guides": "Guides",
    "nav.faq": "FAQ",
    "nav.local": "Autos usagées dans le West Island",
    "nav.privacy": "Politique de confidentialité",
    "cta.bookTestDrive": "Réserver un essai",
    "cta.searchInventory": "Rechercher",
    "cta.viewAll": "Voir tout l'inventaire →",
    "cta.call": "Appeler",
    "cta.browse": "Voir l'inventaire",
    "cta.checkAvailability": "Vérifier la disponibilité",
    "cta.getPreApproved": "Obtenir une préapprobation",
    "search.make": "Marque",
    "search.model": "Modèle",
    "search.maxPrice": "Prix max",
    "search.any": "Tous",
    "footer.hours": "Heures",
    "footer.quickLinks": "Liens rapides",
    "footer.newArrivals": "Nouveaux arrivages",
    "footer.newArrivalsSub": "Envoyez-nous votre courriel et nous vous aviserons des nouveaux arrivages.",
    "footer.newArrivalsCta": "Écrivez-nous",
    "footer.orCall": "Ou appelez le",
    "footer.taxNote": "Les prix excluent les taxes applicables et l'immatriculation.",
    "footer.langLink": "View this site in English",
    "closed": "Fermé",
    "inv.filters": "Filtres",
    "inv.keyword": "Marque, modèle, version…",
    "inv.make": "Marque",
    "inv.body": "Carrosserie",
    "inv.price": "Prix",
    "inv.year": "Année",
    "inv.maxKm": "Kilométrage max",
    "inv.transmission": "Transmission",
    "inv.fuel": "Carburant",
    "inv.drivetrain": "Rouage",
    "inv.clearAll": "Tout effacer",
    "inv.showing": "{0} véhicules affichés sur {1}",
    "inv.showingMatching": "{0} véhicules affichés sur {1} correspondants",
    "inv.sortLabel": "Trier les véhicules",
    "inv.sortPriceAsc": "Prix : croissant",
    "inv.sortPriceDesc": "Prix : décroissant",
    "inv.sortKm": "Kilométrage le plus bas",
    "inv.sortYear": "Année la plus récente",
    "inv.loadMore": "Voir plus de véhicules",
    "inv.loadMoreCount": "Voir plus de véhicules ({0} restants)",
    "inv.emptyTitle": "Aucun véhicule ne correspond à ces filtres",
    "inv.emptyBody": "Élargissez la fourchette de prix ou de kilométrage, ou effacez tout et recommencez.",
    "inv.emptyReset": "Réinitialiser les filtres",
    "inv.noStockTitle": "Nouveaux véhicules à venir",
    "inv.noStockBody": "Nos annonces sont en cours de mise à jour. Appelez le {0} pour savoir ce qui est disponible.",
    "veh.photosSoon": "Photos à venir",
    "veh.sold": "Vendu",
    "veh.soldNote": "Ce véhicule a trouvé preneur. Consultez notre inventaire actuel ci-dessous.",
    "veh.overview": "Aperçu",
    "veh.specs": "Fiche technique",
    "veh.features": "Équipements",
    "veh.similar": "Véhicules semblables",
    "veh.estimatePayment": "Estimez votre paiement",
    "veh.kilometres": "Kilométrage",
    "veh.stock": "N° de stock",
    "veh.vin": "NIV",
    "veh.plusTaxes": "plus taxes applicables et immatriculation",
    "veh.noDesc": "Appelez-nous pour tous les détails sur ce véhicule.",
    "veh.featuresSoon": "Liste des équipements disponible lors de votre rendez-vous.",
    "veh.savedLabel": "Enregistrer ce véhicule",
    "calc.title": "Estimateur de paiement",
    "calc.vehiclePrice": "Prix du véhicule",
    "calc.downPayment": "Mise de fonds",
    "calc.term": "Durée",
    "calc.months": "{0} mois",
    "calc.creditRate": "Taux de crédit (annuel)",
    "calc.paymentAmount": "Paiement mensuel estimé",
    "calc.numPayments": "Nombre de paiements",
    "calc.creditCharges": "Frais de crédit totaux",
    "calc.totalObligation": "Obligation totale",
    "calc.monthly": "mois",
    "inv.inStock": "en stock",
    "calc.disclaimer": "Illustration seulement, ce n'est pas une offre de crédit. Les montants excluent les taxes applicables, l'immatriculation et les frais, et supposent un taux de crédit annuel de {0} %. Votre taux, votre durée et votre approbation dépendent du prêteur et de votre dossier de crédit. Le financement n'est jamais une condition d'achat.",
    "calc.priceLabel": "Prix total du véhicule",
    "bc.inventory": "Inventaire",
    "readMore": "Lire le guide →"
  }
};

SX.t = function (key) {
  var args = Array.prototype.slice.call(arguments, 1);
  /* An empty string is a legitimate translation, so test for presence rather
     than truthiness. The old `||` chain printed the key name instead. */
  var here = SX.strings[SX.lang];
  var s = here && typeof here[key] === "string" ? here[key]
    : typeof SX.strings.en[key] === "string" ? SX.strings.en[key]
    : key;
  args.forEach(function (a, i) { s = s.split("{" + i + "}").join(a); });
  return s;
};

/* ---------- Dealership ---------- */
SX.dealer = {
  name: "Automobile SX",
  contact: "Spiro Xiarchos",
  phone: "514-824-9117",
  phoneHref: "tel:+15148249117",
  email: "Automobilesx@gmail.com",
  address1: "2044 Avenue Chartier",
  address2: "Dorval, QC",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=2044+Avenue+Chartier+Dorval+QC",
  reviewsUrl: "https://search.google.com/local/reviews?placeid=ChIJ04zZ8dIXyUwRAplJx4V5F1A",
  mapEmbed: {
    en: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1663.8666495540244!2d-73.72416031436669!3d45.46418333788317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc917d2f1d98cd3%3A0x50177985c7499902!2sAutomobile%20Sx!5e0!3m2!1sen!2sca!4v1786407588287!5m2!1sen!2sca",
    fr: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1663.8666495540244!2d-73.72416031436669!3d45.46418333788317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc917d2f1d98cd3%3A0x50177985c7499902!2sAutomobile%20Sx!5e0!3m2!1sfr!2sca!4v1786407588287!5m2!1sfr!2sca"
  },
  writeReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ04zZ8dIXyUwRAplJx4V5F1A",
  apptNote: {
    en: "By appointment. Call to book, reservations welcome.",
    fr: "Sur rendez-vous. Appelez pour réserver, réservations bienvenues."
  },
  hours: [
    { day: "Monday", fr: "Lundi", open: "10:00", close: "18:00" },
    { day: "Tuesday", fr: "Mardi", open: "10:00", close: "18:00" },
    { day: "Wednesday", fr: "Mercredi", open: "10:00", close: "18:00" },
    { day: "Thursday", fr: "Jeudi", open: "10:00", close: "18:00" },
    { day: "Friday", fr: "Vendredi", open: "10:00", close: "18:00" },
    { day: "Saturday", fr: "Samedi", open: "10:00", close: "18:00" },
    { day: "Sunday", fr: "Dimanche", open: "10:00", close: "18:00" }
  ]
};

/* ---------- Finance illustration defaults ---------- */
SX.finance = { rate: 9.99, defaultTermMonths: 60, defaultDownPct: 0.1 };

SX.num = function (n, digits) {
  var s = Number(n).toFixed(digits == null ? 2 : digits);
  return SX.lang === "fr" ? s.replace(".", ",") : s;
};

SX.money = function (n) {
  var v = Math.round(n || 0);
  return SX.lang === "fr"
    ? v.toLocaleString("fr-CA").replace(/ /g, " ") + " $"
    : "$" + v.toLocaleString("en-CA");
};

SX.monthly = function (price, down, months, rate) {
  down = down == null ? Math.round(price * SX.finance.defaultDownPct) : down;
  months = months || SX.finance.defaultTermMonths;
  rate = rate == null ? SX.finance.rate : rate;
  var principal = Math.max(price - down, 0);
  var r = rate / 100 / 12;
  if (principal <= 0) return 0;
  if (r === 0) return principal / months;
  return principal * r / (1 - Math.pow(1 + r, -months));
};

/* ---------- Inventory ---------- */
SX.vehicles = [];      /* available only, for listings */
SX.allVehicles = [];   /* available + sold, resolvable on detail pages */

/* Public pages read the same GitHub-backed inventory as the admin. This keeps
   a code deployment made from an older checkout from replacing newer stock in
   the browser after the pre-rendered cards have loaded. */
SX.ready = fetch("/api/stock", { cache: "no-cache" })
  .then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  })
  .then(function (d) {
    var all = (d && d.vehicles) || [];
    /* Normalize display spelling in memory only. The admin-controlled JSON
       remains untouched, but legacy values such as "Bmw" cannot leak into
       headings, filters or structured page content. */
    if (window.SX_MAKES) {
      all.forEach(function (v) {
        v.make = SX_MAKES.fixMake(v.make);
        v.model = SX_MAKES.fixModel(v.model);
      });
    }
    SX.allVehicles = all.filter(function (v) { return v.status !== "draft"; });
    SX.vehicles = all.filter(function (v) { return !v.status || v.status === "available"; });
  })
  .catch(function (e) {
    SX.loadError = e;
    console.error("Could not load inventory:", e);
  });

SX.getVehicle = function (id) {
  return SX.allVehicles.find(function (v) { return v.id === id; }) ||
    SX.vehicles.find(function (v) { return v.id === id; });
};

SX.vehicleTitle = function (v) {
  var make = window.SX_MAKES ? SX_MAKES.fixMake(v.make) : v.make;
  var model = window.SX_MAKES ? SX_MAKES.fixModel(v.model) : v.model;
  return v.year + " " + make + " " + model;
};

SX.displayTrim = function (v) {
  var value = v && v.trim;
  return window.SX_MAKES && SX_MAKES.displayTrim ? SX_MAKES.displayTrim(value) : (value || "");
};

SX.bodyTypes = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback"];

SX.bodyLabel = function (b) {
  if (SX.lang !== "fr") return b;
  return { Sedan: "Berline", SUV: "VUS", Truck: "Camionnette", Coupe: "Coupé", Hatchback: "Hayon" }[b] || b;
};

/* Spec values are stored in English (the admin form writes them) and displayed
   translated on the French site. Filtering and structured data keep using the
   stored English value, so nothing about the data model changes. */
SX.specFR = {
  transmission: {
    "Automatic": "Automatique", "Manual": "Manuelle",
    "CVT": "CVT", "e-CVT": "e-CVT"
  },
  fuel: {
    "Gasoline": "Essence", "Hybrid": "Hybride", "Diesel": "Diesel",
    "Electric": "Électrique", "Plug-in Hybrid": "Hybride rechargeable"
  },
  drivetrain: {
    "FWD": "Traction avant", "AWD": "Intégrale",
    "RWD": "Propulsion", "4x4": "4x4"
  }
};

SX.specLabel = function (kind, value) {
  if (SX.lang !== "fr" || !value) return value;
  var m = SX.specFR[kind];
  return (m && m[value]) || value;
};
