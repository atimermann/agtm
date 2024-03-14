<template>
  <!--suppress RequiredAttributes -->
  <DataTable
    :value="model"
    :loading="loading || model === null"
  >
    <template v-for="col of schema" :key="col.idKey">
      <Column
        :field="col.name"
        :header="col.label"
      />
    </template>
    <Column
      class="text-right"
    >
      <template #body="{ data }">
        <Button
          text
          type="button"
          icon="pi pi-pencil"
          @click="$emit('edit', data.id)"
        />
        <Button
          text
          type="button"
          icon="pi pi-trash"
          style="color: red"
          @click="$emit('delete', data.id)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup>
// Todas as possiveis propriededes de Column https://primevue.org/datatable/#api.column
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

defineProps({
  idKey: {
    type: String,
    default: 'id'
  },
  schema: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])

const model = defineModel({ required: true, type: [Array, null] })

</script>

<style scoped>

</style>
