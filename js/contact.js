/* Automobile SX — contact page: validated form (simulated submit), map, FAQ */
SX.ready.then(function () {
  "use strict";

  SXUI.init("contact");

  /* Hours + map */
  document.getElementById("contact-hours").innerHTML = "<tbody>" + SX.dealer.hours.map(function (h) {
    return "<tr" + (h.open ? "" : ' class="closed"') + "><td>" + h.day + "</td><td>" +
      (h.open ? h.open + " – " + h.close : "Closed") + "</td></tr>";
  }).join("") + "</tbody>";
  document.getElementById("contact-appt-note").textContent = SX.dealer.apptNote[SX.lang];
  document.getElementById("contact-map").innerHTML = SXUI.mapSVG();

  /* Vehicle dropdown */
  var vehicleSel = document.getElementById("c-vehicle");
  vehicleSel.innerHTML = SX.vehicles.map(function (v) {
    return '<option value="' + v.id + '">' + SX.vehicleTitle(v) + " " + v.trim + " · " + SX.money(v.price) + "</option>";
  }).join("");

  var interestSel = document.getElementById("c-interest");
  var rowVehicle = document.getElementById("row-vehicle");
  function syncVehicleRow() {
    var show = interestSel.value === "vehicle" || interestSel.value === "test-drive";
    rowVehicle.hidden = !show;
  }
  interestSel.addEventListener("change", syncVehicleRow);

  /* Pre-fill from query string (rail buttons, header CTA) */
  (function seed() {
    var p = new URLSearchParams(location.search);
    var interest = p.get("interest");
    if (interest && interestSel.querySelector('option[value="' + interest + '"]')) interestSel.value = interest;
    var veh = p.get("vehicle");
    if (veh && vehicleSel.querySelector('option[value="' + veh + '"]')) vehicleSel.value = veh;
    syncVehicleRow();
    if (veh) {
      var v = SX.getVehicle(veh);
      if (v) document.getElementById("c-message").value =
        "Hi, I'd like to " + (interestSel.value === "test-drive" ? "book a test drive in" : "ask about") +
        " the " + SX.vehicleTitle(v) + " " + v.trim + " (stock " + v.stock + ").";
    }
  })();

  /* ---------- Validation ---------- */
  var form = document.getElementById("contact-form");
  var submit = document.getElementById("c-submit");

  var fields = {
    name: {
      el: document.getElementById("c-name"), row: document.getElementById("row-name"),
      valid: function (v) { return v.trim().length >= 2; }
    },
    email: {
      el: document.getElementById("c-email"), row: document.getElementById("row-email"),
      valid: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
    },
    phone: {
      el: document.getElementById("c-phone"), row: document.getElementById("row-phone"),
      valid: function (v) { return v.replace(/\D/g, "").length >= 10; }
    },
    message: {
      el: document.getElementById("c-message"), row: document.getElementById("row-message"),
      valid: function (v) { return v.trim().length >= 10; }
    }
  };

  function fieldOK(f) { return f.valid(f.el.value); }
  function allOK() {
    return Object.keys(fields).every(function (k) { return fieldOK(fields[k]); });
  }
  function refreshSubmit() { submit.disabled = !allOK(); }

  Object.keys(fields).forEach(function (k) {
    var f = fields[k];
    /* validate on blur, clear error as user fixes it */
    f.el.addEventListener("blur", function () {
      var ok = fieldOK(f);
      f.row.classList.toggle("invalid", !ok);
      f.el.setAttribute("aria-invalid", String(!ok));
      refreshSubmit();
    });
    f.el.addEventListener("input", function () {
      if (f.row.classList.contains("invalid") && fieldOK(f)) {
        f.row.classList.remove("invalid");
        f.el.setAttribute("aria-invalid", "false");
      }
      refreshSubmit();
    });
  });
  refreshSubmit();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!allOK()) return;
    /* No backend by design: compose the email in the visitor's own mail app */
    var interestLabel = interestSel.options[interestSel.selectedIndex].text;
    var lines = [
      "Name: " + fields.name.el.value.trim(),
      "Phone: " + fields.phone.el.value.trim(),
      "Email: " + fields.email.el.value.trim(),
      "Interested in: " + interestLabel
    ];
    if (!rowVehicle.hidden && vehicleSel.value) {
      lines.push("Vehicle: " + vehicleSel.options[vehicleSel.selectedIndex].text);
    }
    lines.push("", fields.message.el.value.trim());
    var subject = "Website inquiry: " + interestLabel;
    location.href = "mailto:" + SX.dealer.email +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
    form.hidden = true;
    var success = document.getElementById("form-success");
    success.style.display = "block";
    success.focus();
  });

  /* ---------- FAQ accordion ---------- */
  var faqs = [
    ["Do you offer financing?", "Yes. We work with a dozen Canadian lenders and can usually get an answer the same day, for good credit, new credit, and bruised credit alike. You'll see the real rate and the real payment before you sign anything. Bring a driver's licence and proof of income to speed things up."],
    ["Can I trade in my car?", "Yes, and it usually saves you tax. In Quebec, sales tax on your next vehicle is calculated on the price after your trade-in is deducted. You get a written offer with no obligation to buy from us."],
    ["Do you deliver?", "We offer free delivery within 50 km of the lot, anywhere in the Montreal area. Beyond that, we charge a flat fee based on distance; ask us for a quote. You can also complete almost all paperwork before pickup so the handover takes 20 minutes."],
    ["Can I reserve a vehicle?", "Yes, we are open to reservations. Call 514-824-9117 or send the form above and we'll hold the vehicle while you arrange financing or an inspection visit."],
    ["Do I need an appointment?", "Yes, visits are by appointment, and we are open 10:00 to 18:00 every day, so there is always a slot that works. Call 514-824-9117 or use the form above, and the car will be fuelled, warmed up, and parked out front when you arrive."]
  ];
  document.getElementById("faq-list").innerHTML = faqs.map(function (f, i) {
    return '<div class="faq-item">' +
      '<h3 style="margin:0"><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-' + i + '">' + f[0] + "</button></h3>" +
      '<div class="faq-a" id="faq-a-' + i + '"><p style="margin:0">' + f[1] + "</p></div></div>";
  }).join("");

  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
});
