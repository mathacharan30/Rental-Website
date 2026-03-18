/**
 * Vercel Edge Middleware — Forward bot requests to Prerender.io
 *
 * This runs at the edge before any other logic. When a bot request comes in,
 * we forward it to prerender.io's service, which returns fully-rendered HTML.
 */

import { NextResponse } from 'next/server';

// Bot patterns that should get pre-rendered content
const BOT_AGENTS_PATTERN = /googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkshare|w3c_validator|whatsapp|duckduckbot|applebot|sogou|exabot|ia_archiver|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider/i;

// Paths that should be excluded from prerendering
const EXCLUDE_PATHS = /\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|woff2|svg|eot)$/i;

export function middleware(req) {
  const userAgent = req.headers.get('user-agent') || '';
  const url = req.nextUrl;

  // Skip prerendering for:
  // 1. Non-bot user agents
  // 2. API routes
  // 3. Static files
  const isBot = BOT_AGENTS_PATTERN.test(userAgent);
  const isApiRoute = url.pathname.startsWith('/api/');
  const isStaticFile = EXCLUDE_PATHS.test(url.pathname);
  const isAsset = url.pathname.startsWith('/assets/') ||
                  url.pathname.startsWith('/_next/') ||
                  url.pathname === '/favicon.svg' ||
                  url.pathname === '/robots.txt' ||
                  url.pathname === '/sitemap.xml';

  if (!isBot || isApiRoute || isStaticFile || isAsset) {
    return NextResponse.next();
  }

  // Forward bot requests to prerender.io
  const prerenderToken = process.env.PRERENDER_TOKEN;

  if (!prerenderToken) {
    console.warn('[Prerender] PRERENDER_TOKEN not set, serving normal page');
    return NextResponse.next();
  }

  // Build the URL to request from prerender.io
  const targetUrl = `https://peopleandstyle.in${url.pathname}${url.search}`;
  const prerenderUrl = `https://service.prerender.io/${targetUrl}`;

  // Forward to prerender.io with authentication
  return fetch(prerenderUrl, {
    headers: {
      'X-Prerender-Token': prerenderToken,
      'User-Agent': userAgent, // Pass through the bot's user agent
    },
  })
    .then(res => {
      if (!res.ok) {
        console.error(`[Prerender] Failed with status ${res.status}`);
        return NextResponse.next();
      }
      return res.text();
    })
    .then(html => {
      // Return the pre-rendered HTML with appropriate headers
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Prerendered': 'true',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    })
    .catch(err => {
      console.error('[Prerender] Error:', err.message);
      return NextResponse.next();
    });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next (Next.js internals)
     * - static files
     */
    '/((?!api/|_next/|favicon\\.svg|robots\\.txt|sitemap\\.xml|assets/).*)',
  ],
};
