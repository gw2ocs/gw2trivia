// https://nuxt.com/docs/api/configuration/nuxt-config
import "dotenv/config";
import { defineOrganization } from 'nuxt-schema-org/schema';

export default defineNuxtConfig({
  app: {
    head: {
      title: 'GW2Trivia',
      link: [{
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'search',
        type: 'application/opensearchdescription+xml',
        title: 'GW2Trivia',
        href: '/opensearch.xml'
      }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  modules: [
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@nuxt/ui',
    '@nuxt/content',
  ],
  css: ['~/assets/css/main.css'],
  experimental: {
    scanPageMeta: true,
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  debug: true,
  i18n: {
    baseUrl: 'https://gw2trivia.com',
    defaultLocale: 'en',
    strategy: 'prefix',
    locales: [
      { code: 'en', file: 'en.js', name: 'English' },
      { code: 'fr', file: 'fr.js', name: 'Français' },
      { code: 'de', file: 'de.js', name: 'Deutsch' },
      { code: 'es', file: 'es.js', name: 'Español' },
    ],
    compilation: {
      strictMessage: false,
      escapeHtml: false,
    }
  },
  content: {
    experimental: { sqliteConnector: 'native' },
  },
  site: {
    title: 'GW2Trivia',
    description: 'Tester vos connaissances sur l\'univers de Guild Wars en participant à Questions pour un Quaggan, un jeu présenté par Ogden Guéripierre.',
    url: 'https://gw2trivia.com',
    
  },
  schemaOrg: {
    identity: defineOrganization({
      name: 'GW2Trivia',
      logo: '/img/icon_180.png',
    }),
  },
});
