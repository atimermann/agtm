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

import { storeToRefs } from 'pinia'

import { useMenuAdminStore } from '#imports'

/*
TODO:
 * [OK] Implementar active corretamente para exibir o menu ativo
 * Implementar menu perfil no lado direito superior
 * [OK] Implementar configuração de menu
*/

const menuAdminStore = useMenuAdminStore()

const { menu } = storeToRefs(menuAdminStore)

</script>

<style scoped>
</style>
