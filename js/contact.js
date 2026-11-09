/* Automobile SX - contact form */
SX.ready.then(function () {
  "use strict";

  var FR = SX.lang === "fr";

  /* Hours + map */
  var hours = document.getElementById("contact-hours");
  if (hours) {
    hours.innerHTML = "<tbody>" + SX.dealer.hours.map(function (h) {
      return "<tr><td>" + (FR ? h.fr : h.day) + "</td><td>" + h.open + " - " + h.close + "</td></tr>";
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
  function vehicleName(v) {
    return [SX.vehicleTitle(v), SX.displayTrim(v)].filter(Boolean).join(" ");
  }
  vehicleSel.innerHTML = SX.vehicles.map(function (v) {
    return '<option value="' + v.id + '">' + vehicleName(v) + " · " + SX.money(v.price) + "</option>";
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
            " la " + vehicleName(v) + (v.stock ? " (stock " + v.stock + ")" : "") + "."
          : "Hi, I'd like to " + (interestSel.value === "test-drive" ? "book a test drive in" : "ask about") +
            " the " + vehicleName(v) + (v.stock ? " (stock " + v.stock + ")" : "") + ".";
      }
    }
  })();

  /* Validation */
  var submit = document.getElementById("c-submit");
  var submitLabel = submit.textContent;
  var errorBox = document.getElementById("form-error");
  var preferredSel = document.getElementById("c-preferred");
  var submissionId = (window.crypto && typeof window.crypto.randomUUID === "function")
    ? window.crypto.randomUUID()
    : Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  var fields = {
    name: { el: document.getElementById("c-name"), row: document.getElementById("row-name"),
      valid: function (v) { return v.trim().length >= 2; } },
    email: { el: document.getElementById("c-email"), row: document.getElementById("row-email"),
      valid: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
    phone: { el: document.getElementById("c-phone"), row: document.getElementById("row-phone"),
      valid: function (v) { return !v.trim() || v.replace(/\D/g, "").length >= 10; } },
    message: { el: document.getElementById("c-message"), row: document.getElementById("row-message"),
      valid: function (v) { return v.trim().length >= 10; } }
  };

  function contactOK() {
    var email = fields.email.el.value.trim();
    var phone = fields.phone.el.value.trim();
    if (!fields.email.valid(email) || !fields.phone.valid(phone) || (!email && !phone)) return false;
    if (preferredSel.value === "email" && !email) return false;
    if ((preferredSel.value === "call" || preferredSel.value === "text") && !phone) return false;
    return true;
  }

  function fieldOK(key) {
    var f = fields[key];
    if (!f.valid(f.el.value)) return false;
    if (key === "email" || key === "phone") return contactOK();
    return true;
  }

  function allOK() {
    return fields.name.valid(fields.name.el.value) && fields.message.valid(fields.message.el.value) && contactOK();
  }
  function refresh() { submit.disabled = !allOK(); }

  Object.keys(fields).forEach(function (k) {
    var f = fields[k];
    f.el.addEventListener("blur", function () {
      var ok = fieldOK(k);
      f.row.classList.toggle("invalid", !ok);
      f.el.setAttribute("aria-invalid", String(!ok));
      refresh();
    });
    f.el.addEventListener("input", function () {
      ["email", "phone"].forEach(function (contactKey) {
        var contactField = fields[contactKey];
        if (contactField.row.classList.contains("invalid") && fieldOK(contactKey)) {
          contactField.row.classList.remove("invalid");
          contactField.el.setAttribute("aria-invalid", "false");
        }
      });
      if (f.row.classList.contains("invalid") && fieldOK(k)) {
        f.row.classList.remove("invalid");
        f.el.setAttribute("aria-invalid", "false");
      }
      refresh();
    });
  });
  preferredSel.addEventListener("change", function () {
    ["email", "phone"].forEach(function (key) {
      fields[key].row.classList.remove("invalid");
      fields[key].el.setAttribute("aria-invalid", "false");
    });
    refresh();
  });
  refresh();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!allOK()) return;
    var vehicleId = "";
    var vehicleLabel = "";
    if (document.body.contains(rowVehicle) && !rowVehicle.hidden && vehicleSel.value) {
      vehicleId = vehicleSel.value;
      vehicleLabel = vehicleSel.options[vehicleSel.selectedIndex].text;
    }
    errorBox.hidden = true;
    submit.disabled = true;
    submit.textContent = submit.getAttribute("data-sending") || (FR ? "Envoi…" : "Sending…");
    form.setAttribute("aria-busy", "true");
    try {
      var response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.el.value.trim(),
          email: fields.email.el.value.trim(),
          phone: fields.phone.el.value.trim(),
          preferred: preferredSel.value,
          message: fields.message.el.value.trim(),
          interest: interestSel.value,
          vehicleId: vehicleId,
          vehicleLabel: vehicleLabel,
          lang: FR ? "fr" : "en",
          website: document.getElementById("c-website").value,
          submissionId: submissionId
        })
      });
      if (!response.ok) throw new Error("Contact request failed");
      form.hidden = true;
      var success = document.getElementById("form-success");
      success.style.display = "block";
      success.focus();
    } catch (error) {
      errorBox.hidden = false;
      errorBox.focus();
      submit.textContent = submitLabel;
      refresh();
    } finally {
      form.removeAttribute("aria-busy");
    }
  });
});
