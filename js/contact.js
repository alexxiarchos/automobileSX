/* Automobile SX — contact form (opens the visitor's mail app; no backend) */
SX.ready.then(function () {
  "use strict";

  var FR = SX.lang === "fr";

  /* Hours + map */
  var hours = document.getElementById("contact-hours");
  if (hours) {
    hours.innerHTML = "<tbody>" + SX.dealer.hours.map(function (h) {
      return "<tr><td>" + (FR ? h.fr : h.day) + "</td><td>" + h.open + " – " + h.close + "</td></tr>";
    }).join("") + "</tbody>";
  }
  var note = document.getElementById("contact-appt-note");
  if (note) note.textContent = SX.dealer.apptNote[SX.lang];
  SXUI.mapBlock(document.getElementById("contact-map"));

  var form = document.getElementById("contact-form");
  if (!form) return;

  /* Vehicle dropdown */
  var vehicleSel = document.getElementById("c-vehicle");
  var rowVehicle = document.getElementById("row-vehicle");
  vehicleSel.innerHTML = SX.vehicles.map(function (v) {
    return '<option value="' + v.id + '">' + SX.vehicleTitle(v) + " " + (v.trim || "") + " · " + SX.money(v.price) + "</option>";
  }).join("");
  if (!SX.vehicles.length) rowVehicle.remove();

  var interestSel = document.getElementById("c-interest");
  function syncVehicleRow() {
    if (!document.body.contains(rowVehicle)) return;
    rowVehicle.hidden = !(interestSel.value === "vehicle" || interestSel.value === "test-drive");
  }
  interestSel.addEventListener("change", syncVehicleRow);

  (function seed() {
    var p = new URLSearchParams(location.search);
    var interest = p.get("interest");
    if (interest && interestSel.querySelector('option[value="' + interest + '"]')) interestSel.value = interest;
    var veh = p.get("vehicle");
    if (veh && vehicleSel.querySelector('option[value="' + veh + '"]')) vehicleSel.value = veh;
    syncVehicleRow();
    if (veh) {
      var v = SX.getVehicle(veh);
      if (v) {
        document.getElementById("c-message").value = FR
          ? "Bonjour, je souhaite " + (interestSel.value === "test-drive" ? "réserver un essai routier pour" : "avoir plus d'information sur") +
            " la " + SX.vehicleTitle(v) + " " + (v.trim || "") + (v.stock ? " (stock " + v.stock + ")" : "") + "."
          : "Hi, I'd like to " + (interestSel.value === "test-drive" ? "book a test drive in" : "ask about") +
            " the " + SX.vehicleTitle(v) + " " + (v.trim || "") + (v.stock ? " (stock " + v.stock + ")" : "") + ".";
      }
    }
  })();

  /* Validation */
  var submit = document.getElementById("c-submit");
  var fields = {
    name: { el: document.getElementById("c-name"), row: document.getElementById("row-name"),
      valid: function (v) { return v.trim().length >= 2; } },
    email: { el: document.getElementById("c-email"), row: document.getElementById("row-email"),
      valid: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
    phone: { el: document.getElementById("c-phone"), row: document.getElementById("row-phone"),
      valid: function (v) { return v.replace(/\D/g, "").length >= 10; } },
    message: { el: document.getElementById("c-message"), row: document.getElementById("row-message"),
      valid: function (v) { return v.trim().length >= 10; } }
  };

  function allOK() { return Object.keys(fields).every(function (k) { return fields[k].valid(fields[k].el.value); }); }
  function refresh() { submit.disabled = !allOK(); }

  Object.keys(fields).forEach(function (k) {
    var f = fields[k];
    f.el.addEventListener("blur", function () {
      var ok = f.valid(f.el.value);
      f.row.classList.toggle("invalid", !ok);
      f.el.setAttribute("aria-invalid", String(!ok));
      refresh();
    });
    f.el.addEventListener("input", function () {
      if (f.row.classList.contains("invalid") && f.valid(f.el.value)) {
        f.row.classList.remove("invalid");
        f.el.setAttribute("aria-invalid", "false");
      }
      refresh();
    });
  });
  refresh();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!allOK()) return;
    var interestLabel = interestSel.options[interestSel.selectedIndex].text;
    var lines = [
      (FR ? "Nom : " : "Name: ") + fields.name.el.value.trim(),
      (FR ? "Téléphone : " : "Phone: ") + fields.phone.el.value.trim(),
      (FR ? "Courriel : " : "Email: ") + fields.email.el.value.trim(),
      (FR ? "Sujet : " : "Interested in: ") + interestLabel
    ];
    if (document.body.contains(rowVehicle) && !rowVehicle.hidden && vehicleSel.value) {
      lines.push((FR ? "Véhicule : " : "Vehicle: ") + vehicleSel.options[vehicleSel.selectedIndex].text);
    }
    lines.push("", fields.message.el.value.trim());
    location.href = "mailto:" + SX.dealer.email +
      "?subject=" + encodeURIComponent((FR ? "Demande du site web : " : "Website inquiry: ") + interestLabel) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    form.hidden = true;
    var success = document.getElementById("form-success");
    success.style.display = "block";
    success.focus();
  });
});
