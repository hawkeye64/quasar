<template lang="pug">
h6 With Custom Component and Imports
div
  q-btn(label='Click me')
  q-icon(name='map')
</template>

<script setup>
import { Notify, QBtn } from 'quasar'

console.log(QBtn)
console.log('Notify', Notify)
</script>
