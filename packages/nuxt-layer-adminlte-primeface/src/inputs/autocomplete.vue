<template>
  <AutoComplete
    v-model="value"
    dropdown
    :suggestions="items"
    force-selection
    option-label="label"
    @complete="search"
    @item-select="select"
    @clear="clear"
  />
</template>

<script setup>
// ATTENTION, when adding props you need to register in plugns/formkit

import AutoComplete from 'primevue/autocomplete'
import { cloneDeep } from 'lodash-es'
import { watch, onMounted, ref } from '#imports'

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
})

if (!props.context.search) {
  throw new Error('Search props is required  in AutoComplete Input. Need restart.')
}

if (!props.context.getItem) {
  throw new Error('getItem props is required in AutoComplete Input. Need restart.')
}

const items = ref([])
const value = ref()

onMounted(async () => {
  if (props.context._value) {
    value.value = cloneDeep(await props.context.getItem(props.context._value))
  }
})

watch(() => props.context._value, async (newValue) => {
  if (newValue) {
    value.value = cloneDeep(await props.context.getItem(newValue))
  } else {
    value.value = undefined // Limpa o valor se _value for nulo/undefined
  }
})

/**
 * Searches for items based on the user's input. It checks the cache for existing
 * results before making a new request. Caches new results to minimize API calls.
 *
 * @param {object} event  - The event object containing the user's query.
 */

const search = async (event) => {
  items.value = cloneDeep(await props.context.search(event.query))
}

/**
 * Handles the selection of an item from the autocomplete suggestions.
 * Inputs the selected value into the context's node.
 *
 * @param {object} e  - The event object containing the selected item's value.
 */
function select (e) {
  if (e.value) {
    props.context.node.input(e.value.value)
  }
}

/**
 * Clears the current selection from the autocomplete input.
 *
 * @param {object} e  - The event object for the clear action.
 */
function clear (e) {
  props.context.node.input(undefined)
}

</script>

<style scoped>

</style>
