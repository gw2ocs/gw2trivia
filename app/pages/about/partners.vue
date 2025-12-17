<script setup lang="ts">
    const { locales, t } = useI18n();
    const setI18nParams = useSetI18nParams()
    setI18nParams(
        locales.value.reduce((acc, locale) => {
            acc[locale.code] = { path: t('about.partners.page.path', {}, { locale: locale.code }) };
            return acc;
        }, {} as Record<string, object>),
    )
</script>

<template>
    <UMain as="main">
        <UContainer as="article">
            <h2>Partners</h2>

        </UContainer>
    </UMain>
</template>