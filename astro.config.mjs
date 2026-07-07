// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://k-aizen.de',
  // Kurz-URL fürs Erstgespräch → Google-Terminplan (Buchung + Meet-Link automatisch).
  // Merkbare Adresse für Mails/LinkedIn; Ziel-URL bei Kalenderwechsel nur hier ändern.
  redirects: {
    '/termin': 'https://calendar.app.google/AvBJwsvWrh4m26tV7',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const url = new URL(page);
        const path = url.pathname;
        const blockedPrefixes = [
          '/old-index',
          '/preview',
          '/preview-lighttech',
          '/v1',
          '/katalog',
          '/katalog-v2',
          '/pitch',
          '/onboarding',
        ];

        return !blockedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
      },
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
