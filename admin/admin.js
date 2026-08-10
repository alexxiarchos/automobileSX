/* Automobile SX — admin panel logic (no dependencies)
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

  var FEATURES = ["Bluetooth", "Apple CarPlay", "Android Auto", "Backup Camera",
    "Heated Seats", "Heated Steering Wheel", "Leather Seats", "Navigation",
    "Sunroof", "Remote Start", "Cruise Control", "AWD"];

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

    var list = $("dash-list");
    list.innerHTML = "";
    if (!vehicles.length) {
      list.innerHTML = '<p class="muted">No vehicles yet. Tap “Add Vehicle” to create your first listing.</p>';
      return;
    }
    vehicles.forEach(function (v, i) {
      var row = document.createElement("div");
      row.className = "dash-row";
      var img = thumbSrc(v);
      row.innerHTML =
        (img ? '<img class="dash-thumb" src="' + img + '" alt="">'
             : '<div class="dash-thumb" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;color:var(--slate);font-size:12px">No photo</div>') +
        '<div class="dash-info">' +
        '<div class="dash-name">' + (v.year || "?") + " " + (v.make || "") + " " + (v.model || "") + (v.trim ? " · " + v.trim : "") + "</div>" +
        '<div class="dash-sub">' + money(v.price) + " · " + Number(v.km || 0).toLocaleString("en-CA") + " km · Stock " + (v.stock || "—") + "</div>" +
        statusBadge(v) +
        "</div>" +
        '<div class="dash-actions">' +
        '<button class="btn btn-small btn-outline" data-act="edit">Edit</button>' +
        '<button class="btn btn-small btn-outline" data-act="status">' + ((v.status || "available") === "sold" ? "Mark Available" : "Mark Sold") + "</button>" +
        '<button class="btn btn-small btn-ghost" data-act="dup">Duplicate</button>' +
        '<button class="btn btn-small btn-danger-ghost" data-act="del">Delete</button>' +
        "</div>";
      row.addEventListener("click", function (e) {
        var act = e.target.getAttribute && e.target.getAttribute("data-act");
        if (!act) return;
        if (act === "edit") openEditor(v, false);
        if (act === "status") toggleStatus(v);
        if (act === "dup") duplicateVehicle(v);
        if (act === "del") deleteVehicle(v);
      });
      list.appendChild(row);
    });
  }

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
      stock: nextStock(), tag: "", features: [], desc: "", images: [],
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
    $("f-tag").value = v.tag || "";
    $("f-slug").value = v.id || "";
    slugPreview();
    $("f-desc").value = Array.isArray(v.desc) ? v.desc.join("\n\n") : (v.desc || "");

    /* features: flat array (admin) or grouped object (original sample data) */
    var flat = Array.isArray(v.features) ? v.features.slice()
      : v.features ? [].concat(v.features.safety || [], v.features.comfort || [], v.features.technology || [], v.features.exterior || [])
      : [];
    var checks = $("feature-checks");
    checks.innerHTML = FEATURES.map(function (f) {
      var on = flat.some(function (x) { return x.toLowerCase() === f.toLowerCase(); });
      return '<label><input type="checkbox" value="' + f + '"' + (on ? " checked" : "") + ">" + f + "</label>";
    }).join("");
    $("f-features-extra").value = flat.filter(function (x) {
      return !FEATURES.some(function (f) { return f.toLowerCase() === x.toLowerCase(); });
    }).join(", ");

    renderPhotos();
    show("screen-edit");
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
    v.tag = $("f-tag").value;
    v.desc = $("f-desc").value.trim();

    var feats = [];
    $("feature-checks").querySelectorAll("input:checked").forEach(function (cb) { feats.push(cb.value); });
    $("f-features-extra").value.split(",").forEach(function (x) {
      x = x.trim();
      if (x) feats.push(x);
    });
    v.features = feats;

    var hexKey = (v.extColor || "").toLowerCase().split(/\s+/).find(function (w) { return COLOR_HEX[w]; });
    v.extHex = hexKey ? COLOR_HEX[hexKey] : (v.extHex || "#6c7178");

    /* Page address. Created once and then left alone: editing year, make,
       model, price or photos never changes a live URL. It only moves when the
       owner deliberately edits the field below, and the old address is kept in
       slugHistory so /api/vehicle can 301 it to the new one. */
    var typed = slug($("f-slug").value);
    if (!v.id) {
      v.id = typed || slug(v.year + "-" + v.make + "-" + v.model) + "-" + Math.random().toString(36).slice(2, 7);
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

  function saveVehicle(status) {
    if (!validate(status === "available")) return;
    collectForm();
    editing.status = status;
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

  boot();
})();
