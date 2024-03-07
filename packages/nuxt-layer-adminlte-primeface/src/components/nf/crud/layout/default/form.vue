<template>
  <FormKit
    id="form"
    v-model="values"
    :value
    type="form"
    :submit-label="value.id ? 'Atualizar' : 'Criar'"
    @submit="submit"
  >
    <slot name="form">
      <FormKitSchema :schema :data />
    </slot>
  </FormKit>
</template>

<script setup>

import { ref, reactive } from '#imports'

const props = defineProps({
  schema: {
    type: Array,
    default: () => []
  },
  value: {
    type: Object,
    default: () => {
    }
  },
  /**
   * https://formkit.com/essentials/schema#referencing-functions
   * Handlers made available by the user to be used for inputs or columns when loading schema, since it is not possible
   * to load functions in schemas
   */
  handlers: {
    type: Object,
    default: () => {
    }
  }
})

const values = ref({})

const data = reactive({
  ...props.handlers
})

const emit = defineEmits(['submit', 'submitted'])

// TODO: implementar modo para two-way data bind usar model em vez de value
// const model = defineModel({ type: Object })

/**
 * Emits a 'submit' event with the provided values and handles the response via a callback function.
 * This function is designed to be used within Vue components, where it relies on the component's
 * event handling system to notify parent components of the submission event and to receive a
 * response back in an asynchronous manner.
 *
 * @param {object} values  - The data to be submitted, typically collected from a form.
 */
function submit (values) {
  emit('submit', values, (err, response) => {
    const newForm = (values.id === undefined)

    if (err) {
      console.log(err.stack)
    } else if (response.success === true) {
      emit('submitted', newForm, response.data)
    }
  })
}

</script>

<style scoped>

</style>
