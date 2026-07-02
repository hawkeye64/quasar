<template>
  <AppHeader />
  <div class="app-layout__content row items-start no-wrap">
    <AppStack />
    <div class="col">
      <AppCode />
      <AppEnvironment />
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppStack from '@/components/AppStack.vue'
import AppCode from '@/components/AppCode.vue'
import AppEnvironment from '@/components/AppEnvironment.vue'
</script>

<style lang="sass">
body
  background: $dark
</style>
