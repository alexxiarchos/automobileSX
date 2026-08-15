/* Automobile SX - the description itself.

   What this is: a sentence builder, not a writer. It states facts that are
   already on the vehicle - year, make, model, trim, body, doors, kilometres,
   engine, transmission, drivetrain, colours, ticked features - in complete
   sentences, in English and in French. It invents nothing. If a field is
   empty, the sentence that would have used it is not written at all.

   This is not a button that fills a box once. Every listing's description IS
   this template, composed fresh each time a page is rendered, with Spiro's own
   paragraphs dropped into the middle of it. That matters because a description
   copied into a text box the day a car was listed is wrong the moment the price
   drops, a feature is ticked or the mileage is corrected - and nobody ever
   remembers to go back and rewrite it. Composing it on the way out means a
   listing cannot go stale.

   A vehicle can opt out entirely: set descMode to "manual" and desc/descFr are
   used verbatim. Every listing written before this existed is treated that way
   automatically, so nothing that was already published changes by itself.

   Two deliberate choices:

   - The price is never written into the prose. It is already the largest thing
     on the page, and a price in a paragraph is a price that gets forgotten when
     the number changes.
   - Wording varies by vehicle. Every listing on the site coming out of the same
     five sentence templates would read as boilerplate to a reader and as
     near-duplicate content to a search engine, so the phrasing is chosen from
     the vehicle's own id. The same car always produces the same draft; two
     different cars do not.

   The draft is a starting point. The panel says so, because the sentences that
   actually sell a car - where it came from, what was just done to it, why it is
   worth the money - are not in any database. */

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./features.js"), require("./makes.js"));
  else root.SX_DESCRIBE = factory(root.SX_FEATURES, root.SX_MAKES);
})(typeof self !== "undefined" ? self : this, function (FEATURES, MAKES) {
  "use strict";

  function displayMake(value) { return MAKES ? MAKES.fixMake(value) : value; }
  function displayModel(value) { return MAKES ? MAKES.fixModel(value) : value; }
  function displayTrim(value) { return MAKES && MAKES.displayTrim ? MAKES.displayTrim(value) : value; }

  /* ---------- vocabulary ---------- */

  var BODY = {
    Sedan: { en: "sedan", fr: "berline", g: "f" },
    SUV: { en: "SUV", fr: "VUS", g: "m" },
    Truck: { en: "pickup", fr: "camionnette", g: "f" },
    Coupe: { en: "coupe", fr: "coupé", g: "m" },
    Hatchback: { en: "hatchback", fr: "voiture à hayon", g: "f" }
  };

  var DRIVE = {
    FWD: { en: "front-wheel drive", fr: "traction avant" },
    AWD: { en: "all-wheel drive", fr: "rouage intégral" },
    RWD: { en: "rear-wheel drive", fr: "propulsion" },
    "4x4": { en: "four-wheel drive", fr: "quatre roues motrices" }
  };

  var TRANS = {
    Automatic: { en: "an automatic transmission", fr: "une transmission automatique" },
    Manual: { en: "a manual transmission", fr: "une transmission manuelle" },
    CVT: { en: "a CVT automatic", fr: "une transmission automatique à variation continue" },
    "e-CVT": { en: "an e-CVT automatic", fr: "une transmission e-CVT" }
  };

  var FUEL = {
    Gasoline: { en: "", fr: "" },              /* the default; saying it adds nothing */
    Diesel: { en: "diesel", fr: "diesel" },
    Hybrid: { en: "hybrid", fr: "hybride" },
    "Plug-in Hybrid": { en: "plug-in hybrid", fr: "hybride rechargeable" },
    Electric: { en: "electric", fr: "électrique" }
  };

  var DOORS = {
    2: { en: "two-door", fr: "deux portes" },
    3: { en: "three-door", fr: "trois portes" },
    4: { en: "four-door", fr: "quatre portes" },
    5: { en: "five-door", fr: "cinq portes" }
  };

  var COLOUR_FR = {
    black: "noir", white: "blanc", grey: "gris", gray: "gris", silver: "argent",
    red: "rouge", blue: "bleu", green: "vert", brown: "brun", beige: "beige",
    tan: "beige", gold: "or", orange: "orange", yellow: "jaune",
    burgundy: "bordeaux", charcoal: "gris anthracite", navy: "bleu marine",
    champagne: "champagne", bronze: "bronze", purple: "mauve"
    /* "pearl" and "metallic" are finishes rather than colours: leaving them out
       means "Pearl White" resolves to blanc instead of to nacré. */
  };

  var MATERIAL_FR = {
    cloth: "tissu", fabric: "tissu", leather: "cuir", leatherette: "similicuir",
    vinyl: "similicuir", suede: "suède", alcantara: "Alcantara"
  };

  /* Brand names keep their capitals inside a sentence; everything else in the
     catalogue reads better lower case in running prose. */
  var PROPER = ["Apple CarPlay", "Android Auto", "Bluetooth", "Alcantara"];

  var CLOSERS = {
    en: [
      "It is on the lot in Dorval now and can be seen seven days a week by appointment.",
      "You can see it at our lot on Avenue Chartier in Dorval, seven days a week by appointment.",
      "It is available now in Dorval. Call 514-824-9117 to arrange a time to come and see it.",
      "Come by and take a look in Dorval. We are open seven days a week by appointment and you deal directly with Spiro."
    ],
    fr: [
      "Le véhicule est présentement sur place à Dorval et peut être vu sept jours sur sept, sur rendez-vous.",
      "Vous pouvez le voir à notre emplacement de l'avenue Chartier, à Dorval, sept jours sur sept sur rendez-vous.",
      "Il est disponible dès maintenant à Dorval. Appelez le 514-824-9117 pour fixer un rendez-vous.",
      "Passez le voir à Dorval. Nous sommes ouverts sept jours sur sept sur rendez-vous et vous traitez directement avec Spiro."
    ]
  };

  var OWNERSHIP = {
    "One owner": {
      en: "It has had one owner from new.",
      fr: "Le véhicule n'a eu qu'un seul propriétaire depuis le neuf."
    },
    "Two owners": {
      en: "It has had two owners.",
      fr: "Le véhicule a eu deux propriétaires."
    },
    "Local trade-in": {
      en: "It came to us as a local trade-in.",
      fr: "Il nous est arrivé en échange d'un client de la région."
    },
    "Lease return": {
      en: "It is a lease return.",
      fr: "Il s'agit d'un retour de location."
    }
  };

  /* ---------- small helpers ---------- */

  function num(n, lang) {
    return Number(n || 0).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");
  }

  /* Deterministic, so a given car always gets the same wording and pressing the
     button twice never quietly rewrites the sentence you just read. */
  function seed(v) {
    var s = String(v.id || "") + "|" + [v.year, v.make, v.model, v.trim].join("-");
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  function pick(list, n) { return list[n % list.length]; }

  /* "a, b and c" - the Oxford comma is left out, which is house style in both
     languages here. */
  function join(list, lang) {
    var l = list.filter(Boolean);
    if (!l.length) return "";
    if (l.length === 1) return l[0];
    var last = l[l.length - 1];
    return l.slice(0, -1).join(", ") + (lang === "fr" ? " et " : " and ") + last;
  }

  /* "Backup Camera" is a catalogue heading; inside a sentence it is a backup
     camera. Brand names and initialisms (AWD, GPS, a typed-in "USB") keep their
     capitals, everything else is lowered word by word. */
  function featurePhrase(f, lang) {
    var label = FEATURES ? FEATURES.label(f, lang) : f;
    if (PROPER.indexOf(label) !== -1) return label;
    /* Split on spaces and hyphens but keep them, so "Push-Button Start"
       becomes "push-button start" rather than "push-Button start". */
    return String(label).split(/([ -])/).map(function (w) {
      if (w === " " || w === "-") return w;
      var letters = w.replace(/[^A-Za-zÀ-ÿ]/g, "");
      if (letters.length >= 2 && letters === letters.toUpperCase()) return w;  /* AWD, CVT, GPS */
      return w.charAt(0).toLowerCase() + w.slice(1);
    }).join("");
  }

  /* ce / cet - French elides before a vowel sound. Vehicles are referred to as
     masculine here ("le véhicule"), so the feminine form never comes up. */
  function dem(word) {
    return /^[aeiouâàéèêëîïôöùûüh]/i.test(String(word || "")) ? "cet" : "ce";
  }

  function spell(n, lang) {
    var en = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    var fr = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    var i = Number(n);
    if (!(i >= 0 && i <= 9)) return String(n);
    return (lang === "fr" ? fr : en)[i];
  }

  function colourFr(text) {
    var words = String(text || "").toLowerCase().split(/[\s,/-]+/).filter(Boolean);
    var colour = null, material = null;
    words.forEach(function (w) {
      if (!colour && COLOUR_FR[w]) colour = COLOUR_FR[w];
      if (!material && MATERIAL_FR[w]) material = MATERIAL_FR[w];
    });
    if (material && colour) return material + " " + colour;
    if (material) return material;
    if (colour) return colour;
    return String(text || "").trim();   /* not recognised: leave exactly as typed */
  }

  /* ---------- the sentences ---------- */

  /* English articles go by sound, not by spelling. "SUV" is spoken "ess you
     vee", so it takes "an", and so does every acronym whose first letter is
     spoken with a leading vowel: an LED, an RS, an XLE. The reverse trap is a
     vowel letter said as a consonant, "a used car", "a uniform". Digits have
     the same split: an 8 cylinder, an 18 inch, but a 6 speed. Choosing on the
     first letter alone gets SUV wrong, and SUVs are most of the lot. */
  var AN_ACRONYM = /^[AEFHILMNORSX](?![a-z])/;          /* SUV, LED, RS, F150 */
  var A_VOWEL    = /^(uni|use|used|usu|eu|ewe|one|once)/i;  /* vowel spelt, consonant said */
  var AN_HOUR    = /^(hour|honest|heir|honou?r)/i;       /* consonant spelt, vowel said */
  var AN_DIGIT   = /^(8|11|18)(?![0-9])/;                /* eight, eleven, eighteen */

  function an(word) {
    var w = String(word || "").trim();
    if (!w) return "a";
    if (AN_DIGIT.test(w)) return "an";
    if (/^[0-9]/.test(w)) return "a";
    if (AN_ACRONYM.test(w)) return "an";
    if (A_VOWEL.test(w)) return "a";
    if (AN_HOUR.test(w)) return "an";
    return /^[aeiou]/i.test(w) ? "an" : "a";
  }

  function openingEn(v, n) {
    var name = [v.year, displayMake(v.make), displayModel(v.model), displayTrim(v.trim)].filter(Boolean).join(" ");
    if (!name) return "";
    var body = BODY[v.body] ? BODY[v.body].en : "";
    var doors = DOORS[v.doors] ? DOORS[v.doors].en : "";
    var fuel = FUEL[v.fuel] ? FUEL[v.fuel].en : "";
    var shape = [doors, fuel, body].filter(Boolean).join(" ");
    var article = an(shape);
    var mileage = v.km ? num(v.km, "en") + " km" : "";

    if (!shape && !mileage) return "This is " + an(name) + " " + name + ".";
    if (!shape) return "This " + name + " has " + mileage + " on the odometer.";
    if (!mileage) return "This " + name + " is " + article + " " + shape + ".";

    return pick([
      "This " + name + " is " + article + " " + shape + " with " + mileage + " on the odometer.",
      "The " + name + " on offer here is " + article + " " + shape + " showing " + mileage + ".",
      "This is " + an(name) + " " + name + ", " + article + " " + shape + " with " + mileage + " on it."
    ], n);
  }

  function openingFr(v, n) {
    var name = [displayMake(v.make), displayModel(v.model), displayTrim(v.trim), v.year].filter(Boolean).join(" ");
    if (!name) return "";
    var b = BODY[v.body];
    var doors = DOORS[v.doors] ? " à " + DOORS[v.doors].fr : "";
    /* The fuel type is not stacked into this phrase: "une voiture à hayon
       diesel à cinq portes" is the kind of sentence that reads as translated.
       It is carried by the engine sentence instead. */
    var shape = b ? (b.g === "f" ? "une " : "un ") + b.fr + doors : "";
    var mileage = v.km ? num(v.km, "fr") + " km" : "";

    if (!shape && !mileage) return name + ".";
    if (!shape) return name + ", avec " + mileage + " au compteur.";
    if (!mileage) return name + ", " + shape + ".";

    return pick([
      name + ", " + shape + " affichant " + mileage + " au compteur.",
      name + " : " + shape + " avec " + mileage + " au compteur.",
      "Voici " + dem(name) + " " + name + ", " + shape + " avec " + mileage + " au compteur."
    ], n);
  }

  function mechanicalEn(v) {
    var bits = [];
    if (v.engine) bits.push(an(v.engine) + " " + v.engine + " engine");
    if (TRANS[v.transmission]) bits.push(TRANS[v.transmission].en);
    if (DRIVE[v.drivetrain]) bits.push(DRIVE[v.drivetrain].en);
    if (!bits.length) return "";
    return "It has " + join(bits, "en") + ".";
  }

  /* Written straight into the "doté de …" form rather than assembled from bare
     nouns, because the article that belongs in front of each one differs and
     gluing "un rouage" onto "traction avant" produces something no francophone
     would write. */
  var DRIVE_FR_PHRASE = {
    FWD: "de la traction avant",
    AWD: "d'un rouage intégral",
    RWD: "de la propulsion",
    "4x4": "de quatre roues motrices"
  };

  function mechanicalFr(v) {
    var bits = [];
    var fuel = FUEL[v.fuel] && FUEL[v.fuel].fr ? FUEL[v.fuel].fr : "";
    if (v.engine) bits.push("d'un moteur " + (fuel ? fuel + " " : "") + v.engine);
    else if (fuel) bits.push("d'une motorisation " + fuel);
    if (TRANS[v.transmission]) bits.push(TRANS[v.transmission].fr.replace(/^une /, "d'une ").replace(/^un /, "d'un "));
    if (DRIVE_FR_PHRASE[v.drivetrain]) bits.push(DRIVE_FR_PHRASE[v.drivetrain]);
    if (!bits.length) return "";
    return "Il est doté " + join(bits, "fr") + ".";
  }

  function colourEn(v) {
    if (v.extColor && v.intColor) {
      return "It is finished in " + v.extColor.toLowerCase() + " with " + v.intColor.toLowerCase() + " inside.";
    }
    if (v.extColor) return "It is finished in " + v.extColor.toLowerCase() + ".";
    if (v.intColor) return "The interior is " + v.intColor.toLowerCase() + ".";
    return "";
  }

  function colourFrSentence(v) {
    var ext = v.extColor ? colourFr(v.extColor) : "";
    var int = v.intColor ? colourFr(v.intColor) : "";
    /* Nominal phrases on purpose. "La carrosserie est noir" needs a feminine
       agreement, "de couleur noire" needs another, and the colour words are
       stored in one form only, so the sentence is built where no agreement is
       required at all. */
    if (ext && int) return "Extérieur " + ext + " et intérieur en " + int + ".";
    if (ext) return "Extérieur " + ext + ".";
    if (int) return "Intérieur en " + int + ".";
    return "";
  }

  function featuresSentence(v, lang, n) {
    var list = FEATURES.publicList(v.features || []).slice(0, 10);
    if (!list.length) return "";
    var phrases = list.map(function (f) { return featurePhrase(f, lang); });
    var text = join(phrases, lang);
    if (lang === "fr") {
      return pick([
        "L'équipement comprend : " + text + ".",
        "Parmi les équipements : " + text + ".",
        "Équipements notables : " + text + "."
      ], n);
    }
    return pick([
      "Equipment includes " + text + ".",
      "On the equipment list: " + text + ".",
      "It is equipped with " + text + "."
    ], n);
  }

  function seatsSentence(v, lang) {
    if (!v.seats || Number(v.seats) < 6) return "";
    return lang === "fr"
      ? "Il offre " + spell(v.seats, "fr") + " places."
      : "It seats " + spell(v.seats, "en") + ".";
  }

  /* ---------- assembly ---------- */

  /**
   * draft(vehicle, lang) → a string of paragraphs separated by blank lines,
   * which is exactly the shape the description field and the vehicle page use.
   * notes.ownership and notes.work are the owner's own words and are passed
   * through untouched in both languages, because translating a claim about a
   * specific car is not something this file should be doing on its own.
   */
  function draft(v, lang, notes) {
    var n = seed(v);
    notes = notes || {};
    var fr = lang === "fr";

    var first = [
      fr ? openingFr(v, n) : openingEn(v, n),
      fr ? mechanicalFr(v) : mechanicalEn(v),
      seatsSentence(v, lang)
    ].filter(Boolean).join(" ");

    var second = [
      fr ? colourFrSentence(v) : colourEn(v),
      featuresSentence(v, lang, n)
    ].filter(Boolean).join(" ");

    var owner = [];
    var own = OWNERSHIP[notes.ownership];
    if (own) owner.push(fr ? own.fr : own.en);
    if (notes.work && String(notes.work).trim()) owner.push(String(notes.work).trim().replace(/\.?$/, "."));
    var third = owner.join(" ");

    /* The owner's own paragraphs sit after the facts and before the invitation
       to come and see it, which is where a person telling you about a car would
       put them. They are passed through exactly as written. */
    var own = String(notes.own || "").trim();

    return [first, second, third, own, pick(CLOSERS[fr ? "fr" : "en"], n)]
      .filter(Boolean).join("\n\n");
  }

  /* ---------- what the pages actually print ---------- */

  /* "auto" unless told otherwise. A vehicle carrying description text but no
     mode predates the template and is left exactly as it was written. */
  function mode(v) {
    if (v.descMode === "manual" || v.descMode === "auto") return v.descMode;
    return String(v.desc || "").trim() ? "manual" : "auto";
  }

  function split(text) {
    if (Array.isArray(text)) return text.filter(Boolean);
    return String(text || "").split(/\n\s*\n/)
      .map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* Old hand-written descriptions may contain casing or multi-choice trim
     values saved before the current guardrails existed. Correct those facts
     for public display without rewriting the admin-controlled source text. */
  function publicFactText(text, v) {
    var out = String(text || "");
    [
      [v.make, displayMake(v.make)],
      [v.model, displayModel(v.model)],
      [v.trim, displayTrim(v.trim)]
    ].forEach(function (pair) {
      var raw = String(pair[0] || "").trim();
      var shown = String(pair[1] || "").trim();
      if (!raw) return;
      out = out.replace(new RegExp(escapeRegExp(raw), "gi"), shown);
    });
    return out.replace(/[ \t]{2,}/g, " ").trim();
  }

  /**
   * The description for one vehicle in one language, as paragraphs.
   * Used by the admin preview, by the pre-rendered page, by the script that
   * hydrates it and by the social captions - one function, so all four agree.
   */
  function paragraphs(v, lang) {
    if (mode(v) === "manual") {
      return split(lang === "fr" ? (v.descFr || v.desc) : v.desc)
        .map(function (p) { return publicFactText(p, v); });
    }
    return split(draft(v, lang, {
      ownership: v.draftNotes && v.draftNotes.ownership,
      work: v.draftNotes && v.draftNotes.work,
      own: lang === "fr" ? v.descNoteFr : v.descNote
    }));
  }

  function text(v, lang) {
    return paragraphs(v, lang).join("\n\n");
  }

  return {
    draft: draft, paragraphs: paragraphs, text: text, mode: mode,
    BODY: BODY, DRIVE: DRIVE, OWNERSHIP: OWNERSHIP,
    colourFr: colourFr, featurePhrase: featurePhrase, seed: seed
  };
});
