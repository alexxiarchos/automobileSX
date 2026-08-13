/* Automobile SX - the Quebec OPC label.

   This is the prescribed half of the window sheet: the warranty category, what
   the car was used for before, who owned it, repairs since acquisition, and the
   line the buyer signs. It is a legal disclosure, not advertising copy, and it
   is kept in its own module for the same reason the feature catalogue is: the
   admin panel, the printed sheet and anything built later must never hold two
   different opinions about what a class C car is.

   THE CATEGORIES CHANGED ON 5 APRIL 2024. The thresholds below are the current
   ones, taken from the Office de la protection du consommateur:

     A   4 years or less  and  80 000 km or less   6 months or 10 000 km
     B   5 years or less  and 100 000 km or less   3 months or  5 000 km
     C   7 years or less  and 120 000 km or less   1 month  or  1 700 km
     D   more than 7 years or more than 120 000 km  no warranty of good working order

   The previous rule was 2/3/5 years and 40/60/80 thousand kilometres. Anything
   written against the old numbers is wrong, and wrong here is the kind of wrong
   that ends up on a document with a signature under it.

   Two cautions that belong in the file rather than in a chat message:

   1. The Act counts the age from the vehicle's mise en marche. This module
      counts from the model year, which is the only date a listing actually
      holds. For most cars the two agree; near a boundary they may not, which is
      exactly why classify() is a SUGGESTION and the admin lets it be overridden.
      The class that gets printed is the one a human confirmed.

   2. The garantie de bon fonctionnement (article 159) is not the garantie
      legale de qualite (articles 37 and 38). A class D car still carries the
      second one. That is why the label can read "Classe D" and "Garantie
      legale: Oui" on the same card without contradicting itself. */

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SX_OPC = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Ordered widest-warranty first. classify() returns the first one the vehicle
     satisfies on BOTH counts, which is how the Act reads: a two year old car
     with 130 000 km on it is class D, not class A. */
  var CLASSES = [
    { code: "A", maxAge: 4, maxKm: 80000,  months: 6, km: 10000 },
    { code: "B", maxAge: 5, maxKm: 100000, months: 3, km: 5000 },
    { code: "C", maxAge: 7, maxKm: 120000, months: 1, km: 1700 }
  ];

  function classify(year, km, today) {
    var y = Number(year);
    var k = Number(km);
    if (!y || !isFinite(y)) return "";           /* not enough to say anything */
    if (km === "" || km === null || km === undefined || !isFinite(k)) return "";
    var now = today ? new Date(today) : new Date();
    var age = now.getFullYear() - y;
    for (var i = 0; i < CLASSES.length; i++) {
      if (age <= CLASSES[i].maxAge && k <= CLASSES[i].maxKm) return CLASSES[i].code;
    }
    return "D";
  }

  function terms(code) {
    for (var i = 0; i < CLASSES.length; i++) if (CLASSES[i].code === code) return CLASSES[i];
    return null;
  }

  /* What the car was used for before. The Act names these specifically, so they
     are a closed list rather than a free text box: a dealer who types
     "ex-taxi" into a box has still not made the prescribed disclosure.

     A passenger vehicle is the default, and there is no "not stated" option,
     because "not stated" is not a disclosure. Almost every car on the lot was
     somebody's own car; the ones that were not are the whole point of the
     field, and those get picked deliberately. A listing saved before this
     field existed resolves to the default too, which is the honest reading of
     a blank on a car that was never a taxi. */
  var DEFAULT_PRIOR_USE = "personal";

  var PRIOR_USE = [
    { key: "personal", en: "Passenger vehicle", fr: "Véhicule de promenade" },
    { key: "taxi", en: "Paid passenger transport (taxi)", fr: "Transport rémunéré de personnes (taxi)" },
    { key: "driving-school", en: "Driving school vehicle", fr: "Véhicule d'école de conduite" },
    { key: "police", en: "Police vehicle", fr: "Véhicule de police" },
    { key: "ambulance", en: "Ambulance", fr: "Ambulance" },
    { key: "rental", en: "Rental vehicle", fr: "Véhicule de location" },
    { key: "demo", en: "Demonstrator", fr: "Véhicule de démonstration" }
  ];

  function priorUse(key, lang) {
    var k = key || DEFAULT_PRIOR_USE;
    for (var i = 0; i < PRIOR_USE.length; i++) {
      if (PRIOR_USE[i].key === k) return lang === "fr" ? PRIOR_USE[i].fr : PRIOR_USE[i].en;
    }
    /* An unrecognised key is a typo or a value from a newer version of this
       file. Falling back to the default beats printing the raw key on a legal
       document, and beats printing nothing where a disclosure belongs. */
    return lang === "fr" ? PRIOR_USE[0].fr : PRIOR_USE[0].en;
  }

  var T = {
    en: {
      warranty: "Warranty",
      working: "Of good working order",
      legal: "Legal warranty",
      extended: "Additional",
      powertrain: "Powertrain",
      manufacturer: "Manufacturer",
      classLabel: "Class",
      none: "None",
      yes: "Yes",
      no: "No",
      onRequest: "On request",
      usedAs: "This vehicle was previously used as:",
      priorOwner: "Previous owner:",
      lastOwner: "Name and telephone of last owner:",
      tel: "Tel:",
      remark: "Remark",
      repairs: "Repairs",
      acceptance: "Acceptance",
      received: "I acknowledge having received a copy of the label.",
      date: "Date:",
      signature: "Signature:"
    },
    fr: {
      warranty: "Garantie",
      working: "De bon fonctionnement",
      legal: "Garantie légale",
      extended: "Supplémentaire",
      powertrain: "Motopropulseur",
      manufacturer: "Manufacturier",
      classLabel: "Classe",
      none: "Aucune",
      yes: "Oui",
      no: "Non",
      onRequest: "Sur demande",
      usedAs: "Ce véhicule a été utilisé auparavant comme :",
      priorOwner: "Propriétaire antérieur :",
      lastOwner: "Nom et tél. dernier propriétaire :",
      tel: "Tél :",
      remark: "Remarque",
      repairs: "Réparations",
      acceptance: "Acceptation",
      received: "Je reconnais avoir reçu une copie de l'étiquette.",
      date: "Date :",
      signature: "Signature :"
    }
  };

  /* The statutory footnote. Class D gets the sentence that says there is no
     warranty of good working order rather than a sentence quoting a duration
     that does not exist, because printing a duration next to "Classe D" is how
     a label ends up promising something nobody meant to promise. */
  function statute(code, lang) {
    var t = terms(code);
    if (lang === "fr") {
      var head = "Selon les articles 159 et 160 de la Loi sur la protection du consommateur " +
        "(1978, c.9), cette automobile fait partie de la catégorie ci-dessous et ";
      if (!t) {
        return head + "ne comporte aucune garantie de bon fonctionnement en fonction du temps " +
          "ou du kilométrage. En vertu de la Loi sur la protection du consommateur (art. 159, 160).";
      }
      return head + "comporte une garantie de bon fonctionnement de " + t.months +
        (t.months > 1 ? " mois" : " mois") + " ou " + fmt(t.km, "fr") +
        " kilomètres, selon le premier terme atteint. En vertu de la Loi sur la " +
        "protection du consommateur (art. 159, 160).";
    }
    var headEn = "Under sections 159 and 160 of the Consumer Protection Act (1978, c.9), " +
      "this automobile belongs to the category shown and carries ";
    if (!t) {
      return headEn + "no warranty of good working order based on time or mileage. " +
        "Under the Consumer Protection Act (ss. 159, 160).";
    }
    return headEn + "a warranty of good working order of " + t.months +
      (t.months > 1 ? " months" : " month") + " or " + fmt(t.km, "en") +
      " kilometres, whichever comes first. Under the Consumer Protection Act (ss. 159, 160).";
  }

  function fmt(n, lang) {
    return Number(n).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");
  }

  return {
    CLASSES: CLASSES, PRIOR_USE: PRIOR_USE, T: T,
    DEFAULT_PRIOR_USE: DEFAULT_PRIOR_USE,
    classify: classify, terms: terms, priorUse: priorUse, statute: statute
  };
});
