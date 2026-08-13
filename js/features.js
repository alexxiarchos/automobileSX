/* Automobile SX - the feature catalogue.

   One source of truth, loaded three ways:
     - the browser, on vehicle pages (detail.js) and in the admin panel
     - Node, by api/_lib/vehiclePage.js when it pre-renders a vehicle page
     - Node, by api/_lib/vin.js when it turns decoded equipment into features

   Why it matters that there is only one copy: features are stored on the
   vehicle in English, exactly as written in ITEMS below. The French page looks
   the stored string up in FR to display it. If the two lists ever drifted, a
   French visitor would silently get English chips, so they live together.

   Adding a feature: put the English label in the right group and add its French
   translation to FR. Never rename an existing English label - that is the key a
   saved vehicle is matched on, and renaming one would orphan every listing that
   already has it. */

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SX_FEATURES = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var GROUPS = [
    {
      key: "safety",
      en: "Safety and driver assistance",
      fr: "Sécurité et aide à la conduite",
      items: [
        "Backup Camera", "360° Camera", "Parking Sensors", "Blind Spot Monitoring",
        "Rear Cross Traffic Alert", "Lane Departure Warning", "Lane Keep Assist",
        "Forward Collision Warning", "Automatic Emergency Braking",
        "Adaptive Cruise Control", "Automatic High Beams"
      ]
    },
    {
      key: "comfort",
      en: "Comfort",
      fr: "Confort",
      items: [
        "Air Conditioning", "Dual-Zone Climate Control", "Heated Seats",
        "Heated Steering Wheel", "Ventilated Seats", "Leather Seats",
        "Power Driver Seat", "Memory Seats", "Sunroof", "Panoramic Roof",
        "Third-Row Seating"
      ]
    },
    {
      key: "technology",
      en: "Technology",
      fr: "Technologie",
      items: [
        "Bluetooth", "Apple CarPlay", "Android Auto", "Touchscreen Display",
        "Navigation", "Premium Sound System", "Wireless Phone Charging",
        "Digital Instrument Cluster", "Head-Up Display"
      ]
    },
    {
      key: "convenience",
      en: "Convenience and exterior",
      fr: "Commodités et extérieur",
      items: [
        "Keyless Entry", "Push-Button Start", "Remote Start", "Cruise Control",
        "Power Liftgate", "Alloy Wheels", "Roof Rails", "Tow Package",
        "Trailer Hitch", "Winter Tires Included", "Second Set of Tires"
      ]
    }
  ];

  /* Labels that older listings may already carry. They are recognised and
     translated, but are not offered as new choices: "AWD" duplicates the
     drivetrain field, which the spec table already shows. */
  var LEGACY = ["AWD"];

  var FR = {
    "Backup Camera": "Caméra de recul",
    "360° Camera": "Caméra 360°",
    "Parking Sensors": "Capteurs de stationnement",
    "Blind Spot Monitoring": "Surveillance des angles morts",
    "Rear Cross Traffic Alert": "Alerte de circulation transversale arrière",
    "Lane Departure Warning": "Alerte de sortie de voie",
    "Lane Keep Assist": "Assistance au maintien de voie",
    "Forward Collision Warning": "Alerte de collision avant",
    "Automatic Emergency Braking": "Freinage d'urgence automatique",
    "Adaptive Cruise Control": "Régulateur de vitesse adaptatif",
    "Automatic High Beams": "Feux de route automatiques",

    "Air Conditioning": "Climatisation",
    "Dual-Zone Climate Control": "Climatisation bizone",
    "Heated Seats": "Sièges chauffants",
    "Heated Steering Wheel": "Volant chauffant",
    "Ventilated Seats": "Sièges ventilés",
    "Leather Seats": "Sièges en cuir",
    "Power Driver Seat": "Siège conducteur électrique",
    "Memory Seats": "Sièges à mémoire",
    "Sunroof": "Toit ouvrant",
    "Panoramic Roof": "Toit panoramique",
    "Third-Row Seating": "Troisième rangée de sièges",

    "Bluetooth": "Bluetooth",
    "Apple CarPlay": "Apple CarPlay",
    "Android Auto": "Android Auto",
    "Touchscreen Display": "Écran tactile",
    "Navigation": "Navigation",
    "Premium Sound System": "Chaîne audio haut de gamme",
    "Wireless Phone Charging": "Recharge sans fil",
    "Digital Instrument Cluster": "Tableau de bord numérique",
    "Head-Up Display": "Affichage tête haute",

    "Keyless Entry": "Entrée sans clé",
    "Push-Button Start": "Démarrage par bouton",
    "Remote Start": "Démarreur à distance",
    "Cruise Control": "Régulateur de vitesse",
    "Power Liftgate": "Hayon électrique",
    "Alloy Wheels": "Roues en alliage",
    "Roof Rails": "Barres de toit",
    "Tow Package": "Ensemble de remorquage",
    "Trailer Hitch": "Attelage de remorque",
    "Winter Tires Included": "Pneus d'hiver inclus",
    "Second Set of Tires": "Deuxième jeu de pneus",

    "AWD": "Rouage intégral"
  };

  var ALL = [];
  GROUPS.forEach(function (g) { ALL = ALL.concat(g.items); });
  ALL = ALL.concat(LEGACY);

  var BY_LOWER = {};
  ALL.forEach(function (f) { BY_LOWER[f.toLowerCase()] = f; });

  /* The stored label for a string the owner may have typed with different
     capitalisation, so "heated seats" and "Heated Seats" are one feature. */
  function canonical(s) {
    return BY_LOWER[String(s || "").trim().toLowerCase()] || String(s || "").trim();
  }

  function isKnown(s) {
    return Object.prototype.hasOwnProperty.call(BY_LOWER, String(s || "").trim().toLowerCase());
  }

  function label(s, lang) {
    var c = canonical(s);
    if (lang !== "fr") return c;
    return FR[c] || c;
  }

  /* A vehicle's flat feature list becomes display groups, in catalogue order,
     with anything the owner typed himself kept at the end under "Also included"
     rather than dropped. */
  function grouped(list, lang) {
    var flat = (list || []).map(canonical).filter(Boolean);
    var seen = {};
    var out = [];
    GROUPS.forEach(function (g) {
      var items = g.items.filter(function (f) {
        var hit = flat.some(function (x) { return x === f; });
        if (hit) seen[f] = true;
        return hit;
      });
      if (items.length) {
        out.push({
          key: g.key,
          title: lang === "fr" ? g.fr : g.en,
          items: items.map(function (f) { return label(f, lang); })
        });
      }
    });
    var rest = flat.filter(function (f, i) {
      return !seen[f] && flat.indexOf(f) === i;
    });
    if (rest.length) {
      out.push({
        key: "other",
        title: lang === "fr" ? "Aussi inclus" : "Also included",
        items: rest.map(function (f) { return label(f, lang); })
      });
    }
    return out;
  }

  return {
    GROUPS: GROUPS, LEGACY: LEGACY, FR: FR, ALL: ALL,
    canonical: canonical, isKnown: isKnown, label: label, grouped: grouped
  };
});
