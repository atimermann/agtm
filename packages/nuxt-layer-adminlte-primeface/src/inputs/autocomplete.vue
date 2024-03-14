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
import { cloneDeep, isPlainObject } from 'lodash-es'
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

if (!['object', undefined, 'literal'].includes(props.context.output)) {
  throw new Error('Output props must be "object" or "literal"')
}

const outputType = props.context.output || 'object'
const items = ref([])
const value = ref()

onMounted(() => setValueFromContext(props.context))

watch(() => props.context._value, (newValue) => setValueFromContext(props.context))

/**
 * Sets the value based on the provided context. Refactored to use helper functions for simplicity.
 *
 * @param {object} context  The context containing necessary properties and methods.
 */
async function setValueFromContext (context) {
  if (!context._value) {
    value.value = undefined
    return
  }

  if (isPlainObject(context._value)) {
    const valueProp = context.valueProp || 'value'
    const labelProp = context.labelProp || 'label'

    validateObjectProperties(context._value, labelProp, valueProp)

    value.value = {
      label: context._value[labelProp],
      value: context._value[valueProp]
    }
  } else {
    value.value = await fetchItemFromContext(context, context._value)
  }
}

/**
 * Checks if the provided object has the required properties for label and value.
 *
 * @param {object} object     The object to check.
 * @param {string} labelProp  The property name for label.
 * @param {string} valueProp  The property name for value.
 * @throws {Error} If the object does not contain the required properties.
 */
function validateObjectProperties (object, labelProp, valueProp) {
  if (!(labelProp in object) || !(valueProp in object)) {
    throw new Error(`The object must contain the '${labelProp}' and '${valueProp}' properties in Autocomplete. (${JSON.stringify(object)})`)
  }
}

/**
 * Retrieves item information based on a given value.
 *
 * @param  {object}          context  The context containing the getItem function.
 * @param  {*}               value    The value to retrieve the item for.
 * @return {Promise<object>}          The item information.
 * @throws {Error} If the context does not provide a 'getItem' function.
 */
async function fetchItemFromContext (context, value) {
  if (typeof context.getItem !== 'function') {
    throw new Error('For non-literal values, the context must provide a \'getItem\' function to load \'label\'.')
  }
  return cloneDeep(await context.getItem(value))
}

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
  const valueProp = props.context.valueProp || 'value'
  const labelProp = props.context.labelProp || 'label'

  if (e.value) {
    props.context.node.input(
      outputType === 'object'
        ? {
            [labelProp]: e.value.label,
            [valueProp]: e.value.value
          }
        : e.value.value
    )
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
