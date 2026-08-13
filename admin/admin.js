/* Automobile SX - admin panel logic (no dependencies)
   Data flow: /api/inventory → edit in memory → /api/upload per new photo →
   /api/save = one git commit → Vercel auto-deploys the public site. */

(function () {
  "use strict";

  var vehicles = [];        /* full inventory incl. drafts */
  var editing = null;       /* working copy of the vehicle in the editor */
  var isNew = false;
  var pendingBlobs = [];    /* [{path, sha}] uploaded but not yet committed */
  var deletePaths = [];     /* image paths to delete on next save */

  var $ = function (id) { return document.getElementById(id); };

  /* The catalogue, the make spellings and the draft writer are shared with the
     public site and the VIN decoder rather than restated here. See
     js/features.js, js/makes.js and js/describe.js. */
  var CAT = window.SX_FEATURES;
  var MAKES = window.SX_MAKES;
  var DESCRIBE = window.SX_DESCRIBE;

  var COLOR_HEX = { black: "#141518", white: "#eceae6", grey: "#5c6066", gray: "#5c6066",
    silver: "#c3c6c9", red: "#8f1a24", blue: "#2b4d7e", green: "#2f5741", brown: "#4a3a2e",
    beige: "#c9bda6", tan: "#c9bda6", gold: "#b09a5e", orange: "#b4551e", yellow: "#c9a227",
    burgundy: "#5c1f27", charcoal: "#3f4247" };

  /* ---------- tiny helpers ---------- */

  function api(path, opts) {
    return fetch("/api/" + path, Object.assign({ credentials: "same-origin" }, opts))
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) throw new Error(data.error || ("Request failed (" + r.status + ")"));
          return data;
        });
      });
  }

  function toast(msg, cls) {
    var t = $("toast");
    t.textContent = msg;
    t.className = "toast " + (cls || "");
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 6000);
  }

  function busy(msg) {
    $("busy").hidden = !msg;
    if (msg) $("busy-text").textContent = msg;
  }

  function show(screen) {
    ["screen-login", "screen-dash", "screen-edit"].forEach(function (s) {
      $(s).hidden = s !== screen;
    });
    $("header-right").hidden = screen === "screen-login";
    window.scrollTo(0, 0);
  }

  function money(n) { return "$" + Math.round(n || 0).toLocaleString("en-CA"); }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function slugPreview() {
    var el = document.getElementById("slug-preview");
    if (!el) return;
    var s = slug(document.getElementById("f-slug").value);
    el.innerHTML = s
      ? 'Web address: <code>/vehicles/' + s + '</code> &nbsp;·&nbsp; <code>/fr/vehicules/' + s + '</code>'
      : "The address will be created from the year, make and model.";
  }

  function nextStock() {
    var max = 1000;
    vehicles.forEach(function (v) {
      var m = /^SX-(\d+)$/.exec(v.stock || "");
      if (m) max = Math.max(max, Number(m[1]));
    });
    return "SX-" + (max + 1);
  }

  function thumbSrc(v) {
    if (v.images && v.images.length) return "/" + v.images[0];
    return ""; /* handled with placeholder below */
  }

  /* ---------- auth ---------- */

  function boot() {
    api("me").then(function () { loadInventory(); })
      .catch(function () { show("screen-login"); });
  }

  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("login-error");
    err.hidden = true;
    $("login-btn").disabled = true;
    api("login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: $("login-user").value.trim(), password: $("login-pass").value })
    }).then(function () {
      loadInventory();
    }).catch(function (e2) {
      err.textContent = e2.message;
      err.hidden = false;
    }).finally(function () { $("login-btn").disabled = false; });
  });

  $("logout-btn").addEventListener("click", function () {
    api("logout", { method: "POST" }).finally(function () { show("screen-login"); });
  });

  /* ---------- dashboard ---------- */

  function loadInventory() {
    busy("Loading inventory…");
    api("inventory").then(function (data) {
      vehicles = data.vehicles || [];
      renderDash();
      show("screen-dash");
    }).catch(function (e) {
      show("screen-login");
      toast(e.message, "err");
    }).finally(function () { busy(null); });
  }

  /* ---------- how long has this been on the site, and has it been posted ---------- */

  var DAY = 86400000;
  var STALE_DAYS = 60;

  function when(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-CA", { day: "numeric", month: "short", year: "numeric" });
  }

  function daysSince(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return null;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / DAY));
  }

  function ago(iso) {
    var n = daysSince(iso);
    if (n === null) return "";
    return n === 0 ? "today" : n === 1 ? "yesterday" : n + " days ago";
  }

  /* publishedAt is written the first time a car goes live. Cars listed before
     that field existed have no such record, so the date they were created
     stands in - with different wording, because it is a different fact. */
  function listedAt(v) {
    return v.publishedAt || v.createdAt || "";
  }

  function postSummary(v) {
    var posts = Array.isArray(v.posts) ? v.posts : [];
    if (!posts.length) return { text: "not posted yet", cls: "track-none" };
    var last = posts[posts.length - 1];
    var names = [];
    if (posts.some(function (p) { return p.target === "facebook"; })) names.push("Facebook");
    if (posts.some(function (p) { return p.target === "instagram"; })) names.push("Instagram");
    return {
      text: "posted to " + names.join(" and ") + " " + ago(last.at),
      cls: "track-posted"
    };
  }

  /* One line per row saying what has happened to this listing and when. */
  function trackLine(v) {
    var status = v.status || "available";
    var parts = [];

    if (status === "draft") {
      parts.push('<span class="track-none">Draft - never published</span>');
      return '<div class="dash-track">' + parts.join(" · ") + "</div>";
    }

    var since = listedAt(v);
    var days = daysSince(since);
    if (since) {
      parts.push((v.publishedAt ? "Published " : "On the site since ") + when(since));
    }

    if (status === "sold") {
      if (v.soldAt) {
        parts.push("sold " + when(v.soldAt) +
          (days !== null && daysSince(v.soldAt) !== null
            ? " after " + (days - daysSince(v.soldAt)) + " days" : ""));
      } else {
        parts.push("sold");
      }
    } else if (days !== null) {
      parts.push('<span class="' + (days >= STALE_DAYS ? "track-stale" : "") + '">' +
        days + " days on the lot</span>");
    }

    var p = postSummary(v);
    parts.push('<span class="' + p.cls + '">' + p.text + "</span>");

    return '<div class="dash-track">' + parts.join(" · ") + "</div>";
  }

  function statusBadge(v) {
    var s = v.status || "available";
    var label = s.charAt(0).toUpperCase() + s.slice(1);
    return '<span class="badge badge-' + s + '">' + label + "</span>";
  }

  function renderDash() {
    var counts = { available: 0, sold: 0, draft: 0 };
    vehicles.forEach(function (v) { counts[v.status || "available"] = (counts[v.status || "available"] || 0) + 1; });
    $("dash-count").textContent =
      counts.available + " available · " + counts.sold + " sold · " + counts.draft + " drafts";

    /* The two things worth knowing at a glance without opening anything. */
    var onSale = vehicles.filter(function (v) { return (v.status || "available") === "available"; });
    var stale = onSale.filter(function (v) {
      var d = daysSince(listedAt(v));
      return d !== null && d >= STALE_DAYS;
    });
    var unposted = onSale.filter(function (v) { return !(v.posts && v.posts.length); });
    var notes = [];
    if (stale.length) notes.push(stale.length + " listed over " + STALE_DAYS + " days");
    if (unposted.length) notes.push(unposted.length + " never posted to Facebook or Instagram");
    $("dash-insight").textContent = notes.join(" · ");
    $("dash-insight").hidden = !notes.length;

    var list = $("dash-list");
    list.innerHTML = "";
    if (!vehicles.length) {
      list.innerHTML = '<p class="muted">No vehicles yet. Tap “Add Vehicle” to create your first listing.</p>';
      updateBulkBar();
      return;
    }
    vehicles.forEach(function (v, i) {
      var row = document.createElement("div");
      var live = (v.status || "available") !== "draft";
      /* A sold car can still have its old posts opened and deleted, but it must
         not be selectable for posting: announcing a car you no longer have is
         the one thing this button should never be able to do. */
      var postable = (v.status || "available") === "available";
      row.className = "dash-row";
      var img = thumbSrc(v);
      row.innerHTML =
        (postable
          ? '<label class="dash-pick"><input type="checkbox" data-pick="1"' +
            (selected.indexOf(v.id) !== -1 ? " checked" : "") +
            ' aria-label="Select ' + escapeHtml((v.year || "") + " " + (v.make || "") + " " + (v.model || "")) + '"></label>'
          : '<span class="dash-pick" aria-hidden="true"></span>') +
        (img ? '<img class="dash-thumb" src="' + img + '" alt="">'
             : '<div class="dash-thumb" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;color:var(--slate);font-size:12px">No photo</div>') +
        '<div class="dash-info">' +
        '<div class="dash-name">' + (v.year || "?") + " " + (v.make || "") + " " + (v.model || "") + (v.trim ? " · " + v.trim : "") + "</div>" +
        '<div class="dash-sub">' + money(v.price) + " · " + Number(v.km || 0).toLocaleString("en-CA") + " km · Stock " + (v.stock || "-") + "</div>" +
        trackLine(v) +
        statusBadge(v) +
        "</div>" +
        '<div class="dash-actions">' +
        '<button class="btn btn-small btn-outline" data-act="edit">Edit</button>' +
        (live ? '<button class="btn btn-small btn-outline" data-act="share">' +
          ((v.posts && v.posts.length) ? "Posts" : "Share") + "</button>" : "") +
        '<button class="btn btn-small btn-outline" data-act="sheet">Sheet</button>' +
        '<button class="btn btn-small btn-outline" data-act="status">' + ((v.status || "available") === "sold" ? "Mark Available" : "Mark Sold") + "</button>" +
        '<button class="btn btn-small btn-ghost" data-act="dup">Duplicate</button>' +
        '<button class="btn btn-small btn-danger-ghost" data-act="del">Delete</button>' +
        "</div>";

      row.addEventListener("change", function (e) {
        if (!e.target.dataset || !e.target.dataset.pick) return;
        var at = selected.indexOf(v.id);
        if (e.target.checked && at === -1) selected.push(v.id);
        if (!e.target.checked && at !== -1) selected.splice(at, 1);
        updateBulkBar();
      });

      row.addEventListener("click", function (e) {
        var act = e.target.getAttribute && e.target.getAttribute("data-act");
        if (!act) return;
        if (act === "edit") openEditor(v, false);
        if (act === "share") openShare(v);
        if (act === "sheet") openSheet([v.id]);
        if (act === "status") toggleStatus(v);
        if (act === "dup") duplicateVehicle(v);
        if (act === "del") deleteVehicle(v);
      });
      list.appendChild(row);
    });
    updateBulkBar();
  }

  /* ---------- posting several at once ---------- */

  var selected = [];   /* vehicle ids, so the list survives a re-render */

  function selectedVehicles() {
    return selected
      .map(function (id) { return vehicles.filter(function (v) { return v.id === id; })[0]; })
      .filter(Boolean)
      .filter(function (v) { return (v.status || "available") === "available"; });
  }

  function updateBulkBar() {
    var n = selectedVehicles().length;
    $("bulk-bar").hidden = n === 0;
    $("bulk-count").textContent = n === 1 ? "1 vehicle selected" : n + " vehicles selected";
  }

  /* The window sheet opens in its own tab rather than a dialog, because what
     happens next is the browser's Print menu and that wants a real page. */
  function openSheet(list) {
    if (!list.length) return;
    window.open("/admin/sheet.html?ids=" + encodeURIComponent(list.join(",")), "_blank", "noopener");
  }

  $("bulk-sheets").addEventListener("click", function () {
    openSheet(selectedVehicles().map(function (v) { return v.id; }));
  });

  $("bulk-clear").addEventListener("click", function () {
    selected = [];
    renderDash();
  });

  /* One request per vehicle, run one after another rather than all at once.
     Instagram needs up to forty seconds per post while it fetches and
     processes the photo, so a single request covering five cars would run past
     the function's time limit; and posting six things to a Page in the same
     second is exactly what rate limiting is for. */
  $("bulk-post").addEventListener("click", function () {
    var list = selectedVehicles();
    if (!list.length) return;
    if (!confirm("Post these " + list.length + " vehicles to your Facebook Page and Instagram?\n\n" +
      list.map(function (v) { return "• " + v.year + " " + v.make + " " + v.model; }).join("\n") +
      "\n\nThey are posted one at a time and this can take a minute or two.")) return;

    var done = [], failed = [];

    function step(i) {
      if (i >= list.length) return finish();
      var v = list[i];
      busy("Posting " + (i + 1) + " of " + list.length + ": " + v.year + " " + v.make + " " + v.model + "…");
      return api("social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: v.id, targets: ["facebook", "instagram"] })
      }).then(function (d) {
        var okAny = recordPosts(v, d.results);
        var bad = Object.keys(d.results).filter(function (k) { return !d.results[k].ok; });
        if (okAny) done.push(v);
        bad.forEach(function (k) {
          failed.push((v.make || "") + " " + (v.model || "") + " - " + k + ": " + d.results[k].error);
        });
      }).catch(function (e) {
        failed.push((v.make || "") + " " + (v.model || "") + " - " + e.message);
      }).then(function () { return step(i + 1); });
    }

    function finish() {
      busy(null);
      var after = function () {
        selected = [];
        renderDash();
        if (failed.length) {
          alert("Posted " + done.length + " of " + list.length + ".\n\nThese did not go through:\n\n" + failed.join("\n"));
        } else {
          toast("Posted all " + done.length + ".", "ok");
        }
      };
      /* One commit for the whole batch rather than one per vehicle. */
      if (done.length) savePostRecords("Record " + done.length + " social post(s)").then(after).catch(after);
      else after();
    }

    step(0);
  });

  /* Writes down what was posted and where. updatedAt is deliberately not
     touched: nothing about the vehicle page changed, so this must not look
     like an edit to IndexNow and cause a pointless re-crawl ping. */
  function recordPosts(v, results) {
    var any = false;
    v.posts = Array.isArray(v.posts) ? v.posts : [];
    Object.keys(results || {}).forEach(function (target) {
      var r = results[target];
      if (!r || !r.ok) return;
      any = true;
      v.posts.push({ target: target, id: r.id || "", url: r.url || "", at: new Date().toISOString() });
    });
    return any;
  }

  function savePostRecords(message) {
    return api("save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicles: vehicles, newImages: [], deletePaths: [], message: message })
    });
  }

  /* ---------- VIN decode ---------- */

  var VIN_TARGETS = {
    year: "f-year", make: "f-make", model: "f-model", trim: "f-trim",
    body: "f-body", drivetrain: "f-drive", fuel: "f-fuel",
    transmission: "f-trans", engine: "f-engine", doors: "f-doors", seats: "f-seats"
  };

  var VIN_HINT = "Paste or type the VIN and it fills in the year, make, model, engine, body, drivetrain and the safety equipment by itself. Everything stays editable, and nothing you have already typed gets overwritten. No VIN? Just fill the form in below.";

  var FIELD_LABELS = {
    year: "Year", make: "Make", model: "Model", trim: "Trim", body: "Body style",
    drivetrain: "Drivetrain", fuel: "Fuel type", transmission: "Transmission",
    engine: "Engine", doors: "Doors", seats: "Seats", price: "Price", km: "Mileage",
    extColor: "Exterior colour", intColor: "Interior colour"
  };

  function vinStatus(msg, cls) {
    var el = $("vin-status");
    el.textContent = msg;
    el.className = "fh" + (cls ? " " + cls : "");
  }

  /* Only ever fills fields the owner has left blank. A decode can add to what
     is on screen but never overwrite a value someone typed, so pressing Decode
     is always safe, including on a car that is already half filled in. */
  function applyVin(data) {
    var filled = [], skipped = [];
    Object.keys(VIN_TARGETS).forEach(function (key) {
      if (!(key in data.fields)) return;
      var el = $(VIN_TARGETS[key]);
      if (!el) return;
      var value = String(data.fields[key]);

      if (el.tagName === "SELECT") {
        /* A dropdown always shows something, so "is it empty" tells us nothing.
           What matters is whether a human has chosen deliberately, which is
           tracked on change below. An untouched dropdown is only a default and
           the VIN knows better. */
        var match = Array.prototype.slice.call(el.options).some(function (o) { return o.value === value; });
        if (!match) { skipped.push(FIELD_LABELS[key] + " (" + value + " is not one of the options)"); return; }
        if (el.dataset.touched === "1") {
          if (el.value !== value) skipped.push(FIELD_LABELS[key] + " (you chose “" + el.value + "”)");
          return;
        }
        el.value = value;
        filled.push(FIELD_LABELS[key]);
        return;
      }
      if (el.value && el.value.trim()) {
        if (el.value.trim() !== value) skipped.push(FIELD_LABELS[key] + " (you already entered “" + el.value.trim() + "”)");
        return;
      }
      el.value = value;
      filled.push(FIELD_LABELS[key]);
    });

    $("f-vin").value = data.vin;
    slugPreview();

    /* Equipment. "Standard" for this VIN is a fact about the car, so those are
       ticked. "Optional" only means the factory offered it, so those are offered
       as one-tap chips instead: the car in the yard is the authority, not the
       database. Nothing is ever unticked - a decode adds, it never takes away
       what you already knew. */
    var ticked = [];
    var eq = data.features || {};
    (eq.confirmed || []).forEach(function (f) {
      var cb = featureBox(f);
      if (cb && !cb.checked) { cb.checked = true; ticked.push(f); }
    });
    renderVinSuggestions((eq.possible || []).filter(function (f) {
      var cb = featureBox(f);
      return cb && !cb.checked;
    }));

    var parts = [];
    if (filled.length) parts.push("Filled: " + filled.join(", ") + ".");
    if (!filled.length) parts.push("Nothing to fill, every decoded field was already set.");
    if (ticked.length) parts.push("Ticked as standard equipment: " + ticked.join(", ") + ".");
    if (skipped.length) parts.push("Left alone: " + skipped.join("; ") + ".");
    var missing = (data.unresolved || []).map(function (k) { return FIELD_LABELS[k] || k; });
    if (missing.length) parts.push("The VIN cannot tell us " + missing.join(", ").toLowerCase() + " - enter those yourself.");
    (data.caveats || []).forEach(function (c) { parts.push(c); });
    if (data.note) parts.push("Database note: " + data.note);

    var dupe = duplicateVin(data.vin);
    if (dupe) parts.push("Careful: " + dupe + " already has this VIN.");

    vinStatus(parts.join(" "), dupe ? "vin-err" : (filled.length || ticked.length) ? "vin-ok" : null);
    updateQuality();
  }

  /* The checkbox for a catalogue label, if that label is on screen. */
  function featureBox(label) {
    var want = CAT.canonical(label).toLowerCase();
    var found = null;
    $("feature-checks").querySelectorAll("input[type=checkbox]").forEach(function (cb) {
      if (cb.value.toLowerCase() === want) found = cb;
    });
    return found;
  }

  function renderVinSuggestions(list) {
    var box = $("vin-suggest");
    if (!list || !list.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = '<p class="fh"><strong>Was this one optioned with any of these?</strong> ' +
      'The VIN says the factory offered them on this model but cannot say whether this car has them. ' +
      'Check the car, then tap to add.</p><div class="chips">' +
      list.map(function (f) {
        return '<button type="button" class="chip" data-feature="' + escapeHtml(f) + '">+ ' + escapeHtml(f) + "</button>";
      }).join("") + "</div>";
  }

  $("vin-suggest").addEventListener("click", function (e) {
    var f = e.target.getAttribute && e.target.getAttribute("data-feature");
    if (!f) return;
    var cb = featureBox(f);
    if (cb) cb.checked = true;
    e.target.remove();
    if (!$("vin-suggest").querySelector(".chip")) $("vin-suggest").hidden = true;
    updateQuality();
  });

  function duplicateVin(vin) {
    var v = String(vin || "").trim().toUpperCase();
    if (!v) return "";
    var hit = null;
    vehicles.forEach(function (o) {
      if (o !== editing && String(o.vin || "").toUpperCase() === v) hit = o;
    });
    return hit ? (hit.year + " " + hit.make + " " + hit.model + " (stock " + (hit.stock || "-") + ")") : "";
  }

  ["f-body", "f-drive", "f-fuel", "f-trans"].forEach(function (id) {
    $(id).addEventListener("change", function () { $(id).dataset.touched = "1"; });
  });

  function runDecode() {
    var vin = $("f-vin").value.trim();
    if (!vin) { vinStatus("Enter a VIN first.", "vin-err"); return; }
    $("vin-decode").disabled = true;
    vinStatus("Looking up " + vin.toUpperCase() + "…");
    api("vin?vin=" + encodeURIComponent(vin))
      .then(applyVin)
      .catch(function (e) { vinStatus(e.message, "vin-err"); })
      .finally(function () { $("vin-decode").disabled = false; });
  }

  $("vin-decode").addEventListener("click", runDecode);

  /* Pressing Enter in a lone text field would submit the form in some browsers,
     which here means nothing useful. It decodes instead. */
  $("f-vin").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); runDecode(); }
  });

  /* A pasted VIN is 17 characters and always complete, so there is nothing to
     be gained by making the owner press a second button. Typing it by hand
     triggers the same thing on the seventeenth character. Decoding twice for
     the same number is suppressed so an accidental re-paste is free. */
  var lastDecoded = "";
  $("f-vin").addEventListener("input", function () {
    var vin = $("f-vin").value.trim().toUpperCase();
    if (vin.length === 17 && vin !== lastDecoded) { lastDecoded = vin; runDecode(); }
  });

  /* ---------- description drafts ---------- */

  function currentFeatures() {
    var feats = [];
    $("feature-checks").querySelectorAll("input:checked").forEach(function (cb) { feats.push(cb.value); });
    $("f-features-extra").value.split(",").forEach(function (x) {
      x = x.trim();
      if (x) feats.push(x);
    });
    return feats;
  }

  /* What the draft writer needs: the form as it stands right now, not the last
     saved copy. Reading the DOM rather than calling collectForm() keeps this
     free of side effects - pressing the button must not create a page address
     or bump updatedAt on a car you were only looking at. */
  function formSnapshot() {
    return {
      id: editing && editing.id ? editing.id : slug($("f-year").value + "-" + $("f-make").value + "-" + $("f-model").value),
      year: Number($("f-year").value) || "",
      make: $("f-make").value.trim(),
      model: $("f-model").value.trim(),
      trim: $("f-trim").value.trim(),
      body: $("f-body").value,
      km: Number($("f-km").value) || 0,
      engine: $("f-engine").value.trim(),
      transmission: $("f-trans").value,
      drivetrain: $("f-drive").value,
      fuel: $("f-fuel").value,
      doors: Number($("f-doors").value) || "",
      seats: Number($("f-seats").value) || "",
      extColor: $("f-extcolor").value.trim(),
      intColor: $("f-intcolor").value.trim(),
      features: currentFeatures(),
      descMode: "auto",          /* the preview always shows the template */
      descNote: $("f-descnote").value.trim(),
      descNoteFr: $("f-descnotefr").value.trim(),
      draftNotes: { ownership: $("f-ownership").value }
    };
  }

  /* ---------- the description ---------- */

  var descMode = "auto";

  /* Switching modes never destroys anything: the hand-written text and the
     note live in different fields, so a listing can be flipped back and forth
     and both are still there. */
  function setDescMode(next, silent) {
    descMode = next === "manual" ? "manual" : "auto";
    $("desc-auto").hidden = descMode === "manual";
    $("desc-manual").hidden = descMode === "auto";
    renderDescription();
    if (!silent) updateQuality();
  }

  $("desc-manual-on").addEventListener("click", function () {
    /* Starting from a blank page is worse than starting from the template, so
       an empty hand-written box is seeded with what the template would have
       said. Anything already typed there is left alone. */
    if (!$("f-desc").value.trim()) fillManualFromTemplate();
    setDescMode("manual");
    toast("This listing is now written by hand. It will not follow the template any more.", "ok");
  });

  $("desc-manual-off").addEventListener("click", function () {
    setDescMode("auto");
    toast("Back to the automatic description. Your hand-written text is kept in case you want it again.", "ok");
  });

  function fillManualFromTemplate() {
    var v = formSnapshot();
    if (!v.year || !v.make || !v.model) {
      toast("Fill in the year, make and model first - the template is written from them.", "err");
      return false;
    }
    $("f-desc").value = DESCRIBE.text(v, "en");
    $("f-descfr").value = DESCRIBE.text(v, "fr");
    descHint("f-desc", "desc-count-men", 400);
    descHint("f-descfr", "desc-count-mfr", 400);
    return true;
  }

  $("desc-fill").addEventListener("click", function () {
    if ($("f-desc").value.trim() &&
        !confirm("Replace both boxes with the template text?\n\nWhat you have written will be lost.")) return;
    if (fillManualFromTemplate()) {
      toast("Filled from the template. It will not update by itself from here on.", "ok");
      updateQuality();
    }
  });

  /* The preview is the same function the website uses, given the form as it
     stands. What is on screen is therefore not an approximation of the page -
     it is the page. */
  function renderDescription() {
    if (descMode === "manual") return;
    var v = formSnapshot();
    ["en", "fr"].forEach(function (lang) {
      var paras = DESCRIBE.paragraphs(v, lang);
      $("preview-" + lang).innerHTML = paras.length
        ? paras.map(function (p) { return "<p>" + escapeHtml(p) + "</p>"; }).join("")
        : '<p class="fh">Fill in the year, make and model and the description writes itself.</p>';
    });
  }

  /* Translating what a person wrote. Two behaviours, because there are two
     moments you want it: select a sentence and only that sentence is added to
     the French box, leaving the French already there alone; select nothing and
     the whole box is translated. */
  function wireTranslate(button, fromId, toId, countId) {
    $(button).addEventListener("click", function () {
      var box = $(fromId);
      var selection = box.value.substring(box.selectionStart, box.selectionEnd).trim();
      var whole = !selection;
      var text = selection || box.value.trim();

      if (!text) { toast("Write the English text first.", "err"); return; }
      if (whole && $(toId).value.trim() &&
          !confirm("Replace the French box with a translation of the whole English box?\n\n" +
                   "If you only want to add one sentence, cancel, select that sentence, and press this again.")) {
        return;
      }

      busy("Translating…");
      api("translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
      }).then(function (d) {
        var fr = $(toId);
        fr.value = whole ? d.text : (fr.value.trim() ? fr.value.trim() + "\n\n" : "") + d.text;
        descHint(toId, countId, 0);
        renderDescription();
        updateQuality();
        toast("Translated with " + d.provider + ". Read it through - it is a machine, and this is Quebec.", "ok");
      }).catch(function (e) {
        toast("Could not translate: " + e.message, "err");
      }).finally(function () { busy(null); });
    });
  }

  wireTranslate("desc-translate", "f-descnote", "f-descnotefr", "desc-count-fr");
  wireTranslate("desc-translate-manual", "f-desc", "f-descfr", "desc-count-mfr");

  /* target = 0 means "no length to aim for": the note is an addition to a
     description that is already complete without it. */
  function descHint(id, out, target) {
    var n = $(id).value.trim().length;
    var el = $(out);
    if (!el) return;
    if (!n) { el.textContent = target ? "Empty." : "Empty - the template alone will be used."; return; }
    el.textContent = n + " characters" +
      (target && n < target ? " - a bit short. Around " + target + " gives search engines and buyers something to work with." : ".");
  }

  /* ---------- listing quality ---------- */

  /* Not validation: none of this blocks a save. It is the difference between a
     listing that gets found and clicked and one that does not, written down so
     it is visible at the moment it can still be fixed. */
  function qualityChecks() {
    var photos = (editing && editing.images ? editing.images.length : 0);
    var feats = currentFeatures().length;

    /* Measured on the composed description, not on a text box. In automatic
       mode the template already supplies several hundred characters, so what
       matters is whether anything of Spiro's own has been added to it - that
       is the part that differs from every other listing, and the part a search
       engine has not already seen on a hundred other dealer sites. */
    var snapshot = formSnapshot();
    var auto = descMode === "auto";
    var descEn = auto ? DESCRIBE.text(snapshot, "en").length : $("f-desc").value.trim().length;
    var descFr = auto ? DESCRIBE.text(snapshot, "fr").length : $("f-descfr").value.trim().length;
    var ownEn = auto ? $("f-descnote").value.trim().length : 0;
    var ownFr = auto ? $("f-descnotefr").value.trim().length : 0;

    return [
      photos >= 6 ? ["ok", photos + " photos"]
        : photos > 0 ? ["warn", "Only " + photos + " photo" + (photos === 1 ? "" : "s") + " - six or more gets far more clicks"]
        : ["bad", "No photos yet"],
      $("f-price").value ? ["ok", "Price set"] : ["bad", "No price"],
      $("f-km").value ? ["ok", "Mileage set"] : ["bad", "No mileage"],
      descEn >= 400 ? ["ok", "English description is " + descEn + " characters"]
        : descEn > 0 ? ["warn", "English description is short (" + descEn + " characters)"]
        : ["bad", "No English description"],
      descFr >= 400 ? ["ok", "French description is " + descFr + " characters"]
        : descFr > 0 ? ["warn", "French description is short (" + descFr + " characters)"]
        : ["bad", "No French description"],
      !auto ? ["ok", "Written by hand rather than from the template"]
        : ownEn && ownFr ? ["ok", "Your own words added, in both languages"]
        : ownEn ? ["warn", "Your own words are English only - translate them for the French page"]
        : ["warn", "Nothing of your own yet - a line only you could write is what sets this listing apart"],
      feats >= 5 ? ["ok", feats + " features ticked"]
        : feats > 0 ? ["warn", "Only " + feats + " feature" + (feats === 1 ? "" : "s") + " ticked"]
        : ["warn", "No features ticked"],
      $("f-vin").value.trim() ? ["ok", "VIN recorded"] : ["warn", "No VIN - buyers look for it and it fills the form for you"],
      $("f-extcolor").value.trim() ? ["ok", "Exterior colour set"] : ["warn", "No exterior colour"],
      $("f-engine").value.trim() ? ["ok", "Engine listed"] : ["warn", "No engine listed"]
    ];
  }

  function updateQuality() {
    var rows = qualityChecks();
    var good = rows.filter(function (r) { return r[0] === "ok"; }).length;
    $("quality").innerHTML =
      '<p class="quality-score">' + good + " of " + rows.length + " done. " +
      (good === rows.length ? "This listing is as complete as it gets."
        : "Nothing here blocks publishing - it is what makes the listing work harder.") + "</p>" +
      '<ul class="quality-list">' + rows.map(function (r) {
        return '<li class="q-' + r[0] + '"><span aria-hidden="true">' +
          (r[0] === "ok" ? "✓" : r[0] === "warn" ? "!" : "×") + "</span>" + escapeHtml(r[1]) + "</li>";
      }).join("") + "</ul>";
  }

  /* One listener for the whole form rather than one per field. */
  $("edit-form").addEventListener("input", function () { renderDescription(); updateQuality(); });
  $("edit-form").addEventListener("change", function () { renderDescription(); updateQuality(); });
  [["f-descnote", "desc-count-en", 0], ["f-descnotefr", "desc-count-fr", 0],
   ["f-desc", "desc-count-men", 400], ["f-descfr", "desc-count-mfr", 400]].forEach(function (t) {
    $(t[0]).addEventListener("input", function () { descHint(t[0], t[1], t[2]); });
  });

  /* ---------- spelling ---------- */

  /* "bmw" becomes BMW and "xc60" becomes XC60 as you leave the field, so the
     inventory, the page title and the Marketplace listing all agree. Anything
     the shared list is not sure about is left exactly as typed. */
  $("f-make").addEventListener("blur", function () {
    var fixed = MAKES.fixMake($("f-make").value);
    if (fixed && fixed !== $("f-make").value) $("f-make").value = fixed;
  });
  $("f-model").addEventListener("blur", function () {
    var fixed = MAKES.fixModel($("f-model").value);
    if (fixed && fixed !== $("f-model").value) $("f-model").value = fixed;
  });

  $("makes-list").innerHTML = MAKES.LIST.map(function (m) {
    return "<option>" + escapeHtml(m) + "</option>";
  }).join("");

  /* ---------- share panel ---------- */

  var shareVehicle = null;

  function mpField(key, label, value) {
    if (!value) return "";
    var id = "mp-" + key;
    return '<div class="mp-field"><label for="' + id + '">' + label + "</label>" +
      '<div class="mp-val" id="' + id + '">' + escapeHtml(value) + "</div>" +
      '<button class="btn btn-small btn-ghost" type="button" data-copy="' + id + '">Copy</button></div>';
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Everything this app has posted about this vehicle, newest last, each one
     with a way to look at it and a way to take it down. */
  function renderShareHistory(v) {
    var posts = Array.isArray(v.posts) ? v.posts : [];
    var box = $("share-history");
    if (!posts.length) {
      box.innerHTML = '<p class="fh">Nothing has been posted about this vehicle yet.</p>';
      return;
    }
    box.innerHTML = "<h3>Already posted</h3>" + posts.map(function (p, i) {
      var name = p.target === "facebook" ? "Facebook" : "Instagram";
      return '<div class="post-row">' +
        "<div><strong>" + name + "</strong> · " + escapeHtml(when(p.at) || "") +
        ' <span class="fh">(' + ago(p.at) + ")</span></div>" +
        '<div class="post-row-actions">' +
        (p.url ? '<a class="btn btn-small btn-ghost" href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener">View</a>' : "") +
        '<button class="btn btn-small btn-danger-ghost" type="button" data-delpost="' + i + '">Delete</button>' +
        "</div></div>";
    }).join("");
  }

  $("share-history").addEventListener("click", function (e) {
    var idx = e.target.getAttribute && e.target.getAttribute("data-delpost");
    if (idx === null || idx === undefined || !shareVehicle) return;
    var p = (shareVehicle.posts || [])[Number(idx)];
    if (!p) return;
    var name = p.target === "facebook" ? "Facebook" : "Instagram";
    if (!confirm("Delete this " + name + " post?\n\nThis removes it from " + name +
      " for good. The vehicle listing on your website is not affected.")) return;

    busy("Deleting the " + name + " post…");
    api("social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", target: p.target, postId: p.id })
    }).then(function (d) {
      if (!d.ok) {
        /* Meta's own words. Its documentation contradicts itself about which
           posts an app may remove, so the honest thing is to show what it
           actually said rather than a guess at what it meant. */
        $("share-status").textContent = name + " refused: " + d.error +
          "  ·  You can still delete it in the " + name + " app.";
        toast(name + " would not delete that post.", "err");
        return;
      }
      shareVehicle.posts.splice(Number(idx), 1);
      renderShareHistory(shareVehicle);
      $("share-status").textContent = "Deleted from " + name + ".";
      return savePostRecords("Remove " + p.target + " post record").then(renderDash);
    }).catch(function (e2) {
      $("share-status").textContent = "Could not delete: " + e2.message;
    }).finally(function () { busy(null); });
  });

  function openShare(v) {
    shareVehicle = v;
    $("share-status").textContent = "";
    $("share-caption").value = "Loading…";
    $("share-caption-ig").value = "";
    $("share-marketplace").innerHTML = "";
    renderShareHistory(v);
    $("share-overlay").hidden = false;

    api("social?id=" + encodeURIComponent(v.id))
      .then(function (d) {
        $("share-vehicle").textContent = d.title;
        $("share-caption").value = (d.captions && d.captions.facebook) || d.caption || "";
        $("share-caption-ig").value = (d.captions && d.captions.instagram) || d.caption || "";
        $("share-open").href = d.url;
        var m = d.marketplace;
        $("share-marketplace").innerHTML =
          mpField("title", "Title", m.title) +
          mpField("price", "Price", m.price) +
          mpField("year", "Year", m.year) +
          mpField("make", "Make", m.make) +
          mpField("model", "Model", m.model) +
          mpField("mileage", "Mileage", m.mileage) +
          mpField("trans", "Transmission", m.transmission) +
          mpField("colour", "Exterior colour", m.exteriorColour) +
          mpField("desc", "Description", m.description);

        var ready = d.configured.facebook || d.configured.instagram;
        $("share-post").disabled = !ready;
        if (!ready) {
          $("share-status").textContent =
            "Direct posting is not set up yet, so copy and paste for now. See SOCIAL-SETUP.md.";
        } else if (!d.image) {
          $("share-status").textContent =
            "This vehicle has no photo, so Instagram will be skipped.";
        }
      })
      .catch(function (e) {
        $("share-caption").value = "";
        $("share-status").textContent = "Could not load: " + e.message;
      });
  }

  function closeShare() { $("share-overlay").hidden = true; shareVehicle = null; }

  $("share-close").addEventListener("click", closeShare);
  $("share-overlay").addEventListener("click", function (e) {
    if (e.target === $("share-overlay")) closeShare();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("share-overlay").hidden) closeShare();
  });

  /* One delegated handler for every Copy button in the panel */
  $("share-overlay").addEventListener("click", function (e) {
    var target = e.target.getAttribute && e.target.getAttribute("data-copy");
    if (!target) return;
    var el = $(target);
    var text = el.value !== undefined ? el.value : el.textContent;
    navigator.clipboard.writeText(text).then(function () {
      var old = e.target.textContent;
      e.target.textContent = "Copied";
      setTimeout(function () { e.target.textContent = old; }, 1200);
    }).catch(function () { toast("Could not copy. Select the text manually.", "err"); });
  });

  $("share-post").addEventListener("click", function () {
    if (!shareVehicle) return;
    if (!confirm("Post this to your Facebook Page and Instagram now?")) return;
    busy("Posting…");
    api("social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: shareVehicle.id,
        targets: ["facebook", "instagram"],
        captions: {
          facebook: $("share-caption").value,
          instagram: $("share-caption-ig").value
        }
      })
    }).then(function (d) {
      var lines = Object.keys(d.results).map(function (k) {
        var r = d.results[k];
        var name = k === "facebook" ? "Facebook" : "Instagram";
        return name + ": " + (r.ok ? "posted" : "failed, " + r.error);
      });
      $("share-status").textContent = lines.join("  ·  ");
      var allOk = Object.keys(d.results).every(function (k) { return d.results[k].ok; });
      toast(allOk ? "Posted." : "Some posts failed, see the panel.", allOk ? "ok" : "err");

      /* Write down what went out, so the dashboard can say so and so the post
         can be deleted from here later. */
      if (recordPosts(shareVehicle, d.results)) {
        renderShareHistory(shareVehicle);
        return savePostRecords("Record social post for " + shareVehicle.id).then(renderDash);
      }
    }).catch(function (e) {
      $("share-status").textContent = "Failed: " + e.message;
      toast("Could not post: " + e.message, "err");
    }).finally(function () { busy(null); });
  });

  /* ---------- save (one commit) ---------- */

  function saveAll(message, doneMsg) {
    busy("Saving…");
    return api("save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicles: vehicles,
        newImages: pendingBlobs,
        deletePaths: deletePaths,
        message: message
      })
    }).then(function () {
      pendingBlobs = [];
      deletePaths = [];
      toast(doneMsg || "Saved. The website is updating and will show changes in about a minute.", "ok");
    }).catch(function (e) {
      toast("Could not save: " + e.message, "err");
      throw e;
    }).finally(function () { busy(null); });
  }

  function toggleStatus(v) {
    var to = (v.status || "available") === "sold" ? "available" : "sold";
    if (!confirm((to === "sold" ? "Mark as SOLD: " : "Mark as AVAILABLE: ") + v.year + " " + v.make + " " + v.model + "?")) return;
    v.status = to;
    markLive(v, to);
    v.updatedAt = new Date().toISOString();
    saveAll("Mark " + v.make + " " + v.model + " " + to, null).then(renderDash).catch(renderDash);
  }

  function deleteVehicle(v) {
    if (!confirm("Delete the " + v.year + " " + v.make + " " + v.model + "? This cannot be undone.")) return;
    vehicles = vehicles.filter(function (o) { return o !== v; });
    (v.images || []).forEach(function (p) { deletePaths.push(p); });
    saveAll("Delete " + v.year + " " + v.make + " " + v.model, "Deleted. Website updating.").then(renderDash).catch(function () { loadInventory(); });
  }

  function duplicateVehicle(v) {
    var copy = JSON.parse(JSON.stringify(v));
    copy.id = slug((v.year || "") + "-" + (v.make || "") + "-" + (v.model || "")) + "-" + Math.random().toString(36).slice(2, 7);
    copy.stock = nextStock();
    copy.slugHistory = [];   /* a copy inherits no redirects */
    copy.vin = "";
    copy.images = [];      /* photos are per-vehicle; upload fresh ones */
    copy.status = "draft";
    /* A copy has its own history: it has never been published and nothing has
       ever been posted about it. */
    delete copy.publishedAt;
    delete copy.soldAt;
    copy.posts = [];
    copy.createdAt = new Date().toISOString();
    vehicles.unshift(copy);
    openEditor(copy, true);
    toast("Duplicated as a draft. Add photos and publish when ready.", "ok");
  }

  /* ---------- editor ---------- */

  function blankVehicle() {
    return {
      id: "", year: "", make: "", model: "", trim: "", body: "SUV",
      price: "", km: "", transmission: "Automatic", fuel: "Gasoline",
      drivetrain: "FWD", extColor: "", intColor: "", engine: "", vin: "",
      doors: "", seats: "", econCity: "", econHwy: "",
      stock: nextStock(), tag: "", features: [], desc: "", descFr: "",
      descNote: "", descNoteFr: "", descMode: "auto",
      draftNotes: { ownership: "" }, images: [], posts: [],
      status: "draft", createdAt: new Date().toISOString()
    };
  }

  function openEditor(v, alreadyInList) {
    editing = v;
    isNew = !alreadyInList && vehicles.indexOf(v) === -1;
    $("edit-title").textContent = isNew ? "Add Vehicle" : "Edit Vehicle";
    $("edit-error").hidden = true;

    $("f-year").value = v.year || "";
    $("f-make").value = v.make || "";
    $("f-model").value = v.model || "";
    $("f-trim").value = v.trim || "";
    $("f-price").value = v.price || "";
    $("f-km").value = v.km || "";
    $("f-vin").value = v.vin || "";
    $("f-extcolor").value = v.extColor || "";
    $("f-intcolor").value = v.intColor || "";
    $("f-fuel").value = v.fuel || "Gasoline";
    $("f-trans").value = v.transmission || "Automatic";
    $("f-drive").value = v.drivetrain || "FWD";
    $("f-body").value = v.body || "SUV";
    $("f-engine").value = v.engine || "";
    $("f-doors").value = v.doors || "";
    $("f-seats").value = v.seats || "";
    $("f-econcity").value = v.econCity != null ? v.econCity : "";
    $("f-econhwy").value = v.econHwy != null ? v.econHwy : "";
    $("f-tag").value = v.tag || "";
    $("f-slug").value = v.id || "";
    slugPreview();
    vinStatus(VIN_HINT);
    $("vin-suggest").hidden = true;
    $("vin-suggest").innerHTML = "";
    lastDecoded = (v.vin || "").toUpperCase();
    /* An existing vehicle's dropdowns hold real saved choices; a brand new one
       is only showing defaults, which a decode may replace. */
    ["f-body", "f-drive", "f-fuel", "f-trans"].forEach(function (id) {
      if (v.id) $(id).dataset.touched = "1"; else delete $(id).dataset.touched;
    });
    $("f-desc").value = paragraphs(v.desc);
    $("f-descfr").value = paragraphs(v.descFr);
    $("f-ownership").value = (v.draftNotes && v.draftNotes.ownership) || "";

    /* "Recent work" used to be its own field, which meant it went onto the
       French page in English. It is now part of the note, which can be
       translated properly, so anything already stored is folded in. */
    var legacyWork = (v.draftNotes && v.draftNotes.work) || "";
    $("f-descnote").value = [legacyWork, paragraphs(v.descNote)].filter(Boolean).join("\n\n");
    $("f-descnotefr").value = paragraphs(v.descNoteFr);

    descHint("f-descnote", "desc-count-en", 0);
    descHint("f-descnotefr", "desc-count-fr", 0);
    descHint("f-desc", "desc-count-men", 400);
    descHint("f-descfr", "desc-count-mfr", 400);
    setDescMode(DESCRIBE.mode(v), true);

    renderFeatures(flatFeatures(v));
    renderPhotos();
    updateQuality();
    show("screen-edit");
  }

  function paragraphs(d) {
    return Array.isArray(d) ? d.join("\n\n") : (d || "");
  }

  /* Features arrive as a flat array from this panel, or as the grouped object
     the original sample data used. Both flatten to the same thing. */
  function flatFeatures(v) {
    if (Array.isArray(v.features)) return v.features.slice();
    if (v.features) {
      return [].concat(v.features.safety || [], v.features.comfort || [],
        v.features.technology || [], v.features.exterior || []);
    }
    return [];
  }

  /* The catalogue drawn as grouped checkboxes, with two rules:
     - a legacy label is only shown if this vehicle already carries it, so the
       list does not grow a "AWD" box that duplicates the drivetrain field
     - anything typed by hand that is not in the catalogue goes back into the
       free-text box rather than disappearing */
  function renderFeatures(flat) {
    var chosen = {};
    flat.forEach(function (f) { chosen[CAT.canonical(f).toLowerCase()] = true; });

    function box(f) {
      var on = chosen[f.toLowerCase()] ? " checked" : "";
      return '<label><input type="checkbox" value="' + escapeHtml(f) + '"' + on + ">" +
        "<span>" + escapeHtml(f) + "</span></label>";
    }

    var html = CAT.GROUPS.map(function (g) {
      return '<fieldset class="fgroup"><legend>' + escapeHtml(g.en) + "</legend>" +
        '<div class="feature-checks">' + g.items.map(box).join("") + "</div></fieldset>";
    }).join("");

    var legacy = CAT.LEGACY.filter(function (f) { return chosen[f.toLowerCase()]; });
    if (legacy.length) {
      html += '<fieldset class="fgroup"><legend>Already on this listing</legend>' +
        '<div class="feature-checks">' + legacy.map(box).join("") + "</div></fieldset>";
    }
    $("feature-checks").innerHTML = html;

    $("f-features-extra").value = flat.filter(function (x) { return !CAT.isKnown(x); }).join(", ");
  }

  function collectForm() {
    var v = editing;
    v.year = Number($("f-year").value) || "";
    v.make = $("f-make").value.trim();
    v.model = $("f-model").value.trim();
    v.trim = $("f-trim").value.trim();
    v.price = Number($("f-price").value) || "";
    v.km = Number($("f-km").value) || 0;
    v.vin = $("f-vin").value.trim().toUpperCase();
    v.extColor = $("f-extcolor").value.trim();
    v.intColor = $("f-intcolor").value.trim();
    v.fuel = $("f-fuel").value;
    v.transmission = $("f-trans").value;
    v.drivetrain = $("f-drive").value;
    v.body = $("f-body").value;
    v.engine = $("f-engine").value.trim();
    v.doors = Number($("f-doors").value) || "";
    v.seats = Number($("f-seats").value) || "";
    v.econCity = $("f-econcity").value === "" ? "" : Number($("f-econcity").value);
    v.econHwy = $("f-econhwy").value === "" ? "" : Number($("f-econhwy").value);
    v.tag = $("f-tag").value;
    v.desc = $("f-desc").value.trim();
    v.descFr = $("f-descfr").value.trim();
    v.descNote = $("f-descnote").value.trim();
    v.descNoteFr = $("f-descnotefr").value.trim();
    v.descMode = descMode;
    v.draftNotes = { ownership: $("f-ownership").value };

    v.features = currentFeatures();

    var hexKey = (v.extColor || "").toLowerCase().split(/\s+/).find(function (w) { return COLOR_HEX[w]; });
    v.extHex = hexKey ? COLOR_HEX[hexKey] : (v.extHex || "#6c7178");

    /* Page address. Created once and then left alone: editing year, make,
       model, price or photos never changes a live URL. It only moves when the
       owner deliberately edits the field below, and the old address is kept in
       slugHistory so /api/vehicle can 301 it to the new one. */
    var typed = slug($("f-slug").value);
    if (!v.id) {
      v.id = typed || slug(v.year + "-" + v.make + "-" + v.model) + "-" + Math.random().toString(36).slice(2, 7);
      /* Show the address that was just created. Uploading a photo calls this
         function early, because the image needs a folder to live in, and if the
         field were left blank the next save would see an id on the vehicle, an
         empty box on screen, and refuse to save with "the page address cannot
         be empty" - on a listing where nobody had touched the address at all. */
      $("f-slug").value = v.id;
      slugPreview();
    } else if (typed && typed !== v.id) {
      v.slugHistory = (v.slugHistory || []).filter(function (s) { return s !== typed; });
      if (v.slugHistory.indexOf(v.id) === -1) v.slugHistory.push(v.id);
      v.slugHistory = v.slugHistory.slice(-10);
      v.id = typed;
    }
    v.updatedAt = new Date().toISOString();
    return v;
  }

  function validate(forPublish) {
    var v = editing;
    var missing = [];
    if (!$("f-year").value) missing.push("Year");
    if (!$("f-make").value.trim()) missing.push("Make");
    if (!$("f-model").value.trim()) missing.push("Model");
    if (forPublish) {
      if (!$("f-price").value) missing.push("Price");
      if (!$("f-km").value) missing.push("Mileage");
    }
    if (missing.length) {
      var err = $("edit-error");
      err.textContent = "Please fill in: " + missing.join(", ");
      err.hidden = false;
      return false;
    }

    /* Page address: never allow an empty or already-used address */
    var typed = slug($("f-slug").value);
    var slugError = "";
    if (v.id && !typed) {
      slugError = "The page address cannot be empty. Put the old one back or type a new one.";
    } else if (typed && typed !== v.id) {
      var clash = vehicles.some(function (o) {
        return o !== v && (o.id === typed || (o.slugHistory || []).indexOf(typed) !== -1);
      });
      if (clash) slugError = "The page address “" + typed + "” is already used by another vehicle.";
    }
    if (slugError) {
      var e2 = $("edit-error");
      e2.textContent = slugError;
      e2.hidden = false;
      return false;
    }

    $("edit-error").hidden = true;
    return true;
  }

  /* The dates behind the tracking line. publishedAt is written once, the first
     time a car is visible to the public, and never moved afterwards - editing a
     price is not a new listing. soldAt only exists while the car is sold, so
     putting one back on the market clears it rather than leaving a date that is
     no longer true. */
  function markLive(v, status) {
    if (status !== "draft" && !v.publishedAt) v.publishedAt = new Date().toISOString();
    if (status === "sold") { if (!v.soldAt) v.soldAt = new Date().toISOString(); }
    else delete v.soldAt;
  }

  function saveVehicle(status) {
    if (!validate(status === "available")) return;
    collectForm();
    editing.status = status;
    markLive(editing, status);
    if (vehicles.indexOf(editing) === -1) vehicles.unshift(editing);
    var label = editing.year + " " + editing.make + " " + editing.model;
    saveAll((status === "draft" ? "Draft: " : "Publish: ") + label,
      status === "draft"
        ? "Draft saved. It is not visible on the website."
        : "Published! The website is updating. Your listing will be live in about a minute.")
      .then(function () { renderDash(); show("screen-dash"); })
      .catch(function () { /* stay in editor so nothing is lost */ });
  }

  $("save-draft-btn").addEventListener("click", function () { saveVehicle("draft"); });
  $("publish-btn").addEventListener("click", function () {
    /* Publishing an edited sold vehicle keeps it sold unless the owner confirms */
    var status = "available";
    if (editing.status === "sold" && !confirm("This vehicle is marked SOLD. Publish it as AVAILABLE again?")) {
      status = "sold";
    }
    saveVehicle(status);
  });

  $("f-slug").addEventListener("input", slugPreview);
  $("add-btn").addEventListener("click", function () { openEditor(blankVehicle(), false); });
  $("back-btn").addEventListener("click", function () {
    if (confirm("Leave this listing? Unsaved changes will be lost.")) {
      loadInventory();
    }
  });

  /* ---------- photos ---------- */

  function renderPhotos() {
    var grid = $("photo-grid");
    grid.innerHTML = "";
    (editing.images || []).forEach(function (p, i) {
      var item = document.createElement("div");
      item.className = "photo-item";
      item.draggable = true;
      item.innerHTML =
        '<img src="' + (p.indexOf("data:") === 0 ? p : "/" + p) + '" alt="Photo ' + (i + 1) + '">' +
        (i === 0 ? '<span class="ph-main">Main</span>' : "") +
        '<div class="ph-tools">' +
        '<button type="button" data-mv="-1" aria-label="Move photo ' + (i + 1) + ' earlier">◀</button>' +
        '<button type="button" class="ph-remove" data-rm="1" aria-label="Remove photo ' + (i + 1) + '">✕</button>' +
        '<button type="button" data-mv="1" aria-label="Move photo ' + (i + 1) + ' later">▶</button>' +
        "</div>";

      item.addEventListener("click", function (e) {
        if (e.target.dataset.rm) {
          var removed = editing.images.splice(i, 1)[0];
          if (typeof removed === "string" && removed.indexOf("images/vehicles/") === 0) deletePaths.push(removed);
          pendingBlobs = pendingBlobs.filter(function (b) { return b.path !== removed; });
          renderPhotos();
        } else if (e.target.dataset.mv) {
          var j = i + Number(e.target.dataset.mv);
          if (j < 0 || j >= editing.images.length) return;
          var tmp = editing.images[i];
          editing.images[i] = editing.images[j];
          editing.images[j] = tmp;
          renderPhotos();
        }
      });

      /* drag to reorder */
      item.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", String(i));
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", function () { item.classList.remove("dragging"); });
      item.addEventListener("dragover", function (e) { e.preventDefault(); });
      item.addEventListener("drop", function (e) {
        e.preventDefault();
        var from = Number(e.dataTransfer.getData("text/plain"));
        if (isNaN(from) || from === i) return;
        var moved = editing.images.splice(from, 1)[0];
        editing.images.splice(i, 0, moved);
        renderPhotos();
      });

      grid.appendChild(item);
    });
    updateQuality();
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var MAX = 1600;
        var scale = Math.min(1, MAX / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Could not read " + file.name)); };
      img.src = url;
    });
  }

  var uploadCounter = 0;
  function addFiles(files) {
    var list = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;
    if (!editing.id) collectForm(); /* make sure we have an id for the folder */

    list.reduce(function (chain, file) {
      return chain.then(function () {
        return compressImage(file).then(function (dataUrl) {
          var filename = Date.now().toString(36) + "-" + (++uploadCounter) + ".jpg";
          /* optimistic preview while uploading */
          editing.images = editing.images || [];
          var idx = editing.images.push(dataUrl) - 1;
          renderPhotos();
          var grid = $("photo-grid");
          var overlay = document.createElement("div");
          overlay.className = "ph-uploading";
          overlay.textContent = "Uploading…";
          if (grid.children[idx]) grid.children[idx].appendChild(overlay);

          return api("upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vehicleId: editing.id,
              filename: filename,
              data: dataUrl.split(",")[1]
            })
          }).then(function (out) {
            editing.images[idx] = out.path;
            if (out.sha !== "mock") pendingBlobs.push({ path: out.path, sha: out.sha });
            else pendingBlobs.push({ path: out.path, sha: "mock" });
            renderPhotos();
          }).catch(function (e) {
            editing.images.splice(idx, 1);
            renderPhotos();
            toast("Upload failed: " + e.message, "err");
          });
        });
      });
    }, Promise.resolve());
  }

  var dz = $("dropzone");
  dz.addEventListener("click", function () { $("file-input").click(); });
  dz.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("file-input").click(); }
  });
  $("file-input").addEventListener("change", function () {
    addFiles(this.files);
    this.value = "";
  });
  ["dragenter", "dragover"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("dragover"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("dragover"); });
  });
  dz.addEventListener("drop", function (e) { addFiles(e.dataTransfer.files); });

  /* Closing the tab mid-listing loses everything that is not committed, and a
     phone that swipes the tab away by accident is not a rare event. The browser
     shows its own wording; all we control is whether it asks at all. */
  window.addEventListener("beforeunload", function (e) {
    if ($("screen-edit").hidden) return;
    e.preventDefault();
    e.returnValue = "";
  });

  boot();
})();
