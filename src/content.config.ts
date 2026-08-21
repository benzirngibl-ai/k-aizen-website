import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// FUNNEL-UMBAU 2026-08-21 (Ben): Die Sammlungen `tutorials` und `funktionen`
// gehörten zur KI-PA-Welt und sind mit den zugehörigen Routen nach
// `_archive/2026-08-21-funnel-umbau/content/` gewandert. Die Texte dort sind
// bewusst aufgehoben — mehrere Schmerz-Geschichten (verpasster Anruf,
// vergessenes Angebot) beschreiben genau das, was das heutige Paket löst,
// und taugen als Rohmaterial. Reaktivieren heißt: Ordner zurück nach
// src/content/ + Sammlung hier wieder eintragen + Route zurückholen.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.enum(['A', 'B', 'C']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
    author: z.string().default('Benjamin Zirngibl'),
  }),
});

export const collections = { blog };
