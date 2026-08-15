"use strict";

const assert = require("node:assert/strict");
const { loadLatestInventory } = require("../build/liveInventory.js");

const SHA = "0123456789abcdef0123456789abcdef01234567";

async function main() {
  const calls = [];
  const inventory = { vehicles: [{ id: "live-car" }] };
  const responses = [
    { object: { sha: SHA } },
    { encoding: "base64", content: Buffer.from(JSON.stringify(inventory)).toString("base64") }
  ];

  const vehicles = await loadLatestInventory({
    repo: "alexxiarchos/automobileSX",
    branch: "main",
    token: "test-token",
    fetchImpl: async function (url, options) {
      calls.push({ url: url, options: options });
      const body = responses.shift();
      return { ok: true, status: 200, json: async function () { return body; } };
    }
  });

  assert.deepEqual(vehicles, inventory.vehicles);
  assert.match(calls[0].url, /\/git\/ref\/heads\/main$/);
  assert.match(calls[1].url, new RegExp("[?&]ref=" + SHA + "$"));
  assert(!calls[1].url.endsWith("ref=main"), "inventory must be read from the resolved commit, not a moving branch URL");
  assert.equal(calls[0].options.cache, "no-store");
  assert.equal(calls[0].options.headers.Authorization, "Bearer test-token");

  await assert.rejects(
    loadLatestInventory({
      repo: "alexxiarchos/automobileSX",
      fetchImpl: async function () {
        return { ok: true, status: 200, json: async function () { return { object: { sha: "stale" } }; } };
      }
    }),
    /invalid commit SHA/
  );

  console.log("Live inventory build tests passed.");
}

main().catch(function (error) {
  console.error(error);
  process.exitCode = 1;
});
