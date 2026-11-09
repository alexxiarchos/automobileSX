/* Automobile SX - privacy-conscious production site measurement.
   Vercel Web Analytics and Speed Insights remain cookieless and respect
   browser privacy signals and the existing opt-out. */
(function () {
  "use strict";

  var STORAGE_KEY = "sx_metrics_disabled";
  var productionHost = location.hostname === "automobilesx.ca" ||
    location.hostname === "www.automobilesx.ca";
  var privacySignal = navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1" || window.doNotTrack === "1";

  function setting(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function saveSetting(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (_) { /* Storage failure must never break the site. */ }
  }
  function disabled() {
    return privacySignal || setting(STORAGE_KEY) === "1";
  }
  function updateControls() {
    var isDisabled = disabled();
    document.querySelectorAll("[data-metrics-status]").forEach(function (el) {
      el.textContent = isDisabled ? el.getAttribute("data-off") : el.getAttribute("data-on");
    });
    document.querySelectorAll("[data-metrics-opt-out]").forEach(function (button) {
      button.hidden = isDisabled;
      button.onclick = function () {
        saveSetting(STORAGE_KEY, "1");
        location.reload();
      };
    });
    document.querySelectorAll("[data-metrics-opt-in]").forEach(function (button) {
      button.hidden = !isDisabled || privacySignal;
      button.onclick = function () {
        saveSetting(STORAGE_KEY, null);
        location.reload();
      };
    });
  }
  function inject(src, id) {
    if (document.getElementById(id)) return;
    var script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", updateControls);
  else updateControls();

  if (!productionHost || disabled()) return;

  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.va("beforeSend", function (event) {
    try {
      var url = new URL(event.url);
      if (url.pathname.indexOf("/admin") === 0) return null;
      url.search = "";
      url.hash = "";
      event.url = url.toString();
    } catch (_) { /* Do not modify unknown URL formats. */ }
    return event;
  });
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
  inject("/_vercel/insights/script.js", "sx-web-analytics");
  inject("/_vercel/speed-insights/script.js", "sx-speed-insights");
})();
