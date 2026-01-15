import type { RouterConfig } from '@nuxt/schema';
const locales = ['en', 'fr', 'es', 'de'];

export default {
    routes: _routes => {
        const redirectRoutes = locales.map(lang => ({
            name: `questions-view-id-slug___${lang}`,
            path: `/${lang}/questions/view/:id()/:slug(.*)*`,
            redirect: to => to.path.replace(/view\//, ''),
        }));
        return [...redirectRoutes, ..._routes];
    }
} satisfies RouterConfig;