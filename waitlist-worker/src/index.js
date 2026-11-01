// ArtOfMenu launch list. One POST endpoint that the landing page's "notify me" form calls.
// Checks the visitor with Turnstile, validates every field again on the server and stores the
// signup in D1. Nothing is ever returned about who else is on the list.

const PLANS = new Set(["menu", "order", "smart", "undecided"]);
const LANGS = new Set(["tr", "en", "de"]);
const HOURLY_LIMIT = 5;   // signups per visitor (hashed IP) per hour

function isMapsUrl(value) {
  let u;
  try { u = new URL(String(value).trim()); } catch { return false; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  const host = u.hostname.toLowerCase().replace(/^www\./, ""), path = u.pathname;
  if (host === "maps.app.goo.gl" || host === "g.page" || host === "share.google") return true;
  if (host === "goo.gl") return path.startsWith("/maps");
  if (host === "g.co") return path.startsWith("/kgs/");
  if (/^maps\.google\.[a-z.]+$/.test(host)) return true;
  return /^google\.[a-z.]+$/.test(host) && path.startsWith("/maps");
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cors(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function reply(status, body, headers) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

export default {
  async fetch(request, env) {
    const headers = cors(request.headers.get("Origin"), env);
    // only the landing page's own address may use this endpoint from a browser
    if (!headers) return reply(403, { error: "origin" }, {});
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return reply(405, { error: "method" }, headers);

    let data;
    try { data = await request.json(); } catch { return reply(400, { error: "body" }, headers); }

    // a hidden field people never see; bots that fill it get a quiet "ok" and are not stored
    if (data.website) return reply(200, { ok: true }, headers);

    const name = String(data.name || "").trim().replace(/\s+/g, " ");
    const email = String(data.email || "").trim().toLowerCase();
    const maps = String(data.maps || "").trim();
    const plan = PLANS.has(data.plan) ? data.plan : "undecided";
    const lang = LANGS.has(data.lang) ? data.lang : "en";
    // first and last name: at least two words, no markup
    if (name.length < 3 || name.length > 120 || !name.includes(" ") || /[<>]/.test(name)) return reply(400, { error: "name" }, headers);
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reply(400, { error: "email" }, headers);
    if (maps.length > 500 || !isMapsUrl(maps)) return reply(400, { error: "maps" }, headers);
    if (data.consent !== true) return reply(400, { error: "consent" }, headers);

    const ip = request.headers.get("CF-Connecting-IP") || "";

    // Cloudflare Turnstile: the token from the page is checked here, with the secret key
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(data.token || ""), remoteip: ip })
    }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!check.success) return reply(400, { error: "check" }, headers);

    // the IP is never stored, only a salted hash of it, and only to limit repeated signups
    const ipHash = await sha256(ip + (env.IP_SALT || ""));
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM signups WHERE ip_hash = ? AND updated_at > datetime('now', '-1 hour')"
    ).bind(ipHash).first();
    if (recent && recent.n >= HOURLY_LIMIT) return reply(429, { error: "many" }, headers);

    // signing up again with the same email updates the link and plan instead of adding a row
    await env.DB.prepare(
      `INSERT INTO signups (name, email, maps_url, plan, lang, ip_hash, consent_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
       ON CONFLICT(email) DO UPDATE SET name = excluded.name, maps_url = excluded.maps_url, plan = excluded.plan, lang = excluded.lang,
         ip_hash = excluded.ip_hash, consent_at = excluded.consent_at, updated_at = excluded.updated_at`
    ).bind(name, email, maps, plan, lang, ipHash).run();

    return reply(200, { ok: true }, headers);
  }
};
