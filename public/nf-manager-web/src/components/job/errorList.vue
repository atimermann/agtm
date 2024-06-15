<template>
  <NfCard>
    <template #title>
      Erros
    </template>
    <template #content>
      <DataTable
        :value="parsedErrorList"
        selection-mode="single"
        scrollable
        scroll-height="400px"
        table-style="min-width: 50rem"
        class="p-datatable-sm"
        @row-select="onRowSelect"
      >
        <Column field="formattedDateTime" header="Hora" />
        <Column field="note" header="Info" />
        <Column field="workerName" header="Worker" />
        <Column field="instance" header="Instancia" />
      </DataTable>
    </template>
  </NfCard>
  <Dialog
    v-model:visible="errorDescriptionDialogVisible"
    modal
    header="Descrição do Erro"
    :style="{ width: '50vw' }"
  >
    <span style="white-space: pre;" v-text="errorDescriptionText" />
  </Dialog>
</template>

<script setup>

import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import { orderBy } from 'lodash'

const errorDescriptionDialogVisible = ref(false)
const errorDescriptionText = ref('')

const props = defineProps({
  errorList: {
    type: Array,
    default: () => []
  }
})

const parsedErrorList = computed(() => {
  return orderBy(props.errorList, 'dateTime', 'desc')
    .map(error => {
      if (!error.formattedDateTime) {
        error.formattedDateTime = Intl.DateTimeFormat(
          'pt-BR',
          {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }
        ).format(error.dateTime)
      }

      return error
    })
})

const onRowSelect = (event) => {
  errorDescriptionText.value = event.data.description
  errorDescriptionDialogVisible.value = true
}

</script>
