<template>
  <nav class="main-header navbar navbar-expand navbar-white navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a
          class="nav-link"
          data-widget="pushmenu"
          href="#"
          role="button"
          @click="colapseMenu"
        ><i class="pi pi-bars" /></a>
      </li>
      <!--      <li class="nav-item d-none d-sm-inline-block">-->
      <!--        <a href="../../index3.html" class="nav-link">Home</a>-->
      <!--      </li>-->
      <!--      <li class="nav-item d-none d-sm-inline-block">-->
      <!--        <a href="#" class="nav-link">Contact</a>-->
      <!--      </li>-->
    </ul>

    <!-- Right navbar links -->
    <slot />

    <div v-if="admin.auth.enabled" class="flex align-items-center gap-2">
      <span class="text-muted">{{ adminAuthStore.decodedToken?.name }} </span>
      <Avatar :image="avatarImg" shape="circle" />
    </div>
    <!--    <a v-ripple v-bind="props.action" class="flex align-items-center gap-2">-->
    <!--      <img :alt="item.name" :src="`/images/avatar/${item.image}`" style="width: 32px" />-->
    <!--      <span class="font-bold">{{ item.name }}</span>-->
    <!--    </a>-->
  </nav>
</template>

<script setup>

import Avatar from 'primevue/avatar'
import { inject, useAppConfig, useAuthAdminStore } from '#imports'

import avatarImg from '@/assets/adminlte/img/avatar5.png'

const adminAuthStore = useAuthAdminStore()

const { admin } = useAppConfig()

const colapseMenu = inject('colapseMenu')

</script>
