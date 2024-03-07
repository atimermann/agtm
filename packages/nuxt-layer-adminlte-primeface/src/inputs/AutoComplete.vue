<template>
  <AutoComplete
    v-model="value"
    dropdown
    :suggestions="items"
    force-selection
    @complete="search"
    @item-select="select"
    @clear="clear"
  />
</template>

<script setup>

import AutoComplete from 'primevue/autocomplete'
import { ref } from '#imports'

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
})

if (!props.context.search) {
  throw new Error('Serch function is required')
}

const value = ref(props.context._value)
const items = ref([])

const search = (event) => {
  items.value = props.context.search(event)
}

function select (e) {
  if (e.value) {
    props.context.node.input(e.value)
  }
}

function clear (e) {
  props.context.node.input(undefined)
}

</script>

<style scoped>

</style>
