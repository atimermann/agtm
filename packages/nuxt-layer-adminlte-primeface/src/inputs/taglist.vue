<template>
  <Chips
    v-model="value"
    :allow-duplicate="false"
    separator=","
    @update:model-value="update"
  />
</template>

<script setup>

import Chips from 'primevue/chips'
import { ref } from '#imports'

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
})

const value = ref(props.context._value)

function update (value) {
  if (value) {
    props.context.node.input(value)
  }
}

</script>

<style scoped>

</style>
