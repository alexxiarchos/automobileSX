/* Automobile SX — mock inventory data (front-end only, no backend)
   All prices CAD, distances in km. Strings routed through SX.t() for later FR swap. */

window.SX = window.SX || {};

/* ---------- i18n ---------- */
SX.lang = "en";

SX.strings = {
  en: {
    "nav.home": "Home",
    "nav.inventory": "Inventory",
    "nav.financing": "Financing",
    "nav.about": "About",
    "nav.contact": "Contact",
    "cta.bookTestDrive": "Book a Test Drive",
    "cta.searchInventory": "Search Inventory",
    "cta.viewAll": "View all inventory →",
    "cta.call": "Call",
    "cta.browse": "Browse Inventory",
    "hero.title": "Pre-owned, properly inspected.",
    "hero.sub": "Every vehicle on our lot passes a 150-point inspection before it gets a price tag.",
    "search.make": "Make",
    "search.model": "Model",
    "search.maxPrice": "Max Price",
    "search.any": "Any",
    "featured.title": "Featured vehicles",
    "bodytype.title": "Browse by body type",
    "estMo": "est. {0}/mo",
    "footer.tagline": "Family-run pre-owned dealership serving Dorval and Greater Montreal.",
    "footer.hours": "Hours",
    "footer.quickLinks": "Quick links",
    "footer.newArrivals": "New arrivals",
    "footer.newArrivalsSub": "Want first call when fresh stock lands? Send us your email and we will keep you posted.",
    "footer.newArrivalsCta": "Email us",
    "footer.orCall": "Or call",
    "footer.taxNote": "All prices exclude applicable taxes and licensing.",
    "closed": "Closed"
  },
  fr: {
    "nav.home": "Accueil",
    "nav.inventory": "Inventaire",
    "nav.financing": "Financement",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "cta.bookTestDrive": "Réserver un essai routier",
    "cta.searchInventory": "Rechercher l'inventaire",
    "cta.viewAll": "Voir tout l'inventaire →",
    "cta.call": "Appeler",
    "cta.browse": "Voir l'inventaire",
    "hero.title": "D'occasion, bien inspecté.",
    "hero.sub": "Chaque véhicule passe une inspection en 150 points avant d'être mis en vente.",
    "search.make": "Marque",
    "search.model": "Modèle",
    "search.maxPrice": "Prix max",
    "search.any": "Tous",
    "featured.title": "Véhicules en vedette",
    "bodytype.title": "Parcourir par carrosserie",
    "estMo": "env. {0}/mois",
    "footer.tagline": "Concessionnaire familial de véhicules d'occasion à Dorval, dans le Grand Montréal.",
    "footer.hours": "Heures",
    "footer.quickLinks": "Liens rapides",
    "footer.newArrivals": "Nouveaux arrivages",
    "footer.newArrivalsSub": "Envoyez-nous votre courriel et nous vous aviserons des nouveaux arrivages.",
    "footer.newArrivalsCta": "Écrivez-nous",
    "footer.orCall": "Ou appelez le",
    "footer.taxNote": "Les prix excluent les taxes applicables et l'immatriculation.",
    "closed": "Fermé"
  }
};

SX.t = function (key) {
  var args = Array.prototype.slice.call(arguments, 1);
  var s = (SX.strings[SX.lang] && SX.strings[SX.lang][key]) || SX.strings.en[key] || key;
  args.forEach(function (a, i) { s = s.replace("{" + i + "}", a); });
  return s;
};

/* ---------- Dealership info ---------- */
SX.dealer = {
  name: "Automobile SX",
  contact: "Spiro Xiarchos",
  phone: "514-824-9117",
  phoneHref: "tel:+15148249117",
  email: "Automobilesx@gmail.com",
  address1: "2044 Avenue Chartier",
  address2: "Dorval, QC",
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

/* ---------- Finance defaults ---------- */
SX.finance = { apr: 7.99, defaultTermMonths: 72, defaultDownPct: 0.1 };

SX.money = function (n) {
  return "$" + Math.round(n).toLocaleString("en-CA");
};

SX.monthly = function (price, down, months, apr) {
  down = down == null ? Math.round(price * SX.finance.defaultDownPct) : down;
  months = months || SX.finance.defaultTermMonths;
  apr = apr == null ? SX.finance.apr : apr;
  var principal = Math.max(price - down, 0);
  var r = apr / 100 / 12;
  if (principal <= 0) return 0;
  if (r === 0) return principal / months;
  return principal * r / (1 - Math.pow(1 + r, -months));
};

SX.estMoLabel = function (price) {
  return SX.t("estMo", SX.money(SX.monthly(price)));
};

/* ---------- Vehicles ----------
   24 vehicles. Fields: id, year, make, model, trim, body, price, km,
   transmission, fuel, drivetrain, extColor, extHex, intColor, engine,
   econCity/econHwy (L/100km), doors, seats, vin, stock, tag (optional),
   features {safety, comfort, technology, exterior}, desc[2] */

/* Vehicles now live in data/vehicles.json (managed by the /admin panel).
   SX.ready resolves once inventory is loaded. */
SX.vehicles = [];      /* status === "available" — shown in listings */
SX.allVehicles = [];   /* available + sold — resolvable on detail page */

SX.ready = fetch("data/vehicles.json", { cache: "no-cache" })
  .then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  })
  .then(function (d) {
    var all = (d && d.vehicles) || [];
    SX.allVehicles = all.filter(function (v) { return v.status !== "draft"; });
    SX.vehicles = all.filter(function (v) { return !v.status || v.status === "available"; });
  })
  .catch(function (e) {
    SX.loadError = e;
    console.error("Could not load inventory:", e);
  });

/* Photo view labels used to generate each vehicle's 7-image gallery */
SX.photoViews = ["Front 3/4", "Side Profile", "Rear 3/4", "Interior", "Dashboard", "Wheels", "Cargo / Trunk"];

SX.getVehicle = function (id) {
  return SX.allVehicles.find(function (v) { return v.id === id; }) ||
    SX.vehicles.find(function (v) { return v.id === id; });
};

SX.vehicleTitle = function (v) {
  return v.year + " " + v.make + " " + v.model;
};

SX.bodyTypes = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback"];
