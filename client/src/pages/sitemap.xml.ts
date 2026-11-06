import type { APIRoute } from 'astro'

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const GET: APIRoute = async () => {
  const DOMAIN = 'https://peopleandstyle.in'
  const API    = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

  const staticPages: { loc: string; lastmod: string }[] = [
    { loc: '/',                              lastmod: '2026-05-10' },
    { loc: '/products',                      lastmod: '2026-05-10' },
    { loc: '/rental-clothing-mysuru',        lastmod: '2026-05-10' },
    { loc: '/rental-clothing-bangalore',     lastmod: '2026-05-10' },
    { loc: '/rental-jewellery-mysuru',       lastmod: '2026-05-10' },
    { loc: '/rental-jewellery-bangalore',    lastmod: '2026-05-10' },
    { loc: '/makeup-services-mysuru',        lastmod: '2026-05-10' },
    { loc: '/makeup-services-bangalore',     lastmod: '2026-05-10' },
    { loc: '/photography-services-mysuru',   lastmod: '2026-05-27' },
    { loc: '/photography-services-bangalore',lastmod: '2026-05-27' },
    { loc: '/bridal-package-mysuru',         lastmod: '2026-05-27' },
    { loc: '/bridal-package-bangalore',      lastmod: '2026-05-27' },
    { loc: '/about',                         lastmod: '2026-05-10' },
    { loc: '/contact',                       lastmod: '2026-05-10' },
    { loc: '/faq',                           lastmod: '2026-05-10' },
    { loc: '/terms',                         lastmod: '2026-05-10' },
    { loc: '/privacy',                       lastmod: '2026-05-10' },
    { loc: '/refund',                        lastmod: '2026-05-10' },
  ]

  type ProductEntry = {
    loc: string
    lastmod: string
    name: string
    images: { url: string }[]
  }

  let productPages: ProductEntry[] = []

  // Every category page, generated from the live category list
  try {
    const res = await fetch(`${API}/api/categories`)
    const cats: { name?: string; updatedAt?: string }[] = await res.json()
    if (Array.isArray(cats)) {
      for (const c of cats) {
        const name = String(c?.name ?? '').trim().toLowerCase()
        if (!name) continue
        staticPages.push({
          loc: `/products/${encodeURIComponent(name)}`,
          lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString().slice(0, 10) : '2026-11-06',
        })
      }
    }
  } catch {
    // Skip category pages if the API is unreachable
  }

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
