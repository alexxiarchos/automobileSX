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

const accuracyNote = `<p class="accuracy-note">Information on this page reflects Quebec rules reviewed in November 2026 and is provided for general guidance only. It is not legal or financial advice. Rules and fees change; verify the relevant details with the <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/vehicule/auto-achat/conseil/occasion-commercant" target="_blank" rel="noopener">Office de la protection du consommateur</a>, <a href="https://saaq.gouv.qc.ca/immatriculation" target="_blank" rel="noopener">SAAQ</a> and <a href="https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/transport-and-road-vehicles/road-vehicles-individuals/purchase-of-a-road-vehicle/purchase-of-a-used-road-vehicle-from-a-dealer/" target="_blank" rel="noopener">Revenu Québec</a>.</p>`;

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
  { h: "Used car budget in Quebec", p: "Work backward from a total limit and compare purchase and ownership costs.", href: R.g5 },
  { h: "Used car inspection in Dorval", p: "Arrange an independent inspection and use the written findings.", href: R.g6 },
  { h: "Buying a used car in Quebec", p: "Taxes, the legal warranty, the dealer label and what to check before you sign.", href: R.g1 },
  { h: "Car financing with bad credit", p: "How to compare a complete financing offer and the rights you keep in Quebec.", href: R.g2 },
  { h: "What is my trade-in worth?", p: "How trade values are set, and the tax saving most buyers miss.", href: R.g3 },
  { h: "Registering a used car", p: "SAAQ paperwork, plates, and what the dealer handles for you.", href: R.g4 }
];

module.exports = {
  asideCard: ctaCard,
  lang: "en",
  R,
  ui,

  home: {
    title: "Used Cars in Dorval, QC | Automobile SX",
    description: "Used cars for sale in Dorval, Quebec. Family-run dealership offering sales, purchases and trades, with financing available. Open 10 to 6, seven days.",
    h1: "Quality used cars in Dorval",
    sub: "A family-run dealership on Avenue Chartier. You deal directly with Spiro throughout the buying process, in English or in French.",
    heroAlt: "The Automobile SX lot at 2044 Avenue Chartier in Dorval",
    searchAria: "Search inventory",
    whyH: "Why buy from Automobile SX",
    trust: [
      { h: "Personal service", p: "You deal directly with Spiro, from the first phone call to the keys in your hand." },
      { h: "Vente · Achat · Échange", p: "We sell, we buy, and we take trades. Kilometres and condition disclosed up front." },
      { h: "Open seven days by appointment", p: `10:00 to 18:00 every day, by appointment. Call ${DEALER.phone} ahead so we can confirm the time and have the vehicle ready for you.` },
      { h: "Financing options", p: "We work with several lenders. Approval, rate and terms depend on the lender's assessment of each application." }
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
      <p>An eligible trade-in can reduce the taxable amount. GST is generally calculated on the sale price less the trade-in credit; QST uses the greater of the vehicle's sale price or estimated value, less that credit. Ask for the actual calculation in writing.</p>`,
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
    budgetHelp: `<p class="muted-note">Working with a firm total limit? <a class="text-link" href="${R.g5}">Plan the vehicle price, taxes and other costs first</a>.</p>`,
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
    title: "Used Car Financing in Dorval, QC | Automobile SX",
    description: "Used car financing information for Dorval and the West Island. Compare the complete offer, prepare your documents and understand your Quebec rights.",
    h1: "Used car financing in Dorval",
    sub: "Approval, rate and terms depend on the lender and the application. Here is how to prepare and compare an offer.",
    body: `
      <p>A monthly payment is only one part of a financing offer. Compare the amount borrowed, the credit rate, the term, the fees and the total obligation before deciding.</p>

      <h2>Each lender assesses the complete application</h2>
      <p>Automobile SX works with several Canadian lenders. Their criteria differ, and the lender—not the dealership—decides whether to approve an application and which rate and terms to offer.</p>
      <ul>
        <li><strong>Credit history is one factor.</strong> There is no score on this site that promises approval or a particular rate.</li>
        <li><strong>Income and existing obligations matter.</strong> The lender must assess whether the requested credit can be repaid.</li>
        <li><strong>The vehicle and term matter.</strong> Eligibility can vary with the amount requested and the vehicle selected.</li>
        <li><strong>A down payment is application-specific.</strong> Do not assume one is required—or that a particular amount will change the result—until it appears in a written offer.</li>
      </ul>

      <h2>Confirm the documents before applying</h2>
      <p>A lender may ask for documents that verify identity, address, income, banking details or a trade-in. The exact list depends on the application. Ask what is required before sending personal information. Examples can include:</p>
      <ul>
        <li>Government-issued identification and proof of address</li>
        <li>Documents supporting income or employment</li>
        <li>Banking information requested for the application</li>
        <li>Trade-in registration and a current payout statement, if applicable</li>
      </ul>

      <h2>Compare the complete written offer</h2>
      <p>Rates change and an advertised range cannot predict an individual approval. Ask for the rate, payment schedule, financing fees, amount financed, term and total obligation in writing. The <a href="https://www.canada.ca/en/financial-consumer-agency/services/loans/financing-car/shop-around.html" target="_blank" rel="noopener">Financial Consumer Agency of Canada</a> recommends comparing the total cost rather than only the payment or interest rate.</p>

      <h2>Understand the effect of the term</h2>
      <p>A longer term can lower each payment while increasing the interest paid over the life of the loan. It can also increase the time you owe more than the vehicle is worth. Compare the same amount and rate over different terms before choosing.</p>

      <h2>Your rights in Quebec, in plain language</h2>
      <ul>
        <li><strong>Financing cannot be forced on you.</strong> Quebec prohibits making a road-vehicle purchase conditional on dealer-arranged credit or long-term leasing. <a href="https://www.opc.gouv.qc.ca/consommateur/nouvelles-protections/" target="_blank" rel="noopener">Read the OPC summary</a>.</li>
        <li><strong>An instalment-sale contract must disclose the complete figures.</strong> That includes the cash price, down payment if any, credit charges, credit rate, total obligation, term and payments. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/credit-recouvrement-finance/temperament/contrat/contenu" target="_blank" rel="noopener">See the OPC contract checklist</a>.</li>
        <li><strong>Early repayment and cancellation rules depend on the contract.</strong> An instalment-sale contract must allow early payment without fees or penalty and normally carries a two-day cancellation right; high-cost credit has different rules. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/vehicule/auto-achat/occasion/annulation-contrat" target="_blank" rel="noopener">Check the OPC cancellation guidance</a>.</li>
      </ul>

      <h2>Start the conversation</h2>
      <p>Tell us the vehicle, intended purchase budget and whether you want to discuss financing. Call ${DEALER.phone} or <a class="text-link" href="${R.contact}?interest=financing">send us a note</a>. Any approval, rate, term or down-payment requirement comes from the lender's written offer after assessment.</p>
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
      <p>An eligible trade-in can reduce the taxable amount, but GST and QST do not always use the same starting figure. GST is generally calculated on the sale price less the trade-in credit. QST is calculated on the greater of the vehicle's sale price or estimated value, less the trade-in credit.</p>
      <p>Ask for the sale price, trade-in credit, estimated value if applicable, and each tax amount separately. Do not assume the reduction will always equal the trade-in credit multiplied by the combined tax rates. <a href="https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/transport-and-road-vehicles/road-vehicles-individuals/trading-in-a-road-vehicle/trade-in-of-a-road-vehicle-between-an-individual-and-a-dealer/" target="_blank" rel="noopener">Review Revenu Québec's trade-in calculation</a>.</p>

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
        a: "Yes. Visits are by appointment. We are open 10:00 to 18:00 seven days a week; call 514-824-9117 ahead so we can confirm the time, have the vehicle ready and give you our full attention when you arrive." },
      { q: "Do you offer financing?",
        a: "Yes. We work with several Canadian lenders and submit your file to the ones that suit it. You will see the rate, the term and the total cost before anything is signed. In Quebec, a dealer cannot require you to finance through them as a condition of the sale." },
      { q: "Can I trade in my car?",
        a: "Yes. For an eligible trade-in, GST is generally calculated on the sale price less the trade-in credit. QST uses the greater of the vehicle's sale price or estimated value, less that credit. Ask for the itemized calculation rather than assuming a fixed saving. We will appraise your vehicle with no obligation to buy from us." },
      { q: "Is there a warranty on a used car in Quebec?",
        a: "Often, yes, and it is set by law rather than by the dealer. Quebec's Consumer Protection Act sets a warranty of good working order based on the vehicle's age and kilometres: roughly six months or 10,000 km for newer, lower-kilometre vehicles, down to one month or 1,700 km for older ones, and no such warranty on vehicles over seven years old or above 120,000 km. Even then, the general legal warranties of fitness and reasonable durability still apply. The category is shown on the label on the vehicle." },
      { q: "Can I have the car inspected by my own mechanic?",
        a: `You may request an independent inspection. Choose the garage and <a href="${R.g6}">review what to arrange</a>. Before booking, contact us with the vehicle, garage and proposed time so current availability and access can be confirmed. Any transport or other arrangement must be agreed case by case. The inspection assesses condition at that time; it cannot guarantee future reliability.` },
      { q: "Can I reserve a vehicle?",
        a: "Call 514-824-9117 with the vehicle or stock number. Availability and any temporary hold are confirmed case by case; do not assume a vehicle is reserved until you receive confirmation." },
      { q: "Do you deliver?",
        a: "Delivery availability, area, timing and any charge are not stated as a general policy online. Ask about the specific vehicle and destination, and have any agreed arrangement included in writing before purchase." },
      { q: "What do I need to register the car?",
        a: "Registration steps depend on the transaction. Before delivery, ask which steps Automobile SX will handle, which steps you must complete, and which documents and fees apply. Confirm the current requirements with the SAAQ." },
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
      <p>For a standard taxable dealer purchase, GST is 5% and is generally calculated on the agreed sale price. QST is 9.975% and is calculated on the greater of the agreed sale price or the vehicle's estimated value, unless a specific damaged-or-unusual-wear rule applies. <a href="https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/transport-and-road-vehicles/road-vehicles-individuals/purchase-of-a-road-vehicle/purchase-of-a-used-road-vehicle-from-a-dealer/" target="_blank" rel="noopener">Check the current Revenu Québec calculation</a>. The advertised price must already include preparation, transport and administration fees; taxes and the applicable new-tire duty can be added.</p>
      <p>With an eligible trade-in, GST is generally calculated on the sale price less the trade-in credit. QST uses the greater of the sale price or estimated value, less that credit. Ask for an itemized calculation. If you are planning from a firm limit, use our <a class="text-link" href="${R.g5}">complete purchase-budget worksheet</a>.</p>

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
      <p>If you are arriving from Ontario, adjust your expectations: an ordinary used passenger car sold by a Quebec dealer to a consumer does not require a safety certificate. Mechanical inspection certificates are required in specific situations, such as vehicles brought in from outside Quebec or rebuilt after serious damage. Ask the garage you choose to quote the scope and price of an independent inspection.</p>

      <h2>Have it inspected anyway</h2>
      <p>The OPC recommends a road test and an inspection by a mechanic you trust, and states that a dealer must accept the request. An inspection describes the vehicle's observed condition at that time; it cannot promise future reliability. Use our <a class="text-link" href="${R.g6}">Dorval pre-purchase inspection worksheet</a> to coordinate the vehicle, garage and questions.</p>

      <h2>Before you sign</h2>
      <p>The contract must show the dealer's OPC permit number, the price, the taxes, the total payable, the warranty details and any trade-in terms. Check that the vehicle identification number on the contract matches the one on the car. Make sure any verbal promise, such as a repair before delivery, is written into the contract.</p>

      <h2>Changing your mind</h2>
      <p>If you finance through the dealer, you have two days to cancel that credit contract, and for a used vehicle you can do so even after taking delivery, provided the car comes back in the same condition. If you pay cash or use your own bank, there is generally no cooling-off period at all. Decide before the pen touches paper.</p>

      <h2>Where to go next</h2>
      <p><a class="text-link" href="${R.g4}">Registering the car with the SAAQ</a> · <a class="text-link" href="${R.g2}">Financing with imperfect credit</a> · <a class="text-link" href="${R.inventory}">See what we have in stock</a></p>
      ${accuracyNote}`
  },

  g2: {
    title: "Bad-Credit Car Financing in Quebec: Compare the Offer",
    description: "Prepare for used-car financing in Quebec with limited or damaged credit. Compare the full written offer without relying on promised rates or approval.",
    h1: "Car financing with bad credit in Quebec",
    sub: "Prepare the application, compare the complete offer and keep the rights Quebec law gives you.",
    body: `
      <p>Limited or damaged credit does not produce one standard rate, down payment or decision. Each lender applies its own criteria to the complete application. Treat any estimate as provisional until the lender provides a written offer.</p>

      <h2>A credit score is not an approval table</h2>
      <p>Credit scores are one input, not a published lender commitment. This page does not assign score bands, predict approval or quote a rate. Ask which documents are required and let the lender assess the actual file.</p>

      <h2>Prepare the information a lender may assess</h2>
      <p>The exact criteria and documents vary. A lender may consider:</p>
      <ul>
        <li><strong>Income and existing obligations.</strong> Be ready to provide the documents the lender requests.</li>
        <li><strong>Credit history.</strong> Review your own report for errors before applying.</li>
        <li><strong>The requested amount and term.</strong> Compare them with your complete monthly ownership budget.</li>
        <li><strong>The selected vehicle.</strong> Eligibility may differ by vehicle and lender.</li>
        <li><strong>A proposed down payment.</strong> Include it only when comparing an actual written offer; no fixed amount guarantees a result.</li>
      </ul>

      <h2>Compare what the offer actually costs</h2>
      <p>Compare the cash price, amount financed, credit charges, credit rate, payment schedule, term and total obligation. Quebec's OPC explains the required figures in an <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/credit-recouvrement-finance/temperament/contrat/contenu" target="_blank" rel="noopener">instalment-sale contract</a>. The <a href="https://www.canada.ca/en/financial-consumer-agency/services/loans/financing-car/shop-around.html" target="_blank" rel="noopener">Financial Consumer Agency of Canada</a> recommends comparing multiple complete offers when possible.</p>

      <h2>New to Canada with no credit file</h2>
      <p>No Canadian credit history is different from a history of missed payments, but there is no single newcomer program or requirement that applies to every lender. Ask which identity, residency, income and credit documents are required for the actual application. Do not rely on a promised down-payment percentage or vehicle-age rule unless the lender puts it in the offer.</p>

      <h2>Do not let the term hide the cost</h2>
      <p>A longer term generally lowers each payment while increasing the interest paid over the loan. Compare the total obligation and consider how long you may owe more than the vehicle is worth. A lower payment alone does not make the offer less expensive.</p>

      <h2>Do not assume a future refinance</h2>
      <p>Make the decision using the offer you have now. Credit-file changes and future refinancing depend on reporting, payment history, market conditions and a later lender assessment. No dealership can promise when a score will improve or that a cheaper refinance will become available.</p>

      <h2>Protect yourself</h2>
      <ul>
        <li>Financing cannot be a condition of a road-vehicle sale in Quebec. <a href="https://www.opc.gouv.qc.ca/consommateur/nouvelles-protections/" target="_blank" rel="noopener">Read the OPC summary</a>.</li>
        <li>Ask whether every warranty, insurance or protection product is optional and how it changes the amount financed.</li>
        <li>Compare the total obligation, not the weekly payment.</li>
        <li>Get the approved rate in writing and check it against the contract.</li>
        <li>An instalment-sale contract must state the right to repay early without fees or penalty. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/credit-recouvrement-finance/temperament/contrat/contenu" target="_blank" rel="noopener">Check the required contract content</a>.</li>
      </ul>

      <h2>Talk to us honestly</h2>
      <p>Tell us which vehicle and purchase budget you want to discuss. Call ${DEALER.phone} or read <a class="text-link" href="${R.financing}">how financing works at Automobile SX</a>. Approval, rate, term and any down-payment requirement come from the lender after assessment.</p>
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
      <p>Comparing a trade offer with a private-sale price can include the tax effect, but the calculation needs both tax bases. For an eligible trade-in, GST is generally calculated on the sale price less the trade-in credit. QST is calculated on the greater of the purchased vehicle's sale price or estimated value, less that credit.</p>
      <p>Request an itemized purchase quote showing the sale price, estimated value if applicable, trade-in credit and both tax amounts. That gives you the net comparison without assuming that every dollar of trade-in credit always reduces both taxes in the same way. <a href="https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/transport-and-road-vehicles/road-vehicles-individuals/trading-in-a-road-vehicle/trade-in-of-a-road-vehicle-between-an-individual-and-a-dealer/" target="_blank" rel="noopener">See Revenu Québec's calculation and conditions</a>.</p>

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

  g5: {
    title: "Used Car Budget in Quebec: The Full Cost | Automobile SX",
    description: "Buying a used car with a $15,000 budget? Separate the asking price, taxes and ownership costs before comparing vehicles in Dorval.",
    h1: "Used car budget in Quebec: what a $15,000 limit really buys",
    sub: "Work backward from a firm total so the advertised price, taxes and other costs fit the same plan.",
    byline: "By Automobile SX",
    schemaType: "BlogPosting",
    showBreadcrumbs: true,
    draft: true,
    image: "/images/guides/used-car-budget-quebec.jpg",
    imageAlt: "Used cars outside Automobile SX in Dorval, including a grey Kia Forte",
    imageCaption: "Current Automobile SX inventory in Dorval. Availability and prices change; use a total budget rather than this photo to compare vehicles.",
    body: `
      <p>A $15,000 purchase budget is not the same as a $15,000 advertised price. Set aside the applicable taxes, registration and any separately budgeted inspection or immediate ownership costs before choosing a vehicle. For a Dorval buyer with a firm spending limit, the useful question is: "What can I buy and prepare for use without exceeding my total budget?"</p>

      <h2>Start with two budgets</h2>
      <p>Your purchase budget covers getting the vehicle into your name and ready for your needs. Your monthly ownership budget covers keeping it on the road.</p>
      <p>Write down the following before browsing:</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Purchase planning</th><th>Monthly planning</th></tr></thead>
        <tbody>
          <tr><td>Vehicle price and applicable taxes</td><td>Loan payment, if financed</td></tr>
          <tr><td>Registration</td><td>Insurance</td></tr>
          <tr><td>Independent inspection</td><td>Fuel or charging</td></tr>
          <tr><td>Immediate work or equipment you choose</td><td>Maintenance reserve</td></tr>
          <tr><td>A cash reserve you do not want to spend</td><td>Parking and other recurring costs</td></tr>
        </tbody>
      </table></div>
      <p>An inspection fee or insurance quote comes from the provider you select. Do not assume the advertised vehicle price includes either.</p>

      <h2>Work backward from your limit</h2>
      <p>For a standard taxable dealer purchase, GST is 5% and QST is 9.975%. QST may use the vehicle's estimated value when it is higher than the selling price. Confirm the applicable calculation before relying on a simple percentage. <a href="https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/transport-and-road-vehicles/road-vehicles-individuals/purchase-of-a-road-vehicle/purchase-of-a-used-road-vehicle-from-a-dealer/" target="_blank" rel="noopener">Revenu Québec explains purchases from a dealer</a>.</p>
      <p>Here is an illustrative calculation, not a vehicle offer. Assume both taxes apply to the selling price, with no trade-in:</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Item</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Total available</td><td>$15,000.00</td></tr>
          <tr><td>Amount you choose to reserve for other costs</td><td>$1,000.00</td></tr>
          <tr><td>Remaining for vehicle plus taxes</td><td>$14,000.00</td></tr>
          <tr><td>Approximate maximum vehicle price: $14,000 / 1.14975</td><td>$12,176.56</td></tr>
        </tbody>
      </table></div>
      <p>The $1,000 reserve is a hypothetical planning choice, not an estimate of registration, inspection, insurance or repair costs. Replace it with your actual figures. A higher QST valuation changes this calculation.</p>

      <h2>Ask for a quote you can compare</h2>
      <p>Request an itemized written total for the exact vehicle. Ask what is included, what is optional, which amount is used for QST and what remains payable at registration. If you have a trade-in, ask for its value and any outstanding loan balance as separate figures.</p>
      <p>For financing, compare the amount borrowed, rate, term and total borrowing cost. A smaller payment alone does not establish a cheaper purchase. The <a href="https://www.canada.ca/en/financial-consumer-agency/services/loans/financing-car/shop-around.html" target="_blank" rel="noopener">Financial Consumer Agency of Canada</a> recommends comparing the complete financing offer.</p>

      <h2>Make your shortlist useful</h2>
      <p>Send your maximum purchase budget, intended monthly limit, preferred body style and planned purchase date. State whether your budget includes taxes. This prevents a conversation about a vehicle that was never within your limit.</p>
      <p><a class="text-link" href="${R.inventory}">Browse Automobile SX inventory</a>, then <a class="text-link" href="${R.contact}">contact us in Dorval</a> with the vehicle or stock number you want to discuss. For the broader process, read <a class="text-link" href="${R.g1}">buying a used car in Quebec</a>, <a class="text-link" href="${R.g6}">plan an independent inspection</a> or review <a class="text-link" href="${R.financing}">our financing information</a>.</p>`
  },

  g6: {
    title: "Used Car Inspection in Dorval | Automobile SX",
    description: "Arrange an independent inspection before buying a used car in Dorval. Know what to ask the garage, what to bring and how to use the report.",
    h1: "Used car inspection in Dorval: what to arrange before buying",
    sub: "Coordinate the actual vehicle, the garage and the questions before you commit.",
    byline: "By Automobile SX",
    schemaType: "BlogPosting",
    showBreadcrumbs: true,
    draft: true,
    image: "/images/guides/used-car-inspection-dorval.jpg",
    imageAlt: "Dashboard and front cabin of a used Volkswagen at Automobile SX",
    imageCaption: "Interior photos can help prepare questions, but they do not replace an independent mechanical inspection.",
    body: `
      <p>Arrange an independent inspection before committing to a used car, even if you have already driven it and read its history report. Choose the garage, agree on the inspection scope and coordinate access to the specific vehicle. Use the written findings to decide what you are comfortable buying; an inspection cannot promise future reliability.</p>

      <h2>Start with the actual vehicle</h2>
      <p>Before booking a garage, confirm that the car is still available. Give the dealership the stock number and give the garage the VIN, model, year and kilometres. Tell the garage about any warning light, sound or concern you noticed.</p>
      <p>Before booking, contact us with the vehicle, garage and proposed time so current availability and access can be confirmed. Any transport or other arrangement must be agreed case by case; do not assume the vehicle can be moved to a garage until that coordination is complete. See the <a class="text-link" href="${R.faq}">buying FAQ</a> for the current wording.</p>

      <h2>Ask the garage what its inspection includes</h2>
      <p>CAA-Québec recommends an independent pre-purchase inspection because an ordinary viewing or road test can miss problems. Ask for a written report and confirm the price and scope directly with the inspecting shop. <a href="https://www.caaquebec.com/fr/conseils/acheter-ou-vendre-un-vehicule/vous-achetez-une-voiture-passez-d-abord-a-l-inspection" target="_blank" rel="noopener">Read CAA-Québec's pre-purchase inspection guidance</a>.</p>
      <p>Use these questions to prepare the appointment:</p>
      <ul>
        <li>Will you inspect the underside and explain any corrosion you find?</li>
        <li>What mechanical and diagnostic checks are included?</li>
        <li>Will the report distinguish work needed now from items to monitor?</li>
        <li>Can you provide a written estimate for any recommended work?</li>
        <li>What cannot be assessed within this inspection?</li>
      </ul>
      <p>Do not ask a mechanic simply whether the car is "good." Ask what the observed condition means for your intended use and budget.</p>

      <h2>Keep the paperwork separate from the mechanical check</h2>
      <p>Bring any available service invoices and vehicle-history report. These can give the inspector useful context, but neither replaces an examination of the car. A mechanical inspection also does not resolve ownership debts by itself. Documentary checks belong alongside it.</p>
      <p>The OPC's dealer-buying guidance recommends a road test and inspection by a mechanic you trust. It states that a dealer must accept your request to test and inspect the vehicle. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/vehicule/auto-achat/conseil/occasion-commercant" target="_blank" rel="noopener">Read the OPC guidance before buying from a dealer</a>.</p>

      <h2>Turn the findings into a decision</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Finding</th><th>Question before buying</th></tr></thead>
        <tbody>
          <tr><td>Work recommended before use</td><td>What work, cost and timing does the garage specify?</td></tr>
          <tr><td>Maintenance due soon</td><td>Can I accommodate it in my ownership budget?</td></tr>
          <tr><td>An unanswered concern</td><td>What additional assessment is needed?</td></tr>
          <tr><td>A repair discussed with the seller</td><td>Is the agreed work written into the purchase terms?</td></tr>
        </tbody>
      </table></div>
      <p>You can continue, request clarification, discuss the terms or decide that the vehicle is not suitable. The inspection's value is helping you make that decision with better information.</p>
      <p><a class="text-link" href="${R.inventory}">Choose a vehicle from our inventory</a>, then <a class="text-link" href="${R.contact}">contact Automobile SX in Dorval</a> with its stock number and your preferred inspection timing. For the broader process, read <a class="text-link" href="${R.g1}">buying a used car in Quebec</a> or use the <a class="text-link" href="${R.g5}">complete purchase-budget worksheet</a>.</p>`
  },

  privacy: {
    title: "Privacy Policy | Automobile SX Dorval",
    description: "How Automobile SX handles personal information and uses privacy-conscious, cookie-free website analytics.",
    h1: "Privacy policy",
    sub: "What we collect, what we do not, and how to reach us about it. Last updated 14 August 2026.",
    body: `
      <p>Automobile SX is a used car dealership at 2044 Avenue Chartier, Dorval, Quebec. This page explains what happens to personal information in connection with this website and our business. It is written to be accurate about how the site actually works rather than to cover every hypothetical.</p>

      <h2>What this website collects</h2>
      <p>This site has <strong>no advertising trackers, no marketing pixels and no analytics cookies</strong>. We do not build advertising profiles or track visitors across websites.</p>
      <p>We use Vercel Web Analytics and Speed Insights to understand aggregate page traffic and real-world site performance. They may process the page path, referring site, approximate country or region, device and browser type, and measurements such as loading speed and layout stability. Vercel states that Web Analytics stores anonymized data, uses no cookies, does not associate activity with an IP address, and resets its visitor hash every 24 hours.</p>
      <p>Before a page view is sent, this site removes the complete query string and fragment from the URL. We do not send names, email addresses, phone numbers, form contents, messages or other inquiry details to analytics. Analytics runs only on the public automobilesx.ca website, not in the admin panel or deployment previews. Browser Global Privacy Control and Do Not Track signals are respected.</p>
      <div class="privacy-controls">
        <p><strong>Anonymous site measurement on this browser:</strong> <span data-metrics-status data-on="On" data-off="Off">On</span></p>
        <button class="btn btn-outline" type="button" data-metrics-opt-out>Turn off anonymous measurement</button>
        <button class="btn btn-outline" type="button" data-metrics-opt-in hidden>Allow anonymous measurement</button>
        <p class="privacy-control-note">Turning it off saves only that preference in this browser. It applies to future page loads and does not affect the website.</p>
        <noscript><p class="privacy-control-note">Analytics does not load when JavaScript is disabled.</p></noscript>
      </div>
      <p>When you use the contact form, the name, contact details, topic, vehicle selection, reply preference and message you enter are sent to Automobile SX by email. The website does not add that message to an inventory database, analytics service or marketing list.</p>

      <h2>What we hold, and why</h2>
      <p>If you email, call or text us, we hold what you chose to tell us: your name, your contact details, and whatever you said about the vehicle you are interested in. We use it to answer you and to arrange a viewing or a sale. Nothing more.</p>
      <p>If you buy a vehicle or trade one in, we collect the information required to complete the sale and the registration, including identification and details needed by the Société de l'assurance automobile du Québec. That is a legal requirement of selling a vehicle, and those records are kept as long as the law requires.</p>
      <p>We do not sell, rent or trade personal information to anyone.</p>

      <h2>Other companies involved</h2>
      <p>Four third parties are involved in running the site, and it is fair that you know what each one sees.</p>
      <p><strong>Vercel</strong> hosts the website and provides the anonymous traffic and performance measurements described above. Like any web host, its servers also process standard technical information such as IP addresses when a page is requested.</p>
      <p><strong>Resend</strong> delivers messages submitted through the contact form to our email inbox. It processes the form details for that delivery; copies then remain in our email records so we can answer your inquiry.</p>
      <p><strong>Google</strong> provides the fonts used for the text, and the map on the home and contact pages. Loading a font or a map means your browser contacts Google directly, so Google may receive your IP address and set its own cookies. Google's handling of that is governed by its own privacy policy. If your browser blocks Google, the site still works: the map is replaced by our address and a link.</p>
      <p><strong>Meta</strong> is involved only if you follow a link to our Facebook or Instagram pages, at which point you are on their service and their policies apply.</p>
      <p>These service providers may process information outside Quebec or Canada under their own security and privacy commitments.</p>

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
