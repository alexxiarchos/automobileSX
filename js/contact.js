/* Automobile SX — contact page: validated form (simulated submit), map, FAQ */
(function () {
  "use strict";

  SXUI.init("contact");

  /* Hours + map */
  document.getElementById("contact-hours").innerHTML = "<tbody>" + SX.dealer.hours.map(function (h) {
    return "<tr" + (h.open ? "" : ' class="closed"') + "><td>" + h.day + "</td><td>" +
      (h.open ? h.open + " – " + h.close : "Closed") + "</td></tr>";
  }).join("") + "</tbody>";
  document.getElementById("contact-map").innerHTML = SXUI.mapSVG();

  /* Vehicle dropdown */
  var vehicleSel = document.getElementById("c-vehicle");
  vehicleSel.innerHTML = SX.vehicles.map(function (v) {
    return '<option value="' + v.id + '">' + SX.vehicleTitle(v) + " " + v.trim + " — " + SX.money(v.price) + "</option>";
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
        "Hi — I'd like to " + (interestSel.value === "test-drive" ? "book a test drive in" : "ask about") +
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
    /* Simulated submission — no backend */
    var name = fields.name.el.value.trim().split(/\s+/)[0];
    document.getElementById("success-detail").innerHTML =
      "Thanks, " + name + " — we’ll get back to you at <strong>" + fields.email.el.value.trim() +
      "</strong> within one business day. If it’s urgent, call <a href=\"tel:+14165550184\" class=\"text-link\">(416) 555-0184</a>. (Demo only; no message was actually sent.)";
    form.hidden = true;
    var success = document.getElementById("form-success");
    success.style.display = "block";
    success.focus();
  });

  /* ---------- FAQ accordion ---------- */
  var faqs = [
    ["Do you offer financing?", "Yes. We work with a dozen Canadian lenders and can usually get an answer the same day, for good credit, new credit, and bruised credit alike. You'll see the real rate and the real payment before you sign anything. Bring a driver's licence and proof of income to speed things up."],
    ["Can I trade in my car?", "Yes — and it usually saves you tax. In Ontario, HST on your next vehicle is charged on the price after your trade-in is deducted. We'll give you a written offer that's good for 7 days, with no obligation to buy from us."],
    ["Do you deliver?", "We offer free delivery within 50 km of the lot, anywhere in the GTA. Beyond that, we charge a flat fee based on distance — ask us for a quote. You can also complete almost all paperwork before pickup so the handover takes 20 minutes."],
    ["What's your return policy?", "Every vehicle comes with a 7-day / 500 km return policy. If it's not right for you, bring it back in the condition you bought it and we'll unwind the deal. Safety certification and a free Carfax report are included with every car."],
    ["Do I need an appointment?", "No — walk-ins are welcome any time we're open, Monday to Saturday. That said, booking a test drive ahead means the car is fuelled, warmed up, and parked out front when you arrive."]
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
})();
