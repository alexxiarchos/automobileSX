/* VIN decoding via the NHTSA vPIC database.

   Free, no API key, run by the US Department of Transportation. It covers
   vehicles built for the North American market, which is effectively all of
   Spiro's stock.

   Two things to be clear about:

   - vPIC returns what the factory built, not what is standing on the lot. It
     knows the engine and body style; it cannot know the colour, the mileage or
     the condition. So this fills the mechanical fields and leaves the human
     ones alone.
   - It does know some equipment, and marks each item "Standard" or "Optional"
     for the configuration the VIN describes. Only "Standard" is treated as a
     fact about this car. "Optional" means the factory offered it, not that it
     is fitted, so those come back separately as things to check on the car
     before ticking. A dealer listing that claims equipment the car does not
     have is a misrepresentation, so the line is drawn strictly.
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
   proper low-range transfer case or an on-demand all-wheel-drive system. Writing
   "4x4" on a RAV4 would be wrong in the way buyers care about, so a 4WD reading
   only becomes "4x4" on a pickup; on anything else it becomes AWD and the caller
   is told to confirm. "4x2" is two-wheel drive without saying which end, so it
   resolves to nothing rather than to a guess. */
function mapDrive(raw, bodyClass) {
  const s = String(raw || "").toLowerCase();
  if (!s) return "";
  if (s.includes("awd") || s.includes("all-wheel")) return "AWD";
  if (s.includes("4wd") || s.includes("4x4") || s.includes("four-wheel")) {
    return String(bodyClass || "").toLowerCase().includes("pickup") ? "4x4" : "AWD";
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

/* "Standard" is a fact about the car; "Optional" is a fact about the order
   sheet. They are kept apart so the admin panel can tick the first group and
   merely offer the second. */
function equipment(d) {
  const confirmed = [];
  const possible = [];
  Object.keys(EQUIPMENT).forEach(field => {
    const value = String(d[field] || "").trim().toLowerCase();
    const label = EQUIPMENT[field];
    if (value === "standard") {
      if (!confirmed.includes(label)) confirmed.push(label);
    } else if (value === "optional") {
      if (!possible.includes(label)) possible.push(label);
    }
  });

  /* A seat count is part of the build, not an option package, so a third row
     is something the VIN really does establish. */
  const seats = parseInt(d.Seats, 10);
  const rows = parseInt(d.SeatRows, 10);
  if ((rows >= 3 || seats >= 7) && !confirmed.includes("Third-Row Seating")) {
    confirmed.push("Third-Row Seating");
  }

  return {
    confirmed: confirmed,
    possible: possible.filter(f => !confirmed.includes(f))
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

  const fields = {
    year: d.ModelYear ? Number(d.ModelYear) : "",
    make: fixMake(d.Make),
    model: fixModel((d.Model || "").trim()),
    trim: (d.Trim || d.Series || "").trim(),
    body: mapBody(d.BodyClass),
    drivetrain: mapDrive(d.DriveType, d.BodyClass),
    fuel: mapFuel(d.FuelTypePrimary, d.ElectrificationLevel),
    transmission: mapTransmission(d.TransmissionStyle),
    engine: engineString(d.DisplacementL, d.EngineCylinders, d.EngineConfiguration),
    doors: d.Doors ? Number(d.Doors) : "",
    seats: d.Seats ? Number(d.Seats) : ""
  };

  Object.keys(fields).forEach(k => {
    if (fields[k] === "" || fields[k] === 0 || Number.isNaN(fields[k])) delete fields[k];
  });

  /* Caveats worth showing next to the filled fields, because a value that is
     right for the database can still be wrong for the listing. */
  const caveats = [];
  const rawDrive = String(d.DriveType || "").toLowerCase();
  if (fields.drivetrain === "AWD" && (rawDrive.includes("4wd") || rawDrive.includes("4x4"))) {
    caveats.push("The database says 4WD, which it uses for both all-wheel drive and a true 4x4. Set this to 4x4 yourself if the vehicle has a low-range transfer case.");
  }
  if (!fields.drivetrain && rawDrive.includes("4x2")) {
    caveats.push("The database only says two-wheel drive without saying which end, so choose front or rear yourself.");
  }

  /* Things the VIN can never tell us, listed so the panel can say so plainly */
  const unresolved = ["price", "km", "extColor", "intColor"]
    .concat(fields.body ? [] : ["body"])
    .concat(fields.drivetrain ? [] : ["drivetrain"]);

  return { ok: true, vin: clean, fields, features: equipment(d), caveats, unresolved, note };
}

module.exports = {
  decode, isPlausibleVin, fixMake, mapBody, mapDrive, mapFuel,
  mapTransmission, engineString, equipment, EQUIPMENT
};
