<template>
  <li class="nav-item" :class="{ 'menu-open': menuItem.isOpen }">
    <nuxt-link
      :to="menuItem.link"
      class="nav-link"
      :class="{ active: menuItem.link === $route.path }"
      @click.prevent="menuAdminStore.toggleMenuItem(menuItem.key)"
    >
      <span :style="spaceStyle" />
      <i v-if="menuItem.iconClasses" :class="['nav-icon', ...menuItem.iconClasses]" />
      <p>
        {{ menuItem.title }}
        <i v-if="menuItem.subItems" class="right pi pi-angle-left" />
        <span v-if="menuItem.badge" class="right" :class="['badge', menuItem.badgeType]">{{ menuItem.badge }}</span>
      </p>
    </nuxt-link>
    <template v-if="menuItem.subItems">
      <slide-up-down :active="menuItem.isOpen" :duration="500">
        <ul class="nav nav-treeview">
          <AdminSideBarMenuItem
            v-for="(item, index) in menuItem.subItems"
            :key="index"
            :menu-item="item"
            :level="level+1"
          />
        </ul>
      </slide-up-down>
    </template>
  </li>
</template>

<script setup>

import { computed, useMenuAdminStore } from '#imports'

// https://github.com/danieldiekmeier/vue-slide-up-down
import SlideUpDown from 'vue-slide-up-down'

const props = defineProps({
  menuItem: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

// Store
const menuAdminStore = useMenuAdminStore()

/**
 * Add indentation to submenus.
 *
 * @type {ComputedRef<{padding: string, margin: number, paddingLeft: string}>}
 */
const spaceStyle = computed(() => {
  return {
    margin: 0,
    padding: '0px',
    paddingLeft: `${props.level / 2}em`
  }
})

</script>

<style scoped>
.nav-link {
  cursor: pointer;
}
</style>
