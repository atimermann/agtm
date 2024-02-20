<template>
  <nav class="mt-2">
    <ul class="nav nav-pills nav-sidebar flex-column" role="menu">
      <AdminSideBarMenuItem
        v-for="(item, index) in template.menu.items"
        :key="index"
        :menu-item="item"
        @open="closeMenu(template.menu.items, index)"
        @open-submenu="closeMenu"
      />
    </ul>
  </nav>
</template>

<script setup>

import { useAppConfig, ref } from '#imports'

/*
TODO:
 * [OK] Implementar active corretamente para exibir o menu ativo
 * Implementar menu perfil no lado direito superior
 * Implementar configuração de menu
*/

const { template } = useAppConfig()

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

// const x = [
//     {
//       "title": "Dashboard",
//       "iconClasses": [
//         "pi",
//         "pi-home"
//       ],
//       "link": "#",
//       "active": true,
//       "subItems": [
//         {
//           "title": "Dashboard v1",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index.html",
//           "active": false
//         },
//         {
//           "title": "Dashboard v2",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index2.html",
//           "active": false
//         },
//         {
//           "title": "Dashboard v3",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index3.html",
//           "active": false
//         }
//       ],
//       "badge": null,
//       "badgeClasses": null,
//       "isOpen": false
//     },
//     {
//       "title": "Widgets",
//       "iconClasses": [
//         "pi",
//         "pi-calculator"
//       ],
//       "link": "../widgets.html",
//       "active": false,
//       "subItems": [
//         {
//           "title": "Dashboard v1",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index.html",
//           "active": false
//         },
//         {
//           "title": "Dashboard v2",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index2.html",
//           "active": false
//         },
//         {
//           "title": "Dashboard v3",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index3.html",
//           "active": false
//         }
//       ],
//       "badge": "New",
//       "badgeClasses": [
//         "badge-danger"
//       ],
//       "isOpen": false
//     },
//     {
//       "title": "Calendar",
//       "iconClasses": [
//         "pi",
//         "pi-calendar"
//       ],
//       "link": "../calendar.html",
//       "active": false,
//       "subItems": [
//         {
//           "title": "Dashboard v1",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index.html",
//           "active": false
//         },
//         {
//           "title": "Dashboard v2",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index2.html",
//           "active": false
//         },
//         {
//           "title": "Dashboard v3",
//           "iconClasses": [
//             "pi",
//             "pi-circle-on"
//           ],
//           "link": "../../index3.html",
//           "active": false
//         }
//       ],
//       "badge": "2",
//       "badgeClasses": [
//         "badge-info"
//       ],
//       "isOpen": false
//     },
//     {
//       "title": "Kanban Board",
//       "iconClasses": [
//         "pi",
//         "pi-clone"
//       ],
//       "link": "../kanban.html",
//       "active": false,
//       "subItems": [],
//       "badge": null,
//       "badgeClasses": null,
//       "isOpen": false
//     }
//   ],
//   "_value"
// :
// [
//   {
//     "title": "Dashboard",
//     "iconClasses": [
//       "pi",
//       "pi-home"
//     ],
//     "link": "#",
//     "active": true,
//     "subItems": [
//       {
//         "title": "Dashboard v1",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index.html",
//         "active": false
//       },
//       {
//         "title": "Dashboard v2",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index2.html",
//         "active": false
//       },
//       {
//         "title": "Dashboard v3",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index3.html",
//         "active": false
//       }
//     ],
//     "badge": null,
//     "badgeClasses": null,
//     "isOpen": false
//   },
//   {
//     "title": "Widgets",
//     "iconClasses": [
//       "pi",
//       "pi-calculator"
//     ],
//     "link": "../widgets.html",
//     "active": false,
//     "subItems": [
//       {
//         "title": "Dashboard v1",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index.html",
//         "active": false
//       },
//       {
//         "title": "Dashboard v2",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index2.html",
//         "active": false
//       },
//       {
//         "title": "Dashboard v3",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index3.html",
//         "active": false
//       }
//     ],
//     "badge": "New",
//     "badgeClasses": [
//       "badge-danger"
//     ],
//     "isOpen": false
//   },
//   {
//     "title": "Calendar",
//     "iconClasses": [
//       "pi",
//       "pi-calendar"
//     ],
//     "link": "../calendar.html",
//     "active": false,
//     "subItems": [
//       {
//         "title": "Dashboard v1",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index.html",
//         "active": false
//       },
//       {
//         "title": "Dashboard v2",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index2.html",
//         "active": false
//       },
//       {
//         "title": "Dashboard v3",
//         "iconClasses": [
//           "pi",
//           "pi-circle-on"
//         ],
//         "link": "../../index3.html",
//         "active": false
//       }
//     ],
//     "badge": "2",
//     "badgeClasses": [
//       "badge-info"
//     ],
//     "isOpen": false
//   },
//   {
//     "title": "Kanban Board",
//     "iconClasses": [
//       "pi",
//       "pi-clone"
//     ],
//     "link": "../kanban.html",
//     "active": false,
//     "subItems": [],
//     "badge": null,
//     "badgeClasses": null,
//     "isOpen": false
//   }
// ]

</script>

<style scoped>
</style>
