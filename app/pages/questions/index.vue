<script setup lang="ts">
    import { getPaginationRowModel, getSortedRowModel, type Column } from '@tanstack/vue-table';
    import type { TableColumn } from '@nuxt/ui';
    const { locales, t } = useI18n();
    const setI18nParams = useSetI18nParams();
    setI18nParams(
        locales.value.reduce((acc, locale) => {
            acc[locale.code] = { path: t('questions.page.path', {}, { locale: locale.code }) };
            return acc;
        }, {} as Record<string, object>),
    );

    const UUser = resolveComponent('UUser');
    const UButton = resolveComponent('UButton');
    const UDropdownMenu = resolveComponent('UDropdownMenu');

    const table = useTemplateRef('table');

    const columns: TableColumn<Question>[] = [
        {
            header: ({ column }) => getHeader(column, t('questions.columns.points')),
            enableColumnFilter: true,
            accessorKey: 'points',
        },
        {
            header: ({ column }) => getHeader(column, t('questions.columns.title')),
            enableColumnFilter: true,
            accessorKey: 'title',
        },
        {
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
        },
        {
            header: ({ column }) => getHeader(column, t('questions.columns.createdAt')),
            accessorKey: 'createdAt',
            cell: (info) => new Date(info.getValue<string>()).toLocaleDateString(),
        },
        {
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
        },
    ];

    function getHeader(column: Column<Question>, label: string) {
        const isSorted = column.getIsSorted()

        return h(
            UDropdownMenu,
            {
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
            key: 'table-qestions',
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