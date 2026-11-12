/* Copie française. Faits québécois vérifiés en août 2026 auprès de l'OPC,
   de la SAAQ, de Revenu Québec et de Québec.ca. */

const { ROUTES, DEALER } = require("./layout.js");
const R = ROUTES.fr;

const ui = {
  make: "Marque", model: "Modèle", maxPrice: "Prix max", any: "Tous",
  searchBtn: "Rechercher", viewAll: "Voir tout l'inventaire →",
  filters: "Filtres", close: "Fermer", keyword: "Marque, modèle, version…",
  bodyType: "Carrosserie", price: "Prix", priceMin: "Prix minimum", priceMax: "Prix maximum",
  year: "Année", yearMin: "Année la plus ancienne", yearMax: "Année la plus récente",
  maxKm: "Kilométrage max", transmission: "Transmission", fuel: "Carburant", drivetrain: "Rouage",
  sortLabel: "Trier les véhicules", sortPriceAsc: "Prix : croissant", sortPriceDesc: "Prix : décroissant",
  sortKm: "Kilométrage le plus bas", sortYear: "Année la plus récente",
  emptyTitle: "Aucun véhicule ne correspond à ces filtres",
  emptyBody: "Élargissez la fourchette de prix ou de kilométrage, ou effacez tout et recommencez.",
  noStockTitle: "Nouveaux véhicules à venir",
  noStockBody: `Nos annonces sont en cours de mise à jour. Appelez le <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a> pour savoir ce qui est disponible.`,
  emptyReset: "Réinitialiser les filtres", loadMore: "Voir plus de véhicules",
  overview: "Aperçu", specs: "Fiche technique", features: "Équipements",
  similar: "Véhicules semblables", estimatePayment: "Estimez votre paiement",
  bookTestDrive: "Réserver un essai", checkAvailability: "Vérifier la disponibilité",
  getPreApproved: "Info financement", hoursShort: "Ouvert de 10 h à 18 h tous les jours. Appelez avant de vous déplacer.",
  hours: "Heures", readMore: "Lire le guide →"
};

const ctaCard = `
<aside class="prose-aside">
  <div class="aside-card">
    <h2>Parlez à Spiro</h2>
    <p>Vous traitez directement avec Spiro tout au long de l'achat, en français comme en anglais.</p>
    <a class="btn btn-red btn-block" href="tel:+15148249117">Appeler le ${DEALER.phone}</a>
    <a class="btn btn-outline btn-block" href="${R.contact}">Envoyer un message</a>
    <a class="btn btn-ghost btn-block" href="${R.inventory}">Voir l'inventaire</a>
    <p class="aside-note">${DEALER.street}, ${DEALER.city}, ${DEALER.region}<br>Ouvert de 10 h à 18 h, 7 jours sur 7.</p>
  </div>
</aside>`;

const accuracyNote = `<p class="accuracy-note">L'information de cette page reflète les règles québécoises vérifiées en novembre 2026 et est fournie à titre indicatif seulement. Il ne s'agit pas d'un avis juridique ou financier. Les règles et les tarifs changent : validez les détails pertinents auprès de l'<a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/vehicule/auto-achat/conseil/occasion-commercant" target="_blank" rel="noopener">Office de la protection du consommateur</a>, de la <a href="https://saaq.gouv.qc.ca/immatriculation" target="_blank" rel="noopener">SAAQ</a> et de <a href="https://www.revenuquebec.ca/fr/citoyens/taxes/biens-et-services-taxables-detaxes-ou-exoneres/tps-et-tvq/transport-et-vehicules-routiers/vehicules-routiers-citoyens/achat-dun-vehicule-routier/achat-dun-vehicule-routier-usage-dun-commercant/" target="_blank" rel="noopener">Revenu Québec</a>.</p>`;

const guideCards = [
  { h: "Acheter une auto usag\u00e9e en hiver", p: "Comprenez les r\u00e8gles sur les pneus d'hiver et planifiez la pose avant de repartir.", href: R.g7 },
  { h: "Budget d'auto usagée au Québec", p: "Partez d'une limite totale et comparez les coûts d'achat et d'utilisation.", href: R.g5 },
  { h: "Inspection d'une auto usagée à Dorval", p: "Organisez une inspection indépendante et utilisez les constats écrits.", href: R.g6 },
  { h: "Acheter une voiture usagée au Québec", p: "Taxes, garantie légale, étiquette obligatoire et vérifications avant de signer.", href: R.g1 },
  { h: "Financement avec mauvais crédit", p: "Comment comparer une offre complète et conserver vos droits au Québec.", href: R.g2 },
  { h: "Quelle est la valeur de ma reprise ?", p: "Comment le montant est établi et l'économie de taxes que plusieurs ignorent.", href: R.g3 },
  { h: "Immatriculer une voiture usagée", p: "Les démarches à la SAAQ, les plaques et ce que le commerçant gère pour vous.", href: R.g4 }
];

module.exports = {
  asideCard: ctaCard,
  lang: "fr",
  R,
  ui,

  home: {
    title: "Autos Usagées à Dorval, QC | Automobile SX | Vente, Achat, Échange",
    description: "Voitures d'occasion à vendre à Dorval, au Québec. Commerce familial : vente, achat, échange. Financement disponible. Ouvert de 10 h à 18 h, 7 jours.",
    h1: "Autos usagées de qualité à Dorval",
    sub: "Un commerce familial sur l'avenue Chartier. Vous traitez directement avec Spiro tout au long de l'achat, en français comme en anglais.",
    heroAlt: "Le commerce Automobile SX au 2044 avenue Chartier à Dorval",
    searchAria: "Rechercher dans l'inventaire",
    whyH: "Pourquoi acheter chez Automobile SX",
    trust: [
      { h: "Service personnalisé", p: "Vous traitez directement avec Spiro, du premier appel jusqu'aux clés dans votre main." },
      { h: "Vente · Achat · Échange", p: "Nous vendons, nous achetons et nous prenons des reprises. Kilométrage et état divulgués d'avance." },
      { h: "Ouvert 7 jours", p: `De 10 h à 18 h tous les jours. Les rendez-vous sont fortement recommandés. Veuillez appeler le ${DEALER.phone} avant de vous déplacer pour confirmer la disponibilité de Spiro.` },
      { h: "Options de financement", p: "Nous travaillons avec plusieurs prêteurs. L'approbation, le taux et les conditions dépendent de l'analyse de chaque demande." }
    ],
    featuredKicker: "En stock",
    featuredH: "Voitures d'occasion à vendre à Dorval",
    bodyH: "Parcourir par type de carrosserie",
    finH: "Parlons de financement automobile à Dorval.",
    finBody: `<p>Nous travaillons avec plusieurs prêteurs canadiens. Chacun analyse le dossier et détermine l'approbation, le taux, la durée et toute mise de fonds exigée. Vous pouvez comparer l'offre écrite avant de décider.</p>
      <p>Et pour être clair sur vos droits : au Québec, un commerçant ne peut pas conditionner la vente d'un véhicule à la conclusion d'un contrat de crédit. Si vous préférez payer comptant ou passer par votre banque, c'est votre choix.</p>`,
    finCta: "Comment fonctionne le financement",
    lotAlt: "Le commerce Automobile SX au 2044 avenue Chartier à Dorval",
    tradeKicker: "Vente · Achat · Échange",
    tradeH: "Nous achetons aussi, et une reprise réduit vos taxes.",
    tradeBody: `<p>Vendre de particulier à particulier, c'est des inconnus chez vous, des essais routiers avec des gens que vous ne connaissez pas et un risque de paiement. Apportez-la-nous : vous obtenez une offre claire, que vous achetiez chez nous ou non.</p>
      <p>Une reprise admissible peut réduire la base taxable. La TPS est généralement calculée sur le prix de vente moins le crédit de reprise; la TVQ part du plus élevé du prix de vente ou de la valeur estimative, puis soustrait ce crédit. Demandez le calcul réel par écrit.</p>`,
    tradeCta: "Faire évaluer mon véhicule",
    guidesKicker: "Réponses claires",
    guidesH: "Guides pour acheteurs de voitures d'occasion au Québec",
    guidesAll: "Tous les guides →",
    guideCards,
    reviewsKicker: "Avis Google",
    reviewsH: "Directement de nos clients",
    reviewsP: "De vrais commentaires de personnes qui ont fait affaire directement avec Spiro à Dorval. Lisez tous les avis sur Google ou partagez votre expérience pour aider une petite entreprise familiale.",
    /* Mêmes avis que la version anglaise, transcrits tels quels. */
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
    reviewsWrite: "Laisser un avis Google",
    reviewsRead: "Lire tous les avis Google",
    reviewsSwipe: "Glissez pour voir d’autres avis →",
    visitH: "Visitez-nous à Dorval",
    askFor: "Demandez Spiro",
    directions: "Itinéraire ↗"
  },

  inventory: {
    title: "Autos Usagées à Vendre à Dorval, QC | Inventaire Automobile SX",
    description: "Voitures, VUS et camionnettes d'occasion à vendre chez Automobile SX à Dorval. Filtrez par marque, carrosserie, prix, année et kilométrage.",
    h1: "Autos usagées à vendre à Dorval",
    sub: `Chaque véhicule est affiché à son juste prix, kilométrage divulgué. Appelez le <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a> pour planifier une visite.`,
    budgetHelp: `<p class="muted-note">Vous avez une limite totale ferme? <a class="text-link" href="${R.g5}">Planifiez d'abord le prix, les taxes et les autres coûts</a>.</p>`,
    note: `<h2>Vous ne trouvez pas ce que vous cherchez ?</h2>
      <p>Notre inventaire change constamment et nous pouvons rechercher un véhicule pour vous. Dites-nous la marque, le modèle, le budget et le kilométrage souhaités et nous allons ouvrir l'œil. Appelez le ${DEALER.phone} ou <a class="text-link" href="${R.contact}">envoyez-nous les détails</a>.</p>`
  },

  vehicle: {
    title: "Détails du véhicule | Automobile SX Dorval, QC",
    description: "Fiche technique complète, équipements et photos de ce véhicule d'occasion chez Automobile SX à Dorval, au Québec."
  },

  contact: {
    title: "Contacter Automobile SX | Concessionnaire d'Autos Usagées à Dorval",
    description: "Contactez Automobile SX à Dorval, au Québec. Prenez rendez-vous, informez-vous sur le financement ou faites évaluer votre véhicule.",
    h1: "Nous joindre",
    sub: "Demandez Spiro. Nous répondons en français comme en anglais, généralement en un jour ouvrable.",
    formH: "Envoyez-nous un message",
    name: "Nom", email: "Courriel", phone: "Téléphone", message: "Message",
    contactChoice: "Indiquez une adresse courriel ou un numéro de téléphone pour que Spiro puisse vous répondre. Il n'est pas nécessaire de fournir les deux.",
    preferred: "Réponse souhaitée", prefEither: "Aucune préférence", prefCall: "Appel téléphonique",
    prefText: "Message texte", prefEmail: "Courriel",
    interest: "Mon besoin", whichVehicle: "Quel véhicule ?",
    optGeneral: "Une question générale", optVehicle: "Un véhicule précis",
    optTestDrive: "Réserver un essai routier", optFinancing: "Le financement", optTrade: "Vendre ou échanger mon véhicule",
    errName: "Veuillez inscrire votre nom.",
    errEmail: "Inscrivez une adresse courriel valide, ou laissez ce champ vide et fournissez un numéro de téléphone.",
    errPhone: "Inscrivez un numéro d'au moins 10 chiffres, ou laissez ce champ vide et fournissez une adresse courriel.",
    errMessage: "Ajoutez un court message pour que nous puissions vous aider.",
    send: "Envoyer",
    sending: "Envoi…",
    formNote: "Votre message est transmis de façon sécurisée à Automobile SX. Vous préférez parler ? Appelez le " + DEALER.phone + ".",
    sendError: `Nous n'avons pas pu envoyer votre message pour le moment. Réessayez, écrivez à <a class="text-link" href="mailto:${DEALER.email}">${DEALER.email}</a> ou appelez le <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a>.`,
    successH: "Message envoyé",
    successBody: "Merci. Spiro a reçu votre message et vous répondra généralement dans un délai d'un jour ouvrable.",
    directions: "Itinéraire ↗"
  },

  financing: {
    title: "Financement Auto Usagée à Dorval, QC | Automobile SX",
    description: "Information sur le financement d'auto usagée à Dorval : comparez l'offre complète, préparez vos documents et connaissez vos droits au Québec.",
    h1: "Financement d'auto usagée à Dorval",
    sub: "L'approbation, le taux et les conditions dépendent du prêteur et du dossier. Voici comment vous préparer et comparer une offre.",
    body: `
      <p>Le paiement mensuel n'est qu'une partie de l'offre. Comparez le montant emprunté, le taux de crédit, la durée, les frais et l'obligation totale avant de décider.</p>

      <h2>Chaque prêteur analyse le dossier complet</h2>
      <p>Automobile SX travaille avec plusieurs prêteurs canadiens. Leurs critères diffèrent, et c'est le prêteur—pas le commerçant—qui décide d'approuver ou non la demande et qui fixe le taux et les conditions.</p>
      <ul>
        <li><strong>L'historique de crédit est un facteur.</strong> Aucune cote affichée ici ne promet une approbation ou un taux précis.</li>
        <li><strong>Le revenu et les obligations existantes comptent.</strong> Le prêteur doit évaluer la capacité de rembourser le crédit demandé.</li>
        <li><strong>Le véhicule et la durée comptent.</strong> L'admissibilité peut varier selon le montant demandé et le véhicule choisi.</li>
        <li><strong>La mise de fonds dépend du dossier.</strong> Ne présumez pas qu'elle est exigée ni qu'un montant précis changera le résultat avant d'avoir une offre écrite.</li>
      </ul>

      <h2>Confirmez les documents avant la demande</h2>
      <p>Un prêteur peut demander des documents pour vérifier l'identité, l'adresse, le revenu, les renseignements bancaires ou la reprise. La liste exacte dépend de la demande. Demandez ce qui est requis avant de transmettre des renseignements personnels. Par exemple :</p>
      <ul>
        <li>Une pièce d'identité officielle et une preuve d'adresse</li>
        <li>Les documents demandés pour appuyer le revenu ou l'emploi</li>
        <li>Les renseignements bancaires nécessaires à la demande</li>
        <li>L'immatriculation de la reprise et un solde de remboursement à jour, s'il y a lieu</li>
      </ul>

      <h2>Comparez l'offre écrite complète</h2>
      <p>Les taux changent et une fourchette publicitaire ne prédit pas une approbation individuelle. Demandez par écrit le taux, l'échéancier, les frais de financement, le montant financé, la durée et l'obligation totale. L'<a href="https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/prets/financer-auto/comparer-financement-automobile.html" target="_blank" rel="noopener">Agence de la consommation en matière financière du Canada</a> recommande de comparer le coût total plutôt que seulement le paiement ou le taux.</p>

      <h2>Comprenez l'effet de la durée</h2>
      <p>Une durée plus longue peut réduire chaque paiement tout en augmentant les intérêts payés pendant le prêt. Elle peut aussi prolonger la période où vous devez plus que la valeur du véhicule. Comparez le même montant et le même taux sur différentes durées avant de choisir.</p>

      <h2>Vos droits au Québec, en clair</h2>
      <ul>
        <li><strong>Le financement ne peut pas vous être imposé.</strong> Le Québec interdit de conditionner l'achat d'un véhicule routier au crédit organisé par le commerçant ou à la location à long terme. <a href="https://www.opc.gouv.qc.ca/consommateur/nouvelles-protections/" target="_blank" rel="noopener">Consultez le résumé de l'OPC</a>.</li>
        <li><strong>Le contrat de vente à tempérament doit présenter les chiffres complets.</strong> Cela comprend notamment le prix comptant, la mise de fonds s'il y a lieu, les frais et le taux de crédit, l'obligation totale, la durée et les versements. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/credit-recouvrement-finance/temperament/contrat/contenu" target="_blank" rel="noopener">Consultez la liste de l'OPC</a>.</li>
        <li><strong>Les règles de remboursement anticipé et d'annulation dépendent du contrat.</strong> Un contrat de vente à tempérament doit permettre le remboursement anticipé sans frais ni pénalité et comporte normalement un délai d'annulation de deux jours; le crédit à coût élevé suit des règles différentes. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/vehicule/auto-achat/occasion/annulation-contrat" target="_blank" rel="noopener">Vérifiez les règles d'annulation de l'OPC</a>.</li>
      </ul>

      <h2>Commençons la conversation</h2>
      <p>Indiquez le véhicule, votre budget d'achat et si vous souhaitez discuter de financement. Appelez le ${DEALER.phone} ou <a class="text-link" href="${R.contact}?interest=financing">écrivez-nous</a>. Toute approbation, tout taux, toute durée ou toute mise de fonds exigée provient de l'offre écrite du prêteur après son analyse.</p>
      <p>À lire aussi : <a class="text-link" href="${R.g2}">le financement auto avec mauvais crédit au Québec</a>.</p>
      ${accuracyNote}`
  },

  sell: {
    title: "Vendre ou Échanger Votre Auto à Dorval, QC | Automobile SX",
    description: "Nous achetons des autos usagées à Dorval et prenons des reprises. Offre écrite sans obligation et économie de taxes sur votre prochain véhicule.",
    h1: "Vendez votre auto, ou donnez-la en échange",
    sub: "Une offre claire, que vous achetiez chez nous ou non.",
    body: `
      <p>Vendre une voiture de particulier à particulier, c'est des inconnus dans votre entrée, des essais routiers avec des gens que vous ne connaissez pas et un mode de paiement auquel il faut faire confiance. Bien des gens préfèrent éviter tout ça. Apportez le véhicule sur l'avenue Chartier : nous l'examinons sérieusement et nous vous faisons une offre.</p>

      <h2>Comment se déroule l'évaluation</h2>
      <ol>
        <li><strong>Parlez-nous du véhicule.</strong> Année, marque, modèle, version, kilométrage et tout ce qu'on devrait savoir. Des photos aident.</li>
        <li><strong>Passez le montrer.</strong> Une évaluation sérieuse implique de le conduire et de regarder dessous. Prévoyez environ quinze minutes et appelez avant de vous déplacer pour confirmer la disponibilité de Spiro.</li>
        <li><strong>Recevez un montant.</strong> Nous expliquons comment nous y arrivons. Si ça ne vous convient pas, aucun problème et aucune pression.</li>
      </ol>

      <h2>L'économie de taxes que plusieurs ignorent</h2>
      <p>Une reprise admissible peut réduire la base taxable, mais la TPS et la TVQ ne partent pas toujours du même montant. La TPS est généralement calculée sur le prix de vente moins le crédit de reprise. La TVQ est calculée sur le plus élevé du prix de vente ou de la valeur estimative, moins ce crédit.</p>
      <p>Demandez séparément le prix de vente, le crédit de reprise, la valeur estimative s'il y a lieu et chaque taxe. Ne présumez pas que la réduction correspond toujours au crédit de reprise multiplié par les taux combinés. <a href="https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/transport-and-road-vehicles/road-vehicles-individuals/trading-in-a-road-vehicle/trade-in-of-a-road-vehicle-between-an-individual-and-a-dealer/" target="_blank" rel="noopener">Consultez le calcul de Revenu Québec</a>.</p>

      <h2>Ce qui fait monter la valeur</h2>
      <ul>
        <li>Les factures d'entretien, même partielles</li>
        <li>Les deux clés</li>
        <li>Les pneus d'hiver, surtout montés sur jantes</li>
        <li>Un intérieur propre : la présentation influence réellement le montant</li>
        <li>La franchise sur les défauts connus, qui coûte moins cher qu'une surprise sur le pont élévateur</li>
      </ul>

      <h2>Le véhicule est encore financé ?</h2>
      <p>C'est courant. Nous obtenons le solde auprès de votre prêteur et gérons le remboursement. Si le véhicule vaut plus que ce que vous devez, la différence s'applique à votre prochain achat. S'il vaut moins, nous vous le dirons clairement et nous examinerons les options plutôt que de glisser discrètement l'écart dans un nouveau prêt.</p>

      <h2>Obtenez une offre</h2>
      <p>Appelez le ${DEALER.phone} ou <a class="text-link" href="${R.contact}?interest=trade-in">envoyez les détails</a>. Nous sommes ouverts de 10 h à 18 h tous les jours; veuillez appeler avant de vous déplacer pour confirmer la disponibilité de Spiro.</p>
      <p>À lire aussi : <a class="text-link" href="${R.g3}">quelle est la valeur de ma reprise au Québec ?</a></p>
      ${accuracyNote}`
  },

  about: {
    title: "À Propos d'Automobile SX | Concessionnaire Familial à Dorval",
    description: "Automobile SX est un commerce familial de véhicules d'occasion au 2044 avenue Chartier à Dorval, au service de l'Ouest-de-l'Île.",
    h1: "Un petit commerce à Dorval, dirigé par la personne qui répond au téléphone",
    sub: "Vente · Achat · Échange, sur l'avenue Chartier.",
    body: `
      <p>Automobile SX est un commerce familial de véhicules d'occasion situé au 2044 avenue Chartier, à Dorval. Il est volontairement petit. Quand vous appelez, c'est Spiro qui répond. Quand vous venez voir une auto, c'est Spiro qui vous la montre. Et si vous avez une question trois mois plus tard, vous composez le même numéro et vous parlez à la même personne.</p>

      <h2>Ce que signifie faire affaire avec un petit commerce</h2>
      <p>Être petit, c'est justement le but. Dans l'Ouest-de-l'Île, la réputation voyage de bouche à oreille : les clients qui reviennent et les recommandations font croître l'entreprise. Cela influence la façon dont chaque véhicule est acheté, évalué et décrit.</p>
      <ul>
        <li><strong>Une seule personne, du début à la fin.</strong> Spiro s'occupe de votre dossier, du premier appel jusqu'aux documents.</li>
        <li><strong>Des prix affichés.</strong> Chaque annonce indique son prix, son kilométrage et son état.</li>
        <li><strong>Service bilingue.</strong> En français ou en anglais, selon votre préférence.</li>
        <li><strong>Le temps de réfléchir.</strong> Personne n'a un quota qui dépend de votre signature aujourd'hui.</li>
      </ul>

      <h2>Comment nous choisissons nos véhicules</h2>
      <p>Nous achetons des véhicules dans lesquels nous mettrions un membre de notre famille. Ça veut dire refuser les autos dont l'historique ne tient pas debout, et être francs sur l'usure normale liée à l'âge et au kilométrage pour celles que nous prenons. Une voiture de huit ans avec 140 000 km est un bon achat au bon prix, et prétendre le contraire n'aide personne.</p>
      <p>Le kilométrage, l'état et les défauts connus sont divulgués avant même qu'on vous les demande. Les inspections indépendantes sont les bienvenues. Spiro discutera volontiers des modalités avec vous; veuillez communiquer avec nous à l'avance pour coordonner l'inspection.</p>

      <h2>Au service de Dorval et de l'Ouest-de-l'Île</h2>
      <p>Nous sommes à quelques minutes de Pointe-Claire, Lachine, Pierrefonds, Kirkland et Montréal-Ouest, et facilement accessibles depuis le centre-ville de Montréal ou Laval. La plupart de nos clients viennent de l'Ouest-de-l'Île, et beaucoup arrivent par une connaissance qui a déjà acheté chez nous.</p>
      <p>Plus de détails sur notre service dans l'<a class="text-link" href="${R.local}">Ouest-de-l'Île</a>, ou consultez notre <a class="text-link" href="${R.faq}">foire aux questions</a>.</p>

      <h2>Passez nous voir</h2>
      <p>${DEALER.street}, ${DEALER.city}, ${DEALER.region}. Ouvert de 10 h à 18 h, 7 jours sur 7. Un appel au ${DEALER.phone} à l'avance permet de préparer le véhicule pour votre arrivée.</p>`
  },

  faq: {
    title: "FAQ Auto Usagée | Acheter à Dorval et au Québec | Automobile SX",
    description: "Réponses sur l'achat d'une voiture d'occasion au Québec : financement, reprise, garantie légale, rendez-vous, taxes et immatriculation.",
    h1: "Foire aux questions",
    sub: "Les questions qu'on nous pose vraiment, avec des réponses claires.",
    faqs: [
      { q: "Faut-il un rendez-vous ?",
        a: "Les rendez-vous sont fortement recommandés, mais ils ne sont pas obligatoires. Nous sommes ouverts de 10 h à 18 h 7 jours sur 7. Veuillez appeler avant de vous déplacer pour confirmer la disponibilité de Spiro." },
      { q: "Offrez-vous du financement ?",
        a: "Oui. Nous travaillons avec plusieurs prêteurs canadiens et soumettons votre dossier à ceux qui conviennent. Vous verrez le taux, la durée et le coût total avant toute signature. Au Québec, un commerçant ne peut pas exiger que vous financiez chez lui comme condition de la vente." },
      { q: "Puis-je donner mon véhicule en échange ?",
        a: "Oui. Pour une reprise admissible, la TPS est généralement calculée sur le prix de vente moins le crédit de reprise. La TVQ part du plus élevé du prix de vente ou de la valeur estimative, puis soustrait ce crédit. Demandez le calcul détaillé plutôt que de présumer une économie fixe. Nous évaluons votre véhicule sans obligation d'achat." },
      { q: "Y a-t-il une garantie sur une auto usagée au Québec ?",
        a: "Souvent oui, et elle est fixée par la loi plutôt que par le commerçant. La Loi sur la protection du consommateur prévoit une garantie de bon fonctionnement selon l'âge et le kilométrage : environ six mois ou 10 000 km pour les véhicules récents à faible kilométrage, jusqu'à un mois ou 1 700 km pour les plus âgés, et aucune garantie de ce type au-delà de sept ans ou de 120 000 km. Même dans ce dernier cas, les garanties légales générales de qualité et de durabilité s'appliquent toujours. La catégorie est indiquée sur l'étiquette du véhicule." },
      { q: "Puis-je faire inspecter l'auto par mon mécanicien ?",
        a: `Les inspections indépendantes sont les bienvenues. Spiro discutera volontiers des modalités avec vous. Communiquez avec nous à l'avance pour coordonner l'inspection, puis <a href="${R.g6}">voyez quoi organiser</a> avec le garage. L'accès au véhicule et tout transport doivent être confirmés pour l'inspection précise. L'inspection évalue l'état au moment de l'examen; elle ne garantit pas la fiabilité future.` },
      { q: "Puis-je réserver un véhicule ?",
        a: "Appelez le 514-824-9117 avec le véhicule ou le numéro de stock. La disponibilité peut changer et Automobile SX ne publie pas de politique générale de réservation en ligne. Confirmez directement avec Spiro les conditions applicables au véhicule précis avant de considérer qu'il est réservé." },
      { q: "Faites-vous la livraison ?",
        a: "Les véhicules sont normalement récupérés chez Automobile SX à Dorval. Vous avez besoin d'un arrangement particulier? Communiquez avec Spiro pour discuter de ce qui pourrait être possible. La livraison n'est ni garantie ni annoncée comme gratuite." },
      { q: "Que faut-il pour immatriculer le véhicule ?",
        a: "Les étapes d'immatriculation dépendent de la transaction. Avant la livraison, demandez quelles étapes Automobile SX prendra en charge, lesquelles vous devrez accomplir et quels documents et frais s'appliquent. Confirmez les exigences actuelles auprès de la SAAQ." },
      { q: "Parlez-vous anglais ?",
        a: "Yes. Service is available in English as well as French, both in person and for documents." }
    ]
  },

  guides: {
    title: "Guides d'Achat d'Auto Usagée au Québec | Automobile SX",
    description: "Guides en langage clair pour acheter une voiture d'occasion au Québec : taxes, garantie légale, financement, reprise et immatriculation.",
    h1: "Guides pour acheteurs de voitures d'occasion au Québec",
    sub: "Ce que nous expliquons en personne, mis par écrit pour que vous puissiez le lire avant.",
    cards: guideCards
  },

  g1: {
    title: "Acheter une Voiture Usagée au Québec : le Guide Complet (2026)",
    description: "À savoir avant d'acheter une auto usagée au Québec : TPS et TVQ, catégories de garantie légale, étiquette obligatoire et inspection.",
    h1: "Acheter une voiture usagée au Québec",
    sub: "Taxes, garantie légale, étiquette du commerçant et vérifications avant de signer.",
    body: `
      <p>Le Québec protège mieux les acheteurs de véhicules d'occasion que la plupart des provinces, mais seulement si vous savez quoi regarder. Ce guide couvre ce qui détermine réellement si un achat se passe bien.</p>

      <h2>Les taxes que vous paierez</h2>
      <p>Pour un achat taxable ordinaire chez un commerçant, la TPS est de 5 % et est généralement calculée sur le prix de vente convenu. La TVQ est de 9,975 % et est calculée sur le plus élevé du prix de vente ou de la valeur estimative du véhicule, sauf règle particulière pour un véhicule endommagé ou soumis à une usure anormale. <a href="https://www.revenuquebec.ca/fr/citoyens/taxes/biens-et-services-taxables-detaxes-ou-exoneres/tps-et-tvq/transport-et-vehicules-routiers/vehicules-routiers-citoyens/achat-dun-vehicule-routier/achat-dun-vehicule-routier-usage-dun-commercant/" target="_blank" rel="noopener">Vérifiez le calcul actuel de Revenu Québec</a>. Le prix annoncé doit déjà inclure la préparation, le transport et les frais d'administration; les taxes et le droit applicable sur les pneus neufs peuvent s'ajouter.</p>
      <p>Avec une reprise admissible, la TPS est généralement calculée sur le prix de vente moins le crédit de reprise. La TVQ part du plus élevé du prix de vente ou de la valeur estimative, puis soustrait ce crédit. Demandez un calcul détaillé. Si votre limite est ferme, utilisez notre <a class="text-link" href="${R.g5}">fiche de budget d'achat complet</a>.</p>

      <h2>La garantie légale sur un véhicule d'occasion</h2>
      <p>La Loi sur la protection du consommateur accorde à la plupart des véhicules d'occasion achetés chez un commerçant une garantie de bon fonctionnement, sans frais supplémentaires, selon l'âge et le kilométrage. Les seuils ont été élargis en avril 2024, alors les articles plus anciens en ligne les sous-estiment :</p>
      <ul>
        <li><strong>Catégorie A</strong> (4 ans ou moins et 80 000 km ou moins) : 6 mois ou 10 000 km</li>
        <li><strong>Catégorie B</strong> (5 ans ou moins et 100 000 km ou moins) : 3 mois ou 5 000 km</li>
        <li><strong>Catégorie C</strong> (7 ans ou moins et 120 000 km ou moins) : 1 mois ou 1 700 km</li>
        <li><strong>Catégorie D</strong> (plus de 7 ans ou plus de 120 000 km) : aucune garantie de bon fonctionnement</li>
      </ul>
      <p>La garantie couvre les pièces, la main-d'œuvre et les frais raisonnables de remorquage. Elle ne peut pas être écartée, même en échange d'un rabais. Et la catégorie D ne veut pas dire sans protection : les garanties légales générales de qualité et de durabilité raisonnable s'appliquent à tout véhicule vendu par un commerçant.</p>

      <h2>Lisez l'étiquette sur le pare-brise</h2>
      <p>Tout véhicule d'occasion chez un commerçant québécois doit porter une étiquette indiquant le prix, l'année, la marque, le modèle et le numéro de série, le kilométrage, la catégorie de garantie et l'avis de votre droit d'obtenir les coordonnées du propriétaire précédent. Elle doit aussi divulguer un usage antérieur comme taxi, auto-école, véhicule de police ou de location. Si une pièce précise est exclue de la garantie, ça doit figurer sur l'étiquette avec une estimation du coût de réparation, sinon l'exclusion ne tient pas.</p>

      <h2>Les certificats de sécurité fonctionnent différemment ici</h2>
      <p>Si vous arrivez de l'Ontario, ajustez vos attentes : une voiture de promenade usagée vendue par un commerçant québécois à un consommateur n'exige pas de certificat de vérification mécanique. Ces certificats sont requis dans des situations précises, comme les véhicules provenant de l'extérieur du Québec ou reconstruits après un accident grave. Demandez au garage choisi de confirmer le contenu et le prix de son inspection indépendante.</p>

      <h2>Faites-la inspecter quand même</h2>
      <p>L'OPC recommande un essai routier et une inspection par un mécanicien de confiance, et précise qu'un commerçant doit accepter la demande. Une inspection décrit l'état observé au moment de l'examen; elle ne garantit pas la fiabilité future. Utilisez notre <a class="text-link" href="${R.g6}">fiche d'inspection préachat à Dorval</a> pour coordonner le véhicule, le garage et vos questions.</p>

      <h2>Avant de signer</h2>
      <p>Le contrat doit indiquer le numéro de permis OPC du commerçant, le prix, les taxes, le total à payer, les détails de la garantie et les conditions de reprise s'il y a lieu. Vérifiez que le numéro d'identification du véhicule au contrat correspond à celui sur l'auto. Assurez-vous que toute promesse verbale, comme une réparation avant la livraison, est écrite au contrat.</p>

      <h2>Changer d'idée</h2>
      <p>Si vous financez chez le commerçant, vous avez deux jours pour annuler ce contrat de crédit, et pour un véhicule d'occasion vous pouvez le faire même après en avoir pris livraison, à condition de le rapporter dans le même état. Si vous payez comptant ou passez par votre banque, il n'y a généralement aucun délai de réflexion. Décidez avant que le stylo touche le papier.</p>

      <h2>Pour aller plus loin</h2>
      <p><a class="text-link" href="${R.g4}">Immatriculer le véhicule à la SAAQ</a> · <a class="text-link" href="${R.g2}">Le financement avec un crédit imparfait</a> · <a class="text-link" href="${R.inventory}">Voir notre inventaire</a></p>
      ${accuracyNote}`
  },

  g2: {
    title: "Financement Auto avec Mauvais Crédit : Comparer l'Offre",
    description: "Préparez un financement d'auto usagée au Québec avec un crédit limité ou abîmé. Comparez l'offre écrite sans promesse de taux ni d'approbation.",
    h1: "Financement auto avec mauvais crédit au Québec",
    sub: "Préparez la demande, comparez l'offre complète et conservez les droits prévus au Québec.",
    body: `
      <p>Un crédit limité ou abîmé ne produit pas un taux, une mise de fonds ou une décision standard. Chaque prêteur applique ses propres critères au dossier complet. Considérez toute estimation comme provisoire jusqu'à l'offre écrite du prêteur.</p>

      <h2>Une cote de crédit n'est pas un tableau d'approbation</h2>
      <p>La cote est un élément du dossier, pas un engagement publié du prêteur. Cette page n'attribue pas de catégories de cote, ne prédit pas une approbation et ne cite pas de taux. Demandez les documents requis et laissez le prêteur analyser le dossier réel.</p>

      <h2>Préparez l'information que le prêteur peut analyser</h2>
      <p>Les critères et les documents exacts varient. Le prêteur peut tenir compte :</p>
      <ul>
        <li><strong>Du revenu et des obligations existantes.</strong> Préparez les documents demandés par le prêteur.</li>
        <li><strong>De l'historique de crédit.</strong> Vérifiez votre propre dossier pour repérer les erreurs avant la demande.</li>
        <li><strong>Du montant et de la durée demandés.</strong> Comparez-les avec votre budget mensuel complet.</li>
        <li><strong>Du véhicule choisi.</strong> L'admissibilité peut varier selon le véhicule et le prêteur.</li>
        <li><strong>D'une mise de fonds proposée.</strong> Utilisez-la seulement pour comparer une offre réelle; aucun montant fixe ne garantit un résultat.</li>
      </ul>

      <h2>Comparez le coût réel de l'offre</h2>
      <p>Comparez le prix comptant, le montant financé, les frais et le taux de crédit, l'échéancier, la durée et l'obligation totale. L'OPC explique les chiffres obligatoires d'un <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/credit-recouvrement-finance/temperament/contrat/contenu" target="_blank" rel="noopener">contrat de vente à tempérament</a>. L'<a href="https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/prets/financer-auto/comparer-financement-automobile.html" target="_blank" rel="noopener">Agence de la consommation en matière financière du Canada</a> recommande de comparer plusieurs offres complètes lorsque c'est possible.</p>

      <h2>Nouvel arrivant sans dossier de crédit</h2>
      <p>L'absence d'historique canadien est différente d'un historique de paiements manqués, mais aucun programme ni aucune exigence ne s'applique à tous les prêteurs. Demandez les documents d'identité, de résidence, de revenu et de crédit requis pour la demande réelle. Ne vous fiez pas à un pourcentage de mise de fonds ou à une limite d'âge du véhicule sans que le prêteur l'indique dans son offre.</p>

      <h2>Ne laissez pas la durée masquer le coût</h2>
      <p>Une durée plus longue réduit généralement chaque paiement tout en augmentant les intérêts payés. Comparez l'obligation totale et la période où vous pourriez devoir plus que la valeur du véhicule. Un paiement plus bas ne rend pas, à lui seul, l'offre moins chère.</p>

      <h2>Ne présumez pas un refinancement futur</h2>
      <p>Prenez votre décision avec l'offre disponible aujourd'hui. L'évolution du dossier de crédit et un futur refinancement dépendent de la déclaration des paiements, de l'historique, du marché et d'une nouvelle analyse. Aucun commerçant ne peut promettre quand une cote s'améliorera ni qu'un refinancement moins cher sera offert.</p>

      <h2>Protégez-vous</h2>
      <ul>
        <li>Au Québec, le financement ne peut pas être une condition de la vente d'un véhicule routier. <a href="https://www.opc.gouv.qc.ca/consommateur/nouvelles-protections/" target="_blank" rel="noopener">Consultez le résumé de l'OPC</a>.</li>
        <li>Demandez si chaque garantie, assurance ou forfait de protection est facultatif et comment il modifie le montant financé.</li>
        <li>Comparez l'obligation totale, pas le paiement hebdomadaire.</li>
        <li>Obtenez le taux approuvé par écrit et vérifiez-le au contrat.</li>
        <li>Le contrat de vente à tempérament doit indiquer le droit de rembourser avant l'échéance sans frais ni pénalité. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/credit-recouvrement-finance/temperament/contrat/contenu" target="_blank" rel="noopener">Vérifiez le contenu obligatoire</a>.</li>
      </ul>

      <h2>Parlons-en franchement</h2>
      <p>Indiquez le véhicule et le budget d'achat que vous souhaitez discuter. Appelez le ${DEALER.phone} ou consultez <a class="text-link" href="${R.financing}">comment fonctionne le financement chez Automobile SX</a>. L'approbation, le taux, la durée et toute mise de fonds exigée proviennent du prêteur après son analyse.</p>
      ${accuracyNote}`
  },

  g3: {
    title: "Quelle Est la Valeur de Ma Reprise au Québec ? | Automobile SX",
    description: "Comment la valeur de reprise est établie au Québec, l'économie de taxes qu'elle procure et quand la reprise bat la vente privée.",
    h1: "Quelle est la valeur de ma reprise ?",
    sub: "Comment le montant est bâti, et l'économie de taxes qui rend la reprise compétitive.",
    body: `
      <p>Chaque conversation sur une reprise commence pareil : le propriétaire a un chiffre en tête tiré d'un site web, et le commerçant a un chiffre venu du marché de gros. Voici comment l'écart se forme.</p>

      <h2>Ce qui détermine le montant</h2>
      <ul>
        <li><strong>La valeur de gros.</strong> Ce que des véhicules comparables se vendent réellement à l'encan ce mois-ci, pas ce qu'ils valaient au printemps dernier.</li>
        <li><strong>Le kilométrage.</strong> Le principal levier après l'âge.</li>
        <li><strong>L'état mécanique.</strong> Tout ce qu'il faut faire pour le rendre vendable est soustrait.</li>
        <li><strong>L'esthétique.</strong> Dommages de carrosserie, jantes égratignées, sièges déchirés, odeur de cigarette.</li>
        <li><strong>La demande.</strong> Un VUS à traction intégrale en octobre et une décapotable en octobre, ce n'est pas la même affaire.</li>
        <li><strong>Les documents et les extras.</strong> Historique d'entretien, deuxième clé, pneus d'hiver sur jantes.</li>
      </ul>

      <h2>L'économie de taxes fait partie de l'offre</h2>
      <p>La comparaison entre une offre de reprise et un prix de vente privée peut inclure l'effet fiscal, mais elle exige les deux bases de calcul. Pour une reprise admissible, la TPS est généralement calculée sur le prix de vente moins le crédit de reprise. La TVQ est calculée sur le plus élevé du prix de vente ou de la valeur estimative du véhicule acheté, moins ce crédit.</p>
      <p>Demandez une soumission d'achat détaillée indiquant le prix de vente, la valeur estimative s'il y a lieu, le crédit de reprise et les deux taxes. Vous obtiendrez ainsi une comparaison nette sans présumer que chaque dollar de reprise réduit toujours les deux taxes de la même façon. <a href="https://www.revenuquebec.ca/en/citizens/consumption-taxes/taxable-zero-rated-or-tax-exempt-goods-and-services/gst-and-qst/transport-and-road-vehicles/road-vehicles-individuals/trading-in-a-road-vehicle/trade-in-of-a-road-vehicle-between-an-individual-and-a-dealer/" target="_blank" rel="noopener">Consultez le calcul et les conditions de Revenu Québec</a>.</p>

      <h2>Reprise ou vente entre particuliers ?</h2>
      <p><strong>La reprise a du sens</strong> quand vous achetez un autre véhicule de toute façon, quand votre temps a de la valeur, quand l'auto a des besoins que vous devriez divulguer, ou quand il reste un prêt dessus.</p>
      <p><strong>La vente privée a du sens</strong> quand le véhicule est en demande et en bon état, quand vous avez du temps et de la patience, et quand vous n'achetez pas autre chose tout de suite, donc que le mécanisme fiscal ne vous sert à rien.</p>

      <h2>Obtenir davantage</h2>
      <ul>
        <li>Nettoyez-la comme il faut, dedans et dehors. Ça change vraiment le montant.</li>
        <li>Rassemblez les factures d'entretien, même partielles.</li>
        <li>Apportez les deux clés : un remplacement coûte cher et sera déduit.</li>
        <li>Incluez les pneus d'hiver, surtout sur jantes.</li>
        <li>Ne cachez pas un défaut connu. Il sera trouvé, et tout le reste de ce que vous avez dit deviendra suspect.</li>
      </ul>

      <h2>Il reste un solde à payer ?</h2>
      <p>C'est normal. Nous obtenons le solde auprès de votre prêteur et nous le réglons. L'équité positive s'applique à votre prochain véhicule. Si vous êtes en équité négative, nous vous le dirons clairement et nous expliquerons les options plutôt que de glisser discrètement l'écart dans un nouveau prêt.</p>

      <h2>Obtenez un vrai chiffre</h2>
      <p>Les estimateurs en ligne ignorent que votre auto a besoin de deux pneus et d'un pare-brise, d'où l'écart quand quelqu'un la regarde vraiment. Apportez-la sur l'avenue Chartier et nous l'évaluerons sérieusement. Appelez le ${DEALER.phone} ou <a class="text-link" href="${R.sell}">voyez comment se déroulent nos évaluations</a>.</p>
      ${accuracyNote}`
  },

  g4: {
    title: "Immatriculer une Voiture Usagée au Québec | Automobile SX",
    description: "Immatriculer une auto usagée achetée chez un commerçant au Québec : démarches à la SAAQ, documents, plaques, coûts et délais.",
    h1: "Immatriculer une voiture usagée au Québec",
    sub: "Ce que le commerçant gère, ce que vous apportez et quand votre plaque arrive.",
    body: `
      <p>L'immatriculation passe par la SAAQ, et acheter chez un commerçant simplifie nettement les choses par rapport à une vente entre particuliers. Voici la marche à suivre.</p>

      <h2>Ce que le commerçant fait</h2>
      <p>Chez un commerçant, l'immatriculation se fait normalement à la livraison. Si le commerçant utilise les services en ligne de la SAAQ, vous évitez complètement le déplacement en point de service. Sinon, vous recevez un certificat d'immatriculation temporaire et vous complétez la démarche à un point de service.</p>

      <h2>Ce que vous apportez</h2>
      <ul>
        <li>Votre permis de conduire québécois valide ou une autre pièce d'identité officielle avec photo</li>
        <li>Une preuve d'assurance responsabilité</li>
        <li>Si vous immatriculez à un point de service plutôt que chez le commerçant : l'attestation de transaction avec un commerçant et le certificat d'immatriculation signé par l'ancien propriétaire et le commerçant</li>
      </ul>

      <h2>Plaques et délais</h2>
      <p>Immatriculez à votre nom rapidement après la livraison. Posez tout de suite la plaque temporaire en papier ; la plaque permanente est postée à l'adresse principale inscrite à votre dossier, généralement en dix à vingt jours ouvrables.</p>

      <h2>Les coûts</h2>
      <p>L'immatriculation annuelle d'un véhicule de promenade standard dépasse un peu 200 $ dans la plupart des régions, en combinant les droits d'immatriculation, la contribution d'assurance de la SAAQ et les frais administratifs, avec des totaux plus bas en région périphérique. Il y a aussi de petits frais de transaction, et une nouvelle plaque coûte un peu plus cher que la réutilisation d'une plaque existante.</p>
      <p>Deux montants supplémentaires surprennent souvent. Les véhicules de sept ans ou moins évalués à plus de 40 000 $ paient 1 % additionnel sur la portion excédant ce seuil, et ça s'applique aussi aux véhicules d'occasion, chaque année. Les moteurs de forte cylindrée, à partir d'environ 4,0 litres, entraînent à la fois un montant annuel et un droit d'acquisition unique. Si vous magasinez un gros V8 ou un véhicule de luxe récent, prévoyez ces montants avant l'achat plutôt qu'après.</p>
      <p>Les tarifs sont révisés annuellement : validez les montants courants sur le site de la SAAQ.</p>

      <h2>L'assurance avant de partir</h2>
      <p>La couverture pour les blessures corporelles vient du régime public québécois, mais la responsabilité civile et la couverture du véhicule sont privées et obligatoires. Appelez votre assureur avec le numéro d'identification du véhicule avant le jour de la livraison ; la plupart activent la couverture en quelques minutes.</p>

      <h2>Les pneus d'hiver après l'achat d'une auto usagée</h2>
      <p>Au Québec, les pneus d'hiver sont généralement obligatoires du 1er décembre au 15 mars. Que vous achetiez chez un commerçant ou d'un particulier, consultez notre <a class="text-link" href="${R.g7}">guide sur les pneus d'hiver à l'achat d'une auto usagée</a> pour comprendre les exemptions et le transit de 10 jours, et planifier la pose avant de repartir.</p>

      <h2>Conservez vos documents</h2>
      <p>Gardez ensemble le contrat de vente, le certificat d'immatriculation et les détails de la garantie. Vous en aurez besoin pour l'assurance, pour vos dossiers et au moment de revendre ou d'échanger le véhicule.</p>
      <p>Ensuite : <a class="text-link" href="${R.g1}">le guide complet de l'achat d'occasion au Québec</a> · <a class="text-link" href="${R.inventory}">voir notre inventaire</a></p>
      ${accuracyNote}`
  },

  g5: {
    title: "Budget Auto Usagée au Québec : Coût Total | Automobile SX",
    description: "Un budget de 15 000 $ pour une auto usagée? Distinguez prix, taxes et coûts d'utilisation avant de comparer les véhicules à Dorval.",
    h1: "Budget auto usagée au Québec : que permet une limite de 15 000 $?",
    sub: "Partez d'une limite totale ferme afin d'intégrer le prix affiché, les taxes et les autres coûts au même plan.",
    byline: "Par Automobile SX",
    schemaType: "BlogPosting",
    draft: false,
    datePublished: "2026-11-04",
    dateModified: "2026-11-04",
    image: "/images/guides/used-car-budget-quebec.jpg",
    imageAlt: "Autos usagées devant Automobile SX à Dorval, dont une Kia Forte grise",
    imageCaption: "Inventaire actuel d'Automobile SX à Dorval. La disponibilité et les prix changent; comparez les véhicules à partir d'un budget total, et non de cette photo.",
    body: `
      <p>Un budget d'achat de 15 000 $ ne correspond pas à un prix affiché de 15 000 $. Prévoyez les taxes applicables, l'immatriculation et les frais d'inspection ou de mise en service que vous devez payer séparément avant de choisir un véhicule. Pour un acheteur à Dorval, la bonne question est : « Quelle auto puis-je acheter et préparer sans dépasser mon budget total? »</p>

      <h2>Commencez par deux budgets</h2>
      <p>Le budget d'achat couvre l'acquisition du véhicule et sa préparation selon vos besoins. Le budget mensuel couvre son utilisation.</p>
      <p>Notez ces éléments avant de consulter les annonces :</p>
      <div class="table-wrap"><table>
        <thead><tr><th>À l'achat</th><th>Chaque mois</th></tr></thead>
        <tbody>
          <tr><td>Prix du véhicule et taxes applicables</td><td>Paiement du prêt, s'il y a lieu</td></tr>
          <tr><td>Immatriculation</td><td>Assurance</td></tr>
          <tr><td>Inspection indépendante</td><td>Essence ou recharge</td></tr>
          <tr><td>Travaux immédiats ou équipement choisi</td><td>Réserve pour l'entretien</td></tr>
          <tr><td>Somme que vous souhaitez conserver</td><td>Stationnement et autres frais récurrents</td></tr>
        </tbody>
      </table></div>
      <p>Le prix d'une inspection ou d'une assurance dépend du fournisseur choisi. Ne présumez pas que ces services sont compris dans le prix affiché.</p>

      <h2>Partez du montant que vous pouvez dépenser</h2>
      <p>Pour un achat taxable ordinaire chez un commerçant, la TPS est de 5 % et la TVQ de 9,975 %. La TVQ peut être calculée sur la valeur estimative du véhicule si elle dépasse son prix de vente. Faites confirmer le calcul applicable avant d'utiliser un simple pourcentage. <a href="https://www.revenuquebec.ca/fr/citoyens/taxes/biens-et-services-taxables-detaxes-ou-exoneres/tps-et-tvq/transport-et-vehicules-routiers/vehicules-routiers-citoyens/achat-dun-vehicule-routier/achat-dun-vehicule-routier-usage-dun-commercant/" target="_blank" rel="noopener">Revenu Québec explique l'achat chez un commerçant</a>.</p>
      <p>Voici un exemple de calcul, et non une offre de véhicule. Les deux taxes sont ici appliquées au prix de vente, sans reprise :</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Élément</th><th>Montant</th></tr></thead>
        <tbody>
          <tr><td>Budget disponible</td><td>15 000,00 $</td></tr>
          <tr><td>Réserve choisie pour les autres coûts</td><td>1 000,00 $</td></tr>
          <tr><td>Solde pour le véhicule et les taxes</td><td>14 000,00 $</td></tr>
          <tr><td>Prix maximal approximatif : 14 000 $ / 1,14975</td><td>12 176,56 $</td></tr>
        </tbody>
      </table></div>
      <p>La réserve de 1 000 $ est un choix fictif pour illustrer le calcul. Elle ne constitue pas une estimation des frais d'immatriculation, d'inspection, d'assurance ou de réparation. Remplacez-la par vos vrais montants. Une valeur taxable plus élevée pour la TVQ modifiera le résultat.</p>

      <h2>Demandez une soumission comparable</h2>
      <p>Demandez un total écrit et détaillé pour le véhicule précis. Faites distinguer les éléments inclus, les options, la base de calcul de la TVQ et les sommes à payer lors de l'immatriculation. En cas de reprise, demandez que la valeur offerte et le solde de votre ancien prêt apparaissent séparément.</p>
      <p>Pour le financement, comparez le capital emprunté, le taux, la durée et le coût total du crédit. Un paiement plus bas ne signifie pas nécessairement un achat moins coûteux. L'<a href="https://www.canada.ca/fr/agence-consommation-matiere-financiere/services/prets/financer-auto/comparer-financement-automobile.html" target="_blank" rel="noopener">Agence de la consommation en matière financière du Canada</a> recommande de comparer l'ensemble de l'offre.</p>

      <h2>Préparez une sélection utile</h2>
      <p>Indiquez votre budget d'achat maximal, votre limite mensuelle, le type de carrosserie recherché et votre date d'achat prévue. Précisez si les taxes sont comprises dans votre budget. Vous éviterez ainsi de discuter d'un véhicule qui dépasse votre limite dès le départ.</p>
      <p><a class="text-link" href="${R.inventory}">Consultez l'inventaire Automobile SX</a>, puis <a class="text-link" href="${R.contact}">contactez-nous à Dorval</a> avec le modèle ou le numéro de stock souhaité. Consultez aussi notre <a class="text-link" href="${R.g1}">guide d'achat au Québec</a>, <a class="text-link" href="${R.g6}">préparez une inspection indépendante</a> ou lisez les <a class="text-link" href="${R.financing}">renseignements sur le financement</a>.</p>`
  },

  g7: {
    breadcrumbLabel: "Pneus d'hiver",
    title: "Achat d'une auto usag\u00e9e : pneus d'hiver au Qu\u00e9bec",
    description: "Vous achetez une auto usag\u00e9e au Qu\u00e9bec? Voyez quand les pneus d'hiver sont obligatoires, comment fonctionne l'exemption de 7 jours et quand pr\u00e9voir la pose.",
    h1: "Acheter une auto usag\u00e9e en hiver au Qu\u00e9bec : peut-on repartir sans pneus d'hiver?",
    sub: "Les pneus d'hiver obligatoires, l'exemption de sept jours et la pose avant de repartir.",
    schemaType: "BlogPosting",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
    body: `
      <p>Au Qu&#233;bec, les pneus d'hiver sont g&#233;n&#233;ralement obligatoires du 1er d&#233;cembre au 15 mars. Si vous allez chercher une auto usag&#233;e pendant cette p&#233;riode, pr&#233;voyez faire poser des pneus conformes avant de repartir. Si vous achetez chez un commer&#231;ant, le Qu&#233;bec pr&#233;voit une exception de sept jours suivant la date d'acquisition, &#224; condition d'avoir le contrat de vente ou une copie avec vous. Le transit de 10 jours remis par un commer&#231;ant a sa propre &#233;ch&#233;ance d'immatriculation, et l'exception li&#233;e &#224; ce document est limit&#233;e &#224; sept jours. <a href="https://www.quebec.ca/transports/circulation-securite-routiere/periode-hivernale/pneus-hiver">R&#232;gles qu&#233;b&#233;coises sur les pneus d'hiver</a> | <a href="https://saaq.gouv.qc.ca/immatriculation/immatriculation-temporaire">Immatriculation temporaire &#224; la SAAQ</a></p>

      <h2>Faites poser les pneus d'hiver selon les conditions routi&#232;res</h2>

      <p>Si on pr&#233;voit de la neige, de la pluie vergla&#231;ante ou des routes glac&#233;es, &#231;a vaut la peine de faire poser les pneus d'hiver avant d'aller chercher l'auto, m&#234;me en novembre ou pendant une exemption. Une mince couche de verglas, parfois appel&#233;e glace noire, peut &#234;tre difficile &#224; voir. Avant de partir, consultez la m&#233;t&#233;o et Qu&#233;bec 511 pour votre trajet. Si les conditions sont mauvaises, appelez le vendeur pour convenir d'une pose avant de prendre la route ou pour d&#233;placer le rendez-vous.</p>

      <p><a href="https://www.quebec.ca/transports/circulation-securite-routiere/periode-hivernale/conduite-hiver">Conseils de conduite hivernale du Qu&#233;bec</a></p>

      <h2>Quelle r&#232;gle s'applique &#224; votre achat?</h2>

      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Votre situation</th><th scope="col">Quoi v&#233;rifier avant de prendre la route</th></tr></thead>
          <tbody>
            <tr><td>Vous avez achet&#233; chez un commer&#231;ant</td><td>L'exception de sept jours pour les pneus d'hiver commence &#224; la date d'acquisition. Gardez le contrat de vente ou une copie avec vous.</td></tr>
            <tr><td>Le commer&#231;ant a d&#233;livr&#233; un certificat d'immatriculation temporaire (transit)</td><td>Le transit du commer&#231;ant peut &#234;tre valide 10 jours pour l'immatriculation. Si le transit est affich&#233; sur l'auto, l'exception li&#233;e &#224; ce document prend fin &#224; l'expiration du transit ou sept jours apr&#232;s sa d&#233;livrance, selon la premi&#232;re &#233;ch&#233;ance.</td></tr>
            <tr><td>L'auto est immatricul&#233;e et vous attendez la plaque m&#233;tallique</td><td>La plaque provisoire en papier vous permet de circuler en attendant la plaque m&#233;tallique. V&#233;rifiez si une exception distincte pour les pneus d'hiver s'applique &#224; votre situation.</td></tr>
            <tr><td>Vous avez achet&#233; d'un particulier</td><td>Si vous avez besoin de l'exemption pour les pneus d'hiver, demandez un certificat dans SAAQclic ou &#224; un point de service de la SAAQ. Les sept jours commencent &#224; la date d'acquisition.</td></tr>
          </tbody>
        </table>
      </div>

      <p><a href="https://www.quebec.ca/transports/circulation-securite-routiere/periode-hivernale/pneus-hiver">R&#232;gles qu&#233;b&#233;coises sur les pneus d'hiver</a> | <a href="https://saaq.gouv.qc.ca/securite-routiere/moyens-deplacement/auto/entretien-securite/pneus-hiver">Certificat d'exemption de la SAAQ</a> | <a href="https://saaq.gouv.qc.ca/immatriculation/immatriculer-vehicule/automobile-habitation-motorisee/auto-habitation-motorisee-neuve-usagee-achetee-chez-commercant">Immatriculation d'une auto achet&#233;e chez un commer&#231;ant</a></p>

      <h2>Et si vous achetez en novembre?</h2>

      <p>Supposons que vous achetez une auto usag&#233;e chez un commer&#231;ant et recevez un transit de 10 jours le 23 novembre. Le 1er d&#233;cembre, plus de sept jours se sont &#233;coul&#233;s depuis l'acquisition et la d&#233;livrance du transit. Le transit peut encore &#234;tre valide pour l'immatriculation, mais les deux exceptions li&#233;es &#224; l'achat et au transit ont pris fin. Si vous comptez rouler le 1er d&#233;cembre, pr&#233;voyez la pose avant cette date, sauf si une autre exemption s'applique. <a href="https://www.quebec.ca/transports/circulation-securite-routiere/periode-hivernale/pneus-hiver">R&#232;gles qu&#233;b&#233;coises sur les pneus d'hiver</a> | <a href="https://saaq.gouv.qc.ca/immatriculation/immatriculation-temporaire">Immatriculation temporaire &#224; la SAAQ</a></p>

      <h2>Quatre questions &#224; poser avant de prendre possession de l'auto</h2>

      <ol>
        <li><strong>Quels pneus seront install&#233;s quand je viendrai chercher l'auto?</strong> Demandez si les pneus d'hiver seront d&#233;j&#224; mont&#233;s ou s'ils seront remis s&#233;par&#233;ment. Rep&#233;rez le pictogramme de la montagne et du flocon sur le flanc. Les pneus &#224; crampons sont aussi reconnus par les r&#232;gles qu&#233;b&#233;coises.</li>
        <li><strong>Le prix convenu comprend-il les pneus d'hiver et la pose?</strong> Si des pneus d'hiver font partie de l'entente, demandez au vendeur d'inscrire par &#233;crit le jeu de pneus, les roues et la pose convenues, selon le cas.</li>
        <li><strong>Les pneus d'hiver sont-ils encore en bon &#233;tat?</strong> Demandez la profondeur de la bande de roulement et la date de fabrication de chacun des quatre pneus. En cas de doute sur leur &#233;tat, faites-les v&#233;rifier dans un atelier.</li>
        <li><strong>Les pneus d'hiver peuvent-ils &#234;tre pos&#233;s avant la prise de possession?</strong> Si l'auto est chauss&#233;e de pneus d'&#233;t&#233; ou de pneus quatre-saisons ordinaires, confirmez qui s'occupera de la pose et &#224; quel moment.</li>
      </ol>

      <p><a href="https://www.quebec.ca/transports/circulation-securite-routiere/periode-hivernale/pneus-hiver">R&#232;gles qu&#233;b&#233;coises sur les pneus d'hiver</a> | <a href="https://saaq.gouv.qc.ca/securite-routiere/moyens-deplacement/auto/entretien-securite/pneus-hiver">Conseils de la SAAQ sur l'&#233;tat des pneus</a></p>

      <h2>Achat et installation de pneus d'hiver &#224; Dorval</h2>

      <p>Avant de vous remettre l'auto, on fait le point avec vous sur les pneus d&#233;j&#224; install&#233;s et sur ce qu'il reste &#224; pr&#233;voir. Vous pouvez acheter vos pneus d'hiver vous-m&#234;me ou les faire installer par votre garage habituel. On vous confirme la dimension qui convient &#224; l'auto et on fixe avec vous le moment de venir la chercher.</p>

      <p>Si vous pr&#233;f&#233;rez qu'on s'occupe des d&#233;marches, Spiro peut vous aider &#224; choisir des pneus d'hiver adapt&#233;s &#224; votre auto et &#224; votre budget, puis organiser la pose avec un atelier de la r&#233;gion. On vous confirme le prix des pneus et de l'installation avant de prendre rendez-vous. Si les conditions se d&#233;gradent, on peut ajuster l'heure ou la date de remise de l'auto pour que vous repartiez avec les pneus d&#233;j&#224; install&#233;s.</p>

      <p>Pour les d&#233;marches, consultez notre <a href="${R.g4}">guide d'immatriculation d'une auto usag&#233;e au Qu&#233;bec</a>. <a href="${R.inventory}">Voir les autos usag&#233;es &#224; Dorval</a>.</p>`
  },

  g6: {
    title: "Inspection Auto Usagée à Dorval | Automobile SX",
    description: "Organisez une inspection indépendante avant l'achat à Dorval. Préparez vos questions, les documents et les points à discuter après le rapport.",
    h1: "Inspection d'une auto usagée à Dorval : quoi organiser avant l'achat",
    sub: "Coordonnez le véhicule précis, le garage et vos questions avant de vous engager.",
    byline: "Par Automobile SX",
    schemaType: "BlogPosting",
    draft: false,
    datePublished: "2026-11-04",
    dateModified: "2026-11-04",
    image: "/images/guides/used-car-inspection-dorval.jpg",
    imageAlt: "Tableau de bord et habitacle avant d'une Volkswagen usagée chez Automobile SX",
    imageCaption: "Les photos de l'habitacle aident à préparer des questions, mais ne remplacent pas une inspection mécanique indépendante.",
    body: `
      <p>Organisez une inspection indépendante avant de vous engager, même si vous avez déjà conduit l'auto et lu son historique. Choisissez le garage, convenez du contenu de l'inspection et coordonnez l'accès au véhicule précis. Le rapport écrit vous aidera à décider si l'achat vous convient; une inspection ne garantit pas la fiabilité future.</p>

      <h2>Commencez par le bon véhicule</h2>
      <p>Avant de réserver au garage, confirmez que l'auto est toujours disponible. Transmettez le numéro de stock au commerçant et le NIV, le modèle, l'année et le kilométrage au garage. Signalez les témoins lumineux, les bruits ou les autres éléments qui vous ont préoccupé pendant la visite.</p>
      <p>Les inspections indépendantes sont les bienvenues. Spiro discutera volontiers des modalités avec vous. Communiquez à l'avance le véhicule, le garage et l'heure proposée afin de coordonner l'accès et tout transport avant de réserver. Consultez la <a class="text-link" href="${R.faq}">FAQ d'achat</a> pour le libellé actuel.</p>

      <h2>Demandez ce qui sera inspecté</h2>
      <p>CAA-Québec recommande une inspection indépendante avant l'achat, car une visite ou un essai routier peut laisser passer certains problèmes. Demandez un rapport écrit et faites confirmer le prix et le contenu directement par le garage. <a href="https://www.caaquebec.com/fr/conseils/acheter-ou-vendre-un-vehicule/vous-achetez-une-voiture-passez-d-abord-a-l-inspection" target="_blank" rel="noopener">Consultez les conseils d'inspection préachat de CAA-Québec</a>.</p>
      <p>Préparez vos questions :</p>
      <ul>
        <li>Inspecterez-vous le dessous du véhicule et la corrosion observée?</li>
        <li>Quelles vérifications mécaniques et électroniques sont comprises?</li>
        <li>Le rapport distinguera-t-il les travaux immédiats des points à surveiller?</li>
        <li>Pouvez-vous chiffrer les travaux recommandés par écrit?</li>
        <li>Quels éléments ne peuvent pas être évalués pendant cette inspection?</li>
      </ul>
      <p>Ne demandez pas seulement si l'auto est « bonne ». Demandez ce que son état signifie pour votre utilisation et votre budget.</p>

      <h2>Distinguez les documents de l'état mécanique</h2>
      <p>Apportez les factures d'entretien disponibles et le rapport d'historique. Ils peuvent orienter le mécanicien, mais ne remplacent pas l'examen du véhicule. Une inspection mécanique ne règle pas non plus, à elle seule, la question des dettes sur l'auto. Les vérifications documentaires doivent être faites en parallèle.</p>
      <p>L'OPC recommande l'essai routier et l'inspection par un mécanicien de confiance avant un achat chez un commerçant. Il précise que le commerçant doit accepter votre demande d'essai et d'inspection. <a href="https://www.opc.gouv.qc.ca/consommateur/bien-service/vehicule/auto-achat/conseil/occasion-commercant" target="_blank" rel="noopener">Consultez les conseils de l'OPC</a>.</p>

      <h2>Transformez le rapport en décision</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Constat</th><th>Question avant l'achat</th></tr></thead>
        <tbody>
          <tr><td>Travaux recommandés avant l'utilisation</td><td>Quels travaux, quels coûts et quel délai le garage indique-t-il?</td></tr>
          <tr><td>Entretien à prévoir prochainement</td><td>Mon budget d'utilisation permet-il cette dépense?</td></tr>
          <tr><td>Point toujours incertain</td><td>Quelle vérification supplémentaire faut-il demander?</td></tr>
          <tr><td>Réparation discutée avec le vendeur</td><td>L'entente figure-t-elle par écrit dans les conditions d'achat?</td></tr>
        </tbody>
      </table></div>
      <p>Vous pouvez poursuivre, demander des précisions, discuter des conditions ou conclure que le véhicule ne vous convient pas. L'inspection sert à prendre cette décision avec de meilleurs renseignements.</p>
      <p><a class="text-link" href="${R.inventory}">Choisissez une auto dans notre inventaire</a>, puis <a class="text-link" href="${R.contact}">contactez Automobile SX à Dorval</a> avec son numéro de stock et la période souhaitée pour l'inspection. Pour le processus général, consultez notre <a class="text-link" href="${R.g1}">guide d'achat d'une auto usagée au Québec</a> ou la <a class="text-link" href="${R.g5}">fiche de budget d'achat complet</a>.</p>`
  },

  privacy: {
    title: "Politique de confidentialité | Automobile SX Dorval",
    description: "Comment Automobile SX protège les renseignements personnels et utilise les mesures anonymes ou GA4 avec consentement.",
    h1: "Politique de confidentialité",
    sub: "Ce que nous recueillons, ce que nous ne recueillons pas, et comment nous joindre à ce sujet. Mise à jour le 4 novembre 2026.",
    body: `
      <p>Automobile SX est un commerce de véhicules d'occasion situé au 2044, avenue Chartier, à Dorval, au Québec. Cette page explique ce qu'il advient des renseignements personnels en lien avec ce site et notre entreprise. Elle décrit le fonctionnement réel du site plutôt que toutes les situations hypothétiques.</p>

      <h2>Ce que ce site recueille</h2>
      <p>Ce site ne comporte aucun pixel publicitaire et ne crée pas de profil publicitaire. Les mesures Vercel n'utilisent pas de témoins d'analyse. Google Analytics 4 (GA4), si configuré, ne se charge qu'après votre consentement explicite ci-dessous. GA4 peut utiliser des témoins d'analyse.</p>
      <p>Nous utilisons Vercel Web Analytics et Speed Insights pour comprendre l'achalandage global des pages et le rendement réel du site. Ces outils peuvent traiter le chemin de la page, le site référent, le pays ou la région approximative, le type d'appareil et de navigateur, ainsi que des mesures comme la vitesse de chargement et la stabilité visuelle. Vercel indique que Web Analytics conserve des données anonymisées, n'utilise aucun témoin, n'associe pas l'activité à une adresse IP et renouvelle son empreinte de visiteur toutes les 24 heures.</p>
      <p>Pour les consultations de pages mesurées, nous retirons les paramètres et les fragments des adresses URL. Nous n'envoyons volontairement aux outils d'analyse aucun nom, courriel, numéro de téléphone ni contenu des formulaires. Avec votre accord explicite, GA4 mesure les pages consultées et certaines actions de contact, dont l'envoi réussi d'un formulaire, sans transmettre les coordonnées du client. Les mesures ne fonctionnent que sur le site public, jamais dans l'administration ou les aperçus. Les signaux Global Privacy Control et Do Not Track sont respectés.</p>
      <div class="privacy-controls">
        <p><strong>Mesure anonyme du site dans ce navigateur :</strong> <span data-metrics-status data-on="Activée" data-off="Désactivée">Activée</span></p>
        <button class="btn btn-outline" type="button" data-metrics-opt-out>Désactiver la mesure anonyme</button>
        <button class="btn btn-outline" type="button" data-metrics-opt-in hidden>Autoriser la mesure anonyme</button>
        <p class="privacy-control-note">La désactivation enregistre uniquement cette préférence dans ce navigateur. Elle s'applique aux prochaines pages chargées et ne nuit pas au fonctionnement du site.</p>
        <p><strong>Google Analytics 4 facultatif :</strong> <span data-ga4-status data-on="Autorisé" data-off="Non autorisé" data-unavailable="Non configuré">Non configuré</span></p>
        <p class="privacy-control-note">Si configuré, GA4 utilise des témoins pour mesurer les consultations et les actions de contact. Il est désactivé par défaut. Vous pouvez retirer votre consentement ici. Le retrait arrête les mesures futures et supprime les témoins GA4 propriétaires accessibles.</p>
        <button class="btn btn-outline" type="button" data-ga4-consent hidden>Autoriser les témoins GA4</button>
        <button class="btn btn-outline" type="button" data-ga4-revoke hidden>Arrêter la mesure GA4</button>
        <noscript><p class="privacy-control-note">Les mesures ne sont pas chargées lorsque JavaScript est désactivé.</p></noscript>
      </div>
      <p>Lorsque vous utilisez le formulaire de contact, le nom, les coordonnées, le sujet, le véhicule sélectionné, la préférence de réponse et le message que vous saisissez sont transmis par courriel à Automobile SX. Le site n'ajoute pas ce message à une base de données d'inventaire, à un service d'analyse ni à une liste de marketing.</p>

      <h2>Ce que nous conservons, et pourquoi</h2>
      <p>Si vous nous écrivez, nous appelez ou nous envoyez un texto, nous conservons ce que vous avez choisi de nous dire : votre nom, vos coordonnées et ce que vous nous avez indiqué au sujet du véhicule qui vous intéresse. Nous nous en servons pour vous répondre et pour organiser un essai ou une vente. Rien de plus.</p>
      <p>Si vous achetez un véhicule ou en échangez un, nous recueillons les renseignements nécessaires pour conclure la vente et l'immatriculation, y compris les pièces d'identité et les données exigées par la Société de l'assurance automobile du Québec. Il s'agit d'une obligation légale liée à la vente d'un véhicule, et ces dossiers sont conservés aussi longtemps que la loi l'exige.</p>
      <p>Nous ne vendons, ne louons et n'échangeons aucun renseignement personnel.</p>

      <h2>Les autres entreprises concernées</h2>
      <p>Quatre tiers interviennent dans le fonctionnement du site, et il est normal que vous sachiez ce que chacun voit.</p>
      <p><strong>Vercel</strong> héberge le site et fournit les mesures anonymes d'achalandage et de rendement décrites ci-dessus. Comme tout hébergeur, ses serveurs traitent aussi des renseignements techniques usuels, dont l'adresse IP, lorsqu'une page est demandée.</p>
      <p><strong>Resend</strong> transmet les messages soumis par le formulaire de contact à notre boîte de courriel. Ce service traite les renseignements du formulaire pour effectuer cette transmission; des copies demeurent ensuite dans nos dossiers de courriel afin que nous puissions répondre à votre demande.</p>
      <p><strong>Google</strong> fournit les polices de caractères ainsi que la carte affichée sur la page d'accueil et la page contact. Charger une police ou une carte signifie que votre navigateur communique directement avec Google, qui peut donc recevoir votre adresse IP et déposer ses propres témoins. Le traitement qu'en fait Google est régi par sa propre politique. Si votre navigateur bloque Google, le site fonctionne quand même : la carte est remplacée par notre adresse et un lien.</p>
      <p><strong>Meta</strong> n'intervient que si vous suivez un lien vers nos pages Facebook ou Instagram; vous êtes alors sur leur service et leurs politiques s'appliquent.</p>
      <p>Ces fournisseurs de services peuvent traiter des renseignements à l'extérieur du Québec ou du Canada selon leurs propres engagements en matière de sécurité et de confidentialité.</p>

      <h2>Vos droits au Québec</h2>
      <p>En vertu de la <em>Loi sur la protection des renseignements personnels dans le secteur privé</em>, modifiée par la Loi 25, vous pouvez nous demander quels renseignements personnels nous détenons à votre sujet, demander leur rectification s'ils sont inexacts, et demander que nous cessions de les utiliser, sous réserve des dossiers que la loi nous oblige à conserver pour la vente de véhicules.</p>
      <p>Pour toute demande de ce type, communiquez avec Spiro Xiarchos, responsable de la protection des renseignements personnels chez Automobile SX, à <a class="text-link" href="mailto:Automobilesx@gmail.com">Automobilesx@gmail.com</a> ou au <a class="text-link" href="tel:+15148249117">514-824-9117</a>. Nous répondrons dans les 30 jours.</p>
      <p>Si notre réponse ne vous satisfait pas, vous pouvez porter plainte auprès de la Commission d'accès à l'information du Québec.</p>

      <h2>Modifications</h2>
      <p>Si cette politique change, la date indiquée en haut de la page change aussi.</p>`
  },
  local: {
    title: "Autos Usagées dans l'Ouest-de-l'Île | Automobile SX",
    description: "Concessionnaire d'autos usagées desservant l'Ouest-de-l'Île depuis Dorval : Pointe-Claire, Lachine, Pierrefonds, Kirkland. Bilingue et familial.",
    h1: "Autos usagées dans l'Ouest-de-l'Île",
    sub: "Sur l'avenue Chartier à Dorval, à quelques minutes de Pointe-Claire, Lachine et Pierrefonds.",
    body: `
      <p>Automobile SX est situé au 2044 avenue Chartier à Dorval, ce qui nous place à courte distance de la majeure partie de l'Ouest-de-l'Île. Nos clients viennent de Pointe-Claire, Lachine, Dollard-des-Ormeaux, Kirkland, Beaconsfield, Pierrefonds, Montréal-Ouest et Lasalle, et plusieurs arrivent du centre-ville de Montréal ou de Laval.</p>

      <h2>Comment nous rejoindre</h2>
      <p>Nous sommes près de l'autoroute 20 et de la 520, à quelques minutes de l'aéroport de Dorval et de la gare de Dorval. De Pointe-Claire ou Beaconsfield, c'est droit vers l'est ; de Lachine ou Lasalle, un court trajet vers l'ouest. Et aucune chasse au stationnement au bout du chemin.</p>

      <h2>Ce que recherchent les acheteurs de l'Ouest-de-l'Île</h2>
      <p>Les besoins ici sont précis. La traction intégrale compte à cause des hivers et parce que beaucoup de gens font la navette sur la 20 et la 40 en février. Les VUS compacts et les berlines capables d'avaler une virée chez Costco sans boire trop d'essence se placent bien. La consommation compte pour quiconque roule vers le centre-ville tous les jours. Nous choisissons notre inventaire en conséquence plutôt que de remplir la cour avec ce qui était le moins cher à l'encan.</p>

      <h2>Un service réellement bilingue</h2>
      <p>L'Ouest-de-l'Île est authentiquement bilingue, et nous aussi. En français ou en anglais, à l'oral comme sur papier, selon votre préférence.</p>

      <h2>À quoi vous attendre lors de votre visite</h2>
      <p>C'est le propriétaire qui vous présente le véhicule, qui vous laisse le temps qu'il faut et qui vous dit ce que nous savons de son historique et de son état. Si un véhicule ne vous convient pas, nous préférons vous le dire plutôt que de vous le vendre.</p>
      <ul>
        <li>Ouvert de 10 h à 18 h, 7 jours sur 7</li>
        <li>Vente, achat et échange : vous pouvez nous vendre un véhicule sans en acheter un</li>
        <li>Financement auprès de plusieurs prêteurs, y compris pour un crédit mince ou abîmé</li>
        <li>Votre mécanicien est bienvenu pour inspecter n'importe quel véhicule avant votre engagement</li>
      </ul>

      <h2>Prenez rendez-vous</h2>
      <p>Appelez le ${DEALER.phone} ou <a class="text-link" href="${R.contact}">écrivez-nous</a> en précisant ce que vous cherchez. Si ce n'est pas dans la cour aujourd'hui, nous ouvrirons l'œil.</p>
      <p><a class="text-link" href="${R.inventory}">Voir l'inventaire actuel</a> · <a class="text-link" href="${R.about}">À propos d'Automobile SX</a></p>`
  }
};
