/* English copy. Quebec facts verified August 2026 against OPC, SAAQ,
   Revenu Québec and Québec.ca; each guide carries a dated accuracy note. */

const { ROUTES, DEALER } = require("./layout.js");
const R = ROUTES.en;

const ui = {
  make: "Make", model: "Model", maxPrice: "Max price", any: "Any",
  searchBtn: "Search Inventory", viewAll: "View all inventory →",
  filters: "Filters", close: "Close", keyword: "Search make, model, trim…",
  bodyType: "Body type", price: "Price", priceMin: "Minimum price", priceMax: "Maximum price",
  year: "Year", yearMin: "Earliest year", yearMax: "Latest year", maxKm: "Max kilometres",
  transmission: "Transmission", fuel: "Fuel", drivetrain: "Drivetrain",
  sortLabel: "Sort vehicles", sortPriceAsc: "Price: low to high", sortPriceDesc: "Price: high to low",
  sortKm: "Lowest kilometres", sortYear: "Newest year",
  emptyTitle: "No vehicles match those filters",
  emptyBody: "Try widening the price or kilometre range, or clear everything and start over.",
  emptyReset: "Reset all filters", loadMore: "Load more vehicles",
  overview: "Overview", specs: "Specifications", features: "Features",
  similar: "Similar vehicles", estimatePayment: "Estimate your payment",
  bookTestDrive: "Book a Test Drive", checkAvailability: "Check Availability",
  getPreApproved: "Ask about financing", hoursShort: "Open 10 to 6, seven days, by appointment",
  hours: "Hours", readMore: "Read the guide →"
};

const ctaCard = `
<aside class="prose-aside">
  <div class="aside-card">
    <h2>Talk to Spiro</h2>
    <p>You deal directly with Spiro throughout the buying process, in English or in French.</p>
    <a class="btn btn-red btn-block" href="tel:+15148249117">Call ${DEALER.phone}</a>
    <a class="btn btn-outline btn-block" href="${R.contact}">Send a message</a>
    <a class="btn btn-ghost btn-block" href="${R.inventory}">Browse inventory</a>
    <p class="aside-note">${DEALER.street}, ${DEALER.city}, ${DEALER.region}<br>Open 10:00 to 18:00, seven days a week.</p>
  </div>
</aside>`;

const accuracyNote = `<p class="accuracy-note">Information on this page reflects Quebec rules as of August 2026 and is provided for general guidance only. It is not legal or financial advice. Rules and fees change; confirm current details with the <a href="https://www.opc.gouv.qc.ca" target="_blank" rel="noopener">Office de la protection du consommateur</a>, <a href="https://saaq.gouv.qc.ca" target="_blank" rel="noopener">SAAQ</a> or <a href="https://www.revenuquebec.ca" target="_blank" rel="noopener">Revenu Québec</a>.</p>`;

function prose(h1, sub, article) {
  return `
  <div class="page-head">
    <div class="container"><h1>${h1}</h1><p class="sub">${sub}</p></div>
  </div>
  <div class="container prose-layout">
    <article class="prose">${article}</article>
    ${ctaCard}
  </div>`;
}

const guideCards = [
  { h: "Buying a used car in Quebec", p: "Taxes, the legal warranty, the dealer label and what to check before you sign.", href: R.g1 },
  { h: "Car financing with bad credit", p: "What lenders look for, realistic rates, and the rights you keep in Quebec.", href: R.g2 },
  { h: "What is my trade-in worth?", p: "How trade values are set, and the tax saving most buyers miss.", href: R.g3 },
  { h: "Registering a used car", p: "SAAQ paperwork, plates, and what the dealer handles for you.", href: R.g4 }
];

module.exports = {
  asideCard: ctaCard,
  lang: "en",
  R,
  ui,

  home: {
    title: "Used Cars in Dorval, QC | Automobile SX | Vente d'Autos Usagées",
    description: "Used cars for sale in Dorval, Quebec. Family-run dealership offering sales, purchases and trades, with financing available. Open 10 to 6, seven days.",
    h1: "Quality used cars in Dorval",
    sub: "A family-run dealership on Avenue Chartier. You deal directly with Spiro throughout the buying process, in English or in French.",
    heroAlt: "The Automobile SX lot at 2044 Avenue Chartier in Dorval",
    searchAria: "Search inventory",
    whyH: "Why buy from Automobile SX",
    trust: [
      { h: "Personal service", p: "You deal directly with Spiro, from the first phone call to the keys in your hand." },
      { h: "Vente · Achat · Échange", p: "We sell, we buy, and we take trades. Kilometres and condition disclosed up front." },
      { h: "Open seven days", p: `10:00 to 18:00 every day. Appointments are recommended, so call ${DEALER.phone} ahead and we can have the vehicle ready for you.` },
      { h: "Financing for all credit", p: "Good credit, new credit or bruised credit. We work with several lenders and show you the real numbers." }
    ],
    featuredKicker: "In stock now",
    featuredH: "Used cars for sale in Dorval",
    bodyH: "Browse by body type",
    finH: "Financing in Dorval, whatever your credit looks like.",
    finBody: `<p>New to Canada with no credit file? Rebuilding after a rough patch? We work with several Canadian lenders and tell you the real rate and the real payment before anything gets signed.</p>
      <p>And to be clear about your rights: in Quebec a dealer cannot make financing a condition of buying the car. If you would rather pay cash or use your own bank, that is your call.</p>`,
    finCta: "How financing works",
    lotAlt: "The Automobile SX lot at 2044 Avenue Chartier in Dorval",
    tradeKicker: "Vente · Achat · Échange",
    tradeH: "We buy cars too, and a trade cuts your tax bill.",
    tradeBody: `<p>Selling privately means strangers at your door and payment risk. Bring it to us instead and get a straight offer, whether or not you buy anything from us.</p>
      <p>If you do trade against a purchase, Quebec calculates the sales tax on the price <em>after</em> your trade-in is deducted, so the saving is real money.</p>`,
    tradeCta: "Get your car appraised",
    guidesKicker: "Straight answers",
    guidesH: "Guides for used-car buyers in Quebec",
    guidesAll: "All guides →",
    guideCards,
    reviewsKicker: "Google reviews",
    reviewsH: "Straight from our customers",
    reviewsP: "Real feedback from people who dealt directly with Spiro in Dorval. Read every review on Google, or share your experience and help a small family business.",
    /* Real quotes only, transcribed from the Google reviews, newest first.
       Leave this empty rather than inventing anything: the section renders the
       call to action on its own when there are no quotes yet. */
    /* Real Google reviews, transcribed verbatim. Do not reword these, and
       remove one here if the reviewer ever deletes it on Google. */
    reviewQuotes: [
      { name: "Christina Koulouris",
        text: "Had a great experience with Spiro. He always worked around my schedule, made sure that I got the best results with the car, and within a week, he had everything ready for me. He's great at was he does, but most importantly he's very reliable." },
      { name: "Riley Starr",
        text: "Great experience buying from Spiro. I was looking for a pretty specific year/model/transmission, and Automobiles SX happened to have one on the lot. Zero pressure sales, got all the time I needed to inspect and drive the car, have it looked at by my mechanic. Suprise, it was in good shape just like he told me, and at a very fair price. So rare to find an honest dealer in this business, would recommend to anyone." },
      { name: "F BM",
        text: "Spiro (owner) is truly a gentleman. I contacted him to get information about a car that had previously purchased from him by my colleague. He answered my questions honestly and patiently and also introduced me to a garage that I could go to if necessary. He truly deserves more than a 5 star review and I will definitely do business with him in the future and will introduce my friends to him as well because his patience and honesty are absolutely admirable." }
    ],
    reviewsVia: "via Google",
    reviewsWrite: "Leave a Google review",
    reviewsRead: "Read all Google reviews",
    reviewsSwipe: "Swipe to read more reviews →",
    visitH: "Visit the lot in Dorval",
    askFor: "Ask for Spiro",
    directions: "Get directions ↗"
  },

  inventory: {
    title: "Used Cars for Sale in Dorval, QC | Automobile SX Inventory",
    description: "Browse used cars, SUVs and trucks for sale at Automobile SX in Dorval, Quebec. Filter by make, body type, price, year and kilometres.",
    h1: "Used cars for sale in Dorval",
    sub: `Every vehicle priced honestly, with kilometres disclosed. Call <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a> to arrange a viewing.`,
    note: `<h2>Looking for something we do not have?</h2>
      <p>Our stock turns over constantly and we source vehicles on request. Tell us the make, model, budget and kilometres you are after and we will watch for it. Call ${DEALER.phone} or <a class="text-link" href="${R.contact}">send us the details</a>.</p>`
  },

  vehicle: {
    title: "Vehicle Details | Automobile SX Dorval, QC",
    description: "Full specifications, features and photos for this pre-owned vehicle at Automobile SX in Dorval, Quebec."
  },

  contact: {
    title: "Contact Automobile SX | Used Car Dealer in Dorval, QC",
    description: "Contact Automobile SX in Dorval, Quebec. Book a visit or test drive, ask about financing, or have your vehicle appraised. Open 10 to 6, seven days.",
    h1: "Contact us",
    sub: "Ask for Spiro. We reply in English or in French, usually within one business day.",
    formH: "Send us a message",
    name: "Name", email: "Email", phone: "Phone", message: "Message",
    contactChoice: "Provide an email address or a phone number so Spiro can reply. You do not need to provide both.",
    preferred: "Preferred reply", prefEither: "No preference", prefCall: "Phone call",
    prefText: "Text message", prefEmail: "Email",
    interest: "I'm interested in", whichVehicle: "Which vehicle?",
    optGeneral: "A general question", optVehicle: "A specific vehicle",
    optTestDrive: "Booking a test drive", optFinancing: "Financing", optTrade: "Selling or trading my car",
    errName: "Please enter your name.",
    errEmail: "Enter a valid email address, or leave this blank and provide a phone number.",
    errPhone: "Enter a phone number with at least 10 digits, or leave this blank and provide an email address.",
    errMessage: "Please add a short message so we can help.",
    send: "Send message",
    sending: "Sending…",
    formNote: "Your message is sent securely to Automobile SX. Prefer to talk? Call " + DEALER.phone + ".",
    sendError: `We could not send your message right now. Please try again, email <a class="text-link" href="mailto:${DEALER.email}">${DEALER.email}</a>, or call <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a>.`,
    successH: "Message sent",
    successBody: "Thanks. Spiro received your message and will get back to you, usually within one business day.",
    directions: "Get directions ↗"
  },

  /* ---------------- Content pages ---------------- */

  financing: {
    title: "Used Car Financing in Dorval, QC | All Credit | Automobile SX",
    description: "Used car financing in Dorval and the West Island. What lenders look at, which documents to bring, and your rights under Quebec law.",
    h1: "Used car financing in Dorval",
    sub: "Good credit, bruised credit, or no Canadian credit file yet. Here is how it actually works.",
    body: `
      <p>Financing a used car should not feel like a magic trick performed behind a desk. This page explains what lenders look at, what you should bring, and what the law in Quebec guarantees you, so you can walk in knowing roughly where you stand.</p>

      <h2>Financing for all credit situations</h2>
      <p>We work with several Canadian lenders rather than a single bank, because their criteria differ. We submit your file where we think it fits and tell you exactly what comes back. Rates, terms and approval are decided by the lender, not by us.</p>
      <ul>
        <li><strong>Established credit.</strong> If your file is clean, you should expect a rate in the single digits on a reasonably recent vehicle.</li>
        <li><strong>Bruised credit.</strong> Past missed payments, a consumer proposal or a discharged bankruptcy do not automatically mean no. They usually mean a higher rate, and sometimes a down payment.</li>
        <li><strong>New to Canada.</strong> No Canadian credit history is a very common situation in Montreal and there are lenders set up for exactly it. Proof of steady income does most of the work.</li>
        <li><strong>First-time buyer.</strong> A modest, well-priced car with an affordable payment is the fastest way to build a credit file that opens better rates later.</li>
      </ul>

      <h2>What to bring to speed up approval</h2>
      <p>Quebec law actually requires the lender to assess your ability to repay before signing a credit contract, so this paperwork is not busywork:</p>
      <ul>
        <li>Valid Quebec driver's licence</li>
        <li>Proof of address, such as a Hydro-Québec bill or your lease</li>
        <li>Recent pay stubs, or your notice of assessment if you are self-employed</li>
        <li>Bank statements from the last few months</li>
        <li>A void cheque</li>
        <li>Trade-in registration and, if it is still financed, the payout statement</li>
      </ul>

      <h2>What a used car loan costs right now</h2>
      <p>Rates move, and they depend on your credit file, the age and kilometres of the vehicle, and the length of the loan. As a rough map of the Canadian market in 2026: strong credit tends to land in the high single digits on a used vehicle, mid credit in the low teens, and subprime files well above that. Federal law caps the criminal rate at 35% APR, and Quebec adds its own rules above a high-cost threshold.</p>
      <p>Two things worth knowing. Used-car rates generally run <em>higher</em> than new-car rates, because the collateral is worth less, which surprises most buyers. And most lenders will not finance a vehicle past roughly its tenth model year.</p>

      <h2>Shorter term, less interest</h2>
      <p>Stretching a loan to 84 or 96 months makes the monthly number look friendly and quietly costs thousands more in interest. It also keeps you owing more than the car is worth for years, which becomes a real problem if you need to change vehicles. The average used-car loan in Canada runs about 60 months, and that is a sensible ceiling for most buyers.</p>
      <p>Use the estimator on any vehicle page to see the total obligation, not just the payment. The total is the number that matters.</p>

      <h2>Your rights in Quebec, in plain language</h2>
      <ul>
        <li><strong>Financing cannot be forced on you.</strong> Since November 2024, a dealer may not make the purchase of a vehicle conditional on taking their financing, or on buying other products.</li>
        <li><strong>Extended warranties and add-ons are optional.</strong> Always. If something is presented as mandatory, ask why in writing.</li>
        <li><strong>You may repay early without penalty</strong> on an instalment sale contract, and the contract must say so.</li>
        <li><strong>There is a two-day cancellation right</strong> on a dealer-financed purchase. It does not apply if you pay cash or arrange your own bank loan, so decide before you sign in that case.</li>
        <li><strong>The contract must disclose</strong> the cash price, the down payment, the credit charges, the credit rate, the number of payments and your total obligation. If a number is missing, ask for it.</li>
      </ul>

      <h2>Start the conversation</h2>
      <p>Tell us your situation honestly, including the parts you would rather not mention. It changes which lender we approach, not whether we help. Call ${DEALER.phone} or <a class="text-link" href="${R.contact}?interest=financing">send us a note</a> and we will tell you where you realistically stand.</p>
      <p>Related reading: <a class="text-link" href="${R.g2}">car financing with bad credit in Quebec</a>.</p>
      ${accuracyNote}`
  },

  sell: {
    title: "Sell or Trade Your Car in Dorval, QC | Automobile SX",
    description: "We buy used cars in Dorval and take trade-ins. Get a written offer with no obligation, and see how a trade-in lowers the tax on your next vehicle.",
    h1: "Sell your car, or trade it in",
    sub: "A straight offer, whether or not you buy anything from us.",
    body: `
      <p>Selling a car privately means strangers at your door, test drives with people you have never met, and a payment method you have to trust. Plenty of people would rather skip all of it. Bring the car to Avenue Chartier and we will look at it properly and make you an offer.</p>

      <h2>How the appraisal works</h2>
      <ol>
        <li><strong>Tell us about the car.</strong> Year, make, model, trim, kilometres, and anything we should know. Photos help.</li>
        <li><strong>Bring it by.</strong> A proper appraisal means driving it, putting it on the lot and looking underneath. Fifteen minutes, by appointment.</li>
        <li><strong>Get a number.</strong> We explain how we arrived at it. If it is not for you, no hard feelings and no pressure.</li>
      </ol>

      <h2>The trade-in tax saving most people miss</h2>
      <p>This is the part that surprises buyers. In Quebec, when you trade a vehicle in against a purchase at a dealer, the sales tax is calculated on the price <em>after</em> your trade-in value is deducted, not on the full sticker price.</p>
      <p>Combined GST and QST come to roughly 15%, so on a $6,000 trade-in that mechanism is worth something in the neighbourhood of $900 that a private sale simply does not give you. A private buyer might offer a bit more on paper and still leave you behind once the tax difference is counted. Do that arithmetic before you list it online.</p>

      <h2>What helps your car appraise well</h2>
      <ul>
        <li>Service records, even partial ones</li>
        <li>Both sets of keys</li>
        <li>Winter tires, especially mounted on their own rims</li>
        <li>A clean interior; presentation genuinely affects the number</li>
        <li>Honesty about known faults, which costs you less than a surprise found on the hoist</li>
      </ul>

      <h2>Still financing it?</h2>
      <p>That is routine. We contact your lender for the payout amount and handle the settlement. If the car is worth more than you owe, the difference goes toward your next vehicle. If you owe more than it is worth, we will tell you plainly and walk through the options rather than quietly rolling the shortfall into a new loan.</p>

      <h2>Get an offer</h2>
      <p>Call ${DEALER.phone} or <a class="text-link" href="${R.contact}?interest=trade-in">send the details</a>. We are open 10:00 to 18:00 every day, by appointment.</p>
      <p>Related reading: <a class="text-link" href="${R.g3}">what is my trade-in worth in Quebec?</a></p>
      ${accuracyNote}`
  },

  about: {
    title: "About Automobile SX | Family-Run Used Car Dealer in Dorval",
    description: "Automobile SX is a family-run used car dealership at 2044 Avenue Chartier in Dorval, Quebec, serving the West Island in English and French.",
    h1: "A small lot in Dorval, run by the person who answers the phone",
    sub: "Vente · Achat · Échange, on Avenue Chartier.",
    body: `
      <p>Automobile SX is a family-run used vehicle dealership at 2044 Avenue Chartier in Dorval. It is deliberately small. When you call, Spiro answers. When you come to look at a car, Spiro shows it to you. When you have a question three months later, you call the same number and get the same person.</p>

      <h2>What working with a small dealership means</h2>
      <p>Being small is the point. Reputation in the West Island travels by word of mouth, so repeat customers and referrals are how the business grows. That shapes how every vehicle is bought, priced and described.</p>
      <ul>
        <li><strong>One person, start to finish.</strong> Spiro handles your file from the first call to the paperwork.</li>
        <li><strong>Prices you can see.</strong> Every listing shows its price, kilometres and condition.</li>
        <li><strong>Bilingual service.</strong> English or French, whichever you are comfortable in.</li>
        <li><strong>Time to think.</strong> Nobody has a quota riding on you signing today.</li>
      </ul>

      <h2>How we choose what goes on the lot</h2>
      <p>We buy vehicles we would be comfortable putting a family member in. That means passing on cars with a story that does not add up, and being upfront about the wear that comes with age and kilometres on the ones we do take. An eight-year-old car with 140,000 km is a good buy at the right price, and pretending otherwise helps nobody.</p>
      <p>Kilometres, condition and known issues are disclosed before you ask. You are also welcome to have any vehicle inspected by your own mechanic before you commit, and we will make the car available for it.</p>

      <h2>Serving Dorval and the West Island</h2>
      <p>We are minutes from Pointe-Claire, Lachine, Pierrefonds, Kirkland and Montréal-Ouest, and easy to reach from downtown Montreal or Laval. Most customers come from the West Island, and many arrive through someone who bought from us before.</p>
      <p>More on how we work with buyers in the <a class="text-link" href="${R.local}">West Island</a>, or read our <a class="text-link" href="${R.faq}">frequently asked questions</a>.</p>

      <h2>Come by</h2>
      <p>${DEALER.street}, ${DEALER.city}, ${DEALER.region}. Open 10:00 to 18:00 seven days a week. Calling ${DEALER.phone} ahead is recommended so the vehicle is ready when you arrive.</p>`
  },

  faq: {
    title: "Used Car FAQ | Buying in Dorval & Quebec | Automobile SX",
    description: "Answers about buying a used car in Quebec: financing, trade-ins, the legal warranty, appointments, taxes and SAAQ registration.",
    h1: "Frequently asked questions",
    sub: "The questions we actually get asked, answered plainly.",
    faqs: [
      { q: "Do I need an appointment?",
        a: "Not strictly. We are open 10:00 to 18:00 seven days a week and walk-ins are welcome. Calling 514-824-9117 ahead is recommended so we can have the vehicle ready and give you our full attention when you arrive." },
      { q: "Do you offer financing?",
        a: "Yes. We work with several Canadian lenders and submit your file to the ones that suit it. You will see the rate, the term and the total cost before anything is signed. In Quebec, a dealer cannot require you to finance through them as a condition of the sale." },
      { q: "Can I trade in my car?",
        a: "Yes, and it usually saves you tax. In Quebec the sales tax on your next vehicle is calculated on the price after the trade-in value is deducted. With combined taxes around 15%, that is real money. We will appraise your vehicle with no obligation to buy from us." },
      { q: "Is there a warranty on a used car in Quebec?",
        a: "Often, yes, and it is set by law rather than by the dealer. Quebec's Consumer Protection Act sets a warranty of good working order based on the vehicle's age and kilometres: roughly six months or 10,000 km for newer, lower-kilometre vehicles, down to one month or 1,700 km for older ones, and no such warranty on vehicles over seven years old or above 120,000 km. Even then, the general legal warranties of fitness and reasonable durability still apply. The category is shown on the label on the vehicle." },
      { q: "Can I have the car inspected by my own mechanic?",
        a: "Absolutely, and we encourage it. Arrange it and we will make the vehicle available. A buyer who has had the car checked is a buyer who sleeps well afterwards." },
      { q: "Can I reserve a vehicle?",
        a: "Yes. Call 514-824-9117 and we will hold it while you arrange financing or book an inspection. We will tell you honestly if someone else is already in line for it." },
      { q: "Do you deliver?",
        a: "Ask us. Depending on where you are in the Montreal area we can usually work something out. Most customers prefer to pick up at the lot in Dorval so we can go through the vehicle and paperwork together." },
      { q: "What do I need to register the car?",
        a: "We handle the registration paperwork with the SAAQ at delivery in most cases, so you usually leave with the car properly plated. Bring your valid Quebec driver's licence and proof of insurance." },
      { q: "Do you speak French?",
        a: "Oui. Le service est offert en français comme en anglais, à l'oral comme pour les documents." }
    ]
  },

  guides: {
    title: "Used Car Buying Guides for Quebec | Automobile SX",
    description: "Plain-language guides to buying a used car in Quebec: taxes, the legal warranty, financing, trade-in values and SAAQ registration.",
    h1: "Guides for used-car buyers in Quebec",
    sub: "What we end up explaining in person, written down so you can read it first.",
    cards: guideCards
  },

  g1: {
    title: "Buying a Used Car in Quebec: The Complete Guide (2026)",
    description: "What to know before buying a used car in Quebec: GST and QST, the legal warranty categories, the dealer label and inspection rights.",
    h1: "Buying a used car in Quebec",
    sub: "Taxes, the legal warranty, the dealer label, and what to check before you sign.",
    body: `
      <p>Quebec protects used-car buyers more firmly than most provinces, but only if you know what to look for. This guide covers the parts that actually decide whether a purchase goes well.</p>

      <h2>What you will pay in tax</h2>
      <p>Buying from a dealer, you pay GST at 5% and QST at 9.975%, roughly 15% combined, on the agreed sale price. The advertised price must already include preparation, transport and administration fees; a dealer cannot advertise one number and add those on later. Only the taxes and the small tire environmental duty may be added on top.</p>
      <p>If you trade a vehicle in, tax is calculated on the price after your trade-in value is deducted, which is the single biggest financial reason to trade rather than sell privately.</p>

      <h2>The legal warranty on a used vehicle</h2>
      <p>Quebec's Consumer Protection Act gives most used vehicles bought from a dealer a warranty of good working order, at no extra cost, based on age and kilometres. The thresholds were widened in April 2024, so older articles online understate them:</p>
      <ul>
        <li><strong>Category A</strong> (4 years old or less and 80,000 km or less): 6 months or 10,000 km</li>
        <li><strong>Category B</strong> (5 years or less and 100,000 km or less): 3 months or 5,000 km</li>
        <li><strong>Category C</strong> (7 years or less and 120,000 km or less): 1 month or 1,700 km</li>
        <li><strong>Category D</strong> (over 7 years old or over 120,000 km): no good-working-order warranty</li>
      </ul>
      <p>The warranty covers parts, labour and reasonable towing. It cannot be waived, not even in exchange for a lower price. And Category D does not mean unprotected: the general legal warranties of fitness for purpose and reasonable durability still apply to every vehicle sold by a merchant.</p>

      <h2>Read the label on the windshield</h2>
      <p>Every used vehicle at a Quebec dealer must carry a label showing the price, the year, make, model and serial number, the odometer reading, the warranty category, and notice of your right to the previous owner's contact information. It must also disclose prior use as a taxi, driving-school, police or rental vehicle. If a specific part is excluded from the warranty, that has to appear on the label with a repair estimate, or the exclusion does not stand.</p>

      <h2>Safety certificates work differently here</h2>
      <p>If you are arriving from Ontario, adjust your expectations: an ordinary used passenger car sold by a Quebec dealer to a consumer does not require a safety certificate. Mechanical inspection certificates are required in specific situations, such as vehicles brought in from outside Quebec or rebuilt after serious damage. This is exactly why an independent inspection is worth the hundred-odd dollars.</p>

      <h2>Have it inspected anyway</h2>
      <p>Any dealer worth buying from will let you take the vehicle to your own mechanic. We do. A pre-purchase inspection tells you what is coming in the next year, which turns a nervous decision into an informed one. If a seller resists, that is your answer.</p>

      <h2>Before you sign</h2>
      <p>The contract must show the dealer's OPC permit number, the price, the taxes, the total payable, the warranty details and any trade-in terms. Check that the vehicle identification number on the contract matches the one on the car. Make sure any verbal promise, such as a repair before delivery, is written into the contract.</p>

      <h2>Changing your mind</h2>
      <p>If you finance through the dealer, you have two days to cancel that credit contract, and for a used vehicle you can do so even after taking delivery, provided the car comes back in the same condition. If you pay cash or use your own bank, there is generally no cooling-off period at all. Decide before the pen touches paper.</p>

      <h2>Where to go next</h2>
      <p><a class="text-link" href="${R.g4}">Registering the car with the SAAQ</a> · <a class="text-link" href="${R.g2}">Financing with imperfect credit</a> · <a class="text-link" href="${R.inventory}">See what we have in stock</a></p>
      ${accuracyNote}`
  },

  g2: {
    title: "Car Financing with Bad Credit in Quebec: What to Expect",
    description: "How used car financing works in Quebec with limited or damaged credit: what lenders check, realistic rates, and the rights you keep.",
    h1: "Car financing with bad credit in Quebec",
    sub: "What lenders actually look at, what it realistically costs, and the rights you keep.",
    body: `
      <p>A damaged credit file feels like a locked door. In practice it is usually a more expensive door, and the price depends on choices you can control.</p>

      <h2>What counts as bad credit in Canada</h2>
      <p>On the Equifax scale of 300 to 900, roughly 760 and up is excellent, 725 to 759 very good, 660 to 724 good, 560 to 659 fair, and below 560 poor. Lenders generally treat under 660 as subprime. There is no legal cutoff, and each lender sets its own floor, so a single declined application tells you very little.</p>

      <h2>What subprime lenders actually weigh</h2>
      <p>Once your score is below prime, lenders stop leaning on it and start looking at stability:</p>
      <ul>
        <li><strong>Income.</strong> Steady, provable, and enough to carry the payment comfortably.</li>
        <li><strong>Time at your job.</strong> A few months of history at the same employer carries real weight.</li>
        <li><strong>Bank statements.</strong> They look for rent and bills clearing on time, and for NSF fees.</li>
        <li><strong>The vehicle itself.</strong> A sensible, affordable car is easier to approve than a stretch purchase.</li>
        <li><strong>Down payment.</strong> Not always required, but it improves both approval odds and the rate.</li>
      </ul>

      <h2>What it costs</h2>
      <p>Expect a meaningful premium: where strong credit gets high single digits on a used vehicle, a subprime file commonly sits in the mid-teens and can go higher. Federal law caps the criminal rate at 35% APR, and Quebec applies extra requirements above its high-cost credit threshold. Anything approaching those numbers deserves a hard second look.</p>
      <p>One Quebec detail worth knowing: the credit rate shown on your contract is an all-in figure that includes administration fees, not just the nominal interest. That makes contracts genuinely comparable, so compare that number rather than the payment.</p>

      <h2>New to Canada with no credit file</h2>
      <p>No credit history is not bad credit; it is an empty page, and lenders treat it differently. Some banks run newcomer programs that skip the credit-history requirement, usually with a down payment in the 10% to 25% range and limits on how old the vehicle can be. Those vehicle-age limits are the catch on a used-car lot, so newcomer buyers often do better with a specialty lender or a co-signer.</p>

      <h2>Do not let the term hide the cost</h2>
      <p>The easiest way to make an expensive loan feel affordable is to stretch it. Going from 48 months to 96 cuts the payment substantially and more than doubles the interest, while keeping you underwater for years. If the payment only works at 84 or 96 months, the honest conclusion is usually that the car is too expensive, not that the term is too short.</p>

      <h2>Use it to rebuild</h2>
      <p>A subprime auto loan reported to the bureaus and paid on time is one of the faster ways to repair a credit file. Many buyers refinance to a much better rate after a year or two of clean payments, and in Quebec an instalment sale contract must let you prepay without penalty, so leaving early costs nothing.</p>

      <h2>Protect yourself</h2>
      <ul>
        <li>Financing cannot be a condition of the sale in Quebec, since November 2024.</li>
        <li>Extended warranties, credit insurance and protection packages are optional. Every one of them increases the amount you finance.</li>
        <li>Compare the total obligation, not the weekly payment.</li>
        <li>Get the approved rate in writing and check it against the contract.</li>
        <li>You may repay early without penalty, and the contract must say so.</li>
      </ul>

      <h2>Talk to us honestly</h2>
      <p>Tell us the real situation and we will tell you what is realistic. Call ${DEALER.phone} or read <a class="text-link" href="${R.financing}">how financing works at Automobile SX</a>.</p>
      ${accuracyNote}`
  },

  g3: {
    title: "What Is My Trade-In Worth in Quebec? | Automobile SX",
    description: "How trade-in values are set in Quebec, how much tax a trade-in saves you, and when trading in beats selling privately.",
    h1: "What is my trade-in worth?",
    sub: "How the number is built, and the tax saving that makes trading competitive.",
    body: `
      <p>Every trade-in conversation starts the same way: the owner has a number in mind from a website, and the dealer has a number from the wholesale market. Here is how the gap actually forms.</p>

      <h2>What sets the number</h2>
      <ul>
        <li><strong>Wholesale market value.</strong> What comparable vehicles are actually selling for at auction this month, not what they were worth last spring.</li>
        <li><strong>Kilometres.</strong> The single biggest lever after age.</li>
        <li><strong>Mechanical condition.</strong> Anything needed to make it retail-ready comes off the top.</li>
        <li><strong>Cosmetics.</strong> Body damage, curbed wheels, torn seats, cigarette smell.</li>
        <li><strong>Demand.</strong> An AWD SUV in October and a convertible in October are not the same business.</li>
        <li><strong>Records and extras.</strong> Service history, second key, winter tires on rims.</li>
      </ul>

      <h2>The tax saving is part of the offer</h2>
      <p>Comparing a trade offer to a private-sale price without counting tax gives you the wrong answer. In Quebec, tax on your next vehicle is calculated after the trade-in is deducted, and combined GST and QST run near 15%.</p>
      <p>So on an $8,000 trade-in, that mechanism saves roughly $1,200 in tax. A private buyer offering $9,000 is barely ahead of a $8,000 trade once you count it, and that is before the photos, the messages, the no-shows and the payment risk.</p>

      <h2>Trade in or sell privately?</h2>
      <p><strong>Trading in makes sense</strong> when you are buying another vehicle anyway, when you value the time, when the car has needs you would have to disclose, or when it still has a loan on it.</p>
      <p><strong>Selling privately makes sense</strong> when the car is in demand and in good condition, when you have time and patience, and when you are not buying something else right away so the tax mechanism does you no good.</p>

      <h2>Get more for it</h2>
      <ul>
        <li>Clean it properly, inside and out. It genuinely moves the number.</li>
        <li>Gather service records, even partial.</li>
        <li>Bring both keys; a replacement key is expensive and comes off your offer.</li>
        <li>Include the winter tires, especially on rims.</li>
        <li>Do not hide a known fault. It gets found, and then everything else you said is in question.</li>
      </ul>

      <h2>Still owe money on it?</h2>
      <p>Normal. We get the payout figure from your lender and settle it. Positive equity goes toward your next vehicle. If you are underwater, we will say so plainly and explain the options rather than quietly folding the shortfall into a new loan.</p>

      <h2>Get a real number</h2>
      <p>Online estimators do not know that your car needs two tires and a windshield, which is why the offer changes when someone actually looks at it. Bring it to Avenue Chartier and we will appraise it properly. Call ${DEALER.phone} or <a class="text-link" href="${R.sell}">read how our appraisals work</a>.</p>
      ${accuracyNote}`
  },

  g4: {
    title: "Registering a Used Car in Quebec: SAAQ Guide | Automobile SX",
    description: "How to register a used car bought from a dealer in Quebec: what the dealer handles, what to bring, plates, costs and timelines.",
    h1: "Registering a used car in Quebec",
    sub: "What the dealer handles, what you bring, and when your plate arrives.",
    body: `
      <p>Registration in Quebec runs through the SAAQ, and buying from a dealer makes it markedly simpler than a private sale. Here is the sequence.</p>

      <h2>What the dealer does</h2>
      <p>Buying from a dealer, the registration is normally completed at delivery. If the dealer uses SAAQ online services, you avoid a trip to a service outlet entirely. Otherwise you get a temporary registration certificate and complete it at an SAAQ outlet.</p>

      <h2>What you bring</h2>
      <ul>
        <li>Your valid Quebec driver's licence or other official photo ID</li>
        <li>Proof of liability insurance</li>
        <li>If registering at an SAAQ outlet rather than with the dealer: the transaction attestation form plus the registration certificate signed by the previous owner and the dealer</li>
      </ul>

      <h2>Plates and timing</h2>
      <p>Register in your name promptly after delivery. Fit the temporary paper plate right away; the permanent plate is mailed to the primary address on your file, typically within about ten to twenty business days.</p>

      <h2>What it costs</h2>
      <p>Annual registration for a standard passenger vehicle runs a little over $200 in most regions, made up of registration rights, the SAAQ insurance contribution and administrative fees, with lower totals in outlying regions. There is also a small transaction fee, and a new plate costs slightly more than reusing one.</p>
      <p>Two surcharges catch people out. Vehicles seven years old or newer valued above $40,000 carry an additional 1% on the amount above that threshold, and it applies to used vehicles too, every year. Large-displacement engines of roughly 4.0 litres and up carry both an annual surcharge and a one-time acquisition charge. If you are shopping a big V8 or a recent luxury vehicle, budget for these before you buy, not after.</p>
      <p>Rates are set annually, so confirm current figures on the SAAQ site.</p>

      <h2>Insurance before you drive away</h2>
      <p>Bodily injury coverage comes through Quebec's public plan, but liability and damage coverage for the vehicle is private and mandatory. Call your insurer with the vehicle identification number before pickup day; most will bind coverage in minutes.</p>

      <h2>The winter tire rule for new buyers</h2>
      <p>Winter tires are mandatory in Quebec from 1 December to 15 March on every vehicle registered here, with fines from $200 to $300. There is one exemption worth knowing if you are buying in December: a vehicle within seven days of purchase is exempt, which gives you a week to get tires fitted. Do not treat that week as optional.</p>

      <h2>Keep the paperwork</h2>
      <p>Keep the bill of sale, the registration certificate and the warranty details together. You will want them for insurance, for your own records, and when you eventually sell or trade the car.</p>
      <p>Next: <a class="text-link" href="${R.g1}">the full guide to buying used in Quebec</a> · <a class="text-link" href="${R.inventory}">browse our inventory</a></p>
      ${accuracyNote}`
  },

  privacy: {
    title: "Privacy Policy | Automobile SX Dorval",
    description: "How Automobile SX handles personal information. We use no analytics, no tracking and no cookies on this website.",
    h1: "Privacy policy",
    sub: "What we collect, what we do not, and how to reach us about it. Last updated 14 August 2026.",
    body: `
      <p>Automobile SX is a used car dealership at 2044 Avenue Chartier, Dorval, Quebec. This page explains what happens to personal information in connection with this website and our business. It is written to be accurate about how the site actually works rather than to cover every hypothetical.</p>

      <h2>What this website collects</h2>
      <p>This site has <strong>no analytics, no advertising trackers, no marketing pixels and no cookies</strong>. We do not build profiles of visitors, and we cannot tell who you are from browsing our pages.</p>
      <p>When you use the contact form, the name, email address, phone number, topic, vehicle selection and message you enter are sent to Automobile SX by email. The website does not add that message to an inventory database or marketing list.</p>

      <h2>What we hold, and why</h2>
      <p>If you email, call or text us, we hold what you chose to tell us: your name, your contact details, and whatever you said about the vehicle you are interested in. We use it to answer you and to arrange a viewing or a sale. Nothing more.</p>
      <p>If you buy a vehicle or trade one in, we collect the information required to complete the sale and the registration, including identification and details needed by the Société de l'assurance automobile du Québec. That is a legal requirement of selling a vehicle, and those records are kept as long as the law requires.</p>
      <p>We do not sell, rent or trade personal information to anyone.</p>

      <h2>Other companies involved</h2>
      <p>Four third parties are involved in running the site, and it is fair that you know what each one sees.</p>
      <p><strong>Vercel</strong> hosts the website. Like any web host, its servers record standard technical information such as IP addresses when a page is requested.</p>
      <p><strong>Resend</strong> delivers messages submitted through the contact form to our email inbox. It processes the form details for that delivery; copies then remain in our email records so we can answer your inquiry.</p>
      <p><strong>Google</strong> provides the fonts used for the text, and the map on the home and contact pages. Loading a font or a map means your browser contacts Google directly, so Google may receive your IP address and set its own cookies. Google's handling of that is governed by its own privacy policy. If your browser blocks Google, the site still works: the map is replaced by our address and a link.</p>
      <p><strong>Meta</strong> is involved only if you follow a link to our Facebook or Instagram pages, at which point you are on their service and their policies apply.</p>

      <h2>Your rights in Quebec</h2>
      <p>Under Quebec's <em>Act respecting the protection of personal information in the private sector</em>, as amended by Law 25, you may ask us what personal information we hold about you, ask us to correct it if it is wrong, and ask us to stop using it, subject to the records we are legally required to keep for vehicle sales.</p>
      <p>To make any of those requests, contact Spiro Xiarchos, who is responsible for the protection of personal information at Automobile SX, at <a class="text-link" href="mailto:Automobilesx@gmail.com">Automobilesx@gmail.com</a> or <a class="text-link" href="tel:+15148249117">514-824-9117</a>. We will respond within 30 days.</p>
      <p>If you are not satisfied with our answer, you may complain to the Commission d'accès à l'information du Québec.</p>

      <h2>Changes</h2>
      <p>If this policy changes, the date at the top of the page changes with it.</p>`
  },
  local: {
    title: "Used Cars in the West Island, Montreal | Automobile SX",
    description: "Used car dealership serving the West Island from Dorval: Pointe-Claire, Lachine, Pierrefonds and Kirkland. Bilingual, family-run, open seven days.",
    h1: "Used cars in the West Island",
    sub: "On Avenue Chartier in Dorval, minutes from Pointe-Claire, Lachine and Pierrefonds.",
    body: `
      <p>Automobile SX sits at 2044 Avenue Chartier in Dorval, which puts us within a short drive of most of the West Island. Customers come from Pointe-Claire, Lachine, Dollard-des-Ormeaux, Kirkland, Beaconsfield, Pierrefonds, Montréal-Ouest and Lasalle, and plenty arrive from downtown Montreal or across the bridge from Laval.</p>

      <h2>Getting here</h2>
      <p>We are close to Highway 20 and the 520, a few minutes from Dorval airport and the Dorval train station. If you are coming from Pointe-Claire or Beaconsfield it is a straight run east; from Lachine or Lasalle, a short hop west. There is no downtown parking hunt at the end of it.</p>

      <h2>What West Island buyers tend to want</h2>
      <p>The mix here is specific. All-wheel drive matters because of the winters and because plenty of people commute along the 20 and the 40 in February. Compact SUVs and sedans that swallow a Costco run without drinking fuel do well. Fuel economy counts for anyone driving into the city daily. We stock with that in mind rather than filling the lot with whatever was cheapest at auction.</p>

      <h2>Bilingual service, genuinely</h2>
      <p>The West Island is properly bilingual and so are we. English or French, spoken and on paper, whichever you prefer. Ce site est aussi offert en français.</p>

      <h2>What to expect when you visit</h2>
      <p>You will be shown the vehicle by the owner, given the time you need, and told what we know about the car's history and condition. If a vehicle is not right for you, we would rather say so than sell it to you.</p>
      <ul>
        <li>Open 10:00 to 18:00, seven days a week</li>
        <li>Vente, achat and échange, so you can sell us a car without buying one</li>
        <li>Financing arranged with several lenders, including for thin or damaged credit</li>
        <li>Your own mechanic is welcome to inspect anything before you commit</li>
      </ul>

      <h2>Book a time</h2>
      <p>Call ${DEALER.phone}, or <a class="text-link" href="${R.contact}">send a message</a> and tell us what you are looking for. If it is not on the lot today, we will keep an eye out for it.</p>
      <p><a class="text-link" href="${R.inventory}">See current inventory</a> · <a class="text-link" href="${R.about}">About Automobile SX</a></p>`
  }
};
