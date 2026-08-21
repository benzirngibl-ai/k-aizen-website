// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://k-aizen.de',
  // Kurz-URL fürs Erstgespräch. Merkbare Adresse für Mails/LinkedIn/Signatur;
  // Ziel-URL bei Kalenderwechsel nur hier ändern.
  //
  // ⛔ KALENDER-STANDARD IST GOOGLE (Ben, 2026-08-21): „wir benutzen erstmal
  // kein cal.com mehr. Unser Standard ist Google Kalender."
  //
  // Vorgeschichte am selben Tag: Es liefen ZWEI Systeme parallel (Startseite auf
  // Cal.com, /termin auf Google). Erst wurde auf Cal.com vereinheitlicht, dann
  // hat Ben Google als Standard gesetzt. Wenn hier je wieder cal.k-aizen.de
  // steht, ist das ein Rückschritt.
  redirects: {
    '/termin': 'https://calendar.app.google/AvBJwsvWrh4m26tV7',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const url = new URL(page);
        const path = url.pathname;
        // Nach dem Funnel-Umbau 2026-08-21 existieren die meisten alten Routen
        // gar nicht mehr (nginx leitet sie per 301 um). Übrig bleibt, was gebaut
        // wird, aber nicht in die Suche gehört: das Kunden-Setup-Formular und
        // die noindex-Vorschauen.
        const blockedPrefixes = [
          '/onboarding',
          '/preview',
          '/danke',
          '/v1',
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
