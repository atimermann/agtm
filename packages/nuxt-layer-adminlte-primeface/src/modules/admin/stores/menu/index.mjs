/**
 * Universal Admin Controller.
 *
 * @file
 * Manages state related to the admin panel, including titles, menus, and indexed menus.
 * Utilizes Pinia for state management and Zod for menu schema validation.
 *
 * @module useAdminStore
 * @author André Timermann
 * Created on 16/12/23
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

import { useAppConfig } from '#imports'

/**
 * Defines a Pinia store for admin control.
 *
 * @return {object} The admin store instance.
 */
export const useMenuAdminStore = defineStore('menuAdmin', {
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
      const { admin: adminConfig } = useAppConfig()

      menuSchema.parse(menu)
      this.menu = menu
      this.indexedMenu = indexMenuItems(menu.items)

      if (adminConfig.auth.enabled) {
        this.addItemMenu({
          title: 'Sair',
          link: '/logout',
          iconClasses: [
            'pi',
            'pi-sign-out'
          ]
        })
      }
    },

    /**
     * Adds a new menu item to the specified parent menu or to the main menu, at a specified position.
     * Validates the updated menu structure using a schema and re-indexes the menu items for quick access.
     * The position can be defined as 'atStart', at a specific numeric index, 'atEnd' (default),
     * 'before:<key>', or 'after:<key>', where <key> is the key of an existing menu item.
     *
     * @param {MenuItem} menuItem     - The menu item to be added, following the MenuItem structure.
     * @param {string}   [parentKey]  - The key of the parent menu item to which the new item will be added as a sub-item. Optional.
     *                                If not provided, the item will be added to the top-level menu.
     * @param {string}   [position]   - Specifies the position at which to insert the new menu item. Defaults to 'atEnd'.
     *                                Positions can be 'atStart', a specific index (as a string), 'before:<key>', or 'after:<key>'.
     *
     * @example
     * // Example of adding a menu item to the top-level menu at the end
     * addItemMenu({ id: 'newItem', title: 'New Item', key: 'new_item' });
     *
     * @example
     * // Example of adding a sub-item to an existing item specified by 'parentKey', before another item
     * addItemMenu({ id: 'subItem', title: 'Sub Item', key: 'sub_item' }, 'parentItemKey', 'before:otherItemKey');
     */
    addItemMenu (menuItem, parentKey, position = 'atEnd') {
      const targetMenuArray = getTargetMenuItems(this.menu.items, this.indexedMenu, parentKey)

      addItemToMenuAtPosition(targetMenuArray, menuItem, position)

      // Validates the updated menu structure and re-indexes the items
      menuSchema.parse(this.menu)
      this.indexedMenu = indexMenuItems(this.menu.items)
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
 * Each key is a string that combines the optional prefix and the item's title or ID, with spaces
 * and periods replaced by underscores. This function also enriches each menu item with a `key`
 * property reflecting its generated key, and a `parent` property linking to its parent item, if any.
 *
 * @param  {MenuItem[]}                items     An array of menu items to be indexed. Each `MenuItem` should have an `id` or `title`,
 *                                               and optionally `subItems` which is an array of `MenuItem`.
 * @param  {string}                    [prefix]  The prefix used for keys of nested items. Defaults to an empty string.
 * @param  {MenuItem}                  [parent]  The parent menu item of the current nesting level. Undefined for top-level items.
 * @return {{[key: string]: MenuItem}}           An object indexing all menu items by their generated keys. The object flattens
 *                                               the structure of nested items into a single level, with each value being a `MenuItem` that includes the `key` and `parent` properties.
 *
 * @private
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
 *
 * @private
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
 *  @private
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

/**
 * Determines the appropriate target menu array for adding a new menu item,
 * either to the top-level menu or a specified submenu based on the parentKey.
 * This function is external to the store's scope, hence it requires the menu items to be passed in.
 *
 * @param  {Array<MenuItem>|{[key: string]: MenuItem}} menuItems    - The current set of menu items.
 * @param  {{[key: string]: MenuItem}}                 indexedMenu  - The indexed menu object for lookup.
 * @param  {string}                                    [parentKey]  - Optional key of the parent menu item. If provided,
 *                                                                  the new item will be added to the corresponding submenu.
 * @return {Array<MenuItem>}                                        The target menu array where the new item should be added.
 */
function getTargetMenuItems (menuItems, indexedMenu, parentKey) {
  if (parentKey) {
    verifyMenuKeyExists(indexedMenu, parentKey)
    const parentMenuItem = indexedMenu[parentKey]
    if (!parentMenuItem.subItems) parentMenuItem.subItems = []
    return parentMenuItem.subItems
  } else {
    return menuItems
  }
}

/**
 * Adds a new menu item to the menu structure at a specified position.
 *
 * @param {Array<MenuItem>} targetMenuArray  - The array where the new item will be added.
 * @param {MenuItem}        menuItem         - The new menu item to be added.
 * @param {string}          position         - The position where the new item should be added.
 *                                           Can be 'atStart', a specific index, 'before:<key>', 'after:<key>', or 'atEnd'.
 * @private
 */
function addItemToMenuAtPosition (targetMenuArray, menuItem, position) {
  // Determines the insertion position based on the 'position' string
  if (position === 'atStart') {
    targetMenuArray.unshift(menuItem)
  } else if (position.startsWith('before:')) {
    const key = position.substring(7)
    verifyMenuKeyExists(this.indexedMenu, key) // Verifies the provided key exists before trying to find the index
    const index = targetMenuArray.findIndex(item => item.key === key)
    targetMenuArray.splice(index, 0, menuItem)
  } else if (position.startsWith('after:')) {
    const key = position.substring(6)
    verifyMenuKeyExists(this.indexedMenu, key) // Verifies the provided key exists before trying to find the index
    const index = targetMenuArray.findIndex(item => item.key === key)
    targetMenuArray.splice(index + 1, 0, menuItem)
  } else if (!isNaN(position) && parseInt(position) >= 0) {
    // If 'position' is a valid numeric index, inserts at the specified position
    targetMenuArray.splice(parseInt(position), 0, menuItem)
  } else {
    // If no valid position is specified, adds the item to the end of the array
    targetMenuArray.push(menuItem)
  }
}
