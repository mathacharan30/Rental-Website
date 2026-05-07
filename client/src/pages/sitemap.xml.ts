import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const DOMAIN = import.meta.env.PUBLIC_SITE_URL || 'https://peoplenstyle.com'
  const API    = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

  const staticPages = [
    { loc: '/',                              priority: '1.0',  changefreq: 'daily'   },
    { loc: '/products',                      priority: '0.95', changefreq: 'daily'   },
    { loc: '/rental-clothing-mysuru',        priority: '0.95', changefreq: 'weekly'  },
    { loc: '/rental-clothing-bangalore',     priority: '0.95', changefreq: 'weekly'  },
    { loc: '/rental-jewellery-mysuru',       priority: '0.90', changefreq: 'weekly'  },
    { loc: '/rental-jewellery-bangalore',    priority: '0.90', changefreq: 'weekly'  },
    { loc: '/makeup-services-mysuru',        priority: '0.90', changefreq: 'weekly'  },
    { loc: '/makeup-services-bangalore',     priority: '0.90', changefreq: 'weekly'  },
    { loc: '/photography-services-mysuru',   priority: '0.90', changefreq: 'weekly'  },
    { loc: '/photography-services-bangalore',priority: '0.90', changefreq: 'weekly'  },
    { loc: '/bridal-package-mysuru',         priority: '0.85', changefreq: 'weekly'  },
    { loc: '/bridal-package-bangalore',      priority: '0.85', changefreq: 'weekly'  },
    { loc: '/about',                         priority: '0.70', changefreq: 'monthly' },
    { loc: '/contact',                       priority: '0.70', changefreq: 'monthly' },
    { loc: '/faq',                           priority: '0.60', changefreq: 'monthly' },
  ]

  let productPages: { loc: string; lastmod: string }[] = []

  try {
    const res  = await fetch(`${API}/api/products`)
    const data = await res.json()
    const list: { _id: string; updatedAt?: string }[] = Array.isArray(data)
      ? data
      : data.products ?? []

    productPages = list.map((p) => ({
      loc:     `/product/${p._id}`,
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    }))
  } catch {
    // Silently skip product pages if API is unreachable during build
  }

  const rows = [
    ...staticPages.map(
      (p) => `  <url>
    <loc>${DOMAIN}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ),
    ...productPages.map(
      (p) => `  <url>
    <loc>${DOMAIN}${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
