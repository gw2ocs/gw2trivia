<script setup lang="ts">
import { withLeadingSlash } from 'ufo'
import type { ContentNavigationItem, Collections } from '@nuxt/content'

const route = useRoute();
const { locale } = useI18n();
const slug = computed(() => {
  let slug = route.params.slug
  if (!slug) {
    slug = []
  }
  if (!Array.isArray(slug)) {
    slug = [slug]
  }
  slug = [locale.value, ...slug]
  return withLeadingSlash(String(slug.join('/')))
});

const { data: page } = await useAsyncData('page-' + slug.value, async () => {
  // Build collection name based on current locale
  const collection = ('content_' + locale.value) as keyof Collections
  const content = await queryCollection(collection).path(slug.value).first()

  // Optional: fallback to default locale if content is missing
  if (!content && locale.value !== 'en') {
    return await queryCollection('content_en').path(slug.value).first()
  }

  return content
}, {
  watch: [locale], // Refetch when locale changes
})

if (!page.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
      fatal: true,
    })
}

useSeoMeta(page.value.seo)

/*definePageMeta({
  i18n: {
    paths: {
      en: '/about/[...slug]',
      fr: '/à-propos/[...slug]'
    }
  }
})*/

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
    <UMain as="main">
      <UPage v-if="page">
          <UPageHeader :title="page.title" />

          <template #left>
              <UPageAside>
                  <UContentNavigation :navigation="navigation" highlight number="1" />
              </UPageAside>
          </template>

          <UPageBody>
              <ContentRenderer v-if="page.body" :value="page.body" />
          </UPageBody>

          <template v-if="page?.body?.toc?.links?.length" #right>
              <UContentToc :links="page.body.toc.links" />
          </template>
      </UPage>
    </UMain>
</template>
