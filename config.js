// =====================================================================
// RÉGLAGES DU SITE CGE ARSTM : le fichier à mettre à jour chaque année
// ---------------------------------------------------------------------
// Règles pour ne rien casser :
//  - gardez les guillemets "..." autour de chaque texte ;
//  - gardez une virgule à la fin de chaque ligne ou élément de liste ;
//  - après modification, rechargez le site avec Ctrl+F5.
// En cas de faute, le site affiche un message qui indique de vérifier ce fichier.
// =====================================================================
window.CGE_CONFIG = {

  // Mandat du bureau en cours (affiché sur l'accueil et la page « Le bureau »)
  MANDAT: "2026-2027",

  // Président : son nom doit être écrit EXACTEMENT comme dans la liste BUREAU ci-dessous.
  PRESIDENT: {
    name: "NANGUI AKRE",
    message: "Bienvenue sur le site de la CGE ARSTM. Notre ambition est simple : faire de chaque élève un acteur engagé de sa formation et lui ouvrir les portes du monde professionnel. Ensemble, cultivons l'entraide, l'excellence et le rayonnement de notre Académie. (Texte provisoire)",
  },

  // Bureau exécutif : chaque membre s'écrit ["NOM PRÉNOM", "Fonction"],
  BUREAU: [
    { dept: "Présidence", members: [["NANGUI AKRE", "Président"], ["SYLLA YACOUBA", "Vice-Président"]] },
    { dept: "Secrétariat Général", members: [["COULIBALY DAVID", "Secrétaire Général"], ["GUIRA CHEICK", "Secrétaire Général Adjoint"]] },
    { dept: "Finances", members: [["OUATTARA INES", "Trésorière Générale"], ["ZADI MARIA AUDE", "Trésorière Adjointe"], ["HOBA EKRA", "Commissaire aux Comptes"]] },
    { dept: "Informatique", members: [["KOUAKOU MARC-ARTHUR", "Chef de département"], ["KOLOGA MOUHAMMED", "Adjoint"]] },
    { dept: "Projets", members: [["ALLOH N'CHOH", "Chef de département"], ["ATTA KOUAO", "Adjoint"]] },
    { dept: "Communication", members: [["APOMOLIA APO", "Chef de département"], ["MAMBO INCHOT", "Adjoint"]] },
    { dept: "Organisation", members: [["TOTO DEBORAH", "Cheffe de département"], ["KOUASSI SETH", "Adjoint"], ["SEDJI NANGUI", "Adjoint"]] },
    { dept: "Affaires Externes", members: [["OHOUEU JEAN", "Chef de département"], ["KOUAKOU GBOKO", "Adjoint"]] },
    { dept: "Porte-parole", members: [["ADEGOKE SARAH", "Porte-parole"], ["MAHUDO LUCIE", "Porte-parole Adjointe"]] },
  ],

  // Coordonnées (page Contact et pied de page). Laisser "" pour masquer une ligne.
  CONTACT: {
    adresse: "ARSTM, Abidjan — Côte d'Ivoire",
    email: "",      // ex. "cge.arstm@gmail.com"
    telephone: "",  // ex. "+225 07 00 00 00 00"
    facebook: "https://www.facebook.com/ci.cge/",
  },

  ANNEE_CREATION: 1992,

  // Listes utilisées dans les formulaires et les filtres
  FILIERES: ["Navigation maritime", "Mécanique navale", "Génie thermique", "Électromécanique", "Logistique & transport", "Administration maritime", "Sécurité maritime", "Hydrographie"],
  DOMAINES: ["Sciences nautiques", "Mécanique navale", "Génie thermique", "Électromécanique", "Offshore", "Logistique & transport", "Industrie", "Administration maritime", "Autre"],
  ZONES: ["Côte d'Ivoire", "Afrique", "Europe", "International"],
  NEWS_CATEGORIES: ["Vie de la CGE", "Annonce", "ARSTM", "Carrière", "Événement", "Interne"],
  DOC_CATEGORIES: ["Documents CGE", "Comptes rendus", "Guides pratiques", "Réglementation", "Formations", "Autre"],

  // Images par défaut (elles peuvent aussi être changées depuis Administration → Images & logos)
  LOGO_SRC: "logos/cge-arstm.svg",
  LOGOS_ECOLES: { ARSTM: null, ENSEA: null, ESATIC: null, "INP-HB": null, ESA: null, ESCAE: null, ESI: null, ESMG: null, ESTP: null },
  PHOTOS_BUREAU: {},
};
