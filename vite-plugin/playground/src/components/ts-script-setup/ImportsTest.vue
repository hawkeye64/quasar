<template>
  <h6>With Imports</h6>

  <div>
    <q-btn label="Click me" />
    <q-icon name="map" />
  </div>
</template>

<script setup lang="ts">
import { Notify, QBtn } from 'quasar'

console.log(QBtn)
console.log('Notify', Notify)
</script>
