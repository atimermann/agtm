<template>
  <nav class="mt-2">
    <ul class="nav nav-pills nav-sidebar flex-column" role="menu">
      <AdminSideBarMenuItem
        v-for="(item, index) in menu.items"
        :key="index"
        :menu-item="item"
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

const { template } = useAppConfig()

const admin = useAdminStore()
admin.defineMenu(template.menu)

const { menu } = storeToRefs(admin)

</script>

<style scoped>
</style>
