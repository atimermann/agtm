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

import AutoComplete from 'primevue/autocomplete'
import { cloneDeep } from 'lodash-es'
import { ref } from '#imports'

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
})

if (!props.context.search) {
  throw new Error('Serch props is required')
}

const value = ref(props.context._value)
const items = ref([])

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
