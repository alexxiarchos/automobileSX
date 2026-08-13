/* Automobile SX — a QR encoder, in about two hundred lines and no dependencies.

   Why write one rather than pull one in: this site has no build step and no
   package manager. Everything it runs is a file in the repository that can be
   read and understood. A window sticker needs a code that a phone can scan
   from the far side of the glass, and that is the whole of what this does —
   byte mode, error-correction level M, versions 1 to 6, which is 108 bytes of
   payload at the top end and comfortably more than any address on this site.

   Level M corrects around 15% damage, which is the right trade for a sheet
   that will sit in a windscreen in the sun and get rained on when the door
   opens. Versions stop at 6 deliberately: version 7 and up must also carry a
   version-information block, and there is no reason to write that code for
   payloads this size.

   Verified by generating codes and reading them back with a real decoder
   rather than by inspection — see verify-qr.js. */

(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SX_QR = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- GF(256), the field Reed-Solomon works in ---------- */

  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;          /* the QR primitive polynomial */
    }
    for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function mul(a, b) {
    if (!a || !b) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  /* The generator polynomial for n error-correction codewords. */
  function generator(n) {
    var poly = [1];
    for (var i = 0; i < n; i++) {
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= mul(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly;
  }

  function ecBytes(data, count) {
    var gen = generator(count);
    var rem = data.concat(new Array(count).fill(0));
    for (var i = 0; i < data.length; i++) {
      var factor = rem[i];
      if (!factor) continue;
      for (var j = 0; j < gen.length; j++) rem[i + j] ^= mul(gen[j], factor);
    }
    return rem.slice(data.length);
  }

  /* ---------- the version tables, level M only ----------
     [ total codewords, ec codewords per block, [ [blocks, data codewords], ... ] ] */
  var VERSIONS = {
    1: { total: 26,  ec: 10, groups: [[1, 16]] },
    2: { total: 44,  ec: 16, groups: [[1, 28]] },
    3: { total: 70,  ec: 26, groups: [[1, 44]] },
    4: { total: 100, ec: 18, groups: [[2, 32]] },
    5: { total: 134, ec: 24, groups: [[2, 43]] },
    6: { total: 172, ec: 16, groups: [[4, 27]] }
  };

  var ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };

  function capacity(version) {
    var v = VERSIONS[version];
    return v.groups.reduce(function (n, g) { return n + g[0] * g[1]; }, 0);
  }

  function pickVersion(byteLength) {
    for (var v = 1; v <= 6; v++) {
      /* 4 bits of mode + 8 bits of length + the data itself */
      if (byteLength + 2 <= capacity(v)) return v;
    }
    throw new Error("Too much data for a version 6 QR code (" + byteLength + " bytes).");
  }

  /* ---------- bits in, codewords out ---------- */

  function encodeData(bytes, version) {
    var bits = [];
    function push(value, length) {
      for (var i = length - 1; i >= 0; i--) bits.push((value >> i) & 1);
    }

    push(0x4, 4);                 /* byte mode */
    push(bytes.length, 8);        /* length, 8 bits for versions 1-9 */
    bytes.forEach(function (b) { push(b, 8); });

    var totalData = capacity(version);
    var maxBits = totalData * 8;
    for (var i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);   /* terminator */
    while (bits.length % 8) bits.push(0);

    var words = [];
    for (i = 0; i < bits.length; i += 8) {
      var b = 0;
      for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      words.push(b);
    }
    var pad = [0xEC, 0x11], p = 0;
    while (words.length < totalData) words.push(pad[p++ % 2]);

    /* split into blocks, compute error correction, then interleave */
    var v = VERSIONS[version];
    var blocks = [], at = 0;
    v.groups.forEach(function (g) {
      for (var n = 0; n < g[0]; n++) {
        var data = words.slice(at, at + g[1]);
        at += g[1];
        blocks.push({ data: data, ec: ecBytes(data, v.ec) });
      }
    });

    var out = [];
    var longest = Math.max.apply(null, blocks.map(function (b) { return b.data.length; }));
    for (i = 0; i < longest; i++) {
      blocks.forEach(function (b) { if (i < b.data.length) out.push(b.data[i]); });
    }
    for (i = 0; i < v.ec; i++) {
      blocks.forEach(function (b) { out.push(b.ec[i]); });
    }
    return out;
  }

  /* ---------- the matrix ---------- */

  function build(version, codewords, mask) {
    var size = version * 4 + 17;
    var m = [], reserved = [];
    for (var i = 0; i < size; i++) {
      m.push(new Array(size).fill(0));
      reserved.push(new Array(size).fill(false));
    }

    function set(r, c, dark) { m[r][c] = dark ? 1 : 0; reserved[r][c] = true; }

    function finder(row, col) {
      for (var r = -1; r <= 7; r++) {
        for (var c = -1; c <= 7; c++) {
          var rr = row + r, cc = col + c;
          if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
          var dark = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                     (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                     (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          set(rr, cc, dark);
        }
      }
    }
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

    /* timing patterns */
    for (i = 8; i < size - 8; i++) {
      set(6, i, i % 2 === 0);
      set(i, 6, i % 2 === 0);
    }

    /* alignment patterns, skipping the three finder corners */
    var pos = ALIGN[version];
    pos.forEach(function (r) {
      pos.forEach(function (c) {
        if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) return;
        for (var dr = -2; dr <= 2; dr++) {
          for (var dc = -2; dc <= 2; dc++) {
            set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
          }
        }
      });
    });

    /* the always-dark module, and the space the format bits will occupy */
    set(size - 8, 8, true);
    for (i = 0; i < 9; i++) {
      if (!reserved[8][i]) { m[8][i] = 0; reserved[8][i] = true; }
      if (!reserved[i][8]) { m[i][8] = 0; reserved[i][8] = true; }
    }
    for (i = 0; i < 8; i++) {
      if (!reserved[8][size - 1 - i]) { m[8][size - 1 - i] = 0; reserved[8][size - 1 - i] = true; }
      if (!reserved[size - 1 - i][8]) { m[size - 1 - i][8] = 0; reserved[size - 1 - i][8] = true; }
    }

    /* data, laid in two-wide columns from the bottom right, boustrophedon */
    var bitIndex = 0;
    function nextBit() {
      var byteAt = bitIndex >> 3;
      if (byteAt >= codewords.length) return 0;
      var bit = (codewords[byteAt] >> (7 - (bitIndex & 7))) & 1;
      bitIndex++;
      return bit;
    }

    var col = size - 1, upward = true;
    while (col > 0) {
      if (col === 6) col--;                 /* the vertical timing pattern */
      for (var n = 0; n < size; n++) {
        var row = upward ? size - 1 - n : n;
        for (var k = 0; k < 2; k++) {
          var c2 = col - k;
          if (reserved[row][c2]) continue;
          var bit = nextBit();
          if (maskAt(mask, row, c2)) bit ^= 1;
          m[row][c2] = bit;
        }
      }
      upward = !upward;
      col -= 2;
    }

    placeFormat(m, size, mask);
    return m;
  }

  function maskAt(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    }
  }

  /* 5 bits of level and mask, 10 of BCH, masked with the constant from the
     specification so that an all-zero format is never valid. */
  function formatBits(mask) {
    var data = (0x00 << 3) | mask;          /* 00 is level M */
    var rem = data << 10;
    for (var i = 14; i >= 10; i--) {
      if ((rem >> i) & 1) rem ^= 0x537 << (i - 10);
    }
    return ((data << 10) | rem) ^ 0x5412;
  }

  function placeFormat(m, size, mask) {
    var bits = formatBits(mask);
    /* Most significant bit first along the path: the module at (8,0) carries
       bit 14, not bit 0. Writing it the other way round produces a code that
       is internally consistent — our own reader was perfectly happy with it —
       and that no real scanner will touch. Confirmed against a reference
       encoder rather than against ourselves. */
    function bit(i) { return (bits >> (14 - i)) & 1; }
    for (var i = 0; i <= 5; i++) m[8][i] = bit(i);
    m[8][7] = bit(6);
    m[8][8] = bit(7);
    m[7][8] = bit(8);
    for (i = 9; i <= 14; i++) m[14 - i][8] = bit(i);

    /* The second copy is split 7 / 8, not 8 / 7: the module at (size-8, 8) is
       the fixed dark module, not a format bit, so the column part is one
       shorter than the row part. Getting this backwards produces a code that
       looks perfectly plausible and that no scanner will read. */
    for (i = 0; i <= 6; i++) m[size - 1 - i][8] = bit(i);
    for (i = 7; i <= 14; i++) m[8][size - 15 + i] = bit(i);
    m[size - 8][8] = 1;
  }

  /* ---------- mask selection ---------- */

  function penalty(m) {
    var size = m.length, score = 0, i, j, run, dark = 0;

    for (i = 0; i < size; i++) {
      for (var dir = 0; dir < 2; dir++) {
        run = 1;
        for (j = 1; j < size; j++) {
          var a = dir ? m[j][i] : m[i][j];
          var b = dir ? m[j - 1][i] : m[i][j - 1];
          if (a === b) { run++; } else { if (run >= 5) score += run - 2; run = 1; }
        }
        if (run >= 5) score += run - 2;
      }
    }

    for (i = 0; i < size - 1; i++) {
      for (j = 0; j < size - 1; j++) {
        var s = m[i][j] + m[i][j + 1] + m[i + 1][j] + m[i + 1][j + 1];
        if (s === 0 || s === 4) score += 3;
      }
    }

    var pattern = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    for (i = 0; i < size; i++) {
      for (j = 0; j + 11 <= size; j++) {
        var rowHit = true, colHit = true;
        for (var k = 0; k < 11; k++) {
          if (m[i][j + k] !== pattern[k]) rowHit = false;
          if (m[j + k][i] !== pattern[k]) colHit = false;
        }
        if (rowHit) score += 40;
        if (colHit) score += 40;
      }
    }

    for (i = 0; i < size; i++) for (j = 0; j < size; j++) if (m[i][j]) dark++;
    var percent = (dark * 100) / (size * size);
    score += Math.floor(Math.abs(percent - 50) / 5) * 10;
    return score;
  }

  function utf8(text) {
    var out = [], s = unescape(encodeURIComponent(String(text)));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  /** matrix(text) → array of rows of 0/1 */
  function matrix(text) {
    var bytes = utf8(text);
    var version = pickVersion(bytes.length);
    var words = encodeData(bytes, version);
    var best = null, bestScore = Infinity;
    for (var mask = 0; mask < 8; mask++) {
      var m = build(version, words, mask);
      var score = penalty(m);
      if (score < bestScore) { bestScore = score; best = m; }
    }
    return best;
  }

  /**
   * svg(text, options) → an <svg> string.
   * One path for every dark module, which keeps the file small and prints
   * crisply at any size — a raster image at sticker scale would not.
   */
  function svg(text, options) {
    options = options || {};
    var quiet = options.quiet === undefined ? 4 : options.quiet;
    var m = matrix(text);
    var size = m.length + quiet * 2;
    var d = [];
    for (var r = 0; r < m.length; r++) {
      for (var c = 0; c < m.length; c++) {
        if (m[r][c]) d.push("M" + (c + quiet) + " " + (r + quiet) + "h1v1h-1z");
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '"' +
      (options.className ? ' class="' + options.className + '"' : "") +
      ' shape-rendering="crispEdges" role="img" aria-label="' +
      (options.label || "QR code") + '">' +
      '<rect width="' + size + '" height="' + size + '" fill="#fff"/>' +
      '<path d="' + d.join("") + '" fill="#000"/></svg>';
  }

  return { matrix: matrix, svg: svg, capacity: capacity, VERSIONS: VERSIONS };
});
