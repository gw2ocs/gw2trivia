<script setup>
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
    <nav class="layout-nav">
        <ul itemscope itemtype="http://www.schema.org/SiteNavigationElement">
            <li itemprop="name"><NuxtLink to="/" id="nav-home" accesskey="P" itemprop="url">{{ t('home.page.title') }}</NuxtLink></li>
            <li itemprop="name"><NuxtLink :to="localePath('questions')" id="nav-questions" accesskey="Q" itemprop="url">{{ t('questions.page.title') }}</NuxtLink></li>
            <li itemprop="name"><NuxtLink :to="localePath('articles')" id="nav-articles" accesskey="A" itemprop="url">{{ t('articles.page.title') }}</NuxtLink></li>
            <li itemprop="name"><NuxtLink :to="localePath('novels')" id="nav-novels" accesskey="R" itemprop="url">{{ t('novels.page.title') }}</NuxtLink></li>
        </ul>
    </nav>
</template>