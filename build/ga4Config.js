"use strict";

/* Public GA4 measurement ID - not a secret. Keep one source of truth for the
   generic-page build and both language versions of vehicle-detail pages.
   Analytics only loads after explicit visitor consent in js/metrics.js. */
const DEFAULT_GA4_MEASUREMENT_ID = "G-JR2QS0T6VC";

function ga4MeasurementId() {
  const candidate = process.env.GA4_MEASUREMENT_ID || DEFAULT_GA4_MEASUREMENT_ID;
  return /^G-[A-Z0-9]+$/.test(candidate) ? candidate : "";
}

module.exports = { ga4MeasurementId };
