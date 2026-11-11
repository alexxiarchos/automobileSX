/* Public inventory status rules shared by Node and the browser. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SX_INVENTORY_RULES = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function isActive(v) {
    return Boolean(v && v.id && (v.status == null || v.status === "" || v.status === "available"));
  }

  function isPublic(v) {
    return isActive(v) || Boolean(v && v.id && v.status === "sold");
  }

  function validate(data) {
    if (!data || !Array.isArray(data.vehicles)) {
      throw new Error("Inventory response is missing the vehicles array");
    }
    var ids = new Set();
    data.vehicles.forEach(function (v) {
      if (!v || typeof v.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(v.id) || ids.has(v.id)) {
        throw new Error("Inventory contains a missing, invalid or duplicate vehicle ID");
      }
      ids.add(v.id);
    });
    return data;
  }

  return { isActive: isActive, isPublic: isPublic, validate: validate };
});
