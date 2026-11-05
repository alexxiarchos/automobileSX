/* Automobile SX - production-only website measurement.
   Vercel measurement is cookieless and respects the existing opt-out.
   GA4 is optional, separately opt-in and never loads unless a valid
   measurement ID was configured at build time. Never send form contents,
   contact details or query parameters to either measurement service. */
(function () {
  "use strict";

  var STORAGE_KEY = "sx_metrics_disabled";
  var GA4_CONSENT_KEY = "sx_ga4_consent";
  var productionHost = location.hostname === "automobilesx.ca" ||
    location.hostname === "www.automobilesx.ca";
  var privacySignal = navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === "1" || window.doNotTrack === "1";
  var idNode = document.querySelector('meta[name="sx-ga4-id"]');
  var measurementId = idNode ? idNode.getAttribute("content") : "";
  var ga4Configured = /^G-[A-Z0-9]+$/.test(measurementId || "");

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
  function ga4Allowed() {
    return productionHost && !disabled() && ga4Configured &&
      setting(GA4_CONSENT_KEY) === "granted";
  }
  /* GA4 sets first-party _ga cookies after consent. Revoke permission before
     clearing these cookies so no further GA4 events are queued. Do not touch
     unrelated first-party cookies, including the dealer's own preferences. */
  function clearGa4Cookies() {
    if (!productionHost) return;
    var existing;
    try { existing = document.cookie || ""; } catch (_) { return; }
    existing.split(";").forEach(function (entry) {
      var name = entry.split("=")[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      [null, location.hostname, ".automobilesx.ca"].forEach(function (domain) {
        var expiry = name + "=; Max-Age=0; Path=/; SameSite=Lax; Secure" +
          (domain ? "; Domain=" + domain : "");
        try { document.cookie = expiry; }
        catch (_) { /* Some cookie scopes may be unavailable to this page. */ }
      });
    });
  }
  function revokeGa4() {
    saveSetting(GA4_CONSENT_KEY, null);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    clearGa4Cookies();
    location.reload();
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
        revokeGa4();
      };
    });
    document.querySelectorAll("[data-metrics-opt-in]").forEach(function (button) {
      button.hidden = !isDisabled || privacySignal;
      button.onclick = function () {
        saveSetting(STORAGE_KEY, null);
        location.reload();
      };
    });
    document.querySelectorAll("[data-ga4-consent]").forEach(function (button) {
      button.hidden = !ga4Configured || isDisabled || ga4Allowed();
      button.onclick = function () {
        saveSetting(GA4_CONSENT_KEY, "granted");
        location.reload();
      };
    });
    document.querySelectorAll("[data-ga4-revoke]").forEach(function (button) {
      button.hidden = !ga4Allowed();
      button.onclick = function () {
        revokeGa4();
      };
    });
    document.querySelectorAll("[data-ga4-status]").forEach(function (el) {
      el.textContent = !ga4Configured ? el.getAttribute("data-unavailable") :
        ga4Allowed() ? el.getAttribute("data-on") : el.getAttribute("data-off");
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
  function cleanPageUrl() {
    return location.origin + location.pathname;
  }
  function sendEvent(name, params) {
    if (!ga4Allowed() || typeof window.gtag !== "function") return;
    var safe = { page_location: cleanPageUrl() };
    Object.keys(params || {}).forEach(function (key) { safe[key] = params[key]; });
    window.gtag("event", name, safe);
  }

  window.SXMetrics = { event: sendEvent };

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

  if (!ga4Allowed()) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    page_location: cleanPageUrl(),
    page_path: location.pathname,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  inject("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId), "sx-ga4");

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (/^tel:/i.test(href)) sendEvent("click_to_call", { link_location: "phone" });
    if (/^\/(?:fr\/)?contact(?:\?|$)/.test(href)) {
      sendEvent("contact_intent", { source_page: location.pathname });
    }
  });
  document.addEventListener("sx:contact-success", function () {
    sendEvent("generate_lead", { lead_type: "contact_form" });
  });
})();