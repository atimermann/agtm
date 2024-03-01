<template>
  <NuxtLayout />
</template>

<script setup>

import { useAppConfig } from '#imports'

// ----------------------------------------------------------------------
// Template Configuration
// ----------------------------------------------------------------------

const appConfig = useAppConfig()

appConfig.template.logoPath = (await import('~/assets/img/logo.png')).default
appConfig.template.menu = {
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
}

</script>
