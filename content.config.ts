import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const commonSchema = z.object({})

export default defineContentConfig({
  collections: {
    // English content collection
    content_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/**',
      },
      schema: commonSchema,
    }),
    // French content collection
    content_fr: defineCollection({
      type: 'page',
      source: {
        include: 'fr/**',
      },
      schema: commonSchema,
    }),
    // Spanish content collection
    content_es: defineCollection({
      type: 'page',
      source: {
        include: 'es/**',
      },
      schema: commonSchema,
    }),
    // German content collection
    content_de: defineCollection({
      type: 'page',
      source: {
        include: 'de/**',
      },
      schema: commonSchema,
    }),
  },
})