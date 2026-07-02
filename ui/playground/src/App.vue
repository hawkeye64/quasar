<template>
  <div>
    <router-view />

    <!--
    <router-view v-slot="{ Component, route }">
      <template v-if="Component">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <suspense :timeout="100">
              <component :is="Component" :key="route.path" />

              <template #fallback>
                <q-inner-loading showing size="10vmin" />
              </template>
            </suspense>
          </keep-alive>
        </transition>
      </template>
    </router-view>
    -->

    <q-btn
      to="/"
      round
      icon="home"
      dense
      size="xs"
      class="fixed dev-home-btn z-max"
      color="accent"
      aria-label="Go Home"
    />

    <q-card
      style="padding: 11px; right: 11px; bottom: 10px; z-index: 6000"
      class="rounded-borders shadow-4 fixed"
    >
      <q-btn
        dense
        flat
        size="sm"
        icon="visibility"
        @click="toggleSelector"
        class="absolute-top-right z-top"
        aria-label="Settings"
      />
      <template v-if="showSelector">
        <q-toggle
          :model-value="$q.dark.isActive"
          @update:model-value="$q.dark.toggle"
          :label="`Dark Mode (${$q.dark.mode})`"
        />

        <q-btn
          dense
          flat
          size="sm"
          :icon="lang === 'he' ? 'navigate_before' : 'navigate_next'"
          @click="switchRTL"
          class="absolute-bottom-right z-top"
          aria-label="Toggle RTL/LTR"
        />
        <q-select
          label="Quasar Language"
          dense
          outlined
          :options="langOptions"
          emit-value
          map-options
          options-dense
          v-model="lang"
          style="min-width: 150px"
          class="q-mb-xs"
        />
        <q-select
          label="Icon set"
          dense
          outlined
          :options="iconOptions"
          options-dense
          emit-value
          map-options
          v-model="iconSet"
        />
      </template>
    </q-card>
  </div>
</template>

<script setup>
import { Dark, Quasar, useMeta, useQuasar } from 'quasar'
import { onMounted, ref, watch } from 'vue'
import languages from 'quasar/lang/index.json'

const langList = import.meta.glob('../../lang/*.js')
const iconSetList = import.meta.glob('../../icon-set/*.js')

const $q = useQuasar()
useMeta({ title: 'Quasar Development' })

const lang = ref($q.lang.isoName)
const iconSet = ref($q.iconSet.name)
const showSelector = ref(false)

watch(lang, val => {
  langList[`../../lang/${val}.js`]().then(importLang => {
    $q.lang.set(importLang.default)
  })
})

watch(iconSet, val => {
  iconSetList[`../../icon-set/${val}.js`]().then(importIconSet => {
    $q.iconSet.set(importIconSet.default)
  })
})

function resetScroll(el, done) {
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  done()
}

function switchRTL() {
  lang.value = lang.value === 'en-US' ? 'he' : 'en-US'
}

function toggleSelector() {
  showSelector.value = !showSelector.value
}

onMounted(() => {
  window.$q = $q
  window.Quasar = Quasar
  /*
      nextTick(() => {
        Dark.set(false)
      })
      */
})

// $q.dark.set('auto')
// $q.dark.set(false)

const langOptions = languages.map(item => ({
  label: item.nativeName,
  value: item.isoName
}))
const iconOptions = [
  { label: 'Material', value: 'material-icons' },
  { label: 'SVG Material', value: 'svg-material-icons' },
  { label: 'Material Outlined', value: 'material-icons-outlined' },
  { label: 'Material Round', value: 'material-icons-round' },
  { label: 'Material Sharp', value: 'material-icons-sharp' },
  {
    label: 'Material Symbols Outlined',
    value: 'material-symbols-outlined'
  },
  {
    label: 'Material Symbols Rounded',
    value: 'material-symbols-rounded'
  },
  { label: 'Material Symbols Sharp', value: 'material-symbols-sharp' },
  { label: 'MDI v7', value: 'mdi-v7' },
  { label: 'SVG MDI v7', value: 'svg-mdi-v7' },
  { label: 'SVG Ionicons v8', value: 'svg-ionicons-v8' },
  { label: 'Ionicons v4', value: 'ionicons-v4' },
  { label: 'SVG Ionicons v4', value: 'svg-ionicons-v4' },
  { label: 'Fontawesome v7', value: 'fontawesome-v7' },
  { label: 'SVG Fontawesome v7', value: 'svg-fontawesome-v7' },
  { label: 'Eva Icons', value: 'eva-icons' },
  { label: 'SVG Eva Icons', value: 'svg-eva-icons' },
  { label: 'Themify', value: 'themify' },
  { label: 'SVG Themify', value: 'svg-themify' },
  { label: 'Line Awesome', value: 'line-awesome' },
  { label: 'SVG Line Awesome', value: 'svg-line-awesome' },
  { label: 'Bootstrap Icons', value: 'bootstrap-icons' },
  { label: 'SVG Bootstrap Icons', value: 'svg-bootstrap-icons' }
]
</script>

<style lang="sass">
body
  background: $grey-3

.dev-home-btn
  top: 36px
  right: 8px
</style>
