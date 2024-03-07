<template>
  <NfCrudLayoutDefault>
    <template #form="{ formSchema }">
      <slot name="form" :form-schema="formSchema" />
    </template>
  </NfCrudLayoutDefault>
</template>

<script setup>

</script>

<style scoped>

</style>
