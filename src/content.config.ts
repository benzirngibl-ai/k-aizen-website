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

export const collections = { blog, tutorials };
