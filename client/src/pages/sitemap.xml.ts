import type { APIRoute } from 'astro'

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const GET: APIRoute = async () => {
  const DOMAIN = 'https://peopleandstyle.in'
  const API    = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

  const staticPages: { loc: string; priority: string; changefreq: string; lastmod: string }[] = [
    { loc: '/',                              priority: '1.0',  changefreq: 'daily',   lastmod: '2026-05-10' },
    { loc: '/products',                      priority: '0.95', changefreq: 'daily',   lastmod: '2026-05-10' },
    { loc: '/rental-clothing-mysuru',        priority: '0.95', changefreq: 'weekly',  lastmod: '2026-05-10' },
    { loc: '/rental-clothing-bangalore',     priority: '0.95', changefreq: 'weekly',  lastmod: '2026-05-10' },
    { loc: '/rental-jewellery-mysuru',       priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-10' },
    { loc: '/rental-jewellery-bangalore',    priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-10' },
    { loc: '/makeup-services-mysuru',            priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-10' },
    { loc: '/makeup-services-bangalore',         priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-10' },
    { loc: '/photography-services-mysuru',       priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-12' },
    { loc: '/photography-services-bangalore',    priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-12' },
    { loc: '/bridal-package-mysuru',             priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-12' },
    { loc: '/bridal-package-bangalore',          priority: '0.90', changefreq: 'weekly',  lastmod: '2026-05-12' },
    { loc: '/products/lehenga',              priority: '0.90', changefreq: 'daily',   lastmod: '2026-05-10' },
    { loc: '/products/gowns',               priority: '0.90', changefreq: 'daily',   lastmod: '2026-05-10' },
    { loc: '/products/men',                 priority: '0.85', changefreq: 'daily',   lastmod: '2026-05-10' },
    { loc: '/products/jewels',              priority: '0.85', changefreq: 'daily',   lastmod: '2026-05-10' },
    { loc: '/about',                         priority: '0.70', changefreq: 'monthly', lastmod: '2026-05-10' },
    { loc: '/contact',                       priority: '0.70', changefreq: 'monthly', lastmod: '2026-05-10' },
    { loc: '/faq',                           priority: '0.60', changefreq: 'monthly', lastmod: '2026-05-10' },
    { loc: '/terms',                         priority: '0.30', changefreq: 'yearly',  lastmod: '2026-05-10' },
    { loc: '/privacy',                       priority: '0.30', changefreq: 'yearly',  lastmod: '2026-05-10' },
    { loc: '/refund',                        priority: '0.30', changefreq: 'yearly',  lastmod: '2026-05-10' },
  ]

  type ProductEntry = {
    loc: string
    lastmod: string
    name: string
    images: { url: string }[]
  }

  let productPages: ProductEntry[] = []

  try {
    const res  = await fetch(`${API}/api/products`)
    const data = await res.json()
    const list: { _id: string; updatedAt?: string; name?: string; images?: { url: string; publicId: string }[] }[] =
      Array.isArray(data) ? data : data.products ?? []

    productPages = list.map((p) => ({
      loc:     `/product/${p._id}`,
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
      name:    p.name ?? 'Rental outfit',
      images:  (p.images ?? []).slice(0, 5),
    }))
  } catch {
    // Silently skip product pages if API is unreachable
  }

  const rows = [
    ...staticPages.map(
      (p) => `  <url>
    <loc>${DOMAIN}${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...productPages.map((p) => {
      const imageTags = p.images
        .map((img) => `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${escapeXml(p.name)}</image:title>
    </image:image>`)
        .join('\n')

      return `  <url>
    <loc>${DOMAIN}${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
${imageTags}
  </url>`
    }),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${rows.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
