<template>
  <FormKit
    id="form"
    v-model="formValues"
    type="form"
    :submit-label="values.id ? 'Atualizar' : 'Criar'"
    @submit="submit"
  >
    <slot name="form">
      <FormKitSchema :schema :data />
    </slot>
  </FormKit>
  <pre v-if="debug" style="background-color: #ffe456">{{ formValues }}</pre>
</template>

<script setup>

import { onMounted, ref, reactive } from '#imports'
import { cloneDeep } from 'lodash-es'

const props = defineProps({
  schema: {
    type: Array,
    default: () => []
  },
  values: {
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
  },

  formLoad: {
    type: Function,
    default: null
  },
  /**
   * Debug mode, displays more information
   */
  debug: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['submit', 'submitted'])

const formValues = ref({})

onMounted(async () => {
  formValues.value = (props.values && props.formLoad)
    ? await props.formLoad(cloneDeep(props.values))
    : cloneDeep(props.values)
})

const data = reactive({
  ...props.handlers
})

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
    if (err) {
      console.log(err)
    } else if (response.success === true) {
      const newForm = (values.id === undefined)
      emit('submitted', newForm, response.data)
    } else {
      // TODO: Criar classe para tratar erro do topo API **************
      alert('Erro de API') //                                         *
      console.error(response) //                                      *
      // **************************************************************
    }
  })
}

</script>

<style scoped>

</style>
