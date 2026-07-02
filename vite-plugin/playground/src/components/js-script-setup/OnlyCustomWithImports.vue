<template>
  <h6>With only Custom Component and Imports</h6>

  <div>
    <custom-component />
  </div>
</template>

<script setup>
import { Notify, QBtn } from 'quasar'
import CustomComponent from './custom-component.js'

console.log(QBtn)
console.log('Notify', Notify)
</script>
