<template>
  <NuxtLayout />
</template>

<script setup>

// ----------------------------------------------------------------------
// Configuração do Template
// ----------------------------------------------------------------------

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()

appConfig.template = {
  logoPath: (await import('~/assets/img/logo.png')).default,
  logoLabel: 'Node Manager',
  version: runtimeConfig.public.version,
  menu: {
    items: [
      {
        title: 'Dashboard',
        link: '/',
        iconClasses: [
          'pi',
          'pi-home'
        ]
      },
      {
        title: 'Jobs',
        link: '/jobs',
        iconClasses: [
          'pi',
          'pi-home'
        ]
      },
      {
        title: 'Logs',
        link: '/',
        iconClasses: [
          'pi',
          'pi-home'
        ]
      },
      {
        title: 'Database',
        link: '/',
        iconClasses: [
          'pi',
          'pi-home'
        ]
      },
      {
        title: 'Socket',
        link: '/',
        iconClasses: [
          'pi',
          'pi-home'
        ]
      },
      {
        title: 'Sair',
        link: '/login',
        iconClasses: [
          'pi',
          'pi-sign-out'
        ]
      }
    ]
  }
}

</script>
