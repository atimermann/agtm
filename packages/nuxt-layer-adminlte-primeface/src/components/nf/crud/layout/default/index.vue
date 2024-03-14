------------------------------------------------------------------------------------------------------------------------
                                                     TEMPLATE
------------------------------------------------------------------------------------------------------------------------
<template>
  <div class="grid">
    <div class="col">
      <Button icon="pi pi-plus" label="Adicionar" @click="openNewForm" />
    </div>
    <div class="col" />
  </div>
  <div class="grid">
    <div class="col-12">
      <NfCrudLayoutDefaultDataTable
        v-model="model"
        :schema="gridSchema"
        :id-key
        :loading="loadingGrid"
        @edit="onEdit"
        @delete="onDelete"
      />
    </div>
  </div>
  <Dialog
    v-model:visible="formVisible"
    maximizable
    position="center"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    header="Novo"
    modal
  >
    <!--  When closing the modal form it is removed from memory, when opening again a new instance with clean data is loaded  -->
    <NfCrudLayoutDefaultForm
      :values="formValues"
      :schema="formSchema"
      :handlers="handlers.form"
      :form-load
      @submit="onSubmit"
      @submitted="onSubmitted"
    >
      <template #form>
        <slot name="form" :form-schema="formSchema" />
      </template>
    </NfCrudLayoutDefaultForm>
  </Dialog>

  <ConfirmDialog group="headless">
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-column align-items-center p-5 surface-overlay border-round">
        <div class="border-circle bg-primary inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8">
          <i class="pi pi-question text-5xl" />
        </div>
        <span class="font-bold text-2xl block mb-2 mt-4">{{ message.header }}</span>
        <p class="mb-0">
          {{ message.message }}
        </p>
        <div class="flex align-items-center gap-2 mt-4">
          <Button label="Save" @click="acceptCallback" />
          <Button label="Cancel" outlined @click="rejectCallback" />
        </div>
      </div>
    </template>
  </ConfirmDialog>
  <!--  <div class="card flex justify-content-center">-->
  <!--    <Button label="Save" @click="requireConfirmation()" />-->
  <!--  </div>-->
  <Toast />

<!--  <pre style="background-color: lightgray">-->
<!--<b>formValues:</b>-->
<!--  {{ formValues }}-->
<!--<b>formSchema:</b>-->
<!--  {{ formSchema }}-->
<!--<b>MODEL:</b>-->
<!--    {{ model }}-->
<!--</pre>-->
</template>
------------------------------------------------------------------------------------------------------------------------
                                                        SCRIPT
------------------------------------------------------------------------------------------------------------------------
<script setup>

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'

import { computed, ref } from '#imports'

import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { cloneDeep } from 'lodash-es'
//

// ------------------------------------------------

const confirm = useConfirm()

const toast = useToast()

const requireConfirmation = () => {
  confirm.require({
    group: 'headless',
    header: 'Are you sure?',
    message: 'Please confirm to proceed.',
    accept: () => {
      toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 })
    },
    reject: () => {
      toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
    }
  })
}

// ------------------------------------------------
const props = defineProps({
  idKey: {
    type: String,
    default: 'id'
  },
  schema: {
    type: Array,
    default: () => []
  },
  /**
   * Handlers made available by the user to be used for inputs or columns when loading schema, since it is not possible
   * to load functions in schemas
   */
  handlers: {
    type: Object,
    default: () => {
      return {
        form: {},
        grid: {}
      }
    }
  },
  /**
   * Grid in loading mode
   */
  loadingGrid: {
    type: Boolean,
    default: false
  },

  /**
   * Automatically updates crud when creating new record.
   */
  autoUpdate: {
    type: Boolean,
    default: true
  },

  formLoad: {
    type: Function,
    default: null
  }
})

const model = defineModel({ required: true, type: [Array, null] })

const emit = defineEmits(['submit', 'submitted', 'delete', 'deleted'])

const formVisible = ref(false)

const formValues = ref({})

// ---------------------------------------------------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------------------------------------------------

const formSchema = computed(() => {
  return props.schema
    .map(schemaItem => setDefaultValueInSchema(schemaItem))
    .filter(schemaItem => !schemaItem.ignoreForm)
    .map(schemaItem => mapSchemaToFormSchema(schemaItem))
})

const gridSchema = computed(() => {
  return props.schema
    .map(schemaItem => setDefaultValueInSchema(schemaItem))
    .filter(schemaItem => !schemaItem.ignoreGrid)
    .map(schemaItem => mapSchemaToGridSchema(schemaItem))
})

// ---------------------------------------------------------------------------------------------------------------------
// Métodos
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Open modal with new form.
 */
function openNewForm () {
  formValues.value = {}
  formVisible.value = true
}

/**
 * Open editable form.
 *
 * @param values
 */
function openForm (values) {
  formValues.value = values
  formVisible.value = true
}

function closeForm () {
  formVisible.value = false
}

/**
 * Sets default values for formSchema.
 *
 * @param                                    schemaItem
 * @return {{$formkit: string, name, label}}
 */
function setDefaultValueInSchema (schemaItem) {
  return {
    ...schemaItem,
    form: schemaItem.form ?? {},
    ignoreForm: schemaItem.ignoreForm ?? false
  }
}

/**
 * Maps default nfCrud schema to FormKit schema.
 * Note: Maps only item by item, not the entire schema, it must be used within a loop.
 *
 * @param                                    schemaItem
 * @return {{$formkit: string, name, label}}
 */
function mapSchemaToFormSchema (schemaItem) {
  return (schemaItem.form.$el)
    ? schemaItem.form
    : {
        name: schemaItem.name,
        label: schemaItem.label,
        $formkit: schemaItem.form.$formkit,
        ...schemaItem.form
      }
}

/**
 * Maps default nfCrud schema to GridSchema
 * Note: Maps only item by item, not the entire schema, it must be used within a loop.
 *
 * @param                                    schemaItem
 * @return {{$formkit: string, name, label}}
 */
function mapSchemaToGridSchema (schemaItem) {
  return {
    name: schemaItem.name,
    label: schemaItem.label,
    ...schemaItem.grid
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// EVENTOS
// ---------------------------------------------------------------------------------------------------------------------

function onSubmit (values, callback) {
  emit('submit', values, callback)
}

function onSubmitted (newData, values) {
  if (props.autoUpdate) {
    if (newData) {
      model.value.push(values)
    } else {
      const index = model.value.findIndex(item => item.id === values.id)
      if (index !== -1) {
        model.value[index] = values
      } else {
        throw new Error(`Item with id ${values.id} not found.`)
      }
    }
  }
  closeForm()
  emit('submitted', newData, values)
}

function onEdit (id) {
  const values = model.value.find(item => item.id === id)

  if (!values) {
    // TOOD: Tratar uma forma de avisar amigavelmente usuário de que ocorreu um erro
    throw new Error(`Item with id ${id} not found.`)
  }

  openForm(values)
}

function onDelete (id) {
  // TODO: Implementar dialogo de confirmação
  emit('delete', { id }, (err, response) => {
    if (err) {
      console.log(err.stack)
    }
    if (props.autoUpdate) {
      if (response.success === true) {
        const index = model.value.findIndex(item => item.id === id)

        const deletedValue = cloneDeep(model.value[index])

        if (index !== -1) {
          model.value.splice(index, 1) // Remove o item de forma reativa
          emit('deleted', deletedValue)
        } else {
          throw new Error(`Item with id ${id} not found.`)
        }
      }
    }
  })
}

</script>

------------------------------------------------------------------------------------------------------------------------
                                                       STYLE
------------------------------------------------------------------------------------------------------------------------
<style scoped>

</style>
