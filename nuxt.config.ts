// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineOrganization, defineWebSite } from 'nuxt-schema-org/schema';

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
  ],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  site: {
    title: 'GW2Trivia',
    description: 'Tester vos connaissances sur l\'univers de Guild Wars en participant à Questions pour un Quaggan, un jeu présenté par Ogden Guéripierre.',
    url: 'https://gw2trivia.com',
    
  },
  schemaOrg: {
    identity: defineOrganization({
      name: 'GW2Trivia',
      logo: '/img/icon_180.png',
    })
  },
});
