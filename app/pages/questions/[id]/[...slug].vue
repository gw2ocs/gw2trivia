<script setup lang="ts">
    import type { ButtonProps } from '@nuxt/ui';

    const { locale, t } = useI18n();
    const route = useRoute();

    const { data: question, status, error, execute } = await useFetch<Question>(`/api/questions/${route.params.id}`, {
        key: `table-question-${route.params.id}`,
    });

    useSeoMeta({
        title: question.value ? question.value.title : t('questions.page.title'),
        description: t('questions.page.description')
    })

    const links = ref<ButtonProps[]>([{
        label: t('actions.edit'),
        icon: 'i-lucide-edit',
        href: `/questions/${route.params.id}/edit`
    }, {
        label: t('actions.delete'),
        icon: 'i-lucide-trash',
        color: 'error',
        href: `/questions/${route.params.id}/delete`
    }])
</script>

<template>
    <UMain as="main">
        <UContainer>
            <UPage v-if="question">
                <UPageHeader :title="question.title" :links="links">
                    <template #headline>
                        <UBadge v-for="rel in question.categoriesQuestionsRels" :key="rel.category.id" :label="rel.category.name" size="md" class="mx-1" />
                    </template>
                    <template #description>
                        <UUser v-if="question.user" 
                            :name="question.user.username" 
                            :avatar="{ src: `https://cdn.discordapp.com/avatars/${question.user?.discordId || ''}/${question.user?.avatar || ''}.png` }" 
                            class="inline-flex" />, postée le <NuxtTime :datetime="question.createdAt" :locale="locale" />
                    </template>
                </UPageHeader>

                <UPageBody>
                    <UCard variant="subtle">
                        <template #header>
                            <h2 class="text-base text-pretty font-semibold text-highlighted">Images</h2>
                        </template>

                        <ul v-if="question.imagesQuestionsRels?.length" class="flex flex-row flex-wrap justify-around space-y-6">
                            <li v-for="image in question.imagesQuestionsRels" :key="image.image.id">
                                <NuxtPicture :src="`/filestore/questions/${image.image.id}.${image.image.extension}`" :alt="`Image ${image.image.id}`" class="max-w-md mb-4" />
                            </li>
                        </ul>
                        <div v-else class="text-balance text-center text-muted">Il n'y a pas d'images.</div>
                    </UCard>
                    
                    <UCard variant="subtle">
                        <template #header>
                            <h2 class="text-base text-pretty font-semibold text-highlighted">Indices</h2>
                        </template>

                        <ul v-if="question.tips?.length">
                            <li v-for="tip in question.tips" :key="tip.id">{{ tip.content }}</li>
                        </ul>
                        <div v-else class="text-balance text-center text-muted">Il n'y a pas d'indices.</div>
                    </UCard>
                    
                    <UCard variant="subtle">
                        <template #header>
                            <h2 class="text-base text-pretty font-semibold text-highlighted">Réponses</h2>
                        </template>

                        <ul v-if="question.answers?.length">
                            <li v-for="answer in question.answers" :key="answer.id">{{ answer.content }}</li>
                        </ul>
                        <div v-else class="text-balance text-center text-muted">Il n'y a pas de réponses.</div>
                    </UCard>
                </UPageBody>
            </UPage>
        </UContainer>
    </UMain>
</template>