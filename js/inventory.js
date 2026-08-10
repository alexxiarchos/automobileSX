/* Automobile SX — inventory listing: client-side filtering, sorting, paging */
SX.ready.then(function () {
  "use strict";

  var PAGE_SIZE = 12;
  var shown = PAGE_SIZE;
  var hasStock = SX.vehicles.length > 0;

  var priceLo = Math.min.apply(null, SX.vehicles.map(function (v) { return v.price; }));
  var priceHi = Math.max.apply(null, SX.vehicles.map(function (v) { return v.price; }));
  var yearLo = Math.min.apply(null, SX.vehicles.map(function (v) { return v.year; }));
  var yearHi = Math.max.apply(null, SX.vehicles.map(function (v) { return v.year; }));
  var kmHi = Math.max.apply(null, SX.vehicles.map(function (v) { return v.km; }));

  if (!hasStock || !isFinite(priceLo)) {
    priceLo = 0; priceHi = 60000; yearLo = 2010; yearHi = new Date().getFullYear(); kmHi = 200000;
  }
  priceLo = Math.floor(priceLo / 1000) * 1000;
  priceHi = Math.ceil(priceHi / 1000) * 1000;
  kmHi = Math.max(10000, Math.ceil(kmHi / 5000) * 5000);
  if (priceHi <= priceLo) priceHi = priceLo + 1000;
  if (yearHi <= yearLo) yearHi = yearLo + 1;

  var state = {
    keyword: "", makes: new Set(), bodies: new Set(),
    priceMin: priceLo, priceMax: priceHi,
    yearMin: yearLo, yearMax: yearHi, kmMax: kmHi,
    trans: new Set(), fuel: new Set(), drive: new Set(),
    sort: "price-asc"
  };

  (function seed() {
    var p = new URLSearchParams(location.search);
    if (p.get("make")) state.makes.add(p.get("make"));
    if (p.get("body")) state.bodies.add(p.get("body"));
    if (p.get("model")) state.keyword = p.get("model");
    if (p.get("maxPrice")) state.priceMax = Math.min(Number(p.get("maxPrice")), priceHi);
  })();

  function uniq(fn) { return Array.from(new Set(SX.vehicles.map(fn))).filter(Boolean).sort(); }

  function checkGroup(containerId, values, set, valueOf, labelOf) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = values.map(function (val) {
      var count = SX.vehicles.filter(function (v) { return valueOf(v) === val; }).length;
      var id = containerId + "-" + String(val).replace(/[^a-z0-9]/gi, "");
      var label = labelOf ? labelOf(val) : val;
      return '<label for="' + id + '"><input type="checkbox" id="' + id + '" value="' + val + '"' +
        (set.has(val) ? " checked" : "") + ">" + label + '<span class="count">' + count + "</span></label>";
    }).join("");
    el.addEventListener("change", function (e) {
      if (e.target.type !== "checkbox") return;
      if (e.target.checked) set.add(e.target.value); else set.delete(e.target.value);
      apply();
    });
  }

  checkGroup("f-makes", uniq(function (v) { return v.make; }), state.makes, function (v) { return v.make; });
  checkGroup("f-bodies", SX.bodyTypes, state.bodies, function (v) { return v.body; }, SX.bodyLabel);
  checkGroup("f-trans", uniq(function (v) { return v.transmission; }), state.trans,
    function (v) { return v.transmission; }, function (val) { return SX.specLabel("transmission", val); });
  checkGroup("f-fuel", uniq(function (v) { return v.fuel; }), state.fuel,
    function (v) { return v.fuel; }, function (val) { return SX.specLabel("fuel", val); });
  checkGroup("f-drive", uniq(function (v) { return v.drivetrain; }), state.drive,
    function (v) { return v.drivetrain; }, function (val) { return SX.specLabel("drivetrain", val); });

  var kw = document.getElementById("f-keyword");
  kw.value = state.keyword;
  kw.addEventListener("input", function () { state.keyword = kw.value.trim(); apply(); });

  function dualRange(rangeId, minId, maxId, minValId, maxValId, lo, hi, step, getMin, getMax, setMin, setMax, fmt) {
    var minR = document.getElementById(minId), maxR = document.getElementById(maxId);
    var fill = document.getElementById(rangeId).querySelector(".track-fill");
    minR.min = maxR.min = lo; minR.max = maxR.max = hi; minR.step = maxR.step = step;
    function paint() {
      minR.value = getMin(); maxR.value = getMax();
      document.getElementById(minValId).textContent = fmt(getMin());
      document.getElementById(maxValId).textContent = fmt(getMax());
      var a = (getMin() - lo) / (hi - lo) * 100, b = (getMax() - lo) / (hi - lo) * 100;
      fill.style.left = a + "%"; fill.style.right = (100 - b) + "%";
    }
    minR.addEventListener("input", function () { setMin(Math.min(Number(minR.value), getMax() - step)); paint(); apply(); });
    maxR.addEventListener("input", function () { setMax(Math.max(Number(maxR.value), getMin() + step)); paint(); apply(); });
    paint();
    return paint;
  }

  var paintPrice = dualRange("f-price-range", "f-price-min", "f-price-max", "f-price-min-val", "f-price-max-val",
    priceLo, priceHi, 500,
    function () { return state.priceMin; }, function () { return state.priceMax; },
    function (v) { state.priceMin = v; }, function (v) { state.priceMax = v; }, SX.money);

  var paintYear = dualRange("f-year-range", "f-year-min", "f-year-max", "f-year-min-val", "f-year-max-val",
    yearLo, yearHi, 1,
    function () { return state.yearMin; }, function () { return state.yearMax; },
    function (v) { state.yearMin = v; }, function (v) { state.yearMax = v; }, String);

  var kmR = document.getElementById("f-km");
  kmR.min = 10000; kmR.max = kmHi; kmR.step = 5000; kmR.value = state.kmMax;
  function paintKm() {
    kmR.value = state.kmMax;
    document.getElementById("f-km-val").textContent = "≤ " + Number(state.kmMax).toLocaleString(SX.lang === "fr" ? "fr-CA" : "en-CA") + " km";
  }
  kmR.addEventListener("input", function () { state.kmMax = Number(kmR.value); paintKm(); apply(); });
  paintKm();

  var sortSel = document.getElementById("sort");
  sortSel.value = state.sort;
  sortSel.addEventListener("change", function () { state.sort = sortSel.value; apply(); });

  function matches(v) {
    if (state.keyword) {
      var hay = (v.year + " " + v.make + " " + v.model + " " + (v.trim || "") + " " + v.body + " " + (v.extColor || "")).toLowerCase();
      if (hay.indexOf(state.keyword.toLowerCase()) === -1) return false;
    }
    if (state.makes.size && !state.makes.has(v.make)) return false;
    if (state.bodies.size && !state.bodies.has(v.body)) return false;
    if (v.price < state.priceMin || v.price > state.priceMax) return false;
    if (v.year < state.yearMin || v.year > state.yearMax) return false;
    if (v.km > state.kmMax) return false;
    if (state.trans.size && !state.trans.has(v.transmission)) return false;
    if (state.fuel.size && !state.fuel.has(v.fuel)) return false;
    if (state.drive.size && !state.drive.has(v.drivetrain)) return false;
    return true;
  }

  function sorted(list) {
    var s = list.slice();
    switch (state.sort) {
      case "price-desc": s.sort(function (a, b) { return b.price - a.price; }); break;
      case "km-asc": s.sort(function (a, b) { return a.km - b.km; }); break;
      case "year-desc": s.sort(function (a, b) { return b.year - a.year || a.km - b.km; }); break;
      default: s.sort(function (a, b) { return a.price - b.price; });
    }
    return s;
  }

  function syncChecks(containerId, set) {
    var el = document.getElementById(containerId);
    if (el) el.querySelectorAll("input").forEach(function (cb) { cb.checked = set.has(cb.value); });
  }

  function chips() {
    var out = [];
    function chip(label, undo) { out.push({ label: label, undo: undo }); }
    if (state.keyword) chip("“" + state.keyword + "”", function () { state.keyword = ""; kw.value = ""; });
    state.makes.forEach(function (m) { chip(m, function () { state.makes.delete(m); syncChecks("f-makes", state.makes); }); });
    state.bodies.forEach(function (b) { chip(SX.bodyLabel(b), function () { state.bodies.delete(b); syncChecks("f-bodies", state.bodies); }); });
    if (state.priceMin > priceLo || state.priceMax < priceHi)
      chip(SX.money(state.priceMin) + " – " + SX.money(state.priceMax),
        function () { state.priceMin = priceLo; state.priceMax = priceHi; paintPrice(); });
    if (state.yearMin > yearLo || state.yearMax < yearHi)
      chip(state.yearMin + " – " + state.yearMax,
        function () { state.yearMin = yearLo; state.yearMax = yearHi; paintYear(); });
    if (state.kmMax < kmHi)
      chip("≤ " + state.kmMax.toLocaleString(SX.lang === "fr" ? "fr-CA" : "en-CA") + " km",
        function () { state.kmMax = kmHi; paintKm(); });
    state.trans.forEach(function (t) { chip(SX.specLabel("transmission", t), function () { state.trans.delete(t); syncChecks("f-trans", state.trans); }); });
    state.fuel.forEach(function (f) { chip(SX.specLabel("fuel", f), function () { state.fuel.delete(f); syncChecks("f-fuel", state.fuel); }); });
    state.drive.forEach(function (d) { chip(SX.specLabel("drivetrain", d), function () { state.drive.delete(d); syncChecks("f-drive", state.drive); }); });
    return out;
  }

  function resetAll() {
    state.keyword = ""; kw.value = "";
    state.makes.clear(); state.bodies.clear(); state.trans.clear(); state.fuel.clear(); state.drive.clear();
    ["f-makes", "f-bodies", "f-trans", "f-fuel", "f-drive"].forEach(function (id) { syncChecks(id, new Set()); });
    state.priceMin = priceLo; state.priceMax = priceHi; paintPrice();
    state.yearMin = yearLo; state.yearMax = yearHi; paintYear();
    state.kmMax = kmHi; paintKm();
    apply();
  }

  function apply(keepShown) {
    if (!keepShown) shown = PAGE_SIZE;
    var results = sorted(SX.vehicles.filter(matches));
    var total = SX.vehicles.length;
    var visible = Math.min(shown, results.length);

    document.getElementById("result-count").textContent =
      results.length === total
        ? SX.t("inv.showing", visible, total)
        : SX.t("inv.showingMatching", visible, results.length);

    var chipRow = document.getElementById("chip-row");
    var cs = chips();
    chipRow.innerHTML = "";
    cs.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "chip"; b.type = "button";
      b.innerHTML = c.label + ' <span class="x" aria-hidden="true">×</span>';
      b.addEventListener("click", function () { c.undo(); apply(); });
      chipRow.appendChild(b);
    });
    if (cs.length) {
      var clear = document.createElement("button");
      clear.className = "clear-all"; clear.type = "button"; clear.textContent = SX.t("inv.clearAll");
      clear.addEventListener("click", resetAll);
      chipRow.appendChild(clear);
    }

    var grid = document.getElementById("inventory-grid");
    grid.innerHTML = "";
    results.slice(0, shown).forEach(function (v) { grid.appendChild(SXUI.vehicleCard(v)); });

    var empty = document.getElementById("empty-state");
    empty.hidden = results.length !== 0;
    if (!hasStock) {
      empty.querySelector("h2").textContent = SX.t("inv.noStockTitle");
      empty.querySelector("p").innerHTML = SX.t("inv.noStockBody", '<a class="text-link" href="' + SX.dealer.phoneHref + '">' + SX.dealer.phone + "</a>");
      empty.querySelector("#empty-reset").style.display = "none";
    }

    var lm = document.getElementById("load-more");
    var remaining = results.length - shown;
    lm.style.display = remaining > 0 ? "" : "none";
    lm.textContent = SX.t("inv.loadMoreCount", remaining > 0 ? remaining : 0);
  }

  document.getElementById("load-more").addEventListener("click", function () { shown += PAGE_SIZE; apply(true); });
  document.getElementById("empty-reset").addEventListener("click", resetAll);

  /* Mobile filter drawer */
  var sidebar = document.getElementById("filter-sidebar");
  var overlay = document.getElementById("drawer-overlay");
  var openBtn = document.getElementById("filters-open");
  function setDrawer(open) {
    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    openBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  openBtn.addEventListener("click", function () { setDrawer(true); });
  document.getElementById("drawer-close").addEventListener("click", function () { setDrawer(false); });
  overlay.addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("open")) setDrawer(false);
  });

  apply();
});
