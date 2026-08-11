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
  emptyReset: "Réinitialiser les filtres", loadMore: "Voir plus de véhicules",
  overview: "Aperçu", specs: "Fiche technique", features: "Équipements",
  similar: "Véhicules semblables", estimatePayment: "Estimez votre paiement",
  bookTestDrive: "Réserver un essai", checkAvailability: "Vérifier la disponibilité",
  getPreApproved: "Info financement", hoursShort: "Ouvert de 10 h à 18 h, 7 jours, sur rendez-vous",
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

const accuracyNote = `<p class="accuracy-note">L'information de cette page reflète les règles québécoises en vigueur en août 2026 et est fournie à titre indicatif seulement. Il ne s'agit pas d'un avis juridique ou financier. Les règles et les tarifs changent : validez auprès de l'<a href="https://www.opc.gouv.qc.ca" target="_blank" rel="noopener">Office de la protection du consommateur</a>, de la <a href="https://saaq.gouv.qc.ca" target="_blank" rel="noopener">SAAQ</a> ou de <a href="https://www.revenuquebec.ca" target="_blank" rel="noopener">Revenu Québec</a>.</p>`;

const guideCards = [
  { h: "Acheter une voiture usagée au Québec", p: "Taxes, garantie légale, étiquette obligatoire et vérifications avant de signer.", href: R.g1 },
  { h: "Financement avec mauvais crédit", p: "Ce que les prêteurs regardent, les taux réalistes et vos droits au Québec.", href: R.g2 },
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
      { h: "Ouvert 7 jours", p: `De 10 h à 18 h tous les jours. Le rendez-vous est recommandé : appelez le ${DEALER.phone} et nous préparerons le véhicule pour vous.` },
      { h: "Financement pour tous", p: "Bon crédit, crédit récent ou crédit abîmé. Nous travaillons avec plusieurs prêteurs et vous montrons les vrais chiffres." }
    ],
    featuredKicker: "En stock",
    featuredH: "Voitures d'occasion à vendre à Dorval",
    bodyH: "Parcourir par type de carrosserie",
    finH: "Financement à Dorval, peu importe votre dossier de crédit.",
    finBody: `<p>Nouveau au Canada sans dossier de crédit ? Vous vous rebâtissez après une période difficile ? Nous travaillons avec plusieurs prêteurs canadiens et vous donnons le vrai taux et le vrai paiement avant toute signature.</p>
      <p>Et pour être clair sur vos droits : au Québec, un commerçant ne peut pas conditionner la vente d'un véhicule à la conclusion d'un contrat de crédit. Si vous préférez payer comptant ou passer par votre banque, c'est votre choix.</p>`,
    finCta: "Comment fonctionne le financement",
    lotAlt: "Le commerce Automobile SX au 2044 avenue Chartier à Dorval",
    tradeKicker: "Vente · Achat · Échange",
    tradeH: "Nous achetons aussi, et une reprise réduit vos taxes.",
    tradeBody: `<p>Vendre de particulier à particulier, c'est des inconnus chez vous, des essais routiers avec des gens que vous ne connaissez pas et un risque de paiement. Apportez-la-nous : vous obtenez une offre claire, que vous achetiez chez nous ou non.</p>
      <p>Et si vous donnez le véhicule en échange, le Québec calcule les taxes sur le prix <em>après</em> déduction de votre reprise. L'économie est bien réelle.</p>`,
    tradeCta: "Faire évaluer mon véhicule",
    guidesKicker: "Réponses claires",
    guidesH: "Guides pour acheteurs de voitures d'occasion au Québec",
    guidesAll: "Tous les guides →",
    guideCards,
    reviewsKicker: "Ce que disent nos clients",
    reviewsH: "Les avis de gens qui ont acheté ici",
    reviewsP: "Nos avis sont sur Google. Si vous avez acheté une auto chez Spiro, en laisser un prend une minute et aide vraiment un petit commerce familial.",
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
    reviewsRead: "Lire nos avis",
    visitH: "Visitez-nous à Dorval",
    askFor: "Demandez Spiro",
    directions: "Itinéraire ↗"
  },

  inventory: {
    title: "Autos Usagées à Vendre à Dorval, QC | Inventaire Automobile SX",
    description: "Voitures, VUS et camionnettes d'occasion à vendre chez Automobile SX à Dorval. Filtrez par marque, carrosserie, prix, année et kilométrage.",
    h1: "Autos usagées à vendre à Dorval",
    sub: `Chaque véhicule est affiché à son juste prix, kilométrage divulgué. Appelez le <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a> pour planifier une visite.`,
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
    interest: "Mon besoin", whichVehicle: "Quel véhicule ?",
    optGeneral: "Une question générale", optVehicle: "Un véhicule précis",
    optTestDrive: "Réserver un essai routier", optFinancing: "Le financement", optTrade: "Vendre ou échanger mon véhicule",
    errName: "Veuillez inscrire votre nom.",
    errEmail: "Veuillez inscrire une adresse courriel valide.",
    errPhone: "Veuillez inscrire un numéro de téléphone d'au moins 10 chiffres.",
    errMessage: "Ajoutez un court message pour que nous puissions vous aider.",
    send: "Envoyer",
    formNote: "L'envoi ouvre votre application de courriel avec le message prêt à partir. Vous préférez parler ? Appelez le " + DEALER.phone + ".",
    successH: "Presque envoyé",
    successBody: `Votre application de courriel devrait être ouverte avec le message prêt à envoyer. Si elle ne s'est pas ouverte, écrivez à <a class="text-link" href="mailto:${DEALER.email}">${DEALER.email}</a> ou appelez le <a class="text-link" href="tel:+15148249117">${DEALER.phone}</a>.`,
    directions: "Itinéraire ↗"
  },

  financing: {
    title: "Financement Auto Usagée à Dorval, QC | Tous Crédits | Automobile SX",
    description: "Financement d'auto usagée à Dorval et dans l'Ouest-de-l'Île : critères des prêteurs, documents à apporter et vos droits au Québec.",
    h1: "Financement d'auto usagée à Dorval",
    sub: "Bon crédit, crédit abîmé ou aucun dossier de crédit canadien. Voici comment ça fonctionne vraiment.",
    body: `
      <p>Financer une voiture d'occasion ne devrait pas ressembler à un tour de magie exécuté derrière un bureau. Cette page explique ce que les prêteurs examinent, ce que vous devriez apporter et ce que la loi québécoise vous garantit.</p>

      <h2>Du financement pour toutes les situations</h2>
      <p>Nous travaillons avec plusieurs prêteurs canadiens plutôt qu'avec une seule banque, parce que leurs critères diffèrent. Nous soumettons votre dossier là où il convient et nous vous disons exactement ce qui revient. Le taux, la durée et l'approbation relèvent du prêteur, pas de nous.</p>
      <ul>
        <li><strong>Crédit établi.</strong> Un dossier propre donne généralement un taux à un chiffre sur un véhicule assez récent.</li>
        <li><strong>Crédit abîmé.</strong> Des retards de paiement, une proposition de consommateur ou une faillite libérée ne signifient pas un refus automatique. Ça signifie habituellement un taux plus élevé, parfois une mise de fonds.</li>
        <li><strong>Nouvel arrivant.</strong> Ne pas avoir d'historique de crédit canadien est très courant à Montréal, et certains prêteurs sont organisés exactement pour ça. Une preuve de revenu stable fait l'essentiel du travail.</li>
        <li><strong>Premier achat.</strong> Un véhicule modeste et bien évalué, avec un paiement abordable, reste la façon la plus rapide de bâtir un dossier qui ouvrira de meilleurs taux plus tard.</li>
      </ul>

      <h2>Les documents à apporter</h2>
      <p>La loi québécoise oblige le prêteur à évaluer votre capacité de remboursement avant de conclure un contrat de crédit. Cette paperasse n'est donc pas superflue :</p>
      <ul>
        <li>Permis de conduire québécois valide</li>
        <li>Preuve d'adresse : facture d'Hydro-Québec, bail</li>
        <li>Talons de paie récents, ou votre avis de cotisation si vous êtes travailleur autonome</li>
        <li>Relevés bancaires des derniers mois</li>
        <li>Un spécimen de chèque</li>
        <li>L'immatriculation de votre véhicule d'échange et, s'il est encore financé, le solde à payer</li>
      </ul>

      <h2>Ce que coûte un prêt auto usagée</h2>
      <p>Les taux bougent et dépendent de votre dossier, de l'âge et du kilométrage du véhicule et de la durée du prêt. En repère pour le marché canadien en 2026 : un bon dossier se situe souvent dans les hauts chiffres simples sur un véhicule d'occasion, un dossier moyen dans le bas de la dizaine, et un dossier sous-optimal nettement plus haut. La loi fédérale plafonne le taux criminel à 35 % et le Québec ajoute des exigences au-delà de son seuil de crédit à coût élevé.</p>
      <p>Deux choses à savoir. Les taux sur l'occasion sont généralement <em>plus élevés</em> que sur le neuf, parce que la garantie vaut moins, ce qui surprend la plupart des acheteurs. Et la majorité des prêteurs ne financent pas un véhicule au-delà d'environ sa dixième année.</p>

      <h2>Durée plus courte, moins d'intérêts</h2>
      <p>Étirer un prêt à 84 ou 96 mois rend le paiement mensuel sympathique et coûte discrètement des milliers de dollars de plus en intérêts. Ça vous garde aussi en équité négative pendant des années, ce qui devient un vrai problème si vous devez changer de véhicule. Au Canada, la durée moyenne d'un prêt sur véhicule d'occasion tourne autour de 60 mois, et c'est un plafond raisonnable.</p>
      <p>Utilisez l'estimateur sur chaque fiche de véhicule pour voir l'obligation totale, pas seulement le paiement. C'est le total qui compte.</p>

      <h2>Vos droits au Québec, en clair</h2>
      <ul>
        <li><strong>Le financement ne peut pas vous être imposé.</strong> Depuis novembre 2024, un commerçant ne peut pas conditionner l'achat d'un véhicule à la conclusion d'un contrat de crédit ni à l'achat d'autres produits.</li>
        <li><strong>Les garanties prolongées et les extras sont facultatifs.</strong> Toujours. Si on vous les présente comme obligatoires, demandez-le par écrit.</li>
        <li><strong>Vous pouvez rembourser par anticipation sans pénalité</strong> dans un contrat de vente à tempérament, et le contrat doit le mentionner.</li>
        <li><strong>Vous avez deux jours pour annuler</strong> un achat financé chez le commerçant. Ce droit ne s'applique pas si vous payez comptant ou utilisez votre propre prêt bancaire.</li>
        <li><strong>Le contrat doit indiquer</strong> le prix comptant, la mise de fonds, les frais de crédit, le taux de crédit, le nombre de paiements et votre obligation totale. S'il manque un chiffre, exigez-le.</li>
      </ul>

      <h2>Commençons la conversation</h2>
      <p>Dites-nous votre situation franchement, y compris les parties que vous préféreriez taire. Ça change le prêteur que nous approchons, pas notre volonté de vous aider. Appelez le ${DEALER.phone} ou <a class="text-link" href="${R.contact}?interest=financing">écrivez-nous</a>.</p>
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
        <li><strong>Passez le montrer.</strong> Une évaluation sérieuse implique de le conduire et de regarder dessous. Quinze minutes, sur rendez-vous.</li>
        <li><strong>Recevez un montant.</strong> Nous expliquons comment nous y arrivons. Si ça ne vous convient pas, aucun problème et aucune pression.</li>
      </ol>

      <h2>L'économie de taxes que plusieurs ignorent</h2>
      <p>C'est la partie qui surprend. Au Québec, quand vous donnez un véhicule en échange lors d'un achat chez un commerçant, les taxes sont calculées sur le prix <em>après</em> déduction de la valeur de votre reprise, et non sur le prix affiché.</p>
      <p>La TPS et la TVQ combinées avoisinent 15 %. Sur une reprise de 6 000 $, ce mécanisme vaut donc environ 900 $ qu'une vente entre particuliers ne vous donne pas. Un acheteur privé peut offrir un peu plus sur papier et vous laisser quand même perdant une fois la différence de taxes calculée. Faites ce calcul avant d'afficher votre annonce.</p>

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
      <p>Appelez le ${DEALER.phone} ou <a class="text-link" href="${R.contact}?interest=trade-in">envoyez les détails</a>. Ouvert de 10 h à 18 h tous les jours, sur rendez-vous.</p>
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
      <p>Le kilométrage, l'état et les défauts connus sont divulgués avant même qu'on vous les demande. Vous êtes aussi libre de faire inspecter n'importe quel véhicule par votre propre mécanicien avant de vous engager, et nous rendrons l'auto disponible pour ça.</p>

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
        a: "Pas obligatoirement. Nous sommes ouverts de 10 h à 18 h 7 jours sur 7 et les visites sans rendez-vous sont les bienvenues. Un appel au 514-824-9117 à l'avance est recommandé afin que le véhicule soit prêt et que nous puissions bien vous recevoir." },
      { q: "Offrez-vous du financement ?",
        a: "Oui. Nous travaillons avec plusieurs prêteurs canadiens et soumettons votre dossier à ceux qui conviennent. Vous verrez le taux, la durée et le coût total avant toute signature. Au Québec, un commerçant ne peut pas exiger que vous financiez chez lui comme condition de la vente." },
      { q: "Puis-je donner mon véhicule en échange ?",
        a: "Oui, et ça vous fait généralement économiser des taxes. Au Québec, les taxes sur votre prochain véhicule sont calculées sur le prix après déduction de la valeur de reprise. Avec des taxes combinées d'environ 15 %, l'économie est réelle. Nous évaluons votre véhicule sans obligation d'achat." },
      { q: "Y a-t-il une garantie sur une auto usagée au Québec ?",
        a: "Souvent oui, et elle est fixée par la loi plutôt que par le commerçant. La Loi sur la protection du consommateur prévoit une garantie de bon fonctionnement selon l'âge et le kilométrage : environ six mois ou 10 000 km pour les véhicules récents à faible kilométrage, jusqu'à un mois ou 1 700 km pour les plus âgés, et aucune garantie de ce type au-delà de sept ans ou de 120 000 km. Même dans ce dernier cas, les garanties légales générales de qualité et de durabilité s'appliquent toujours. La catégorie est indiquée sur l'étiquette du véhicule." },
      { q: "Puis-je faire inspecter l'auto par mon mécanicien ?",
        a: "Absolument, et nous vous y encourageons. Prenez rendez-vous et nous rendrons le véhicule disponible. Un acheteur qui a fait vérifier son auto dort mieux ensuite." },
      { q: "Puis-je réserver un véhicule ?",
        a: "Oui. Appelez le 514-824-9117 et nous le garderons pendant que vous organisez votre financement ou une inspection. Nous vous dirons honnêtement si quelqu'un d'autre est déjà sur les rangs." },
      { q: "Faites-vous la livraison ?",
        a: "Demandez-nous. Selon l'endroit où vous êtes dans la région de Montréal, on peut habituellement s'arranger. La plupart des clients préfèrent venir chercher le véhicule à Dorval pour qu'on puisse passer l'auto et les documents ensemble." },
      { q: "Que faut-il pour immatriculer le véhicule ?",
        a: "Dans la plupart des cas, nous nous occupons de l'immatriculation auprès de la SAAQ au moment de la livraison, alors vous repartez avec le véhicule correctement immatriculé. Apportez votre permis de conduire québécois valide et votre preuve d'assurance." },
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
      <p>Chez un commerçant, vous payez la TPS à 5 % et la TVQ à 9,975 %, soit environ 15 % au total, sur le prix de vente convenu. Le prix annoncé doit déjà inclure la préparation, le transport et les frais d'administration : un commerçant ne peut pas afficher un montant et ajouter ces frais ensuite. Seules les taxes et le droit environnemental sur les pneus peuvent s'ajouter.</p>
      <p>Si vous donnez un véhicule en échange, les taxes sont calculées sur le prix après déduction de la valeur de reprise. C'est la principale raison financière de faire une reprise plutôt qu'une vente privée.</p>

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
      <p>Si vous arrivez de l'Ontario, ajustez vos attentes : une voiture de promenade usagée vendue par un commerçant québécois à un consommateur n'exige pas de certificat de vérification mécanique. Ces certificats sont requis dans des situations précises, comme les véhicules provenant de l'extérieur du Québec ou reconstruits après un accident grave. C'est exactement pourquoi une inspection indépendante vaut la centaine de dollars qu'elle coûte.</p>

      <h2>Faites-la inspecter quand même</h2>
      <p>Tout commerçant chez qui il vaut la peine d'acheter vous laissera amener le véhicule chez votre mécanicien. Nous le faisons. Une inspection préachat vous dit ce qui s'en vient dans la prochaine année, ce qui transforme une décision nerveuse en décision éclairée. Si un vendeur résiste, vous avez votre réponse.</p>

      <h2>Avant de signer</h2>
      <p>Le contrat doit indiquer le numéro de permis OPC du commerçant, le prix, les taxes, le total à payer, les détails de la garantie et les conditions de reprise s'il y a lieu. Vérifiez que le numéro d'identification du véhicule au contrat correspond à celui sur l'auto. Assurez-vous que toute promesse verbale, comme une réparation avant la livraison, est écrite au contrat.</p>

      <h2>Changer d'idée</h2>
      <p>Si vous financez chez le commerçant, vous avez deux jours pour annuler ce contrat de crédit, et pour un véhicule d'occasion vous pouvez le faire même après en avoir pris livraison, à condition de le rapporter dans le même état. Si vous payez comptant ou passez par votre banque, il n'y a généralement aucun délai de réflexion. Décidez avant que le stylo touche le papier.</p>

      <h2>Pour aller plus loin</h2>
      <p><a class="text-link" href="${R.g4}">Immatriculer le véhicule à la SAAQ</a> · <a class="text-link" href="${R.g2}">Le financement avec un crédit imparfait</a> · <a class="text-link" href="${R.inventory}">Voir notre inventaire</a></p>
      ${accuracyNote}`
  },

  g2: {
    title: "Financement Auto avec Mauvais Crédit au Québec : à Quoi s'Attendre",
    description: "Le financement d'auto usagée au Québec avec un crédit limité ou abîmé : critères des prêteurs, taux réalistes et vos droits.",
    h1: "Financement auto avec mauvais crédit au Québec",
    sub: "Ce que les prêteurs regardent vraiment, ce que ça coûte réellement et les droits que vous conservez.",
    body: `
      <p>Un dossier de crédit abîmé donne l'impression d'une porte verrouillée. En pratique, c'est habituellement une porte plus chère, et le prix dépend de choix que vous contrôlez.</p>

      <h2>Ce qu'on appelle un mauvais crédit au Canada</h2>
      <p>Sur l'échelle Equifax de 300 à 900, environ 760 et plus est excellent, 725 à 759 très bon, 660 à 724 bon, 560 à 659 moyen, et sous 560 faible. Les prêteurs considèrent généralement qu'en bas de 660 on entre dans le crédit à risque. Il n'existe aucun seuil légal et chaque prêteur fixe le sien, alors un seul refus ne veut pas dire grand-chose.</p>

      <h2>Ce que les prêteurs à risque examinent</h2>
      <p>Une fois sous le seuil du crédit de premier ordre, les prêteurs s'appuient moins sur la cote et davantage sur la stabilité :</p>
      <ul>
        <li><strong>Le revenu.</strong> Stable, démontrable et suffisant pour porter le paiement confortablement.</li>
        <li><strong>L'ancienneté d'emploi.</strong> Quelques mois chez le même employeur pèsent réellement.</li>
        <li><strong>Les relevés bancaires.</strong> On y cherche le loyer et les factures payés à temps, et les frais de chèque sans provision.</li>
        <li><strong>Le véhicule lui-même.</strong> Une auto raisonnable et abordable s'approuve plus facilement qu'un achat trop ambitieux.</li>
        <li><strong>La mise de fonds.</strong> Pas toujours exigée, mais elle améliore les chances et le taux.</li>
      </ul>

      <h2>Ce que ça coûte</h2>
      <p>Attendez-vous à une prime notable : là où un bon dossier obtient des hauts chiffres simples sur un véhicule d'occasion, un dossier à risque se situe souvent au milieu de la dizaine et peut monter plus haut. La loi fédérale plafonne le taux criminel à 35 % et le Québec impose des exigences additionnelles au-delà de son seuil de crédit à coût élevé. Tout ce qui approche ces chiffres mérite un second regard sérieux.</p>
      <p>Une particularité québécoise utile : le taux de crédit inscrit à votre contrat est un taux tout inclus, qui comprend les frais d'administration et pas seulement l'intérêt nominal. Les contrats deviennent donc vraiment comparables. Comparez ce chiffre plutôt que le paiement.</p>

      <h2>Nouvel arrivant sans dossier de crédit</h2>
      <p>Aucun historique de crédit, ce n'est pas un mauvais crédit : c'est une page blanche, et les prêteurs la traitent différemment. Certaines banques offrent des programmes pour nouveaux arrivants qui n'exigent pas d'historique canadien, généralement avec une mise de fonds de 10 % à 25 % et des limites sur l'âge du véhicule. Ces limites d'âge sont justement l'obstacle chez un commerçant d'occasion : les nouveaux arrivants s'en tirent souvent mieux avec un prêteur spécialisé ou un endosseur.</p>

      <h2>Ne laissez pas la durée masquer le coût</h2>
      <p>La façon la plus simple de rendre un prêt cher acceptable, c'est de l'étirer. Passer de 48 à 96 mois réduit fortement le paiement et plus que double les intérêts, tout en vous gardant en équité négative pendant des années. Si le paiement ne fonctionne qu'à 84 ou 96 mois, la conclusion honnête est habituellement que le véhicule est trop cher, pas que la durée est trop courte.</p>

      <h2>Servez-vous-en pour rebâtir</h2>
      <p>Un prêt auto à risque déclaré aux bureaux de crédit et payé à temps est l'un des moyens les plus rapides de réparer un dossier. Beaucoup d'acheteurs refinancent à bien meilleur taux après un an ou deux de paiements impeccables, et au Québec un contrat de vente à tempérament doit permettre le remboursement anticipé sans pénalité : sortir plus tôt ne coûte rien.</p>

      <h2>Protégez-vous</h2>
      <ul>
        <li>Au Québec, le financement ne peut pas être une condition de la vente, depuis novembre 2024.</li>
        <li>Garanties prolongées, assurance crédit et forfaits de protection sont facultatifs. Chacun augmente le montant financé.</li>
        <li>Comparez l'obligation totale, pas le paiement hebdomadaire.</li>
        <li>Obtenez le taux approuvé par écrit et vérifiez-le au contrat.</li>
        <li>Vous pouvez rembourser par anticipation sans pénalité, et le contrat doit le dire.</li>
      </ul>

      <h2>Parlons-en franchement</h2>
      <p>Dites-nous la vraie situation et nous vous dirons ce qui est réaliste. Appelez le ${DEALER.phone} ou consultez <a class="text-link" href="${R.financing}">comment fonctionne le financement chez Automobile SX</a>.</p>
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
      <p>Comparer une offre de reprise au prix d'une vente privée sans tenir compte des taxes donne la mauvaise réponse. Au Québec, les taxes sur votre prochain véhicule sont calculées après déduction de la reprise, et la TPS et la TVQ combinées frôlent 15 %.</p>
      <p>Sur une reprise de 8 000 $, ce mécanisme économise donc environ 1 200 $ en taxes. Un acheteur privé qui offre 9 000 $ est à peine devant une reprise de 8 000 $ une fois le calcul fait, et c'est avant les photos, les messages, les rendez-vous manqués et le risque de paiement.</p>

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

      <h2>La règle des pneus d'hiver pour les nouveaux acheteurs</h2>
      <p>Les pneus d'hiver sont obligatoires au Québec du 1<sup>er</sup> décembre au 15 mars sur tout véhicule immatriculé ici, sous peine d'amendes de 200 $ à 300 $. Une exemption vaut la peine d'être connue si vous achetez en décembre : un véhicule acquis depuis moins de sept jours est exempté, ce qui vous laisse une semaine pour faire installer les pneus. Ne traitez pas cette semaine comme facultative.</p>

      <h2>Conservez vos documents</h2>
      <p>Gardez ensemble le contrat de vente, le certificat d'immatriculation et les détails de la garantie. Vous en aurez besoin pour l'assurance, pour vos dossiers et au moment de revendre ou d'échanger le véhicule.</p>
      <p>Ensuite : <a class="text-link" href="${R.g1}">le guide complet de l'achat d'occasion au Québec</a> · <a class="text-link" href="${R.inventory}">voir notre inventaire</a></p>
      ${accuracyNote}`
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
