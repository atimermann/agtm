<template>
  <aside class="main-sidebar sidebar-dark-primary elevation-4 side">
    <!-- Brand Logo -->

    <a href="#" class="brand-link">
      <img
        v-show="layoutAdminStore.menu.logoImage"
        :src="layoutAdminStore.menu.logoImage"
        alt="AdminLTE Logo"
        class="brand-image img-circle elevation-3"
        style="opacity: .8"
      >

      <span class="brand-text font-weight-light">{{ layoutAdminStore.menu.logoLabel }}</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
      <slot />
    </div>
    <!-- /.sidebar -->
  </aside>
</template>

<script setup>
import { useLayoutAdminStore } from '#imports'
const layoutAdminStore = useLayoutAdminStore()
</script>
