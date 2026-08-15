/* Automobile SX - privacy-conscious production metrics.

   Vercel Web Analytics and Speed Insights are loaded only on the public
   production domain. They use no analytics cookies. Query strings and hashes
   are removed before analytics page views are sent, so contact-form choices
   never become part of the analytics URL. */
(function () {
  "use strict";

  var STORAGE_KEY = "sx_metrics_disabled";
  var productionHost = location.hostname === "automobilesx.ca" ||
    location.hostname === "www.automobilesx.ca";
  var privacySignal = navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1" || window.doNotTrack === "1";

  function storageDisabled() {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; }
    catch (_) { return false; }
  }

  function setStorageDisabled(disabled) {
    try {
      if (disabled) localStorage.setItem(STORAGE_KEY, "1");
      else localStorage.removeItem(STORAGE_KEY);
    } catch (_) { /* A blocked localStorage must never break the site. */ }
  }

  function updateControls() {
    var disabled = privacySignal || storageDisabled();
    document.querySelectorAll("[data-metrics-status]").forEach(function (el) {
      el.textContent = disabled ? el.getAttribute("data-off") : el.getAttribute("data-on");
    });
    document.querySelectorAll("[data-metrics-opt-out]").forEach(function (button) {
      button.hidden = disabled;
      button.onclick = function () {
        setStorageDisabled(true);
        updateControls();
      };
    });
    document.querySelectorAll("[data-metrics-opt-in]").forEach(function (button) {
      button.hidden = !disabled || privacySignal;
      button.onclick = function () {
        setStorageDisabled(false);
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

  if (!productionHost || privacySignal || storageDisabled()) return;

  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.va("beforeSend", function (event) {
    try {
      var url = new URL(event.url);
      if (url.pathname.indexOf("/admin") === 0) return null;
      url.search = "";
      url.hash = "";
      event.url = url.toString();
    } catch (_) { /* Keep the original URL if a browser cannot parse it. */ }
    return event;
  });
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };

  inject("/_vercel/insights/script.js", "sx-web-analytics");
  inject("/_vercel/speed-insights/script.js", "sx-speed-insights");
})();
