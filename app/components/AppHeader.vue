<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
const { t } = useI18n();

const route = useRoute();
const localePath = useLocalePath();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('home.page.title'),
    to: '/',
    active: route.path === '/'
  },
  {
    label: t('questions.page.title'),
    to: localePath('questions'),
    active: route.path.startsWith(localePath('questions'))
  },
  {
    label: t('articles.page.title'),
    to: localePath('articles'),
    active: route.path.startsWith(localePath('articles'))
  },
  {
    label: t('novels.page.title'),
    to: localePath('novels'),
    active: route.path.startsWith(localePath('novels'))
  },
]);
</script>

<template>
    <UHeader title="GW2Trivia">
        <template #title>
            GW2Trivia
        </template>

        <UNavigationMenu :items="items" />

        <template #right>
            <UColorModeButton />
        </template>
    </UHeader>
</template>