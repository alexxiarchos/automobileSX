/* English → French, for the parts of a listing a person wrote himself.

   The description generator already writes proper French for everything it
   knows as structured facts, using vocabulary chosen for Quebec: VUS,
   camionnette, rouage intégral. What it cannot write is the half only Spiro
   can - where the car came from, what was just done to it, how it drives. That
   is what this translates.

   Two providers, chosen automatically:

   - DeepL, if DEEPL_API_KEY is set. Better French, one request for the whole
     text, and it needs an account. Free-plan keys end in ":fx" and must go to
     a different host, which is detected here rather than being another
     environment variable to get wrong.
   - MyMemory otherwise. No account, no key, nothing to set up, and it answers
     for Canadian French specifically. It caps a request at 500 bytes, so long
     text is cut into pieces on paragraph and sentence boundaries and stitched
     back together.

   Both produce a draft. Neither writes Quebec commercial French as well as a
   person does, and the panel says so: this fills the box, it does not sign off
   on what is in it. */

const TIMEOUT_MS = 15000;
const MYMEMORY_LIMIT = 450;   /* the documented cap is 500 bytes; leave room */
const MAX_CHUNKS = 20;

function byteLength(s) {
  return Buffer.byteLength(s, "utf8");
}

async function call(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, Object.assign({ signal: controller.signal }, options || {}));
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (body.message || body.error || "").toString() || ("HTTP " + res.status);
      throw new Error(msg);
    }
    return body;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("The translation service did not respond in time.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- splitting ----------

   Paragraphs first, because they are what the description is made of and the
   blank lines have to survive the round trip. A paragraph too long for one
   request is split at sentence ends; a sentence too long for one request is
   split at spaces. Nothing is ever cut mid-word. */
function chunk(text, limit) {
  const out = [];

  function pushSplit(piece, splitter) {
    const parts = piece.split(splitter).filter(p => p.length);
    let buffer = "";
    parts.forEach(part => {
      if (byteLength(buffer + part) > limit && buffer) {
        out.push(buffer.trim());
        buffer = "";
      }
      buffer += part;
    });
    if (buffer.trim()) out.push(buffer.trim());
  }

  text.split(/\n\s*\n/).forEach(para => {
    const p = para.trim();
    if (!p) return;
    if (byteLength(p) <= limit) { out.push(p); return; }
    /* keep the punctuation with the sentence it ends */
    const sentences = p.match(/[^.!?]+[.!?]*\s*/g) || [p];
    sentences.forEach(s => {
      if (byteLength(s) <= limit) { out.push(s.trim()); return; }
      pushSplit(s, /(?<=\s)/);
    });
  });

  /* Last resort. Splitting on spaces cannot help a run of text that contains
     none - a long URL, say - and a chunk over the limit is rejected by the
     service rather than trimmed, so it is cut by length here. Characters are
     counted one at a time because a byte count is not a character count once
     accents are involved, and cutting a letter in half would corrupt it. */
  const safe = [];
  out.forEach(piece => {
    if (byteLength(piece) <= limit) { safe.push(piece); return; }
    let buffer = "";
    for (const ch of piece) {
      if (byteLength(buffer + ch) > limit) { safe.push(buffer); buffer = ""; }
      buffer += ch;
    }
    if (buffer) safe.push(buffer);
  });

  return safe;
}

/* ---------- MyMemory ---------- */

/* MyMemory answers 200 with the complaint inside the translated text rather
   than as an error, so a quota message would be pasted straight into the
   French box if it were trusted blindly. */
function looksLikeAWarning(s) {
  return /MYMEMORY WARNING|QUOTA|PLEASE SELECT|INVALID (SOURCE|TARGET)|YOU USED ALL/i.test(s || "");
}

async function myMemory(text, email) {
  const pieces = chunk(text, MYMEMORY_LIMIT);
  if (!pieces.length) return "";
  if (pieces.length > MAX_CHUNKS) {
    throw new Error("That is a lot of text for the free translator. Translate it a few paragraphs at a time, or add a DeepL key.");
  }

  const done = [];
  for (const piece of pieces) {
    const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(piece) +
      "&langpair=" + encodeURIComponent("en|fr-CA") +
      (email ? "&de=" + encodeURIComponent(email) : "");
    const body = await call(url);
    const out = body && body.responseData && body.responseData.translatedText;
    if (Number(body.responseStatus) !== 200 || !out) {
      throw new Error((body && body.responseDetails) || "The translator returned nothing.");
    }
    if (looksLikeAWarning(out)) {
      throw new Error("The free translator has hit its daily limit: " + out);
    }
    done.push(out.trim());
  }
  return done.join("\n\n");
}

/* ---------- DeepL ---------- */

async function deepl(text, key) {
  const host = /:fx$/.test(key) ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const body = await call(host + "/v2/translate", {
    method: "POST",
    headers: {
      "Authorization": "DeepL-Auth-Key " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: [text],
      source_lang: "EN",
      target_lang: "FR",
      preserve_formatting: true
    })
  });
  const out = body && body.translations && body.translations[0] && body.translations[0].text;
  if (!out) throw new Error("DeepL returned nothing.");
  return out;
}

/**
 * translate(text) → { text, provider }
 * Throws with a sentence worth showing to a person.
 */
async function translate(text) {
  const clean = String(text || "").trim();
  if (!clean) throw new Error("There is nothing in the English box to translate.");
  if (clean.length > 8000) throw new Error("That is too long to translate in one go.");

  const key = (process.env.DEEPL_API_KEY || "").trim();
  if (key) {
    return { text: await deepl(clean, key), provider: "DeepL" };
  }
  /* MyMemory gives 5,000 characters a day anonymously and 50,000 to a request
     that carries a contact address. The dealership's address is already on
     every page of the site and in its structured data, so sending it here
     discloses nothing new and is worth ten times the daily allowance. Override
     it with TRANSLATE_CONTACT_EMAIL if that ever stops being true. */
  const contact = (process.env.TRANSLATE_CONTACT_EMAIL || "Automobilesx@gmail.com").trim();
  return { text: await myMemory(clean, contact), provider: "MyMemory" };
}

module.exports = { translate, chunk, looksLikeAWarning };
