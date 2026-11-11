# Public inventory publication

The admin writes `data/vehicles.json` to the configured GitHub inventory
branch. On Vercel, the build resolves the branch to a commit SHA and reads that
immutable file. A missing or malformed source fails the build before pages are
generated. Vercel continues serving the last successful deployment.

The build uses one snapshot for both languages, homepage totals, inventory
cards, detail pages, the sitemap and `/api/stock`. An available status or a
legacy record with no status counts as active. Sold listings remain reachable
with a SoldOut offer. Draft, hidden and inactive records have no public listing.

The freshness window is the time from an admin commit to activation of its
successful production deployment. There is no independent inventory refresh
timer. Static HTML revalidates at the deployment boundary, and the stock feed,
sitemap and detail resolver require revalidation on each request. Browsers keep
the server HTML if the feed fails or returns a different snapshot revision.

## Verify after a Vercel preview or production deployment

```sh
base=https://www.automobilesx.ca
for route in / /inventory /fr /fr/inventaire; do
  curl -fsS "$base$route" | grep -o 'data-inventory-count="[0-9]*" data-inventory-revision="[^"]*"'
done
curl -fsSI "$base/api/stock"
curl -fsS "$base/sitemap.xml"
```

The four counts and revisions should match. Inspect `/inventory` for one
unique active listing link per vehicle. Fetch a vehicle link directly and
compare its visible price, mileage and VIN with the JSON-LD. Use Google Search
Console's live URL inspection on the homepage, inventory page and a sample
detail page. Use the Schema Markup Validator or Rich Results Test on the detail
page, and check sitemap processing separately in Search Console.

For monitoring, fetch the two English pages without JavaScript every five
minutes. Alert after two consecutive failures if either count or revision is
missing, the two values disagree, or the inventory card link count differs
from the declared count. Also alert when a successful admin commit has no
corresponding successful production deployment after the team's expected
deployment window. Both pages can agree while serving the previous release.
