import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// vite-plugin-prerender is CJS — the module itself is the plugin factory function,
// and PuppeteerRenderer is a named property on it.
const PrerenderPlugin = require("vite-plugin-prerender");
const { PuppeteerRenderer } = PrerenderPlugin;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    PrerenderPlugin({
      // Path to the built static files (Vite output dir)
      staticDir: path.join(__dirname, "dist"),
      // Routes to pre-render as static HTML at build time
      routes: [
        "/",
        "/products",
        "/products/lehenga",
        "/products/gowns",
        "/products/men",
        "/products/jewels",
        "/about",
        "/contact",
        "/faq",
        "/terms",
        "/privacy",
        "/refund",
      ],
      renderer: new PuppeteerRenderer({
        // Wait 3 seconds after navigation — lets React render initial HTML
        renderAfterTime: 3000,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
      }),
    }),
  ],
});
