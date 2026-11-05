# Inventory deployment and GA4 conversion tracking

This pull request does not modify production settings or enable Google Analytics automatically.

## Inventory publishing
- An inventory save creates a GitHub commit, which starts a separate Vercel deployment.
- A GitHub save is not confirmation that production is serving the new version.
- The admin now says "Saved to GitHub" rather than promising production in one minute.
- The save API reports warnings when any listing source is missing, cannot be read or lacks card markers.
- Warnings do not abort the save. Check Vercel and both language routes after a warning.

After deployment, manually test a new vehicle, a price change and a sold vehicle. Compare /api/stock, /inventory, /fr/inventaire, both detail routes and /sitemap.xml. Confirm the production alias is pointing to the intended commit; a successful GitHub status by itself cannot prove this.

## Optional GA4 setup
- The existing Vercel Analytics remains the default cookieless measurement.
- Obtain a public measurement ID (format G-...) from your GA4 web stream.
- After a privacy review and approval, configure GA4_MEASUREMENT_ID as a Vercel Production environment variable and redeploy.
- The GA4 script is disabled until a visitor grants separate explicit consent on the EN/FR privacy page. DNT, GPC, an existing measurement opt-out and preview domains disable tracking.
- GA4 receives query-free page URLs, page paths and limited conversion actions. It never receives form contents or selected vehicle IDs as event parameters.
- Events: generate_lead after successful contact form POST, click_to_call on phone links and contact_intent on contact-page links.
- In GA4, mark generate_lead as a key event and test with GA4 Realtime / DebugView, using synthetic form data only.
- Review enhanced measurement, consent, retention and applicable Quebec privacy requirements before enabling. This implementation is not a substitute for legal review.
- Consent can be withdrawn on the privacy page. Previously set GA4 cookies may need to be cleared manually; withdrawal does not delete previously collected data.

## Limitations
GA4 can report identifiable AI referral sessions but cannot isolate Google AI Overview clicks from ordinary Google search. Google Search Console remains the appropriate source for total Google organic clicks.

## CI
GitHub Actions runs JavaScript syntax checks, publishing and metrics regression tests and existing inventory/sitemap tests. CI and a Vercel preview are required checks, but do not independently establish production alias correctness.
