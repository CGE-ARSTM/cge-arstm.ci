// CGE ARSTM · fonction Supabase « cge-ia » (v135, plusieurs domaines par offre en v144)
// Assistant IA de l'administration, avec Google Gemini.
// La clé Gemini reste ici, côté serveur : elle n'apparaît jamais dans le site.
//
// Secrets à créer dans Supabase → Edge Functions → Secrets :
//   GEMINI_API_KEY  (obligatoire) : la clé créée sur https://aistudio.google.com
//   GEMINI_MODEL    (facultatif)  : pour changer de modèle sans toucher au code
//
// Actions : "offre", "evenement", "actualite", "corriger".
// Seuls les administrateurs et les membres qui ont le droit correspondant peuvent s'en servir.

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Modèles essayés dans l'ordre : si le premier est indisponible ou saturé, on passe au suivant.
const MODELES = [Deno.env.get("GEMINI_MODEL"), "gemini-3.5-flash-lite", "gemini-3.8-flash"].filter(Boolean) as string[];

// Droit nécessaire pour chaque action ("*" : n'importe quel droit délégué).
const DROITS: Record<string, string> = { offre: "jobs", evenement: "events", actualite: "news", corriger: "*" };

function consigne(action: string, ctx: Record<string, unknown>): string {
  const aujourdhui = String(ctx.aujourdhui || new Date().toISOString().slice(0, 10));
  const liste = (k: string) => JSON.stringify(Array.isArray(ctx[k]) ? ctx[k] : []);
  const commun = `Tu aides le bureau de la CGE ARSTM (association des élèves de l'Académie Régionale des Sciences et Techniques de la Mer, Abidjan, Côte d'Ivoire). Nous sommes le ${aujourdhui}. Réponds uniquement avec un objet JSON valide, en français. N'invente jamais d'information absente : laisse le champ vide ("").`;
  if (action === "offre") {
    return `${commun}
À partir de l'annonce fournie (texte collé depuis WhatsApp ou LinkedIn, et/ou photo de l'affiche), remplis une offre d'opportunité.
Champs attendus :
- "title" : intitulé court et clair du poste ou de l'offre (sans hashtags, 120 caractères maximum).
- "company" : entreprise ou organisme qui recrute.
- "type" : exactement une valeur parmi ${liste("types")}.
- "domaine" : un ou plusieurs domaines concernés, choisis parmi ${liste("domaines")} et séparés par " ; ", ou "".
- "zone" : une valeur parmi ${liste("zones")}, ou "".
- "place" : lieu précis (ville, site).
- "niveau" : niveau ou diplôme demandé.
- "duration" : durée ou type de contrat.
- "cloture" : date limite de candidature au format AAAA-MM-JJ, ou "". Si l'année manque, prends la prochaine date à venir.
- "lien" : le lien de l'offre s'il y en a un (adresse complète), sinon "".
- "text" : description propre et bien présentée : missions, profil recherché, pièces du dossier, comment postuler. Retire les hashtags, le nom et le numéro de la personne qui a transféré le message.`;
  }
  if (action === "evenement") {
    return `${commun}
À partir du texte et/ou de l'affiche fournis, remplis un événement de la CGE.
Champs attendus :
- "title" : titre de l'événement.
- "date" : date au format AAAA-MM-JJ, ou "". Si l'année manque, prends la prochaine date à venir.
- "time" : heure de début au format 14h00, ou "".
- "place" : lieu.
- "text" : description courte et engageante (programme, public, inscription), sans rien inventer.`;
  }
  if (action === "actualite") {
    return `${commun}
À partir des notes fournies (et de la photo éventuelle), rédige une actualité pour le site de la CGE.
Champs attendus :
- "title" : titre accrocheur et sobre (90 caractères maximum).
- "category" : exactement une valeur parmi ${liste("categories")}.
- "text" : article de 120 à 250 mots, ton chaleureux et professionnel, en paragraphes courts. Utilise uniquement les faits des notes.`;
  }
  return `${commun}
Corrige l'orthographe, la grammaire, la ponctuation et les accents du texte fourni, sans changer son sens, son ton ni sa mise en forme (retours à la ligne, listes). Ne rajoute rien.
Champ attendu : "texte" : le texte corrigé.`;
}

async function appelerGemini(cle: string, parts: unknown[]) {
  let derniere = "";
  for (const modele of MODELES) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": cle },
      body: JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }),
    });
    if (!r.ok) { derniere = `${modele} : ${r.status} ${(await r.text()).slice(0, 300)}`; continue; }
    const data = await r.json();
    const texte = (data?.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("").trim();
    try { return { resultat: JSON.parse(texte.replace(/^```(json)?|```$/g, "").trim()), modele }; }
    catch { derniere = `${modele} : réponse illisible`; }
  }
  throw new Error(derniere || "aucun modèle disponible");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erreur: "Méthode non autorisée." }, 405);
  try {
    const cle = Deno.env.get("GEMINI_API_KEY");
    if (!cle) return json({ erreur: "La clé Gemini n'est pas encore enregistrée dans Supabase (secret GEMINI_API_KEY)." }, 500);

    // 1. Qui appelle ? Seuls un administrateur ou un membre actif avec le bon droit délégué peuvent utiliser l'IA.
    const jeton = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, service, { auth: { persistSession: false } });
    const { data: u, error: eu } = await sb.auth.getUser(jeton);
    if (eu || !u?.user) return json({ erreur: "Connectez-vous pour utiliser l'assistant IA." }, 401);
    const { data: p } = await sb.from("profiles").select("role, statut, permissions").eq("id", u.user.id).maybeSingle();
    const body = await req.json();
    const action = String(body.action || "");
    const droit = DROITS[action];
    if (!droit) return json({ erreur: "Action inconnue." }, 400);
    const perms: string[] = (p?.permissions as string[]) || [];
    const autorise = p?.statut === "actif" && (p?.role === "admin" || (droit === "*" ? perms.length > 0 : perms.includes(droit)));
    if (!autorise) return json({ erreur: "Vous n'avez pas le droit d'utiliser l'assistant IA pour cette rubrique." }, 403);

    // 2. Contenu envoyé à Gemini : texte (limité) et image éventuelle (base64, 4 Mo maximum).
    const texte = String(body.texte || "").slice(0, 12000);
    const image = body.image && typeof body.image.data === "string" && body.image.data.length < 5_500_000 ? body.image : null;
    if (!texte.trim() && !image) return json({ erreur: "Collez un texte ou ajoutez une photo." }, 400);
    const parts: unknown[] = [{ text: consigne(action, body.contexte || {}) }];
    if (texte.trim()) parts.push({ text: "Contenu fourni :\n" + texte });
    if (image) parts.push({ inline_data: { mime_type: String(image.type || "image/jpeg"), data: image.data } });

    const { resultat, modele } = await appelerGemini(cle, parts);
    return json({ resultat, modele });
  } catch (e) {
    console.error(e);
    return json({ erreur: "L'assistant IA n'a pas pu répondre : " + String((e as Error).message || e).slice(0, 300) }, 502);
  }
});
