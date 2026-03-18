/**
 * Vercel Serverless Function — Prerender.io proxy
 *
 * When a search-engine bot hits the site, vercel.json rewrites the request
 * here. We fetch the fully-rendered HTML from prerender.io and return it,
 * so crawlers see real content instead of an empty <div id="root">.
 */
export default async function handler(req, res) {
  const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const path = req.query.path || "";

  console.log('[Prerender] Invoked for path:', path);
  console.log('[Prerender] User-Agent:', userAgent);
  console.log('[Prerender] Token present:', !!PRERENDER_TOKEN);

  if (!PRERENDER_TOKEN) {
    console.error('[Prerender] ERROR: PRERENDER_TOKEN not set in environment variables');
    // Return a diagnostic response for verification
    return res.status(503).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Prerender Error</title></head>
      <body>
        <h1>Prerender Configuration Error</h1>
        <p>PRERENDER_TOKEN environment variable is not configured.</p>
        <p>User-Agent: ${userAgent}</p>
        <p>Path: ${path}</p>
      </body>
      </html>
    `);
  }

  // Build the target URL that prerender.io should render
  const targetUrl = `https://peopleandstyle.in/${path}`;
  const prerenderUrl = `https://service.prerender.io/${targetUrl}`;

  console.log('[Prerender] Fetching from:', prerenderUrl);

  try {
    const response = await fetch(prerenderUrl, {
      headers: {
        "X-Prerender-Token": PRERENDER_TOKEN,
        "User-Agent": userAgent, // Forward the bot's user agent
      },
      redirect: "follow",
    });

    console.log('[Prerender] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Prerender.io returned status ${response.status}`);
    }

    const html = await response.text();

    console.log('[Prerender] Success - HTML length:', html.length);

    // Cache the pre-rendered page at the edge for 1 hour, revalidate for 1 day
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Prerendered", "true");
    res.status(response.status).send(html);
  } catch (err) {
    console.error("[Prerender] Error:", err.message);

    // Return diagnostic error page instead of redirect
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Prerender Error</title></head>
      <body>
        <h1>Prerender Fetch Error</h1>
        <p>Failed to fetch pre-rendered content from prerender.io</p>
        <p>Error: ${err.message}</p>
        <p>Target URL: ${targetUrl}</p>
        <p>User-Agent: ${userAgent}</p>
      </body>
      </html>
    `);
  }
}

