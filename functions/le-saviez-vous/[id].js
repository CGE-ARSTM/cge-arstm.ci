// CGE ARSTM · fonction Cloudflare Pages (v140, v141) : aperçu WhatsApp / Facebook d'un « Le saviez-vous ? ».
// Adresse servie : https://cge-arstm.com/le-saviez-vous/12-titre-du-savoir
// WhatsApp ne lit pas le code du site : cette fonction renvoie la page normale (index.html) en remplaçant
// le titre, la description et l'image d'aperçu par ceux du savoir. Les visiteurs voient le site comme d'habitude.
// Seuls les savoirs PUBLIÉS sont lus (clé publique du site, règles de sécurité de Supabase).

const SUPABASE_URL = "https://jusggszkkvpufejnswlo.supabase.co";
const SUPABASE_KEY = "sb_publishable_ai-O9eBluMELsW-qY2ODAQ_eVdQBVp3"; // clé publique (déjà présente dans le site)
const IMAGE_DEFAUT = "https://cge-arstm.com/logos/apercu-savoir.jpg";

const court = (t, n) => { const s = String(t || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s; };

export async function onRequestGet(context) {
  const { request, env, params } = context;
  // La page du site (index.html), servie normalement.
  const page = await env.ASSETS.fetch(new URL("/", request.url));
  const id = parseInt(String(params.id || ""), 10);
  if (!id) return page;

  let s = null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/savoirs?id=eq.${id}&statut=eq.publie&select=id,titre,texte,image,auteur_nom,auteur_info`, {
      headers: { apikey: SUPABASE_KEY },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (r.ok) s = (await r.json())[0] || null;
  } catch (e) { /* Supabase indisponible : aperçu général du site */ }
  if (!s) return page;

  const titre = "💡 " + court(s.titre || "Le saviez-vous ?", 110);
  const description = court(s.texte, 170) + (s.auteur_nom ? ` — Présenté par ${s.auteur_nom}, CGE ARSTM` : "");
  const image = s.image || IMAGE_DEFAUT;
  // Type de l'image (v141) : aide WhatsApp à choisir la grande bannière.
  const typeImage = /\.png(\?|$)/i.test(image) ? "image/png" : /\.webp(\?|$)/i.test(image) ? "image/webp" : "image/jpeg";
  const url = new URL(request.url); url.search = ""; url.hash = "";
  const remplacer = (valeur) => ({ element(e) { e.setAttribute("content", valeur); } });

  const reponse = new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(`${court(s.titre, 80)} — Le saviez-vous ? · CGE ARSTM`); } })
    .on('meta[name="description"]', remplacer(description))
    .on('meta[property="og:type"]', remplacer("article"))
    .on('meta[property="og:url"]', remplacer(url.toString()))
    .on('meta[property="og:title"]', remplacer(titre))
    .on('meta[property="og:description"]', remplacer(description))
    .on('meta[property="og:image"]', remplacer(image))
    .on('meta[property="og:image:secure_url"]', remplacer(image))
    .on('meta[property="og:image:type"]', remplacer(typeImage))
    .on('meta[property="og:image:alt"]', remplacer(court(s.titre, 120)))
    .on('meta[name="twitter:image"]', remplacer(image))
    // Une image envoyée par le membre n'a pas forcément le format 1200 × 630 : on retire ces deux indications.
    .on('meta[property="og:image:width"]', { element(e) { if (s.image) e.remove(); } })
    .on('meta[property="og:image:height"]', { element(e) { if (s.image) e.remove(); } })
    .transform(page);

  return new Response(reponse.body, { status: 200, headers: reponse.headers });
}
