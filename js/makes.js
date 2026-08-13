/* Automobile SX - make and model spelling.

   Shared by the admin panel (which tidies what is typed by hand) and by
   api/_lib/vin.js (which tidies what the VIN database returns in block
   capitals). One copy, so "BMW" cannot end up as "BMW" in one place and "Bmw"
   in the other - which is exactly what happened before this file existed.

   The make list doubles as the autocomplete in the admin form. */

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SX_MAKES = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Every make whose correct spelling is not simply title case. */
  var CASING = {
    BMW: "BMW", GMC: "GMC", RAM: "RAM", MINI: "MINI", KIA: "Kia", FIAT: "Fiat",
    "MERCEDES-BENZ": "Mercedes-Benz", VOLKSWAGEN: "Volkswagen", CHEVROLET: "Chevrolet",
    "LAND ROVER": "Land Rover", "ALFA ROMEO": "Alfa Romeo", "ASTON MARTIN": "Aston Martin",
    MAZDA: "Mazda", SUBARU: "Subaru", TOYOTA: "Toyota", HONDA: "Honda", NISSAN: "Nissan",
    HYUNDAI: "Hyundai", AUDI: "Audi", VOLVO: "Volvo", LEXUS: "Lexus", ACURA: "Acura",
    INFINITI: "Infiniti", JEEP: "Jeep", DODGE: "Dodge", CHRYSLER: "Chrysler", FORD: "Ford",
    BUICK: "Buick", CADILLAC: "Cadillac", LINCOLN: "Lincoln", PORSCHE: "Porsche",
    JAGUAR: "Jaguar", TESLA: "Tesla", MITSUBISHI: "Mitsubishi", GENESIS: "Genesis"
  };

  /* Offered in the admin form's autocomplete, most common first. */
  var LIST = [
    "Toyota", "Honda", "Ford", "Chevrolet", "Mazda", "Subaru", "Hyundai", "Nissan",
    "BMW", "Jeep", "Kia", "Volkswagen", "Mercedes-Benz", "Audi", "Dodge", "RAM",
    "GMC", "Lexus", "Acura", "Mitsubishi", "Volvo", "Infiniti", "Chrysler", "Buick",
    "Cadillac", "Lincoln", "MINI", "Fiat", "Land Rover", "Porsche", "Jaguar",
    "Tesla", "Genesis", "Alfa Romeo"
  ];

  function fixMake(raw) {
    if (!raw) return "";
    var up = String(raw).trim().toUpperCase();
    if (CASING[up]) return CASING[up];
    /* Unknown make: title case each word, which is right far more often than not */
    return up.toLowerCase().replace(/(^|[\s-])(\w)/g, function (m, sep, ch) {
      return sep + ch.toUpperCase();
    });
  }

  /* Model names that are initialisms and have no digits to give them away. */
  var MODEL_CAPS = [
    "CR-V", "HR-V", "BR-V", "NSX", "RDX", "MDX", "TLX", "ILX", "RLX", "TSX",
    "WRX", "STI", "GTI", "GLI", "TDI", "GLC", "GLE", "GLA", "GLB", "GLS",
    "CLA", "CLS", "EQB", "EQE", "EQS", "XT4", "XT5", "XT6", "SQ5", "TT"
  ];
  var MODEL_BY_LOWER = {};
  MODEL_CAPS.forEach(function (m) { MODEL_BY_LOWER[m.toLowerCase()] = m; });

  /**
   * Tidy a hand-typed model name, but only where we are certain.
   *
   *   "xc60"  → "XC60"     a word with both letters and digits is an
   *   "rav4"  → "RAV4"     alphanumeric code, and those are always capitals
   *   "crv"   → "CR-V"     only via the list above
   *   "Mach-E"→ "Mach-E"   left exactly as typed
   *
   * Anything not covered is returned untouched. Guessing at a model name the
   * owner has already written out is how you turn "Mach-E" into "Mach-e".
   */
  function fixModel(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    return s.split(/(\s+)/).map(function (word) {
      if (/^\s+$/.test(word)) return word;
      var known = MODEL_BY_LOWER[word.toLowerCase()];
      if (known) return known;
      var hasLetter = /[A-Za-z]/.test(word);
      var hasDigit = /[0-9]/.test(word);
      if (hasLetter && hasDigit) return word.toUpperCase();
      return word;
    }).join("");
  }

  return { CASING: CASING, LIST: LIST, MODEL_CAPS: MODEL_CAPS, fixMake: fixMake, fixModel: fixModel };
});
