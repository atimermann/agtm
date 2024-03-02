<template>
  <nav class="mt-2">
    <ul class="nav nav-pills nav-sidebar flex-column" role="menu">
      <AdminSideBarMenuItem
        v-for="(item, index) in menu.items"
        :key="index"
        :menu-item="item"
      />
      <AdminSideBarMenuItem
        v-if="admin.auth.enabled"
        :menu-item="{
          title: 'Sair',
          link: '/logout',
          iconClasses: [
            'pi',
            'pi-sign-out'
          ]
        }"
      />
    </ul>
  </nav>
</template>

<script setup>

import { useAdminStore } from '@/stores/admin'
import { useAppConfig } from '#imports'
import { storeToRefs } from 'pinia'

/*
TODO:
 * [OK] Implementar active corretamente para exibir o menu ativo
 * Implementar menu perfil no lado direito superior
 * [OK] Implementar configuração de menu
*/

const { admin } = useAppConfig()

const menuAdminStore = useAdminStore()
menuAdminStore.defineMenu(admin.menu)

const { menu } = storeToRefs(menuAdminStore)

</script>

<style scoped>
</style>
