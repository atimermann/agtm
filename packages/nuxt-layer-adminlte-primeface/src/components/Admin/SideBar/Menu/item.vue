<template>
  <li class="nav-item" :class="{ 'menu-open': menuItem.isOpen }">
    <nuxt-link
      :to="menuItem.link"
      class="nav-link"
      :class="{ active: menuItem.link === $route.path }"
      @click.prevent="toggleMenuItem(menuItem)"
    >
      <span :style="spaceStyle" />
      <i v-if="menuItem.iconClasses" :class="['nav-icon', ...menuItem.iconClasses]" />
      <p>
        {{ menuItem.title }}
        <i v-if="menuItem.subItems" class="right pi pi-angle-left" />
        <span v-if="menuItem.badge" class='right' :class="['badge', 'badge-danger']">{{ menuItem.badge }}</span>
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
            @open="closeMenu(menuItem.subItems, index)"
          />
        </ul>
      </slide-up-down>
    </template>
  </li>
</template>

<script setup>

import { defineProps, defineEmits, computed } from 'vue'

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

const emit = defineEmits(['open', 'openSubmenu'])

/**
 * Change selected menu item
 *
 * Notifies the parent that this menu item has been opened
 * @param menuItem
 */
function toggleMenuItem (menuItem) {
  if (!menuItem.isOpen) {
    emit('open', menuItem)
  }
  menuItem.isOpen = !menuItem.isOpen
}

/**
 * Opening a menu item closes all others
 *
 * @param {object}  menu    Menu in which all items will be closed
 * @param {number} exceptIndex  Closes all menu items except the one you just opened
 */
function closeMenu (menu, exceptIndex) {
  menu.forEach((item, index) => {
    if (exceptIndex !== undefined && exceptIndex !== index) {
      item.isOpen = false
      if (item.subItems && item.subItems.length > 0) {
        closeMenu(item.subItems)
      }
    }
  })
}

/**
 * Add indentation to submenus
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
