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
        <UContainer as="article" class="home-introduction">
            <section class="home-ogden">
                <img src="/img/ogden.png" alt="Ogden Guéripierre" title="Ogden Guéripierre" height="400px" width="261px"
                    loading="lazy"/>
            </section>
            <section class="home-dialogue" v-html="$t('home.welcome_message', { questionsCount }, { escapeParameter: false })">
            </section>
        </UContainer>
    </UMain>
</template>