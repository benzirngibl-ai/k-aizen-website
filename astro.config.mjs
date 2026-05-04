// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://k-aizen.de',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/old-index') && !page.includes('/preview/') && !page.includes('/v1/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});