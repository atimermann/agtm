<template></template>
<script setup>

import { definePageMeta, navigateTo, useAuthAdminStore } from '#imports'

// Store
const AuthAdminStore = useAuthAdminStore()

await AuthAdminStore.logout()

navigateTo()

definePageMeta({
  layout: 'guest',
  auth: false
})
</script>
