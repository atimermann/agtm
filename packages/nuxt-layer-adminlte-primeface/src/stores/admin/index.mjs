/**
 * Universal Admin Controller.
 *
 * Manages state related to the admin panel, including titles, menus, and indexed menus.
 * Utilizes Pinia for state management and Zod for menu schema validation.
 *
 * @module useAdminStore
 * @author André Timermann
 * @created on 16/12/23
 *
 *
 * @typedef {('primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark')} BadgeType
 * Defines the allowed types for badges, controlling their appearance.
 *
 *
 * @typedef {object} MenuItem
 * Represents an item in the admin panel's navigation menu.
 * @property {string}                                                                                   [id]         - Optional unique identifier for the menu item.
 * @property {string}                                                                                   title        - Display title for the menu item.
 * @property {string}                                                                                   key          - System-generated key for the menu item.
 * @property {string}                                                                                   [parent]     - Optional key of the parent menu item.
 * @property {string}                                                                                   [link]       - Optional URL link for the menu item.
 * @property {Array<string>}                                                                            iconClasses  - Array of CSS classes for the item's icon.
 * @property {string}                                                                                   [badge]      - Optional badge text to display on the item.
 * @property {('primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'light' | 'dark')} [badgeType]  - Optional type for the badge, defining its appearance.
 * @property {Array<MenuItem>}                                                                          [subItems]   - Optional array of nested sub-items, allowing for recursive structure.
 *
 *
 * @typedef {object} Menu
 * Represents the top-level structure of the admin panel's navigation menu.
 * @property {Array<MenuItem>}                                                                          items        - Array of top-level menu items.
 */

import { defineStore } from 'pinia'
import { menuSchema } from './schemas.mjs'

/**
 * Defines a Pinia store for admin control.
 *
 * @return {object} The admin store instance.
 */
export const useAdminStore = defineStore('admin', {
  state: () => ({
    title: 'Admin',
    /**
     * @type {Menu}
     */
    menu: {},
    /**
     * @type {{[key: string]: MenuItem}}
     */
    indexedMenu: {}
  }),
  actions: {
    /**
     * Defines the admin panel menu using a given menu object. Validates the menu structure,
     * sets the menu state, and indexes the menu items for quick access.
     *
     * @param {Menu} menu  The menu object to be defined and indexed.
     */
    defineMenu (menu) {
      menuSchema.parse(menu)
      this.menu = menu
      this.indexedMenu = indexMenuItems(menu.items)
    },
    /**
     * Sets the badge and badge type for a given menu item.
     *
     * @param {string}    menuKey      - The name of the menu item to which the badge will be set. Assumes the
     *                                 menu item name is a key in `indexedMenu`.
     * @param {string}    badge        - The badge text to be displayed on the menu item.
     * @param {BadgeType} [badgeType]  - The type of the badge, which controls its appearance.
     *
     * @throws Will throw an error if the menu item does not exist in `indexedMenu`.
     */
    setBadge (menuKey, badge, badgeType = 'info') {
      verifyMenuKeyExists(this.indexedMenu, menuKey)

      this.indexedMenu[menuKey].badge = badge
      this.indexedMenu[menuKey].badgeType = `badge-${badgeType}`
    },
    /**
     * Toggles the open state of a specific menu item identified by its key.
     * If the menu item has subItems and it's being opened, all other items are closed
     * to ensure only one submenu is open at a time.
     *
     * @param {string} menuKey  - The unique key of the menu item to toggle. This key is either derived from the item's id or its title.
     * @throws Will throw an error if the menuKey does not match any item in `indexedMenu`,
     *         listing all possible keys for reference.
     */
    toggleMenuItem (menuKey) {
      verifyMenuKeyExists(this.indexedMenu, menuKey)

      const menuItem = this.indexedMenu[menuKey]

      if (!menuItem.isOpen) {
        const menusToClose = menuItem.parent
          ? menuItem.parent.subItems
          : this.menu.items

        closeMenuItems(menusToClose, menuKey)
      }

      menuItem.isOpen = !menuItem.isOpen
    }
  }
})

/**
 * Indexes menu items recursively for quick access. Generates a flat object where keys are
 * derived from item titles or IDs, and values are references to the original menu item objects.
 *
 * @param  {Array<MenuItem>}           items   The array of menu items to be indexed.
 * @param  {string}                    prefix  The prefix used for keys of nested items, default is an empty string.
 * @param  {MenuItem}                  parent
 *
 * @return {Object.<string, MenuItem>}         The indexed menu items object.
 */
function indexMenuItems (items, prefix = '', parent = undefined) {
  const indexedItems = {}

  items.forEach((item) => {
    const key = `${prefix}${(item.id || item.title).replace(/[\s.]+/g, '_')}`

    if (indexedItems[key]) {
      throw new Error(`Duplicate key found: "${key}". Consider adding a unique 'id' attribute to each item.`)
    }

    indexedItems[key] = item
    indexedItems[key].key = key
    indexedItems[key].parent = parent

    if (item.subItems && item.subItems.length > 0) {
      Object.assign(indexedItems, indexMenuItems(item.subItems, `${key}.`, item))
    }
  })

  return indexedItems
}

/**
 * Verifies if the given menuKey exists in the indexedMenu. If not, throws an error listing all possible keys.
 *
 * @param {object} indexedMenu  - The object containing indexed menu items.
 * @param {string} menuKey      - The key of the menu item to verify.
 * @throws Will throw an error if the menuKey does not exist in indexedMenu.
 */
function verifyMenuKeyExists (indexedMenu, menuKey) {
  if (!indexedMenu[menuKey]) {
    const possibleKeys = Object.keys(indexedMenu).join(', ')
    throw new Error(`Menu item with key "${menuKey}" does not exist. Possible keys are: ${possibleKeys}`)
  }
}

/**
 * Closes all menu items within a given menu array, optionally excluding a specified item.
 * If any menu item has subItems, this function is recursively called to ensure all nested
 * subItems are also closed. This method is designed to support the functionality of
 * collapsing all but the currently active submenu in a navigation structure.
 *
 * @param {Array<MenuItem>} menu             - An array of menu items. Each menu item is an object that may contain 'subItems',
 *                                           which is an array of menu items.
 * @param {string}          [exceptMenuKey]  - Optional index of the menu item that should not be closed.
 *                                           If provided, the menu item at this index will remain open,
 *                                           along with its parent items. If undefined, all menu items will be closed.
 */
function closeMenuItems (menu, exceptMenuKey) {
  menu.forEach((item) => {
    if (exceptMenuKey !== undefined && exceptMenuKey !== item.key) {
      item.isOpen = false
      if (item.subItems && item.subItems.length > 0) {
        closeMenuItems(item.subItems)
      }
    }
  })
}
