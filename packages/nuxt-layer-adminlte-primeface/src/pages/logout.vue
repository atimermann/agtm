<template></template>
<script setup>
import { useAuthStore } from '../stores/auth.mjs'
import { definePageMeta, navigateTo } from '#imports'

const AuthStore = useAuthStore()
await AuthStore.logout()

navigateTo()

definePageMeta({
  layout: 'guest',
  auth: false
})
</script>
