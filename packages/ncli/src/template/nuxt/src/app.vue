<template>
  <NuxtLayout />
</template>

<script setup>

import { useAppConfig, useMenuAdminStore } from '#imports'

// ----------------------------------------------------------------------
// Template Configuration
// ----------------------------------------------------------------------

const appConfig = useAppConfig()

appConfig.admin.logoPath = (await import('~/assets/img/logo.png')).default

const menuAdminStore = useMenuAdminStore()

menuAdminStore.defineMenu({
  items: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      link: '/',
      iconClasses: [
        'pi',
        'pi-home'
      ]
    },
    {
      id: 'exit',
      title: 'Sair',
      link: '/login',
      iconClasses: [
        'pi',
        'pi-sign-out'
      ]
    }
  ]
})

</script>
