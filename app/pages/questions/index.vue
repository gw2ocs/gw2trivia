<script setup lang="ts">
    import { type Column } from '@tanstack/vue-table';
    import type { DropdownMenuItem, TableColumn } from '@nuxt/ui';
    import { useClipboard } from '@vueuse/core';
    const { copy } = useClipboard();
    const toast = useToast();
    const { locales, t } = useI18n();
    const setI18nParams = useSetI18nParams();

    setI18nParams(
        locales.value.reduce((acc, locale) => {
            acc[locale.code] = { path: t('questions.page.path', {}, { locale: locale.code }) };
            return acc;
        }, {} as Record<string, object>),
    );

    useSeoMeta({
        title: t('questions.page.title'),
        description: t('questions.page.description')
    })

    const UUser = resolveComponent('UUser');
    const UButton = resolveComponent('UButton');
    const UDropdownMenu = resolveComponent('UDropdownMenu');

    const table = useTemplateRef('table');

    const columns: TableColumn<Question>[] = [{
        header: ({ column }) => getHeader(column, t('questions.columns.points')),
        accessorKey: 'points',
        size: 32,
    }, {
        header: ({ column }) => getHeader(column, t('questions.columns.title')),
        accessorKey: 'title',
    }, {
        header: ({ column }) => getHeader(column, t('questions.columns.images')),
        accessorKey: 'images',
        cell: ({ row }) => row.original.imagesQuestionsRels?.length ? h(UButton, {
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-lucide-image',
            square: true,
            'aria-label': t('questions.columns.images'),
            onClick: () => row.toggleExpanded(),
        }) : null,
    }, {
        header: ({ column }) => getHeader(column, t('questions.columns.createdAt')),
        accessorKey: 'createdAt',
        cell: (info) => new Date(info.getValue<string>()).toLocaleDateString(),
    }, {
        header: ({ column }) => getHeader(column, t('questions.columns.author')),
        accessorKey: 'user',
        cell: ({ row }) => h(UUser, {
            name: row.original.user?.username || 'Unknown User',
            avatar: {
                src: `https://cdn.discordapp.com/avatars/${row.original.user?.discordId || ''}/${row.original.user?.avatar || ''}.png`,
                alt: row.original.user?.username || 'User Avatar',
                rounded: 'full',
            }
        }),
    }, {
        id: 'action'
    }];

    function getHeader(column: Column<Question>, label: string) {
        const isSorted = column.getIsSorted()

        return h(UDropdownMenu, {
            content: {
                align: 'start'
            },
            'aria-label': 'Actions dropdown',
            items: [
                {
                label: 'Asc',
                type: 'checkbox',
                icon: 'i-lucide-arrow-up-narrow-wide',
                checked: isSorted === 'asc',
                onSelect: () => {
                    if (isSorted === 'asc') {
                        column.clearSorting()
                    } else {
                        column.toggleSorting(false, true)
                    }
                }
                },
                {
                label: 'Desc',
                icon: 'i-lucide-arrow-down-wide-narrow',
                type: 'checkbox',
                checked: isSorted === 'desc',
                onSelect: () => {
                    if (isSorted === 'desc') {
                        column.clearSorting()
                    } else {
                        column.toggleSorting(true, true)
                    }
                }
                }
            ]
            },
            () =>
            h(UButton, {
                color: 'neutral',
                variant: 'ghost',
                label,
                icon: isSorted
                ? isSorted === 'asc'
                    ? 'i-lucide-arrow-up-narrow-wide'
                    : 'i-lucide-arrow-down-wide-narrow'
                : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 data-[state=open]:bg-elevated',
                'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`
            })
        )
    }

    function getDropdownActions(question: Question): DropdownMenuItem[] {
        return [
            [{
                label: t('actions.copy_title'),
                icon: 'i-lucide-copy',
                onSelect: () => {
                    copy(question.title);
                    toast.add({
                        title: t('toasts.title_copied'),
                        color: 'success',
                        icon: 'i-lucide-circle-check',
                    });
                }
            },
            {
                label: t('actions.copy_link'),
                icon: 'i-lucide-link',
                onSelect: () => {
                    copy(`${window.location.origin}/questions/${question.id}/${question.slug}`);
                    toast.add({
                        title: t('toasts.link_copied'),
                        color: 'success',
                        icon: 'i-lucide-circle-check',
                    });
                }
            }], [{
                label: t('actions.view'),
                icon: 'i-lucide-eye',
                href: `/questions/${question.id}/${question.slug}`
            }, {
                label: t('actions.edit'),
                icon: 'i-lucide-edit',
                href: `/questions/${question.id}/edit`
            }, {
                label: t('actions.delete'),
                icon: 'i-lucide-trash',
                color: 'error',
                href: `/questions/${question.id}/delete`
            }]
        ];

    }

    const pagination = ref({
        pageIndex: 0,
        pageSize: 10
    });
    const sorting = ref([
        { id: 'createdAt', desc: false }
    ]);

    const columnVisibility = ref({
        createdAt: false
    });

    const expanded = ref({});

    const questions = ref<Question[]>([]);

    const { data, status, error, execute } = await useFetch<{ questions: Question[], count: number }>('/api/questions',
        {
            key: 'table-questions',
            params: { pagination, sorting },
            lazy: false,
            immediate: false
        }
    );

    watch(data, () => {
        questions.value = data.value?.questions || [];
    });

    execute();
</script>

<template>
    <UMain as="main">
        <UContainer as="article">
            <h2>{{ t('questions.page.title') }}</h2>
            <div class="flex justify-end px-4 py-3.5 border-b border-accented">
                <UDropdownMenu
                    :items="table?.tableApi
                        ?.getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => ({
                            label: column.id,
                            type: 'checkbox' as const,
                            checked: column.getIsVisible(),
                            onUpdateChecked(checked: boolean) {
                                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                            },
                            onSelect(e: Event) {
                                e.preventDefault()
                            }
                        }))"
                    :content="{ align: 'end' }"
                >
                    <UButton
                        :label="t('ui.columns')"
                        color="neutral"
                        variant="outline"
                        trailing-icon="i-lucide-chevron-down"
                    />
                </UDropdownMenu>
            </div>
            <UTable
                ref="table"
                v-model:expanded="expanded"
                v-model:sorting="sorting"
                v-model:pagination="pagination"
                v-model:column-visibility="columnVisibility"
                :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
                :data="questions"
                :columns="columns"
                :loading="status === 'pending'"
                sticky
            >
                <template #expanded="{ row }">
                    <pre>{{ row.original }}</pre>
                </template>
                <template #title-cell="{ row }">
                    <div>
                        <NuxtLink :to="`/questions/${row.original.id}/${row.original.slug}`" :title="row.original.title" class="text-base text-pretty hover:text-highlighted">
                            {{ row.original.title.length > 75 ? row.original.title.slice(0, 75) + '...' : row.original.title }}
                        </NuxtLink>
                        <br />
                        <UBadge
                            v-for="rel in row.original.categoriesQuestionsRels"
                            :key="rel.category.id"
                            :label="rel.category.name"
                            color="primary"
                            variant="outline"
                            size="sm"
                            class="mr-1"
                        />
                    </div>
                </template>
                <template #action-cell="{ row }">
                    <UDropdownMenu :items="getDropdownActions(row.original)">
                        <UButton
                        icon="i-lucide-ellipsis-vertical"
                        color="neutral"
                        variant="ghost"
                        aria-label="Actions"
                        />
                    </UDropdownMenu>
                </template>
            </UTable>
            <UPagination
                :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="data?.count"
                @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
            />
        </UContainer>
    </UMain>
</template>