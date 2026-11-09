# Inventory deployment and privacy-conscious site metrics

## Inventory publishing
- An inventory save creates a GitHub commit, which starts a separate Vercel deployment.
- A GitHub save is not confirmation that production is serving the new version.
- The admin says "Saved to GitHub" rather than promising production in one minute.
- The save API reports warnings when any listing source is missing, cannot be read or lacks card markers.
- Warnings do not abort the save. Check Vercel and both language routes after a warning.

After deployment, manually test a new vehicle, a price change and a sold vehicle. Compare /api/stock, /inventory, /fr/inventaire, both detail routes and /sitemap.xml. Confirm the production alias is pointing to the intended commit; a successful GitHub status by itself cannot prove this.

## Site analytics
- Vercel Web Analytics and Speed Insights provide aggregate, cookieless traffic and performance measurements.
- No external marketing analytics scripts, cookies or measurement IDs are included in the website.
- Metrics run only on the production automobilesx.ca hosts, not on previews.
- Browser Do Not Track, Global Privacy Control and a visitor's saved analytics opt-out disable metric scripts.
- The English and French privacy pages explain the measurement and offer an opt-out.
- The Web Analytics beforeSend hook removes query strings and fragments and ignores admin paths.
- No form contents or contact details are intentionally sent to the metrics service.
- Continue to assess compliance with applicable Quebec privacy requirements.

## Limitations
Google Search Console remains the source for Google organic search clicks. Vercel Web Analytics offers aggregate traffic data without full visitor-level attribution.

## CI
GitHub Actions runs JavaScript syntax checks, publishing and metrics regression tests and existing inventory/sitemap tests. CI and a Vercel preview are required checks, but do not independently establish production alias correctness.
