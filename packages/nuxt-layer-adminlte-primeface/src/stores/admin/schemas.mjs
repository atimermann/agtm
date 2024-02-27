/**
 * **Created on 20/02/24**
 *
 * @file packages/nuxt-layer-adminlte-primeface/src/stores/admin/schemas.mjs
 *  [[ DESCRIPTION HERE ]]
 
 * @author André Timermann <andre@timermann.com.br>
 *
 */

import { z } from 'zod'

/**
 * A recursive Zod schema definition for a menu item. This schema is used to
 * validate individual menu items and their nested sub-items, ensuring they
 * conform to the specified structure and types.
 *
 */
export const menuItemSchema = z.lazy(() => z.object({
  id: z.string().optional(), // Optional unique identifier for the menu item.
  title: z.string(), // Display title for the menu item.
  link: z.string().optional(), // Optional URL link for the menu item.
  iconClasses: z.array(z.string()), // Array of CSS classes for the item's icon.
  badge: z.string().optional(), // Optional badge text to display on the item.
  badgeType: z.enum(['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark']).optional(), // Optional type for the badge, defining its appearance.
  subItems: z.array(menuItemSchema).optional() // Optional array of nested sub-items, allowing for recursive structure.
}))

/**
 * A Zod schema for the top-level menu structure. This schema validates the
 * overall menu configuration, which consists of an array of menu items as
 * defined by the `menuItemSchema`.
 *
 */
export const menuSchema = z.object({
  items: z.array(menuItemSchema)
})
