<script setup lang="ts">
  useSchemaOrg([
    defineWebSite({
      potentialAction: [
        defineSearchAction({
          target: '/questions?title={search_term_string}',
        })
      ],
    })
  ]);
import type { Collections } from '@nuxt/content';
import * as locales from '@nuxt/ui/locale';

const { locale } = useI18n();

const lang = computed(() => locales[locale.value].code);
const dir = computed(() => locales[locale.value].dir);

useHead({
  htmlAttrs: {
    lang,
    dir
  }
});
const { data: navigation } = await useAsyncData('page-' + locale.value + '-navigation', async () => {
  // Build collection name based on current locale
  const collection = ('content_' + locale.value) as keyof Collections
  const navigation = await queryCollectionNavigation(collection)

  // Optional: fallback to default locale if content is missing
  if (!navigation && locale.value !== 'en') {
    return await queryCollectionNavigation('content_en')
  }

  return navigation
}, {
  watch: [locale], // Refetch when locale changes
})

provide('navigation', navigation)
</script>

<template>
  <UApp :locale="locales[locale]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>