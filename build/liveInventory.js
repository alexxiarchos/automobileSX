"use strict";

const API = "https://api.github.com";

function repoPath(repo) {
  const parts = String(repo || "").split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("Live inventory repository must be written as owner/repo");
  }
  return parts.map(encodeURIComponent).join("/");
}

function branchPath(branch) {
  return String(branch || "main").split("/").map(encodeURIComponent).join("/");
}

async function githubJson(url, token, fetchImpl) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "automobile-sx-build",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  if (token) headers.Authorization = "Bearer " + token;

  const response = await fetchImpl(url, { cache: "no-store", headers: headers });
  if (!response.ok) {
    throw new Error("Live inventory request failed with HTTP " + response.status);
  }
  return response.json();
}

/* Resolve the branch once, then read the inventory from that immutable commit.
   A raw branch URL can briefly return an older CDN snapshot after an admin
   publish, which would make a successful deployment serve stale vehicle HTML. */
async function loadLatestInventory(options) {
  const repo = repoPath(options.repo);
  const branch = branchPath(options.branch || "main");
  const token = options.token || "";
  const fetchImpl = options.fetchImpl || fetch;

  const ref = await githubJson(
    API + "/repos/" + repo + "/git/ref/heads/" + branch,
    token,
    fetchImpl
  );
  const sha = ref && ref.object && ref.object.sha;
  if (!/^[0-9a-f]{40}$/i.test(String(sha || ""))) {
    throw new Error("Live inventory branch returned an invalid commit SHA");
  }

  const file = await githubJson(
    API + "/repos/" + repo + "/contents/data/vehicles.json?ref=" + encodeURIComponent(sha),
    token,
    fetchImpl
  );
  if (!file || file.encoding !== "base64" || !file.content) {
    throw new Error("Live inventory file returned an invalid response");
  }

  const data = JSON.parse(Buffer.from(String(file.content).replace(/\s/g, ""), "base64").toString("utf8"));
  if (!data || !Array.isArray(data.vehicles)) {
    throw new Error("Live inventory returned an invalid data shape");
  }
  return data.vehicles;
}

module.exports = { loadLatestInventory };
