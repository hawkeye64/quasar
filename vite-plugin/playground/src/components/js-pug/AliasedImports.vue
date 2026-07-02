<template lang="pug">
h6 With Aliased Imports
div
  q-btn(label='Click me')
  q-icon(name='map')
</template>

<script setup>
import { Notify, QBtn as SomeComponent } from 'quasar'

console.log(SomeComponent)
console.log('Notify', Notify)
</script>
