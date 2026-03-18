/**
 * Vercel Serverless Function — Prerender.io proxy
 *
 * When a search-engine bot hits the site, vercel.json rewrites the request
 * here. We fetch the fully-rendered HTML from prerender.io and return it,
 * so crawlers see real content instead of an empty <div id="root">.
 */
export default async function handler(req, res) {
  const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN;

  if (!PRERENDER_TOKEN) {
    // Fallback: if token isn't configured, serve the normal SPA
    return res.redirect(307, req.url || "/");
  }

  // Build the target URL that prerender.io should render
  const path = req.query.path || "";
  const targetUrl = `https://peopleandstyle.in/${path}`;
  const prerenderUrl = `https://service.prerender.io/${targetUrl}`;

  try {
    const response = await fetch(prerenderUrl, {
      headers: {
        "X-Prerender-Token": PRERENDER_TOKEN,
      },
      redirect: "follow",
    });

    const html = await response.text();

    // Cache the pre-rendered page at the edge for 1 hour, revalidate for 1 day
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Prerendered", "true");
    res.status(response.status).send(html);
  } catch (err) {
    console.error("[Prerender] Error fetching from prerender.io:", err.message);
    // On failure, redirect to the normal SPA so the user isn't stuck
    res.redirect(307, `/${path}`);
  }
}

