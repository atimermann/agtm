<template>
  <Chips
    v-model="value"
    :allow-duplicate="false"
    separator=","
    @update:model-value="update"
  />
</template>

<script setup>
// ATTENTION, when adding props you need to register in plugns/formkit

import Chips from 'primevue/chips'
import { ref, onMounted, watch } from '#imports'
import { cloneDeep } from 'lodash-es'

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
})

const value = ref()
onMounted(async () => {
  if (props.context._value) {
    value.value = props.context._value
  }
})

watch(() => props.context._value, async (newValue) => {
  if (newValue) {
    value.value = props.context._value
  } else {
    value.value = undefined
  }
})

function update (value) {
  if (value) {
    props.context.node.input(value)
  }
}

</script>

<style scoped>

</style>
