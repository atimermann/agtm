<template></template>
<script setup>
import { definePageMeta, navigateTo } from '#imports'
import { useAuthStore } from '../stores/auth.mjs'

const AuthStore = useAuthStore()
await AuthStore.logout()

navigateTo()

definePageMeta({
  layout: 'guest',
  auth: false
})
</script>
