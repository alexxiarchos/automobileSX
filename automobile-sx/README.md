# Automobile SX — starter marketing site

Front-end only. No backend, no build step, no dependencies — open `index.html` in a browser
(or serve the folder with any static server) and everything works.

## Pages

- `index.html` — home: hero + search, trust strip, featured vehicles, body-type tiles, financing estimator, trade-in, testimonials (marked as sample), visit block
- `inventory.html` — 24-vehicle listing with working keyword/make/body/price/year/km/transmission/fuel/drivetrain filters, removable chips, live count, sorting, load-more, empty state; accepts `?make=`, `?model=`, `?body=`, `?maxPrice=` from the home search and body tiles
- `vehicle.html?id=<id>` — gallery (arrows, keyboard, lightbox), sticky price rail (fixed bottom bar on mobile), specs, grouped features, vehicle-history summary, pre-filled payment calculator, similar vehicles
- `contact.html` — validated form (blur validation, disabled submit, simulated success), dealership card, map, FAQ accordion; accepts `?interest=` and `?vehicle=` to pre-fill

## Where things live

- `js/data.js` — all mock inventory, dealership info (phone, address, hours), finance rate, and the EN/FR string table. This is the only file to touch when swapping in real vehicles or translations.
- `js/components.js` — shared header/footer, VehicleCard, PaymentCalculator, placeholder image generator, scroll reveal
- `js/home.js`, `js/inventory.js`, `js/detail.js`, `js/contact.js` — one script per page
- `css/styles.css` — design tokens at the top (`:root`), then components

## Notes

- Vehicle "photos" are generated SVG placeholders (colour-matched silhouettes) so the site is fully self-contained offline. Replace `SXUI.vehicleImage`/`vehicleImages` in `components.js` with real photo paths per vehicle when photography is ready — each vehicle already has 7 image slots and alt text.
- The EN/FR toggle in the header switches the key strings in `SX.strings`; extend the `fr` table to complete the translation.
- Saved vehicles (hearts) and filters are kept in memory only — no cookies, no localStorage — per spec.
- Phone number, VINs, address and testimonials are placeholders.
