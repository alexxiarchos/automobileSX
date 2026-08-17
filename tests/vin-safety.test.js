const assert = require("node:assert/strict");
const {
  safeTrim,
  mapDrive,
  mapTransmission,
  equipment
} = require("../api/_lib/vin.js");

function test(name, fn) {
  try {
    fn();
    console.log("ok - " + name);
  } catch (error) {
    console.error("not ok - " + name);
    throw error;
  }
}

test("a precise US trim remains a Canadian-market suggestion", () => {
  assert.deepEqual(safeTrim("S", ""), {
    value: "",
    suggestion: "S",
    reason: "market"
  });
});

test("a list of possible trims is never published", () => {
  assert.deepEqual(safeTrim("L / LX", ""), {
    value: "",
    suggestion: "L / LX",
    reason: "multiple"
  });
});

test("explicit AWD and FWD remain usable", () => {
  assert.equal(mapDrive("All-Wheel Drive", "Hatchback"), "AWD");
  assert.equal(mapDrive("Front-Wheel Drive", "Hatchback"), "FWD");
});

test("ambiguous SUV 4WD is left for confirmation", () => {
  assert.equal(mapDrive("4WD/4-Wheel Drive/4x4", "Sport Utility Vehicle"), "");
});

test("pickup 4WD remains an unambiguous 4x4", () => {
  assert.equal(mapDrive("4WD/4-Wheel Drive/4x4", "Pickup"), "4x4");
});

test("manual transmission still fills a reliable field", () => {
  assert.equal(mapTransmission("Manual/Standard"), "Manual");
});

test("US equipment is suggested but never confirmed automatically", () => {
  assert.deepEqual(equipment({
    RearVisibilitySystem: "Standard",
    ParkAssist: "Optional",
    Seats: "7",
    SeatRows: "3"
  }), {
    confirmed: [],
    possible: ["Backup Camera", "Parking Sensors", "Third-Row Seating"]
  });
});

console.log("VIN safety tests passed.");
