/* VIN decoding via the NHTSA vPIC database.

   Free, no API key, run by the US Department of Transportation. It covers
   vehicles built for the North American market, which is effectively all of
   Spiro's stock. Its retail trim names and equipment classifications are
   commonly US-market labels, however, so those are suggestions only for this
   Canadian dealership.

   Two things to be clear about:

   - vPIC returns what the factory built, not what is standing on the lot. It
     knows the engine and body style; it cannot know the colour, the mileage or
     the condition. So this fills the mechanical fields and leaves the human
     ones alone.
   - It knows some equipment, but "Standard" can describe the equivalent US
     trim rather than the Canadian car in the yard. Standard and optional
     equipment therefore both come back as things to inspect before ticking.
     A dealer listing that claims equipment the car does not have is a
     misrepresentation, so the line is drawn strictly.
   - Fields come back in vPIC's own vocabulary ("Sport Utility Vehicle (SUV)/
     Multi-Purpose Vehicle (MPV)", makes in block capitals). Everything is
     translated into the exact words the admin form already uses, so a decoded
     car is indistinguishable from a hand-typed one. */

const ENDPOINT = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/";
const TIMEOUT_MS = 8000;

/* Make spelling lives in js/makes.js so that the admin panel and this decoder
   cannot disagree about it. That shared file is what stops the database's
   "BMW" being written into the inventory as "Bmw". */
const { fixMake, fixModel } = require("../../js/makes.js");

/* Only map what is unambiguous. A wagon is not clearly any of the five options
   the form offers, so it is left blank for a human to decide rather than
   guessed at. */
function mapBody(raw) {
  const s = String(raw || "").toLowerCase();
  if (!s) return "";
  if (s.includes("sport utility") || s.includes("mpv")) return "SUV";
  if (s.includes("pickup")) return "Truck";
  if (s.includes("hatchback") || s.includes("liftback")) return "Hatchback";
  if (s.includes("coupe")) return "Coupe";
  if (s.includes("sedan") || s.includes("saloon")) return "Sedan";
  return "";
}

/* vPIC files most crossovers under "4WD/4-Wheel Drive/4x4" whether they have a
   proper low-range transfer case or an on-demand all-wheel-drive system. A 4WD
   reading only becomes "4x4" on a pickup; on anything else it remains unresolved
   for a human to confirm. "4x2" is two-wheel drive without saying which end, so
   it also resolves to nothing rather than to a guess. */
function mapDrive(raw, bodyClass) {
  const s = String(raw || "").toLowerCase();
  if (!s) return "";
  if (s.includes("awd") || s.includes("all-wheel")) return "AWD";
  if (s.includes("4wd") || s.includes("4x4") || s.includes("four-wheel")) {
    return String(bodyClass || "").toLowerCase().includes("pickup") ? "4x4" : "";
  }
  if (s.includes("rwd") || s.includes("rear-wheel")) return "RWD";
  if (s.includes("fwd") || s.includes("front-wheel")) return "FWD";
  return "";
}

function mapFuel(primary, electrification) {
  /* vPIC writes these as "Strong HEV", "Mild HEV", "PHEV", "BEV", so matching
     on the word "hybrid" alone misses most of them. */
  const e = String(electrification || "").toLowerCase();
  if (e.includes("phev") || e.includes("plug-in")) return "Plug-in Hybrid";
  if (e.includes("hev") || e.includes("hybrid")) return "Hybrid";
  if (e.includes("bev")) return "Electric";
  const s = String(primary || "").toLowerCase();
  if (s.includes("diesel")) return "Diesel";
  if (s.includes("electric") && !s.includes("gas")) return "Electric";
  if (s.includes("gasoline") || s.includes("petrol")) return "Gasoline";
  return "";
}

function mapTransmission(raw) {
  const s = String(raw || "").toLowerCase();
  if (!s) return "";
  if (s.includes("continuously variable") || s.includes("cvt")) return "CVT";
  if (s.includes("manual")) return "Manual";
  if (s.includes("automat") || s.includes("dual-clutch")) return "Automatic";
  return "";
}

/* vPIC trim labels are US-market data. Even a single precise-looking value can
   be wrong for a Canadian advertisement: the exact Canadian 2017 Golf VIN
   3VW817AU4HM013270 returns "S" from vPIC, while Volkswagen sold it here as
   "Trendline". Never promote a vPIC trim directly into Canadian inventory.
   Keep it as a visible suggestion so the person with the car can translate or
   confirm it from Canadian documentation. */
function safeTrim(trim, series) {
  const exact = String(trim || "").trim().replace(/\s+/g, " ");
  if (exact && /[,;|/]/.test(exact)) {
    return { value: "", suggestion: exact, reason: "multiple" };
  }
  if (exact) return { value: "", suggestion: exact, reason: "market" };

  /* Series is deliberately not promoted to trim. It can describe a model
     family or package shared by several trims, which is useful as a hint but
     not accurate enough to publish automatically. */
  const hint = String(series || "").trim().replace(/\s+/g, " ");
  return hint
    ? { value: "", suggestion: hint, reason: "series" }
    : { value: "", suggestion: "", reason: "" };
}

/* "2.998832712" and 6 cylinders in a V becomes "3.0L V6" */
function engineString(displacement, cylinders, configuration) {
  const parts = [];
  const litres = Number(displacement);
  if (isFinite(litres) && litres > 0) parts.push(litres.toFixed(1) + "L");
  const cyl = parseInt(cylinders, 10);
  if (cyl > 0) {
    const conf = String(configuration || "").toLowerCase();
    const prefix = conf.includes("v-shaped") ? "V"
      : conf.includes("in-line") || conf.includes("inline") ? "I"
      : conf.includes("horizontally opposed") || conf.includes("boxer") ? "H"
      : "";
    parts.push(prefix ? prefix + cyl : cyl + "-cyl");
  }
  return parts.join(" ");
}

/* vPIC equipment field → the catalogue label in js/features.js.

   Deliberately partial. ABS, traction control, tyre-pressure monitoring and
   daytime running lights are on every car of this age and are not selling
   points, so listing them would pad the page without telling a buyer anything.
   Only equipment a shopper actually filters on is mapped.

   ActiveSafetySysNote is not read. It is free text like "Blind Spot Detection:
   Optional for LE", which is about the trim range rather than about this VIN,
   and parsing it would produce confident claims from a sentence that does not
   support them. */
const EQUIPMENT = {
  RearVisibilitySystem: "Backup Camera",
  ParkAssist: "Parking Sensors",
  BlindSpotMon: "Blind Spot Monitoring",
  BlindSpotIntervention: "Blind Spot Monitoring",
  RearCrossTrafficAlert: "Rear Cross Traffic Alert",
  LaneDepartureWarning: "Lane Departure Warning",
  LaneKeepSystem: "Lane Keep Assist",
  LaneCenteringAssistance: "Lane Keep Assist",
  ForwardCollisionWarning: "Forward Collision Warning",
  CIB: "Automatic Emergency Braking",
  PedestrianAutomaticEmergencyBraking: "Automatic Emergency Braking",
  AdaptiveCruiseControl: "Adaptive Cruise Control",
  AdaptiveDrivingBeam: "Automatic High Beams",
  SemiautomaticHeadlampBeamSwitching: "Automatic High Beams",
  KeylessIgnition: "Push-Button Start"
};

/* vPIC's equipment status describes a market configuration, not necessarily
   the Canadian car in the yard. Both Standard and Optional are suggestions;
   neither is auto-published. */
function equipment(d) {
  const possible = [];
  Object.keys(EQUIPMENT).forEach(field => {
    const value = String(d[field] || "").trim().toLowerCase();
    const label = EQUIPMENT[field];
    if (value === "standard" || value === "optional") {
      if (!possible.includes(label)) possible.push(label);
    }
  });

  /* Seating can vary by Canadian package even when vPIC returns one US-market
     configuration. Third-row seating is therefore a visual-check suggestion. */
  const seats = parseInt(d.Seats, 10);
  const rows = parseInt(d.SeatRows, 10);
  if ((rows >= 3 || seats >= 7) && !possible.includes("Third-Row Seating")) {
    possible.push("Third-Row Seating");
  }

  return {
    confirmed: [],
    possible: possible
  };
}

function isPlausibleVin(vin) {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(String(vin || "").trim());
}

/**
 * Decode a VIN into the admin form's own vocabulary.
 * Resolves to { ok, fields, unresolved, note } and throws only on transport
 * failure, so the caller can always show something useful.
 */
async function decode(vin) {
  const clean = String(vin || "").trim().toUpperCase();
  if (!isPlausibleVin(clean)) {
    throw new Error("That does not look like a 17-character VIN. Check for typos, and note that I, O and Q never appear in a VIN.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let d;
  try {
    const res = await fetch(ENDPOINT + encodeURIComponent(clean) + "?format=json",
      { signal: controller.signal });
    const body = await res.json();
    d = body && body.Results && body.Results[0];
    if (!d) throw new Error("The VIN database returned nothing for that number.");
  } catch (e) {
    if (e.name === "AbortError") throw new Error("The VIN database did not respond. Try again, or fill the fields in by hand.");
    throw new Error("Could not reach the VIN database: " + e.message);
  } finally {
    clearTimeout(timer);
  }

  /* ErrorCode "0" is a clean decode. Anything else still often carries usable
     data, so the values are kept and the message passed through. */
  const errorCode = String(d.ErrorCode || "").split(",")[0].trim();
  const note = errorCode && errorCode !== "0" ? String(d.ErrorText || "").trim() : "";

  const decodedTrim = safeTrim(d.Trim, d.Series);
  const fields = {
    year: d.ModelYear ? Number(d.ModelYear) : "",
    make: fixMake(d.Make),
    model: fixModel((d.Model || "").trim()),
    trim: decodedTrim.value,
    body: mapBody(d.BodyClass),
    drivetrain: mapDrive(d.DriveType, d.BodyClass),
    fuel: mapFuel(d.FuelTypePrimary, d.ElectrificationLevel),
    transmission: mapTransmission(d.TransmissionStyle),
    engine: engineString(d.DisplacementL, d.EngineCylinders, d.EngineConfiguration),
    doors: d.Doors ? Number(d.Doors) : ""
  };

  Object.keys(fields).forEach(k => {
    if (fields[k] === "" || fields[k] === 0 || Number.isNaN(fields[k])) delete fields[k];
  });

  /* Caveats worth showing next to the filled fields, because a value that is
     right for the database can still be wrong for the listing. */
  const caveats = [];
  if (decodedTrim.reason === "market") {
    caveats.push("Canadian trim required. The US VIN database calls this trim \"" + decodedTrim.suggestion + "\", so it was not filled automatically. Confirm the Canadian trim from the original Canadian listing, window label or manufacturer documentation.");
  } else if (decodedTrim.reason === "multiple") {
    caveats.push("The VIN database returned several possible trims (\"" + decodedTrim.suggestion + "\") instead of one exact trim, so trim was left blank. Check the badge or original window label and enter the exact trim manually.");
  } else if (decodedTrim.reason === "series") {
    caveats.push("The VIN database returned a series (\"" + decodedTrim.suggestion + "\"), not an exact trim, so trim was left blank. Check the badge or original window label and enter the exact trim manually.");
  }
  const rawDrive = String(d.DriveType || "").toLowerCase();
  if (!fields.drivetrain && (rawDrive.includes("4wd") || rawDrive.includes("4x4") || rawDrive.includes("four-wheel"))) {
    caveats.push("The VIN database only says 4WD/4x4, which can mean AWD or a true 4x4. Drivetrain was left blank for you to confirm on the vehicle.");
  }
  if (!fields.drivetrain && rawDrive.includes("4x2")) {
    caveats.push("The database only says two-wheel drive without saying which end, so choose front or rear yourself.");
  }
  if (d.Seats) {
    caveats.push("The US VIN database suggests " + d.Seats + " seats, but Canadian seating can vary by package. Seat count was left for you to verify in the vehicle.");
  }

  /* Things the VIN can never tell us, listed so the panel can say so plainly */
  const unresolved = ["price", "km", "extColor", "intColor", "seats"]
    .concat(fields.trim ? [] : ["trim"])
    .concat(fields.body ? [] : ["body"])
    .concat(fields.drivetrain ? [] : ["drivetrain"]);

  return { ok: true, vin: clean, fields, features: equipment(d), caveats, unresolved, note };
}

module.exports = {
  decode, isPlausibleVin, fixMake, mapBody, mapDrive, mapFuel,
  mapTransmission, safeTrim, engineString, equipment, EQUIPMENT
};
