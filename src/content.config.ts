import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    slug: z.string().optional(),
    author: z.string().default('Benjamin Zirngibl'),
    source_video: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Lena-Funktionsseiten — 1 Datei pro Funktion (Spec: docs/superpowers/specs/2026-07-07-lena-funktionsseiten-design.md)
// Story-Sektionen (Schmerz/Ohne/Mit) leben als freies Markdown im Body;
// Mechanik (sources/flow/discord) strukturiert, weil das Template sie als Chips/Steps/Mock rendert.
const funktionen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/funktionen' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    schmerzKicker: z.string(), // 1 Satz Schmerz — Kachel-Text + Seiten-Unterzeile
    protagonist: z.enum(['kunde', 'mitarbeiter', 'markus']),
    heroImage: z.string(),
    heroAlt: z.string(),
    reihenfolge: z.number(),
    sources: z.array(z.string()).default([]),
    flow: z.array(z.string()).default([]),
    discord: z
      .object({
        channel: z.string(),
        time: z.string(),
        alert: z.boolean().optional(),
        body: z.string(),
      })
      .optional(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { blog, tutorials, funktionen };
