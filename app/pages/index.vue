<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const links = ref([
  {
    label: t('questions.page.title'),
    to: localePath('questions'),
  },
  {
    label: t('articles.page.title'),
    to: localePath('articles'),
  },
  {
    label: t('novels.page.title'),
    to: localePath('novels'),
  },
])
  const questionsCount = 1000;
</script>

<template>
    <UMain as="main">
        <UPageHero
            title="GW2Trivia"
            description="Jeu de culture générale sur l'univers de Guild Wars."
            :links="links"
        />
        <UPageSection
          orientation="horizontal"
          reverse>
          <template #description>
            <div v-html="$t('home.welcome_message', { questionsCount }, { escapeParameter: false })"></div>
          </template>
          <img src="/img/ogden.png" alt="Ogden Guéripierre" title="Ogden Guéripierre" height="400px" width="261px"
                    style="margin: auto" loading="lazy"/>
        </UPageSection>
    </UMain>
</template>