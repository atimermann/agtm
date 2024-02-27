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
    <div class="col">
      <NfCrudLayoutDefaultDataTable
        v-model="model"
        :schema
        :id-key
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
      :value="formValues"
      :schema="formSchema"
      @submit="onSubmit"
      @submitted="onSubmitted"
    />
  </Dialog>

  <!--  <ConfirmDialog group="headless">-->
  <!--    <template #container="{ message, acceptCallback, rejectCallback }">-->
  <!--      <div class="flex flex-column align-items-center p-5 surface-overlay border-round">-->
  <!--        <div class="border-circle bg-primary inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8">-->
  <!--          <i class="pi pi-question text-5xl" />-->
  <!--        </div>-->
  <!--        <span class="font-bold text-2xl block mb-2 mt-4">{{ message.header }}</span>-->
  <!--        <p class="mb-0">-->
  <!--          {{ message.message }}-->
  <!--        </p>-->
  <!--        <div class="flex align-items-center gap-2 mt-4">-->
  <!--          <Button label="Save" @click="acceptCallback" />-->
  <!--          <Button label="Cancel" outlined @click="rejectCallback" />-->
  <!--        </div>-->
  <!--      </div>-->
  <!--    </template>-->
  <!--  </ConfirmDialog>-->
  <!--  <div class="card flex justify-content-center">-->
  <!--    <Button label="Save" @click="requireConfirmation()" />-->
  <!--  </div>-->
  <!--  <Toast />-->

  <pre style="background-color: lightgray">
<b>formValues:</b>
  {{ formValues }}
<b>formSchema:</b>
  {{ formSchema }}
<b>MODEL:</b>
    {{ model }}
</pre>
</template>
------------------------------------------------------------------------------------------------------------------------
                                                        SCRIPT
------------------------------------------------------------------------------------------------------------------------
<script setup>

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'

import { computed, ref } from '#imports'

// import ConfirmDialog from 'primevue/confirmdialog'
// import { useConfirm } from 'primevue/useconfirm'
// import { useToast } from 'primevue/usetoast'
//

// ------------------------------------------------
// const confirm = useConfirm()
// const toast = useToast()
//
// const requireConfirmation = () => {
//   confirm.require({
//     group: 'headless',
//     header: 'Are you sure?',
//     message: 'Please confirm to proceed.',
//     accept: () => {
//       toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 })
//     },
//     reject: () => {
//       toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
//     }
//   })
// }

// ------------------------------------------------
const props = defineProps({
  idKey: {
    type: String,
    default: 'id'
  },
  schema: {
    type: Array,
    default: () => []
  }
})

const model = defineModel({ required: true, type: Array })

const emit = defineEmits(['submit'])

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
  return {
    name: schemaItem.name,
    label: schemaItem.label,
    $formkit: 'text',
    ...schemaItem.form
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// EVENTOS
// ---------------------------------------------------------------------------------------------------------------------

function onSubmit (values, callback) {
  emit('submit', values, callback)
}

function onSubmitted (newData, values) {
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
  closeForm()
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
  alert(`Delete: ${id}`)
}

</script>

------------------------------------------------------------------------------------------------------------------------
                                                       STYLE
------------------------------------------------------------------------------------------------------------------------
<style scoped>

</style>
