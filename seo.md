# People & Style — Complete SEO Plan

**Business:** People & Style  
**Services:** Rental Clothing, Rental Jewellery, Makeup Services, Photography Services  
**Locations:** Mysuru & Bangalore, Karnataka, India  
**Website Stack:** React 19 + Vite (CSR) + Express + MongoDB  
**Goal:** Rank #1 on Google for all 4 service lines in both cities  

---

## Table of Contents

1. [Current Technical Audit](#1-current-technical-audit)
2. [Phase 1 — Technical SEO Fixes](#2-phase-1--technical-seo-fixes)
3. [Phase 2 — Site Structure & Landing Pages](#3-phase-2--site-structure--landing-pages)
4. [Phase 3 — Local SEO & Google Business Profile](#4-phase-3--local-seo--google-business-profile)
5. [Phase 4 — Citations & Directory Submissions](#5-phase-4--citations--directory-submissions)
6. [Phase 5 — Schema Markup](#6-phase-5--schema-markup)
7. [Phase 6 — Content & Blog Strategy](#7-phase-6--content--blog-strategy)
8. [Phase 7 — Link Building](#8-phase-7--link-building)
9. [Phase 8 — Reviews & Reputation](#9-phase-8--reviews--reputation)
10. [Phase 9 — Google Search Console Setup](#10-phase-9--google-search-console-setup)
11. [Keyword Master List](#11-keyword-master-list)
12. [6-Month Execution Roadmap](#12-6-month-execution-roadmap)
13. [Tracking & KPIs](#13-tracking--kpis)

---

## 1. Current Technical Audit

### What Is Already Done (Keep These)
- `index.html` has title, description, keywords, Open Graph, Twitter Card meta tags
- `robots.txt` present with correct allow/disallow rules
- `sitemap.xml` present (12 URLs)
- `react-helmet-async` installed and used on most pages
- `LocalBusiness` JSON-LD schema in `index.html`
- ImageKit CDN for image delivery
- Helmet.js security headers on Express server
- GZIP compression enabled on Express
- Rate limiting and mongo sanitization in place

### Critical Issues to Fix (Ordered by Impact)

| # | Issue | Impact | Effort |
|---|---|---|---|
| 1 | Client-Side Rendering — Google sees empty HTML on first crawl | Critical | Medium |
| 2 | Sitemap is static — product pages not included | High | Low |
| 3 | No dedicated pages per service (clothing, jewellery, makeup, photography) | High | Medium |
| 4 | No blog / content section | High | Low-Medium |
| 5 | Schema only has `ClothingStore` — missing BeautySalon, Photographer, JewelryStore | Medium | Low |
| 6 | Product pages may have missing or generic meta tags | Medium | Low |
| 7 | No dynamic canonical URLs on all pages | Medium | Low |
| 8 | Images may be missing descriptive alt text | Medium | Low |

---

## 2. Phase 1 — Technical SEO Fixes

### 2.1 Fix Client-Side Rendering with Prerendering

This is the most critical fix. React CSR apps show empty HTML to crawlers on first visit. Google does render JavaScript eventually ("second-wave indexing") but it delays indexing by days to weeks.

**Solution: Add `react-snap` for static HTML generation at build time.**

```bash
cd client
npm install --save-dev react-snap
```

Add to `client/package.json`:
```json
"scripts": {
  "postbuild": "react-snap"
},
"reactSnap": {
  "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
  "inlineCss": true,
  "minifyHtml": { "collapseWhitespace": true },
  "routes": [
    "/",
    "/products",
    "/about",
    "/contact",
    "/faq",
    "/rental-clothing-mysuru",
    "/rental-clothing-bangalore",
    "/rental-jewellery-mysuru",
    "/rental-jewellery-bangalore",
    "/makeup-services-mysuru",
    "/makeup-services-bangalore",
    "/photography-services-mysuru",
    "/photography-services-bangalore"
  ]
}
```

Update `client/src/main.jsx`:
```jsx
import { hydrateRoot, createRoot } from 'react-dom/client'

const rootEl = document.getElementById('root')
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, <App />)
} else {
  createRoot(rootEl).render(<App />)
}
```

### 2.2 Dynamic Sitemap via Express Backend

Replace the static `sitemap.xml` with a server-generated one that includes all product pages.

Create `server/routes/sitemap.js`:
```js
const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

const DOMAIN = 'https://peoplenstyle.com'

const staticUrls = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/products', priority: '0.95', changefreq: 'daily' },
  { loc: '/rental-clothing-mysuru', priority: '0.95', changefreq: 'weekly' },
  { loc: '/rental-clothing-bangalore', priority: '0.95', changefreq: 'weekly' },
  { loc: '/rental-jewellery-mysuru', priority: '0.90', changefreq: 'weekly' },
  { loc: '/rental-jewellery-bangalore', priority: '0.90', changefreq: 'weekly' },
  { loc: '/makeup-services-mysuru', priority: '0.90', changefreq: 'weekly' },
  { loc: '/makeup-services-bangalore', priority: '0.90', changefreq: 'weekly' },
  { loc: '/photography-services-mysuru', priority: '0.90', changefreq: 'weekly' },
  { loc: '/photography-services-bangalore', priority: '0.90', changefreq: 'weekly' },
  { loc: '/about', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
  { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
]

router.get('/sitemap.xml', async (req, res) => {
  const products = await Product.find({}, '_id slug updatedAt').lean()

  const productUrls = products.map(p => ({
    loc: `/product/${p.slug || p._id}`,
    lastmod: new Date(p.updatedAt).toISOString(),
    priority: '0.8',
    changefreq: 'weekly',
  }))

  const allUrls = [...staticUrls, ...productUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${DOMAIN}${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.header('Content-Type', 'application/xml')
  res.send(xml)
})

module.exports = router
```

Register in `server/server.js`:
```js
app.use('/', require('./routes/sitemap'))
```

### 2.3 Fix Product Page Meta Tags

Every product page at `/product/:id` must have unique meta tags. In `client/src/features/public/pages/ProductDetail.jsx`, ensure:

```jsx
<Helmet>
  <title>{product.name} on Rent in Mysuru & Bangalore | People & Style</title>
  <meta name="description" content={`Rent ${product.name} from People & Style. Available in Mysuru and Bangalore. Book online for your wedding or special occasion.`} />
  <meta property="og:title" content={`${product.name} | People & Style`} />
  <meta property="og:description" content={product.description?.slice(0, 160)} />
  <meta property="og:image" content={product.images?.[0]} />
  <meta property="og:url" content={`https://peoplenstyle.com/product/${product._id}`} />
  <link rel="canonical" href={`https://peoplenstyle.com/product/${product._id}`} />
</Helmet>
```

### 2.4 Image Alt Text Audit

Every `<img>` and ImageKit `<IKImage>` component must have a descriptive `alt` attribute:

- Bad: `alt=""` or `alt="image"`
- Good: `alt="Red bridal lehenga on rent in Mysuru — People & Style"`
- Format: `[product name] [category] [city] — People & Style`

### 2.5 Add Canonical URLs to All Pages

Every page using `<Helmet>` must include:
```jsx
<link rel="canonical" href="https://peoplenstyle.com/EXACT-PAGE-URL" />
```

This prevents duplicate content issues (e.g., URL parameters creating duplicate pages).

### 2.6 Core Web Vitals Fixes

Run Google PageSpeed Insights on your homepage. Target 90+ on mobile. Key fixes:

**LCP (Largest Contentful Paint) — target < 2.5s**
- Add `fetchpriority="high"` to the hero image tag
- Preload the hero image: `<link rel="preload" as="image" href="hero.jpg">`
- Use ImageKit with `?tr=f-auto,q-80` on all images (auto WebP/AVIF format)

**CLS (Cumulative Layout Shift) — target < 0.1**
- Add fixed aspect ratio wrappers for all images: `aspect-ratio: 3/4`
- Reserve space for skeleton loaders (you already have skeletons — make sure dimensions match)

**INP (Interaction to Next Paint) — target < 200ms**
- All routes are already lazy-loaded — keep this
- Avoid heavy computations on scroll events

---

## 3. Phase 2 — Site Structure & Landing Pages

### 3.1 New URL Structure

Add 8 dedicated service landing pages (4 services × 2 cities):

```
/rental-clothing-mysuru
/rental-clothing-bangalore
/rental-jewellery-mysuru
/rental-jewellery-bangalore
/makeup-services-mysuru
/makeup-services-bangalore
/photography-services-mysuru
/photography-services-bangalore
```

Plus one "complete package" page:
```
/bridal-package-mysuru
/bridal-package-bangalore
```

### 3.2 What Each Landing Page Must Have

Each service + city page needs:

1. **H1** with exact keyword: `Bridal Jewellery on Rent in Mysuru`
2. **200-300 word intro** describing the service in Mysuru/Bangalore specifically
3. **Service highlights** (3-6 bullet points)
4. **Price range** (even approximate — "starting from ₹500")
5. **Photo gallery** of actual inventory/work
6. **FAQ section** (5-7 questions, triggers FAQ rich results)
7. **CTA button**: "Book Now" / "View Collection" / "Contact Us"
8. **Schema markup** (service-specific, see Phase 5)
9. **Internal links** to related pages (e.g., makeup page links to clothing page)
10. **Helmet meta tags** with page-specific title, description, canonical URL

### 3.3 Add Routes in App.jsx

```jsx
<Route path="/rental-clothing-mysuru" element={<RentalClothingMysuru />} />
<Route path="/rental-clothing-bangalore" element={<RentalClothingBangalore />} />
<Route path="/rental-jewellery-mysuru" element={<RentalJewelleryMysuru />} />
<Route path="/rental-jewellery-bangalore" element={<RentalJewelleryBangalore />} />
<Route path="/makeup-services-mysuru" element={<MakeupServicesMysuru />} />
<Route path="/makeup-services-bangalore" element={<MakeupServicesBangalore />} />
<Route path="/photography-services-mysuru" element={<PhotographyServicesMysuru />} />
<Route path="/photography-services-bangalore" element={<PhotographyServicesBangalore />} />
<Route path="/bridal-package-mysuru" element={<BridalPackageMysuru />} />
<Route path="/bridal-package-bangalore" element={<BridalPackageBangalore />} />
```

### 3.4 Internal Linking Structure

```
Homepage
├── /rental-clothing-mysuru ──────────── /rental-clothing-bangalore
├── /rental-jewellery-mysuru ─────────── /rental-jewellery-bangalore
├── /makeup-services-mysuru ──────────── /makeup-services-bangalore
├── /photography-services-mysuru ─────── /photography-services-bangalore
├── /bridal-package-mysuru ───────────── /bridal-package-bangalore
└── /products (individual product pages)
```

Each service page links to:
- The same service in the other city
- The bridal package page
- `/products` filtered by that category
- `/contact` with a pre-filled inquiry context

### 3.5 Footer Updates

Add all service pages to footer navigation so Google can discover them on every crawl:

```
Services
├── Rental Clothing — Mysuru
├── Rental Clothing — Bangalore
├── Rental Jewellery — Mysuru
├── Rental Jewellery — Bangalore
├── Makeup Services — Mysuru
├── Makeup Services — Bangalore
├── Photography — Mysuru
└── Photography — Bangalore
```

---

## 4. Phase 3 — Local SEO & Google Business Profile

Local SEO is the highest ROI activity for a business like this. Google Maps rankings appear above organic results.

### 4.1 Create/Claim Google Business Profiles

Create **2 separate GBP listings** — one per city:

**Listing 1: People & Style Mysuru**
**Listing 2: People & Style Bangalore**

For each listing, complete every field:

**Categories:**
- Primary: `Clothing Rental Service`
- Additional (up to 9):
  - `Bridal Shop`
  - `Jewelry Store`
  - `Beauty Salon`
  - `Wedding Photographer`
  - `Costume Jewelry Store`
  - `Wedding Service`
  - `Formal Wear Store`

**Services section** (add each individually with description + price range):
- Bridal Lehenga Rental — "Premium designer bridal lehengas available on rent..."
- Bridal Jewellery Rental — "Complete bridal jewellery sets on rent..."
- Bridal Makeup — "Professional bridal makeup by certified artists..."
- Wedding Photography — "Candid and traditional wedding photography..."
- Sherwani Rental
- Wedding Gown Rental
- Pre-Wedding Shoot

**Photos to upload (minimum 25 per listing):**
- Interior of shop
- Exterior / storefront with sign visible
- Each major product category (lehengas, sherwanis, jewellery sets)
- Before/after makeup photos
- Wedding photography portfolio shots
- Team photos
- Logo

**GBP Posts (post weekly):**
- New arrivals
- Seasonal offers (wedding season, festival season)
- Customer photos (with permission)
- Behind-the-scenes

### 4.2 Apple Maps & Bing Places

These are often ignored but still drive traffic:

- **Bing Places**: `bingplaces.com` — mirror your GBP data exactly
- **Apple Maps Connect**: `mapsconnect.apple.com` — important for iPhone users
- **Google Maps embed** on your Contact page (signals legitimacy)

---

## 5. Phase 4 — Citations & Directory Submissions

A citation = your business NAP (Name, Address, Phone) listed on another website.

**NAP to use consistently everywhere:**
```
Name:    People & Style
Address: [Exact address — Mysuru]
Phone:   [Primary number]
Website: https://peoplenstyle.com
```

Create a spreadsheet to track all submissions with columns:
`Directory | URL | Date Submitted | Login Email | Status | Notes`

### 5.1 General India Directories

| Directory | URL | Priority |
|---|---|---|
| Justdial | justdial.com/jdmart | High |
| Sulekha | sulekha.com | High |
| Indiamart | indiamart.com | High |
| IndiaBizList | indiabizlist.com | Medium |
| TradeIndia | tradeindia.com | Medium |
| ExportersIndia | exportersindia.com | Low |
| YellowPages India | yellowpages.co.in | Medium |
| AskLaila | asklaila.com | Medium |

### 5.2 Wedding-Specific Directories (Highest Value)

| Directory | URL | Services |
|---|---|---|
| WedMeGood | wedmegood.com | All 4 — create separate vendor profiles |
| WeddingWire India | weddingwire.in | All 4 |
| ShaadiSaga | shaadisaga.com | All 4 |
| WeddingBazaar | weddingbazaar.com | Clothing + Jewellery |
| BridalAffair | bridalaffair.in | All 4 |
| Shaadi.com Vendors | shaadi.com | Clothing + Makeup |
| WedAbout | wedabout.com | Photography + Makeup |

> On WedMeGood and WeddingWire, create a complete vendor profile with portfolio photos, pricing, and reviews. These rank on their own and send you direct leads.

### 5.3 Photography-Specific Directories

| Directory | URL |
|---|---|
| WedShoots | wedshoots.com |
| Candidsnap | candidsnap.com |
| PixPa Directory | pixpa.com/directory |
| OneWed | onewed.com |

### 5.4 Makeup-Specific Directories

| Directory | URL |
|---|---|
| Makeupwale | makeupwale.com |
| Beautiguide | beautiguide.in |
| Nykaa Salons | nykaasalon.com |
| UrbanClap (Urban Company) | urbancompany.com |

> Urban Company listing is very high value — it has strong domain authority and ranks for "makeup artist near me" in both cities.

### 5.5 Jewellery Directories

| Directory | URL |
|---|---|
| Meesho (as vendor) | meesho.com |
| Kraftly | kraftly.com |
| GemPages | gempages.net |

### 5.6 Karnataka/Local Directories

| Directory | URL |
|---|---|
| MysoreHub | mysorehub.com |
| MysoreInfoTech | mysore.co.in |
| Bangalore Pages | bangalorepages.com |

---

## 6. Phase 5 — Schema Markup

Schema markup = structured data that Google reads to generate rich results (star ratings, FAQ dropdowns, business info panels). You already have `LocalBusiness` schema. Extend it per service page.

### 6.1 Clothing Rental Pages

```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ClothingStore"],
  "name": "People & Style — Bridal Clothing Rental Mysuru",
  "description": "Premium bridal lehenga, wedding gown, and traditional wear on rent in Mysuru.",
  "url": "https://peoplenstyle.com/rental-clothing-mysuru",
  "telephone": "+91-XXXXXXXXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "YOUR ADDRESS",
    "addressLocality": "Mysuru",
    "addressRegion": "Karnataka",
    "postalCode": "XXXXXX",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "12.2958",
    "longitude": "76.6394"
  },
  "openingHoursSpecification": [...],
  "priceRange": "₹₹",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Bridal Clothing Rental",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Bridal Lehenga Rental" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Wedding Gown Rental" }},
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sherwani Rental" }}
    ]
  }
}
```

### 6.2 Jewellery Rental Pages

```json
{
  "@type": ["LocalBusiness", "JewelryStore"],
  "name": "People & Style — Bridal Jewellery Rental Mysuru",
  "description": "Bridal jewellery sets, temple jewellery, and gold-finish jewellery on rent in Mysuru.",
  ...
}
```

### 6.3 Makeup Service Pages

```json
{
  "@type": ["LocalBusiness", "BeautySalon"],
  "name": "People & Style — Bridal Makeup Mysuru",
  "description": "Professional bridal makeup artists in Mysuru. HD, airbrush, and traditional makeup services.",
  ...
}
```

### 6.4 Photography Pages

```json
{
  "@type": ["LocalBusiness", "Photographer"],
  "name": "People & Style — Wedding Photography Mysuru",
  "description": "Candid and traditional wedding photography in Mysuru and Bangalore.",
  ...
}
```

### 6.5 FAQPage Schema (Add to Every Service Page)

FAQ schema creates expandable Q&A dropdowns directly in Google search results:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does bridal jewellery rental cost in Mysuru?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bridal jewellery rental at People & Style starts from ₹XXX for a full set. Prices vary based on the design and duration of rental."
      }
    },
    {
      "@type": "Question",
      "name": "How far in advance should I book bridal jewellery rental?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend booking at least 2-4 weeks in advance, especially during wedding season (October to February)."
      }
    }
  ]
}
```

### 6.6 Product Schema for Individual Product Pages

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Red Banarasi Bridal Lehenga",
  "description": "Heavy embroidered red Banarasi bridal lehenga available on rent...",
  "image": ["https://ik.imagekit.io/.../product.jpg"],
  "brand": { "@type": "Brand", "name": "People & Style" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": "1500",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "referenceQuantity": { "@type": "QuantitativeValue", "value": "1", "unitCode": "DAY" }
    },
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "People & Style" }
  }
}
```

---

## 7. Phase 6 — Content & Blog Strategy

### 7.1 Blog Platform Setup

**Recommended: Ghost on a subdomain**

- URL: `blog.peoplenstyle.com`
- Ghost is server-rendered (Google indexes it perfectly, unlike React CSR)
- Free, self-hostable on a ₹400/month VPS (DigitalOcean, Hetzner)
- Alternative: Hashnode (free, hosted, fast to set up)
- Every blog post must link back to the relevant service page on the main site

**Do not blog inside the React app** unless you add prerendering for those routes.

### 7.2 Blog Post Template (Use for Every Post)

```
Title: [Primary keyword] — [secondary descriptor] (2025 guide)
URL:   /your-primary-keyword-mysuru
H1:    Same as title

Intro paragraph (100-150 words): Answer the search intent directly.
  Include keyword in first 100 words.

Section 1: [Subtopic 1 — use H2]
Section 2: [Subtopic 2 — use H2]  
Section 3: [Subtopic 3 — use H2]
Section 4: Pricing / What to Expect (always include)
Section 5: Why Choose People & Style (with internal link)

FAQ Section (5-7 questions using H3):
  - Include common "People also ask" questions from Google
  - Add FAQPage schema to this section

CTA: "Book Now" / "View Our Collection" linking to service page

Images:
  - Minimum 3 real photos from your inventory/portfolio
  - Alt text on every image
  - At least 1 photo with your branding visible
```

### 7.3 Content Calendar — 6 Months

**Month 1 — Rental Clothing (Foundation)**

| Week | Title | Target Keyword |
|---|---|---|
| 1 | Bridal Lehenga on Rent in Mysuru — Complete 2025 Guide | bridal lehenga on rent in Mysuru |
| 2 | Wedding Gown Rental in Bangalore — What to Expect | wedding gown rental Bangalore |
| 3 | Top 5 Benefits of Renting Bridal Wear Instead of Buying | renting vs buying bridal wear India |
| 4 | Sherwani Rental in Mysuru — Styles, Prices, How to Book | sherwani on rent Mysuru |

**Month 2 — Rental Jewellery (Low Competition — Fast Wins)**

| Week | Title | Target Keyword |
|---|---|---|
| 5 | Bridal Jewellery on Rent in Mysuru — Full Price Guide | bridal jewellery on rent Mysuru |
| 6 | Temple Jewellery Rental for South Indian Weddings | temple jewellery on rent Mysuru |
| 7 | How to Choose Rental Jewellery for Your Bridal Lehenga | bridal jewellery rental guide |
| 8 | Gold Jewellery vs Rental Jewellery — Honest Comparison 2025 | gold jewellery vs rental jewellery India |

**Month 3 — Makeup Services**

| Week | Title | Target Keyword |
|---|---|---|
| 9 | Best Bridal Makeup Artists in Mysuru (2025 Honest Review) | bridal makeup artist Mysuru |
| 10 | HD vs Airbrush Bridal Makeup — Which Is Right for You? | HD vs airbrush bridal makeup |
| 11 | Bridal Makeup Price Guide in Mysuru and Bangalore (2025) | bridal makeup price Mysuru |
| 12 | How to Prepare Your Skin Before Bridal Makeup | bridal skin prep tips |

**Month 4 — Photography Services**

| Week | Title | Target Keyword |
|---|---|---|
| 13 | Best Pre-Wedding Shoot Locations in Mysuru | pre wedding shoot locations Mysuru |
| 14 | Candid vs Traditional Wedding Photography — Which to Choose | candid vs traditional wedding photography |
| 15 | Wedding Photography Price List in Mysuru 2025 | wedding photography price Mysuru |
| 16 | How to Choose a Wedding Photographer in Bangalore | wedding photographer Bangalore |

**Month 5 — Combo / Local Authority**

| Week | Title | Target Keyword |
|---|---|---|
| 17 | Complete Bridal Package in Mysuru — Outfit + Jewellery + Makeup + Photos | complete bridal package Mysuru |
| 18 | South Indian Wedding Checklist — Clothing, Jewellery, Makeup, Photos | south Indian wedding checklist |
| 19 | Best Wedding Vendors in Mysuru 2025 — Complete Guide | wedding vendors Mysuru |
| 20 | Karnataka Bridal Traditions — What to Wear and Why | Karnataka bridal traditions |

**Month 6 — Seasonal & Long-Tail**

| Week | Title | Target Keyword |
|---|---|---|
| 21 | Wedding Season 2025-26 in Mysuru — Book Your Bridal Package Early | wedding season Mysuru 2025 |
| 22 | Bridesmaid Dress Rental in Bangalore — A Practical Guide | bridesmaid dress rental Bangalore |
| 23 | Rent vs Buy Bridal Jewellery in India — What Makes Sense Financially | rent vs buy bridal jewellery |
| 24 | Dasara Wedding Season in Mysuru — Bridal Packages and Offers | Dasara wedding Mysuru |

### 7.4 Blog Writing Rules

- Minimum 900 words per post (1200-1500 is ideal)
- Include real product photos — not stock images
- Answer "People Also Ask" questions visible in Google for that keyword
- Link to relevant service page on main site in every post
- Add FAQPage schema at the bottom of every post
- Post consistently — Google rewards consistency

---

## 8. Phase 7 — Link Building

Links from other websites signal authority to Google. Focus on relevant, local, high-quality links.

### 8.1 Partnership Links (Easiest Wins)

Reach out to complementary wedding vendors:

- **Wedding photographers** (if you're not competing): "Mention us on your vendors page, we'll send referrals"
- **Wedding planners in Mysuru/Bangalore**: Cross-referral arrangement
- **Bridal makeup artists** (other than your own): Guest collab
- **Wedding venues**: Ask to be listed on their "Preferred Vendors" page
- **Wedding caterers**: Mutual referral blogs

Email template:
```
Subject: Collaboration opportunity — People & Style + [Their Business]

Hi [Name],

I run People & Style, a bridal rental and services studio in Mysuru. 
We offer bridal clothing rental, jewellery rental, makeup, and photography.

We work with many brides who also need [their service]. I'd love to 
explore a referral arrangement and a mutual mention on each other's websites.

Would you be open to a quick 15-minute call?

Warm regards,
[Your name]
People & Style
```

### 8.2 Press & PR Links

- **Deccan Herald** (Mysuru edition): Send a press release for new collection launches, Dasara special offers, or a human-interest story about the business
- **Star of Mysore**: Local news, very high local SEO value
- **Times of India Bengaluru**: Bangalore edition lifestyle section
- **Femina India / Brides Today**: Pitch a "renting vs buying" trend article featuring your business

### 8.3 Guest Posts

Write articles for wedding blogs as a contributor:

- WedMeGood blog
- WeddingWire India blog
- Frugal2Fab blog
- Shaadi Vibes

Pitch angle: "The complete guide to bridal jewellery rental in India" — you are the expert, they get content, you get a backlink.

### 8.4 Educational/Resource Links

- Create a "Bridal Rental Guide PDF" and submit it to wedding planning resources
- Add your business to `Karnataka tourism` vendor lists if applicable
- Submit to Mysuru city directories maintained by local civic bodies

### 8.5 Social Signals (Not direct ranking factor, but drives links)

- Instagram: Post consistently — your target audience is on Instagram
- Pinterest: Wedding content performs extremely well; each pin links back to your site
- YouTube: Behind-the-scenes videos of styling sessions, before/after makeup, photo shoots — embed these on your blog posts

---

## 9. Phase 8 — Reviews & Reputation

For service businesses, Google reviews are a direct local ranking factor.

### 9.1 Review Collection Process

1. Create a short review link: `g.page/peoplenstyle/review` (from GBP dashboard)
2. After every booking, send a WhatsApp message:
   ```
   Thank you for choosing People & Style! 🙏
   We'd love to hear your feedback. It only takes 2 minutes:
   [YOUR GOOGLE REVIEW LINK]
   ```
3. If they don't respond in 3 days, send one follow-up
4. Respond to **every** review within 24 hours (Google rewards this)

### 9.2 Review Targets

| Milestone | Target |
|---|---|
| Month 1 | 10 reviews on each GBP listing |
| Month 3 | 30 reviews mentioning specific services |
| Month 6 | 50+ reviews, 4.7+ star average |

### 9.3 Review Content to Encourage

Ask customers to mention:
- The specific service they used ("bridal lehenga rental", "bridal makeup", "wedding photography")
- The city ("in Mysuru", "Bangalore")
- Specific positive details (made it easy, great variety, affordable)

Do NOT incentivize reviews or write fake reviews — Google penalizes this.

### 9.4 Negative Reviews

- Always respond calmly and professionally
- Offer to resolve offline
- Never argue or get defensive

---

## 10. Phase 9 — Google Search Console Setup

### 10.1 Initial Setup

1. Go to `search.google.com/search-console`
2. Add property: `https://peoplenstyle.com`
3. Verify via HTML file method (upload to `client/public/`)
4. Submit sitemap: `https://peoplenstyle.com/sitemap.xml`

### 10.2 Weekly Actions in Search Console

| Action | Why |
|---|---|
| Check Coverage report | Find pages with indexing errors |
| URL Inspection on new pages | Force-crawl new service pages |
| Review Performance report | Find keywords you're ranking for (positions 4-20 are easy wins to move up) |
| Monitor Core Web Vitals | Fix any pages flagged as "Poor" |

### 10.3 URL Inspection — Force Index New Pages

After creating each new service page, use URL Inspection → Request Indexing. Do this for:
- All 8 service landing pages
- Bridal package pages
- Every new blog post

### 10.4 Quick Wins from Search Console

After 30 days of data, look for:
- Keywords where you rank position 5-15 — optimize those pages further to jump to top 3
- Keywords with high impressions but low clicks — improve the meta title/description
- Pages with 0 impressions — check if they're indexed; fix if not

---

## 11. Keyword Master List

### Rental Clothing

**Mysuru**
- bridal lehenga on rent in Mysuru
- bridal wear on rent Mysuru
- wedding gown rental Mysuru
- sherwani on rent Mysuru
- bridesmaid dress rental Mysuru
- bridal saree on rent Mysuru
- designer lehenga rental Mysuru
- silk saree on rent Mysuru
- Indo-western bridal wear rental Mysuru
- reception dress rental Mysuru
- lehenga rent price Mysuru

**Bangalore**
- bridal lehenga on rent Bangalore
- wedding gown rental Bangalore
- sherwani rental Bangalore
- bridal dress rent near me Bangalore
- designer lehenga on rent Bangalore
- bridesmaid outfit rental Bangalore

**Generic India (lower competition)**
- bridal wear rental Karnataka
- lehenga on rent for wedding
- rent bridal outfit India

### Rental Jewellery

**Mysuru**
- bridal jewellery on rent in Mysuru
- wedding jewellery rental Mysuru
- temple jewellery on rent Mysuru
- gold jewellery rental Mysuru
- artificial bridal jewellery rental Mysuru
- necklace set on rent Mysuru
- bridal jewellery set rental Mysuru

**Bangalore**
- bridal jewellery on rent Bangalore
- wedding jewellery rental Bangalore
- temple jewellery rental Bangalore

**Generic**
- bridal jewellery rental Karnataka
- rent bridal jewellery India

### Makeup Services

**Mysuru**
- bridal makeup artist in Mysuru
- best bridal makeup Mysuru
- airbrush bridal makeup Mysuru
- HD makeup artist Mysuru
- engagement makeup Mysuru
- party makeup artist Mysuru
- professional makeup artist Mysuru

**Bangalore**
- bridal makeup artist Bangalore
- best makeup artist for wedding Bangalore
- HD bridal makeup Bangalore

### Photography Services

**Mysuru**
- wedding photographer in Mysuru
- candid wedding photography Mysuru
- pre wedding shoot Mysuru
- best photographer for wedding Mysuru
- wedding videography Mysuru
- pre wedding photoshoot locations Mysuru
- affordable wedding photographer Mysuru

**Bangalore**
- wedding photographer Bangalore
- candid photographer Bangalore
- pre wedding shoot Bangalore

### Bridal Package (Zero Competition)

- complete bridal package Mysuru
- one-stop bridal services Mysuru
- bridal package outfit jewellery makeup photography Mysuru
- all-inclusive bridal package Bangalore
- bridal studio Mysuru

---

## 12. 6-Month Execution Roadmap

### Month 1 — Foundation (Technical + Local)

**Week 1**
- [x] Prerendering — migrated to Astro (static HTML heads, SSR product pages)
- [x] Create dynamic sitemap — Astro endpoint at /sitemap.xml (fetches all products from API)
- [ ] Set up Google Search Console and submit sitemap

**Week 2**
- [ ] Create/claim Google Business Profile (Mysuru)
- [ ] Create/claim Google Business Profile (Bangalore)
- [ ] Upload 25+ photos to each GBP
- [ ] Fill in all GBP fields (hours, services, description, categories)

**Week 3**
- [ ] Build rental-clothing-mysuru landing page
- [ ] Build rental-clothing-bangalore landing page
- [ ] Add schema markup for clothing pages
- [ ] Submit to Justdial, Sulekha, Indiamart

**Week 4**
- [x] Fix product page meta tags — Astro SSR product/[id].astro fetches real data
- [x] Add alt text to all image components — 4 files fixed
- [x] Add canonical URLs to all pages — done in all Astro page heads
- [ ] Submit to WedMeGood, WeddingWire India
- [ ] Publish Month 1 Blog Post 1

### Month 2 — Jewellery + Blog Launch

- [ ] Build rental-jewellery-mysuru landing page
- [ ] Build rental-jewellery-bangalore landing page
- [ ] Add jewellery schema markup
- [ ] Submit to jewellery and wedding directories (ShaadiSaga, WeddingBazaar)
- [ ] Set up Ghost/Hashnode blog at blog.peoplenstyle.com
- [ ] Publish 4 blog posts (clothing focus)
- [ ] Start review collection process
- [ ] Run PageSpeed Insights — fix top 3 Core Web Vitals issues
- [ ] Submit to Bing Places and Apple Maps

### Month 3 — Makeup + Reviews

- [ ] Build makeup-services-mysuru landing page
- [ ] Build makeup-services-bangalore landing page
- [ ] Add BeautySalon schema markup
- [ ] Submit to Urban Company, Makeupwale, Beautiguide
- [ ] Reach 20 Google reviews on each GBP listing
- [ ] Publish 4 jewellery blog posts
- [ ] Begin outreach to wedding photographers for partnership links
- [ ] URL Inspection all service pages in Search Console

### Month 4 — Photography + Link Building

- [ ] Build photography-services-mysuru landing page
- [ ] Build photography-services-bangalore landing page
- [ ] Add Photographer schema markup
- [ ] Submit to WedShoots, Candidsnap, PixPa
- [ ] Publish 4 makeup blog posts
- [ ] Send 10 guest post pitches to wedding blogs
- [ ] Reach 30 Google reviews on each GBP listing
- [ ] Review Search Console for quick wins (positions 5-15)

### Month 5 — Bridal Package + Authority

- [ ] Build bridal-package-mysuru landing page
- [ ] Build bridal-package-bangalore landing page
- [ ] Publish 4 photography blog posts
- [ ] Publish combo/package blog posts
- [ ] Press release to Deccan Herald, Star of Mysore
- [ ] Reach 40 reviews on each GBP listing
- [ ] Audit all internal links

### Month 6 — Optimize & Scale

- [ ] Review all rankings in Search Console
- [ ] Double down on top-performing service line
- [ ] Publish 4 seasonal blog posts
- [ ] Update top-performing blog posts with fresh data
- [ ] Add `aggregateRating` schema using collected review data
- [ ] Audit citations — fix any NAP inconsistencies
- [ ] Reach 50+ reviews on each GBP listing
- [ ] Review Core Web Vitals report — fix remaining issues

---

## 13. Tracking & KPIs

### Tools to Use (All Free)

| Tool | Purpose |
|---|---|
| Google Search Console | Impressions, clicks, rankings, indexing |
| Google Analytics 4 | Traffic, conversions, bounce rate |
| Google PageSpeed Insights | Core Web Vitals per page |
| Google Business Profile Insights | GBP views, clicks, calls, direction requests |
| Ubersuggest (free tier) | Keyword rank tracking |

### Monthly KPIs to Track

| Metric | Month 1 Target | Month 3 Target | Month 6 Target |
|---|---|---|---|
| Pages indexed | 20+ | 50+ | 100+ |
| Google reviews (per GBP) | 10 | 30 | 50+ |
| Organic clicks/month | Baseline | 2x baseline | 5x baseline |
| Keywords in top 10 | 5 | 20 | 50+ |
| GBP profile views/month | Baseline | 500+ | 2000+ |
| Blog posts published | 4 | 12 | 24 |
| Citations submitted | 10 | 25 | 40 |

### Ranking Milestones

| Keyword | Realistic Timeline |
|---|---|
| "bridal jewellery on rent Mysuru" | 6-10 weeks (very low competition) |
| "complete bridal package Mysuru" | 4-8 weeks (near zero competition) |
| "bridal makeup artist Mysuru" | 8-16 weeks |
| "bridal lehenga on rent Mysuru" | 12-20 weeks |
| "wedding photographer Mysuru" | 16-24 weeks (more competitive) |
| "bridal wear on rent Bangalore" | 20-30 weeks (more competitive market) |

---

## Priority Order Summary

1. **Prerendering** — without this, all other SEO work is partially wasted
2. **Google Business Profile** — highest ROI for local searches
3. **Service landing pages** — 8 dedicated pages = 8 keyword clusters
4. **Dynamic sitemap** — ensures all pages are indexed
5. **Citations** — NAP consistency across 25+ directories
6. **Schema markup** — per-service structured data
7. **Blog** — 24 posts over 6 months, low-competition keywords first
8. **Reviews** — 50+ per GBP listing, mention specific services
9. **Link building** — partnerships, press, guest posts
10. **Search Console optimization** — weekly monitoring, fix issues fast

---

*Last updated: May 2026 | Business: People & Style | Mysuru & Bangalore, Karnataka, India*
