<template>
  <h6>With Imports</h6>

  <div>
    <q-btn label="Click me" />
    <q-icon name="map" />
  </div>
</template>

<script>
import { Notify, QBtn } from 'quasar'
import { defineComponent } from 'vue'

console.log(QBtn)
console.log('Notify', Notify)

export default defineComponent({
  name: 'RSImports'
})
</script>
