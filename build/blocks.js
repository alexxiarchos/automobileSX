/* Shared body markup for the interactive pages.
   IDs here must match the ones the page scripts look for. */

const { DEALER } = require("./layout.js");

const phoneLink = `<a href="tel:+15148249117">${DEALER.phone}</a>`;

/* ---------------- Home ---------------- */
/* cards is the current inventory already rendered to HTML. It is passed in
   rather than fetched here so that this file stays a pure template and the
   same string can be produced at build time or written again later by
   /api/save when stock changes. The sentinels below mark the region that gets
   replaced; nothing else on the page is touched. */
function homeBody(T, R, cards) {
  return `
  <section class="hero" aria-labelledby="hero-h">
    <div class="hero-bg" aria-hidden="true">
      <picture>
        <source media="(min-width: 768px)"
                srcset="/assets/storefront-hero-wide-900.jpg 900w, /assets/storefront-hero-wide.jpg 1672w"
                sizes="100vw">
        <img src="/assets/storefront-hero.jpg"
             srcset="/assets/storefront-hero-900.jpg 900w, /assets/storefront-hero.jpg 1600w"
             sizes="100vw" alt="${T.home.heroAlt}" fetchpriority="high" decoding="async" width="1600" height="1160">
      </picture>
    </div>
    <div class="container">
      <div class="hero-content">
        <p class="hero-kicker">Vente · Achat · Échange</p>
        <hr class="red-rule">
        <h1 id="hero-h">${T.home.h1}</h1>
        <p class="sub">${T.home.sub}</p>
      </div>
    </div>
  </section>

  <div class="container hero-search-wrap">
    <form class="hero-search" id="hero-search" aria-label="${T.home.searchAria}">
      <div class="field">
        <label for="hs-make">${T.ui.make}</label>
        <select id="hs-make" name="make"></select>
      </div>
      <div class="field">
        <label for="hs-model">${T.ui.model}</label>
        <select id="hs-model" name="model"></select>
      </div>
      <div class="field">
        <label for="hs-price">${T.ui.maxPrice}</label>
        <select id="hs-price" name="maxPrice">
          <option value="">${T.ui.any}</option>
          <option value="10000">10 000 $</option>
          <option value="15000">15 000 $</option>
          <option value="20000">20 000 $</option>
          <option value="25000">25 000 $</option>
          <option value="35000">35 000 $</option>
        </select>
      </div>
      <button class="btn btn-red" type="submit">${T.ui.searchBtn}</button>
    </form>
  </div>

  <section class="section" aria-labelledby="why-h">
    <div class="container">
      <h2 id="why-h" class="visually-hidden">${T.home.whyH}</h2>
      <div class="trust-strip reveal">
        ${T.home.trust.map(t => `
        <div class="trust-item">
          <div><h3>${t.h}</h3><p>${t.p}</p></div>
        </div>`).join("")}
      </div>
    </div>
  </section>

  <section class="section section-mist" aria-labelledby="featured-h">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <span class="kicker">${T.home.featuredKicker}</span>
          <h2 id="featured-h">${T.home.featuredH}</h2>
        </div>
        <a class="text-link" href="${R.inventory}">${T.ui.viewAll}</a>
      </div>
      <div class="vehicle-grid reveal" id="featured-grid"><!--SX:CARDS-->${cards || ""}<!--/SX:CARDS--></div>
    </div>
  </section>

  <section class="section" aria-labelledby="body-h">
    <div class="container">
      <div class="section-head reveal"><h2 id="body-h">${T.home.bodyH}</h2></div>
      <div class="body-tiles reveal" id="body-tiles"></div>
    </div>
  </section>

  <section class="section section-dark" id="financing" aria-labelledby="fin-h">
    <div class="container financing-band">
      <div class="reveal">
        <hr class="red-rule">
        <h2 id="fin-h">${T.home.finH}</h2>
        ${T.home.finBody}
        <p style="margin-bottom:0">
          <a class="btn btn-outline-light" href="${R.financing}">${T.home.finCta}</a>
        </p>
      </div>
      <div class="reveal" id="home-calculator"></div>
    </div>
  </section>

  <section class="section" aria-labelledby="trade-h">
    <div class="container split">
      <div class="split-media reveal">
        <img src="/assets/storefront.jpg" alt="${T.home.lotAlt}" loading="lazy" width="900" height="652">
      </div>
      <div class="reveal">
        <span class="kicker">${T.home.tradeKicker}</span>
        <h2 id="trade-h">${T.home.tradeH}</h2>
        ${T.home.tradeBody}
        <a class="btn btn-outline" href="${R.sell}">${T.home.tradeCta}</a>
      </div>
    </div>
  </section>

  <section class="section section-mist" aria-labelledby="guides-h">
    <div class="container">
      <div class="section-head reveal">
        <div>
          <span class="kicker">${T.home.guidesKicker}</span>
          <h2 id="guides-h">${T.home.guidesH}</h2>
        </div>
        <a class="text-link" href="${R.guides}">${T.home.guidesAll}</a>
      </div>
      <div class="card-grid reveal">
        ${T.home.guideCards.map(g => `
        <a class="link-card" href="${g.href}">
          <h3>${g.h}</h3>
          <p>${g.p}</p>
          <span class="link-card-cta">${T.ui.readMore}</span>
        </a>`).join("")}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="visit-h">
    <div class="container">
      <div class="section-head reveal"><h2 id="visit-h">${T.home.visitH}</h2></div>
      <div class="visit-grid reveal">
        <div class="map-block" id="visit-map"></div>
        <div>
          <h3 style="margin-bottom:4px">Automobile SX</h3>
          <p style="color:var(--slate)">${DEALER.street}, ${DEALER.city}, ${DEALER.region}<br>
          <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a> · ${T.home.askFor}</p>
          <p style="margin-top:-6px"><a class="text-link" href="${DEALER.maps}" target="_blank" rel="noopener">${T.home.directions}</a></p>
          <table class="hours-table" id="visit-hours"></table>
          <p id="visit-note" style="font-size:14px;color:var(--slate);margin-top:12px"></p>
        </div>
      </div>
    </div>
  </section>
${reviewsBlock(T)}`;
}

/* ---------------- Reviews (link out, never scraped) ----------------
   Google's Places policy forbids caching or storing review content, and a
   business showing reviews it controls is ineligible for star rich results
   anyway. So this block does the one useful thing instead: it sends people to
   the real reviews and makes leaving one a single tap. */
function reviewsBlock(T) {
  return `
  <section class="section section-mist" aria-labelledby="reviews-h">
    <div class="container">
      <div class="reviews-cta reveal">
        <div>
          <span class="kicker">${T.home.reviewsKicker}</span>
          <h2 id="reviews-h">${T.home.reviewsH}</h2>
          <p>${T.home.reviewsP}</p>
        </div>
        <div class="reviews-actions">
          <a class="btn btn-red" href="${DEALER.writeReviewUrl}" target="_blank" rel="noopener">${T.home.reviewsWrite}</a>
          <a class="btn btn-outline" href="${DEALER.reviewsUrl}" target="_blank" rel="noopener">${T.home.reviewsRead}</a>
        </div>
      </div>
      ${(T.home.reviewQuotes && T.home.reviewQuotes.length) ? `
      <div class="testimonial-grid reveal">
        ${T.home.reviewQuotes.map(q => `
        <figure class="testimonial">
          <blockquote>${q.text}</blockquote>
          <figcaption><strong>${q.name}</strong><span>${T.home.reviewsVia}</span></figcaption>
        </figure>`).join("")}
      </div>` : ""}
    </div>
  </section>`;
}

/* ---------------- Inventory ---------------- */
function inventoryBody(T, cards) {
  return `
  <div class="page-head">
    <div class="container">
      <h1>${T.inventory.h1}</h1>
      <p class="sub">${T.inventory.sub}</p>
    </div>
  </div>

  <div class="container inventory-layout">
    <aside class="filter-sidebar" id="filter-sidebar" aria-label="${T.ui.filters}">
      <div class="filter-head"><h2>${T.ui.filters}</h2><button class="drawer-close" id="drawer-close" type="button" aria-label="${T.ui.close}">×</button></div>

      <div class="filter-group">
        <div class="field">
          <label for="f-keyword" class="visually-hidden">${T.ui.keyword}</label>
          <input type="text" id="f-keyword" placeholder="${T.ui.keyword}" autocomplete="off">
        </div>
      </div>

      <div class="filter-group"><h3>${T.ui.make}</h3><div class="check-list" id="f-makes"></div></div>
      <div class="filter-group"><h3>${T.ui.bodyType}</h3><div class="check-list" id="f-bodies"></div></div>

      <div class="filter-group">
        <h3>${T.ui.price}</h3>
        <div class="dual-range" id="f-price-range">
          <div class="track"></div><div class="track-fill"></div>
          <input type="range" id="f-price-min" aria-label="${T.ui.priceMin}">
          <input type="range" id="f-price-max" aria-label="${T.ui.priceMax}">
        </div>
        <div class="range-vals"><span id="f-price-min-val"></span><span id="f-price-max-val"></span></div>
      </div>

      <div class="filter-group">
        <h3>${T.ui.year}</h3>
        <div class="dual-range" id="f-year-range">
          <div class="track"></div><div class="track-fill"></div>
          <input type="range" id="f-year-min" aria-label="${T.ui.yearMin}">
          <input type="range" id="f-year-max" aria-label="${T.ui.yearMax}">
        </div>
        <div class="range-vals"><span id="f-year-min-val"></span><span id="f-year-max-val"></span></div>
      </div>

      <div class="filter-group">
        <h3>${T.ui.maxKm}</h3>
        <input type="range" id="f-km" aria-label="${T.ui.maxKm}">
        <div class="range-vals"><span></span><span id="f-km-val"></span></div>
      </div>

      <div class="filter-group"><h3>${T.ui.transmission}</h3><div class="check-list" id="f-trans"></div></div>
      <div class="filter-group"><h3>${T.ui.fuel}</h3><div class="check-list" id="f-fuel"></div></div>
      <div class="filter-group"><h3>${T.ui.drivetrain}</h3><div class="check-list" id="f-drive"></div></div>
    </aside>
    <div class="drawer-overlay" id="drawer-overlay"></div>

    <div>
      <div class="inventory-toolbar">
        <p class="result-count" id="result-count" role="status" aria-live="polite"></p>
        <div class="toolbar-right">
          <button class="btn btn-outline filters-open-btn" id="filters-open" type="button" aria-controls="filter-sidebar" aria-expanded="false">${T.ui.filters}</button>
          <label class="visually-hidden" for="sort">${T.ui.sortLabel}</label>
          <select class="sort-select" id="sort">
            <option value="price-asc">${T.ui.sortPriceAsc}</option>
            <option value="price-desc">${T.ui.sortPriceDesc}</option>
            <option value="km-asc">${T.ui.sortKm}</option>
            <option value="year-desc">${T.ui.sortYear}</option>
          </select>
        </div>
      </div>

      <div class="chip-row" id="chip-row"></div>
      <div class="vehicle-grid" id="inventory-grid"><!--SX:CARDS-->${cards || ""}<!--/SX:CARDS--></div>

      <div class="empty-state" id="empty-state" hidden>
        <h2>${T.ui.emptyTitle}</h2>
        <p>${T.ui.emptyBody}</p>
        <button class="btn btn-red" id="empty-reset" type="button">${T.ui.emptyReset}</button>
      </div>

      <div class="load-more-wrap">
        <button class="btn btn-outline" id="load-more" type="button">${T.ui.loadMore}</button>
      </div>

      <div class="inventory-note">
        ${T.inventory.note}
      </div>
    </div>
  </div>`;
}

/* ---------------- Vehicle detail ---------------- */
function vehicleBody(T) {
  return `
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb"><ol id="breadcrumb"></ol></nav>
  </div>

  <div class="container detail-layout">
    <div>
      <h1 id="v-title" style="font-size:clamp(1.6rem,3vw,2.2rem);margin-bottom:4px"></h1>
      <p id="v-subtitle" style="color:var(--slate);margin-bottom:20px"></p>

      <div class="gallery-main" id="gallery-main">
        <img id="gal-img" src="" alt="">
        <button class="gal-btn gal-prev" id="gal-prev" type="button" aria-label="‹">‹</button>
        <button class="gal-btn gal-next" id="gal-next" type="button" aria-label="›">›</button>
        <span class="gal-counter" id="gal-counter"></span>
      </div>
      <div class="thumb-strip" id="thumb-strip"></div>

      <div class="detail-sections">
        <section aria-labelledby="h-overview">
          <h2 id="h-overview">${T.ui.overview}</h2>
          <div id="v-overview"></div>
        </section>
        <section aria-labelledby="h-specs">
          <h2 id="h-specs">${T.ui.specs}</h2>
          <div class="spec-cols" id="v-specs"></div>
        </section>
        <section aria-labelledby="h-features">
          <h2 id="h-features">${T.ui.features}</h2>
          <div id="v-features"></div>
        </section>
        <section aria-labelledby="h-calc">
          <h2 id="h-calc">${T.ui.estimatePayment}</h2>
          <div id="v-calculator" style="max-width:560px"></div>
        </section>
      </div>
    </div>

    <aside class="detail-rail">
      <div class="rail-card">
        <div class="rail-price" id="r-price"></div>
        <p class="rail-mo" id="r-mo"></p>
        <ul class="rail-facts" id="r-facts"></ul>
        <a class="btn btn-red btn-block" id="r-testdrive" href="#">${T.ui.bookTestDrive}</a>
        <a class="btn btn-outline btn-block" id="r-availability" href="#">${T.ui.checkAvailability}</a>
        <a class="text-link" id="r-preapproved" href="#">${T.ui.getPreApproved}</a>
      </div>
      <div class="rail-card dealer-card">
        <strong>Automobile SX</strong> · Spiro Xiarchos<br>
        ${DEALER.street}, ${DEALER.city}, ${DEALER.region}<br>
        ${phoneLink}<br>
        <a href="mailto:${DEALER.email}">${DEALER.email}</a><br>
        <span style="color:var(--slate)">${T.ui.hoursShort}</span>
      </div>
    </aside>
  </div>

  <section class="section section-mist" aria-labelledby="h-similar">
    <div class="container">
      <div class="section-head">
        <h2 id="h-similar">${T.ui.similar}</h2>
        <a class="text-link" href="${T.R.inventory}">${T.ui.viewAll}</a>
      </div>
      <div class="vehicle-grid" id="similar-grid"></div>
    </div>
  </section>

  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true">
    <button class="lightbox-close" id="lb-close" type="button" aria-label="×">×</button>
    <button class="gal-btn gal-prev" id="lb-prev" type="button" aria-label="‹">‹</button>
    <img id="lb-img" src="" alt="">
    <button class="gal-btn gal-next" id="lb-next" type="button" aria-label="›">›</button>
  </div>

  <div class="detail-mobile-bar" id="detail-mobile-bar">
    <div><div class="dm-price" id="dm-price"></div></div>
    <a class="btn btn-red" id="dm-testdrive" href="#">${T.ui.bookTestDrive}</a>
  </div>`;
}

/* ---------------- Contact ---------------- */
function contactBody(T) {
  return `
  <div class="page-head">
    <div class="container">
      <h1>${T.contact.h1}</h1>
      <p class="sub">${T.contact.sub}</p>
    </div>
  </div>

  <div class="container contact-layout">
    <div>
      <form class="contact-form-card" id="contact-form" novalidate>
        <h2 style="font-size:1.3rem">${T.contact.formH}</h2>

        <div class="form-hp" aria-hidden="true">
          <label for="c-website">Website</label>
          <input type="text" id="c-website" tabindex="-1" autocomplete="off">
        </div>

        <div class="form-row" id="row-name">
          <label for="c-name">${T.contact.name} <span class="req">*</span></label>
          <div class="field"><input type="text" id="c-name" autocomplete="name" maxlength="100" required></div>
          <p class="field-error">${T.contact.errName}</p>
        </div>
        <div class="form-row" id="row-email">
          <label for="c-email">${T.contact.email} <span class="req">*</span></label>
          <div class="field"><input type="email" id="c-email" autocomplete="email" maxlength="254" required></div>
          <p class="field-error">${T.contact.errEmail}</p>
        </div>
        <div class="form-row" id="row-phone">
          <label for="c-phone">${T.contact.phone} <span class="req">*</span></label>
          <div class="field"><input type="tel" id="c-phone" autocomplete="tel" maxlength="40" required placeholder="514-555-0123"></div>
          <p class="field-error">${T.contact.errPhone}</p>
        </div>
        <div class="form-row" id="row-interest">
          <label for="c-interest">${T.contact.interest}</label>
          <div class="field">
            <select id="c-interest">
              <option value="general">${T.contact.optGeneral}</option>
              <option value="vehicle">${T.contact.optVehicle}</option>
              <option value="test-drive">${T.contact.optTestDrive}</option>
              <option value="financing">${T.contact.optFinancing}</option>
              <option value="trade-in">${T.contact.optTrade}</option>
            </select>
          </div>
        </div>
        <div class="form-row" id="row-vehicle" hidden>
          <label for="c-vehicle">${T.contact.whichVehicle}</label>
          <div class="field"><select id="c-vehicle"></select></div>
        </div>
        <div class="form-row" id="row-message">
          <label for="c-message">${T.contact.message} <span class="req">*</span></label>
          <div class="field"><textarea id="c-message" rows="6" maxlength="3000" required></textarea></div>
          <p class="field-error">${T.contact.errMessage}</p>
        </div>

        <button class="btn btn-red btn-block" id="c-submit" type="submit" data-sending="${T.contact.sending}" disabled>${T.contact.send}</button>
        <p style="font-size:12.5px;color:var(--slate);margin:12px 0 0">${T.contact.formNote}</p>
        <div class="form-submit-error" id="form-error" role="alert" tabindex="-1" hidden>
          ${T.contact.sendError}
        </div>
      </form>

      <div class="form-success" id="form-success" role="status" tabindex="-1">
        <h2 style="font-size:1.2rem">${T.contact.successH}</h2>
        <p>${T.contact.successBody}</p>
      </div>
    </div>

    <div>
      <div class="contact-info-card">
        <h2 style="font-size:1.3rem">Automobile SX</h2>
        <p style="color:var(--slate);margin:0 0 8px">Spiro Xiarchos</p>
        <address>
          ${DEALER.street}<br>${DEALER.city}, ${DEALER.region}<br>
          <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a><br>
          <a class="text-link" href="mailto:${DEALER.email}">${DEALER.email}</a>
        </address>
        <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:var(--slate);margin-top:22px">${T.ui.hours}</h3>
        <table class="hours-table" id="contact-hours"></table>
        <p style="font-size:14px;color:var(--slate);margin-top:12px" id="contact-appt-note"></p>
        <p style="margin-top:18px;margin-bottom:0">
          <a class="btn btn-outline" href="${DEALER.maps}" target="_blank" rel="noopener">${T.contact.directions}</a>
        </p>
      </div>
      <div class="contact-map" id="contact-map"></div>
    </div>
  </div>
  ${reviewsBlock(T)}`;
}

module.exports = { homeBody, inventoryBody, vehicleBody, contactBody };
