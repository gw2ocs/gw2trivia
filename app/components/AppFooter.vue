<script setup lang="ts">
import * as locales from '@nuxt/ui/locale';
import type { FooterColumn } from '@nuxt/ui';

const { t, locale, setLocale, locales: availableLocales } = useI18n();
const availableLocalesCodes = availableLocales.value.map(l => l.code.toString());
const filteredLocales = Object.values(locales).filter(l => availableLocalesCodes.includes(l.code));
const localePath = useLocalePath();

const columns = computed<FooterColumn[]>(() => [
  {
    label: 'Social',
    children: [
      {
        label: 'EWAzDQN',
        name: 'Discord',
        to: 'https://discord.gg/EWAzDQN',
        target: '_blank',
        rel: 'noreferrer',
      },
      {
        label: '@Gw2Trivia',
        to: 'https://twitter.com/Gw2Trivia',
        target: '_blank',
        rel: 'noreferrer',
      },
      {
        label: 'questionspourunquaggan',
        to: 'https://www.twitch.tv/questionspourunquaggan',
        target: '_blank',
        rel: 'noreferrer',
      },
      {
        label: 'GW2Trivia',
        to: 'https://www.youtube.com/channel/UChpW1puaBfG3pioIhUe7QCg',
        target: '_blank',
        rel: 'noreferrer',
      },
      {
        label: 'Mastodon',
        to: 'https://mastodon.social/@gw2trivia',
        target: '_blank',
        rel: 'noreferrer',
      },
      {
        label: 'Linktree',
        to: 'https://linktr.ee/gw2trivia',
        target: '_blank',
        rel: 'noreferrer',
      }
    ]
  },
  {
    label: 'About',
    children: [
      {
        label: t('about.legal.page.title'),
        to: localePath('about-legal'),
      },
      {
        label: t('about.support.page.title'),
        to: localePath('about-support'),
      },
      {
        label: t('about.partners.page.title'),
        to: localePath('about-partners'),
      },
      {
        label: t('about.projects.page.title'),
        to: localePath('about-projects'),
      }
    ]
  }
]);
</script>

<template>
    <UFooter>
        <template #left>
        <div>
            <div class="partner-logo-wrapper"><div class="partner-logo" title="Partenaire ArenaNet"></div></div>
            <p>Made with <i class="gw2-karma"></i> by <strong>Pandraghon#3647</strong>.</p>
            <p>Icons and background are © ArenaNet, Inc. All rights reserved.</p>
            <p>Vous voulez acheter le jeu, une extension ou vous créer un compte secondaire ? Vous pouvez utiliser notre <a href="http://guildwars2.go2cloud.org/aff_c?offer_id=34&aff_id=741" rel="noreferrer" target="_blank">lien partenaire</a> pour nous soutenir.</p>
            <p>Un problème ou une question ? Créez un nouveau <a href="https://github.com/gw2ocs/gw2trivia/issues" rel="noreferrer" target="_blank"><i class="mdi mdi-github" aria-hidden="true"></i> ticket</a> ou venez en parler sur le <a href="https://discord.gg/YpcMnDY" rel="noreferrer" target="_blank"><i class="mdi mdi-discord" aria-hidden="true"></i> Discord</a> de Questions pour un Quaggan dans le channel #support.</p>
            <ULocaleSelect
                :model-value="locale"
                :locales="filteredLocales"
                @update:model-value="setLocale($event)"
            />
        </div>
        </template>
        <template #right>
            <UFooterColumns :columns="columns" />
        </template>
    </UFooter>
</template>