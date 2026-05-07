# Client — File Structure & Architecture Guide

> **Stack:** Astro 5 + React 19 + Tailwind CSS v4 + Firebase Auth + React Query  
> **Hosted on:** Vercel (SSR mode)  
> **Last updated:** May 2026

---

## How It Works (Big Picture)

Before this migration the app was a pure React SPA (Vite). Google saw an empty HTML page because all content was rendered by JavaScript in the browser.

Now it is **Astro with React Islands**:

1. **Astro** generates the HTML `<head>` with all SEO meta tags on the server before sending anything to the browser. Google reads this immediately.
2. **React** runs only inside the `<body>` as a "client island" (`client:only="react"`). All your existing React code — routing, state, API calls — works exactly as before, zero changes.
3. Product pages (`/product/[id]`) are **server-rendered** — Astro fetches real product data on the server and puts the product name, description and image into the `<head>` before delivery.
4. Static pages (about, FAQ, login, etc.) are **pre-rendered** at build time — they become plain HTML files, the fastest possible delivery.

```
Browser requests /product/123
        │
        ▼
   Vercel (SSR)
        │
        ▼
  Astro runs product/[id].astro
  → fetches product from API
  → builds full HTML page with <head> tags
        │
        ▼
  Sends complete HTML to browser
  Google reads <title>, <meta>, JSON-LD ✓
        │
        ▼
  React hydrates inside <body>
  → full interactive app loads
```

---

## Root Level Files

```
client/
├── astro.config.mjs        ← Astro configuration (replaces vite.config.js)
├── package.json            ← Dependencies and scripts
├── eslint.config.js        ← Linting rules
├── index.html              ← Legacy file, ignored by Astro (kept for reference)
├── vite.config.js.bak      ← Old Vite config (renamed so Astro doesn't pick it up)
├── vercel.json             ← Vercel deployment settings
└── .env                    ← Environment variables (never commit this)
```

### `astro.config.mjs` — The Heart of the Setup

```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

export default defineConfig({
  integrations: [react()],   // enables React components inside Astro
  output: 'server',          // SSR mode — pages run on the server per request
  adapter: vercel(),         // deploys to Vercel as serverless functions
  vite: {
    envPrefix: ['VITE_', 'PUBLIC_'],  // exposes VITE_* vars to client JS bundles
    plugins: [tailwindcss()],
  },
})
```

**Why `envPrefix`?** Astro in SSR mode only exposes `PUBLIC_` prefixed vars to client bundles by default. Adding `VITE_` here is what makes `VITE_FIREBASE_API_KEY` and other Firebase vars available inside React components.

### `.env` Variables Needed

```
VITE_API_URL=https://your-api.vercel.app
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_IMAGEKIT_URL=https://ik.imagekit.io/kayivtq3l
PUBLIC_SITE_URL=https://peoplenstyle.com
```

---

## `src/` — All Application Code

```
src/
├── env.d.ts               ← TypeScript type declarations for Astro
├── index.css              ← Global styles (Tailwind v4 + custom classes)
├── main.jsx               ← React entry point (used by ReactApp.jsx)
├── App.jsx                ← React Router + all route definitions
│
├── layouts/
│   └── BaseLayout.astro   ← HTML shell with <head> SEO tags
│
├── components/
│   └── ReactApp.jsx       ← Wraps the entire React app as an Astro island
│
├── pages/                 ← Astro pages (URL routing lives here)
│
├── features/              ← All React UI code (components + pages)
├── services/              ← API call functions
├── config/                ← Firebase setup
├── context/               ← React context (auth state)
├── data/                  ← Static data files
└── utils/                 ← Small helper components
```

---

## `src/layouts/`

### `BaseLayout.astro` — The HTML Shell

Every Astro page uses this. It generates the full `<html>` document with a complete `<head>`.

**Props it accepts:**

| Prop | What it does | Default |
|---|---|---|
| `title` | `<title>` tag | "People & Style" |
| `description` | `<meta name="description">` | General business description |
| `canonical` | `<link rel="canonical">` | Current page URL |
| `ogImage` | Open Graph image (shows in WhatsApp/Facebook previews) | Logo |
| `ogType` | `website` or `product` | `website` |
| `keywords` | `<meta name="keywords">` | — |
| `schema` | JSON-LD structured data (string) | LocalBusiness schema |

**What it always includes:**
- All Open Graph tags (Facebook, WhatsApp previews)
- Twitter Card tags
- `<link rel="canonical">` to prevent duplicate content
- Default `LocalBusiness` JSON-LD schema covering all 4 services
- Google Fonts preconnect
- The React app as a `client:only="react"` island

---

## `src/components/`

### `ReactApp.jsx` — The React Island

This is the bridge between Astro and React. It wraps every provider that your React app needs.

```jsx
export default function ReactApp() {
  return (
    <StrictMode>
      <IKContext urlEndpoint="https://ik.imagekit.io/kayivtq3l">   // ImageKit
        <HelmetProvider>                                             // react-helmet
          <QueryClientProvider client={queryClient}>               // React Query
            <App />                                                 // your entire app
          </QueryClientProvider>
        </HelmetProvider>
      </IKContext>
    </StrictMode>
  )
}
```

In `BaseLayout.astro` it is mounted as:
```astro
<ReactApp client:only="react" />
```

`client:only="react"` means: **skip server rendering entirely, render only in the browser**. This is correct because the React app uses `window`, `localStorage`, Firebase — none of which exist on a server.

---

## `src/pages/` — URL Routing (Astro Layer)

Astro uses **file-based routing** — every file here becomes a URL. This is where SEO happens.

```
pages/
├── index.astro                          → /
├── about.astro                          → /about
├── contact.astro                        → /contact
├── faq.astro                            → /faq
├── login.astro                          → /login
├── signup.astro                         → /signup
├── forgot-password.astro                → /forgot-password
├── favorites.astro                      → /favorites
├── products.astro                       → /products
├── terms.astro                          → /terms
├── privacy.astro                        → /privacy
├── refund.astro                         → /refund
├── 404.astro                            → shown for any unknown URL
├── sitemap.xml.ts                       → /sitemap.xml  (dynamic, includes all products)
│
├── products/
│   └── [category].astro                 → /products/lehenga, /products/jewels, etc.
│
├── product/
│   └── [id].astro                       → /product/abc123  (SSR, fetches real product data)
│
├── [uid]/
│   └── profile.astro                    → /user123/profile
│
├── payment/status/
│   └── [merchantOrderId].astro          → /payment/status/ORDER_456
│
├── admin/
│   └── [...slug].astro                  → /admin, /admin/products, /admin/orders, etc.
│
└── superadmin/
    └── [...slug].astro                  → /superadmin, /superadmin/stores, etc.
```

### Page Types

**Pre-rendered (static HTML at build time)** — fastest, Google indexes immediately:
```
about, contact, faq, login, signup, forgot-password,
favorites, products, terms, privacy, refund, 404
```
These have `export const prerender = true` at the top.

**Server-rendered (runs on Vercel per request)** — needed for dynamic data:
```
product/[id].astro        — fetches product name/image from API for accurate meta tags
products/[category].astro — category-specific meta tags
[uid]/profile.astro       — user-specific page
payment/status/[...]      — order status page
admin/[...slug].astro     — admin panel (all sub-routes)
superadmin/[...slug].astro
```

### How React Router and Astro Coexist

Astro handles the outer URL routing (serving the right HTML page). React Router runs **inside** the page after hydration and handles sub-navigation without page reloads.

Example flow for `/product/abc123`:
1. Astro matches `product/[id].astro`, runs server-side, builds SEO `<head>`
2. Sends full HTML to browser
3. React hydrates, `BrowserRouter` reads `window.location.pathname` = `/product/abc123`
4. React Router matches `<Route path="/product/:id">` → renders `ProductDetail.jsx`

For admin routes like `/admin/products`:
1. Astro matches `admin/[...slug].astro` (the `...slug` catches everything after `/admin/`)
2. Sends the HTML shell (no SSR data needed for admin)
3. React hydrates, React Router matches `/admin/products` → renders `ProductsAdmin.jsx`

### `sitemap.xml.ts` — Dynamic Sitemap

An Astro API endpoint (not a page). Returns XML instead of HTML.

- Lists all 15 static pages with priorities
- Fetches every product from the API and adds `/product/:id` URLs with `lastmod`
- Cached for 1 hour (`Cache-Control: max-age=3600`)
- Google Search Console: submit `https://peoplenstyle.com/sitemap.xml`

---

## `src/features/` — All React UI Code

Organized by **who uses it**, not by file type.

```
features/
├── public/        ← Pages and components visible to all visitors
├── admin/         ← Store owner admin panel
├── super-admin/   ← Platform super admin panel
└── shared/        ← Components used across all three (Navbar, Footer, etc.)
```

### `features/public/`

```
public/
├── components/
│   ├── Hero.jsx           ← Hero banner slider (React Query cached, auto-slides every 5.5s)
│   ├── Categories.jsx     ← Category grid on home page
│   ├── Gallery.jsx        ← Masonry image gallery
│   ├── ProductCard.jsx    ← Single product card (used in grids and rows)
│   ├── ProductsGrid.jsx   ← Renders a grid/row of ProductCards
│   └── Testimonials.jsx   ← Customer reviews carousel
│
├── loaders/
│   ├── HomeLoaders.jsx    ← Skeleton screens for Hero, Categories, Gallery, Testimonials
│   ├── ProductLoaders.jsx ← Skeleton screens for ProductCard, ProductList, ProductDetail
│   ├── PageLoaders.jsx    ← Full-page loading spinner
│   └── index.js          ← Re-exports all loaders
│
└── pages/
    ├── Home.jsx           ← Homepage (assembles Hero + Categories + Gallery + etc.)
    ├── Products.jsx       ← Product listing page with filters
    ├── ProductDetail.jsx  ← Single product page (images, sizes, booking, reviews)
    ├── Login.jsx          ← Login form
    ├── Signup.jsx         ← Registration form
    ├── ForgotPassword.jsx ← Password reset form
    ├── CustomerProfile.jsx← User profile + order history
    ├── Favorites.jsx      ← Saved/wishlisted products
    ├── AboutUs.jsx        ← About page
    ├── ContactUs.jsx      ← Contact form
    ├── FAQ.jsx            ← Frequently asked questions
    ├── TermsAndConditions.jsx
    ├── DataPolicyPage.jsx ← Privacy policy
    ├── RefundPolicy.jsx
    ├── PaymentStatus.jsx  ← Order confirmation / payment result
    ├── BridalCombo.jsx    ← Bridal combo package page
    └── ComingSoon.jsx     ← Placeholder for unreleased features
```

### `features/admin/`

Accessible at `/admin/:storename/*`. Only store owners can access (protected by `ProtectedRoute`).

```
admin/
├── components/
│   ├── AdminSidebar.jsx   ← Left nav for admin panel
│   ├── Modal.jsx          ← Reusable modal dialog
│   ├── ProductForm.jsx    ← Add/edit product form (images, price, stock)
│   ├── ProductList.jsx    ← Table of store's products
│   └── Stats.jsx          ← Dashboard stats cards
│
└── pages/
    ├── AdminLogin.jsx     ← Admin login (separate from customer login)
    ├── Dashboard.jsx      ← Admin home with stats and quick actions
    ├── ProductsAdmin.jsx  ← Manage products (CRUD)
    └── OrdersAdmin.jsx    ← View and manage orders for this store
```

### `features/super-admin/`

Accessible at `/superadmin/*`. Only the super admin account can access.

```
super-admin/
├── SuperAdminDashboard.jsx ← Platform-wide overview
├── AddStore.jsx            ← Create a new store (store owner account)
├── ViewStores.jsx          ← List all stores
├── AllUsers.jsx            ← List all customers
├── OrdersAdmin.jsx         ← All orders across all stores
├── CategoriesAdmin.jsx     ← Manage product categories
├── HeroImagesAdmin.jsx     ← Manage hero banner images
├── BannerImagesAdmin.jsx   ← Manage other banners
├── InstaAdmin.jsx          ← Manage Instagram feed section
├── TestimonialsAdmin.jsx   ← Manage customer testimonials
└── CitiesAdmin.jsx         ← Manage delivery cities and charges
```

### `features/shared/`

```
shared/components/
├── Navbar.jsx          ← Top navigation bar (changes based on role: customer/admin/superadmin)
├── Footer.jsx          ← Site footer with links to all service pages
├── OptimizedImage.jsx  ← Smart image component (ImageKit CDN + auto WebP/sizing)
├── FavoriteButton.jsx  ← Heart button to save/unsave products
└── Loader.jsx          ← Spinning loader used in buttons and inline areas
```

#### `OptimizedImage.jsx` — How Image Optimization Works

This component sits in front of every product/banner/gallery image.

```
URL passed in
    │
    ├── Not an http URL (local/relative)? → plain <img>
    ├── Already an ImageKit URL?          → plain <img> (no double-transform)
    └── S3 URL?
            │
            ▼
        Extract path from S3 URL
        Pass to <IKImage> with transforms:
          - width: responsive (250–1400px based on type + mobile/desktop)
          - quality: auto (ImageKit picks best quality)
          - format: auto (delivers WebP or AVIF if browser supports it)
          - lqip: only for hero images (blurry placeholder while loading)
```

**Image types and their widths:**

| type | Mobile | Desktop | Used for |
|---|---|---|---|
| `hero` | 600px | 1400px | Hero banner full-screen images |
| `category` | 300px | 400px | Category grid cards |
| `gallery` | 250px | 350px | Product cards, gallery |
| `modal` | 800px | 1400px | Lightbox / zoomed images |

---

## `src/services/` — API Layer

All backend communication is here. Components never call `fetch` or `axios` directly — they call these service functions.

```
services/
├── api.js                    ← Axios instance (base URL from VITE_API_URL, auto-attaches Firebase token)
│
├── productService.js         ← getProducts, getProductById, getProductsByCategory, getTopPicks
├── adminProductService.js    ← createProduct, updateProduct, deleteProduct (store owner only)
├── categoryService.js        ← getCategories, findCategoryIdBySlug
├── bannerService.js          ← getBanners (hero banners, category banners)
├── testimonialService.js     ← getTestimonials
├── productTestimonialService.js ← product-specific reviews
├── instaService.js           ← getInstaPosts (Instagram feed section)
├── orderService.js           ← createOrder, getMyOrders, getAllOrders
├── paymentService.js         ← initiate/verify PhonePe payment
├── favoriteService.js        ← getFavorites, addFavorite, removeFavorite
├── deliveryCityService.js    ← getCities (delivery location + charge dropdown)
├── authService.js            ← signup, getProfile (calls /api/auth/*)
├── firebaseAuthService.js    ← Firebase login, logout, password reset (client-side Firebase SDK)
├── adminService.js           ← getStats, store-level admin operations
└── whatsapp.js               ← Build WhatsApp inquiry URL for a product
```

### `api.js` — How Authentication Works

Every API call that needs authentication automatically attaches the Firebase ID token:

```
User logs in via Firebase
    → Firebase gives browser a JWT token
    → api.js interceptor reads token before every request
    → Adds header: Authorization: Bearer <token>
    → Express server verifies token via Firebase Admin SDK
    → Attaches user role (customer / store_owner / super_admin)
    → Route proceeds or returns 403
```

---

## `src/config/`

### `firebase.js`

Initialises the Firebase app using environment variables. Exports `auth` (used for login/logout) and the app instance.

All `VITE_FIREBASE_*` variables must be set in `.env`. The `envPrefix` fix in `astro.config.mjs` ensures these are available inside React client bundles.

---

## `src/context/`

### `AuthContext.jsx`

A React context that wraps the whole app and provides:

```js
const { user, role, loading } = useAuth()
```

| Value | What it is |
|---|---|
| `user` | Firebase user object (null if not logged in) |
| `role` | `"customer"` / `"store_owner"` / `"super_admin"` (fetched from `/api/auth/me`) |
| `loading` | true while Firebase is checking session on page load |

Used by `ProtectedRoute` to block unauthorized access and by `Navbar` to show the right menu.

---

## `src/utils/`

```
utils/
├── ProtectedRoute.jsx   ← Redirects to /login if not authenticated, or wrong role
├── ComingSoonGate.jsx   ← Wraps a route and shows ComingSoon page instead
└── ScrollToTop.jsx      ← Scrolls to top on every React Router navigation
```

---

## `src/data/`

Static JavaScript data files (not from API).

```
data/
├── combos.js     ← Bridal combo package data (used on BridalCombo page)
├── Content.js    ← Static text content (about page copy, etc.)
├── products.js   ← Possibly legacy static product data
└── reels.js      ← Instagram reel URLs for the reel section
```

---

## `src/App.jsx` — React Router Routes

All URL-to-component mappings for the React layer. When Astro serves a page and React hydrates, React Router reads `window.location` and renders the right component.

**Route structure:**
```
/                          → Home
/products                  → Products (all)
/products/:category        → Products filtered by category
/product/:id               → ProductDetail
/login                     → Login
/signup                    → Signup
/forgot-password           → ForgotPassword
/about                     → AboutUs
/contact                   → ContactUs
/faq                       → FAQ
/terms                     → TermsAndConditions
/privacy                   → DataPolicyPage
/refund                    → RefundPolicy
/favorites                 → Favorites (protected)
/:uid/profile              → CustomerProfile (protected)
/payment/status/:orderId   → PaymentStatus
/bridal-combo              → BridalCombo
/admin/:storename          → Admin dashboard (store_owner only)
/admin/:storename/products → ProductsAdmin
/admin/:storename/orders   → OrdersAdmin
/superadmin                → SuperAdminDashboard (super_admin only)
/superadmin/stores         → ViewStores
... etc.
```

---

## `src/index.css` — Styles

Tailwind CSS v4 is loaded here. Custom utility classes like `skeleton-base`, `btn-funky`, `glass` are also defined here.

Tailwind v4 uses a Vite plugin (not PostCSS like v3). The config is inside `astro.config.mjs` under `vite.plugins`.

---

## Build Output (`dist/`)

When you run `npm run build` (`astro build`):

```
dist/
├── index.html         ← Pre-rendered home page HTML
├── about/index.html   ← Pre-rendered about page HTML
├── faq/index.html     ← Pre-rendered FAQ HTML
├── ...                ← One HTML file per prerendered page
├── assets/            ← JS and CSS bundles (hashed filenames for cache busting)
├── robots.txt
└── sitemap.xml        ← Static sitemap (overridden by the dynamic /sitemap.xml.ts endpoint)
```

SSR pages (product/[id], admin, etc.) are not in `dist/` as HTML files — they are Vercel serverless functions that run on demand.

---

## Deployment Flow

```
git push → Vercel picks up changes
         → runs: npm run build (= astro build)
         → static pages become HTML files in dist/
         → SSR pages become Vercel serverless functions
         → sitemap.xml.ts becomes a serverless API route
         → site goes live
```

**Vercel settings required:**
- Framework Preset: **Astro**
- Build Command: `npm run build`
- Output Directory: `dist`
- All `.env` variables added in Vercel dashboard → Settings → Environment Variables

---

## Quick Reference: Where to Go for What

| I want to... | Go to |
|---|---|
| Change SEO title/description for a page | `src/pages/<page>.astro` |
| Add a new public page | Create `src/pages/newpage.astro` + `src/features/public/pages/NewPage.jsx` + add route in `App.jsx` |
| Change the HTML `<head>` structure | `src/layouts/BaseLayout.astro` |
| Change the React app providers | `src/components/ReactApp.jsx` |
| Edit the hero banner | `src/features/public/components/Hero.jsx` |
| Edit the product card | `src/features/public/components/ProductCard.jsx` |
| Change how images are optimized | `src/features/shared/components/OptimizedImage.jsx` |
| Add a new API call | Create a function in `src/services/` |
| Change navigation links | `src/features/shared/components/Navbar.jsx` |
| Add a loading skeleton | `src/features/public/loaders/HomeLoaders.jsx` or `ProductLoaders.jsx` |
| Change Tailwind config / add custom class | `src/index.css` |
| Change Astro/Vite/Vercel config | `astro.config.mjs` |
| Add a new env variable | `.env` (local) + Vercel dashboard (production) |
