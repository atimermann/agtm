<template>
  <div class="control-sidebar-slide-open sidebar-mini" :class="{'sidebar-collapse': colapsedMenu}">
    <div class="wrapper">
      <!-- Navbar -->

      <AdminTopNavbar>
        <AdminRightNavbarLinks>
          <!-- Include other right navbar items like search, messages, notifications, etc. -->
        </AdminRightNavbarLinks>
      </AdminTopNavbar>
      <!-- /.navbar -->

      <!-- Main Sidebar Container -->
      <AdminMainSidebar>
        <!--      <SidebarSearch />-->
        <AdminSideBarMenu />
      </AdminMainSidebar>

      <!-- Content Wrapper. Contains page content -->
      <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <AdminContentHeader />
        <!-- Main content -->
        <section class="content">
          <nuxtPage />
        </section>
        <!-- /.content -->
      </div>

      <footer class="main-footer">
        <slot name="footer">
          <!-- TODO: Estudar uma forma do usuário poder inserir um componente aqui, sem ser apenas texto-->
          <div class="flex justify-content-end">
            {{ runtimeConfig.public.admin.version || 'Nuxt Admin' }}
          </div>
        </slot>
      </footer>

      <!-- /.control-sidebar -->
    </div>
  </div>
</template>

<script setup>

// TODO: Puxar as classes dessa maneira e salvar em utils
// TODO: Configuração em parametros app.config.ts
// TODO: Documentar tudo aqui e no zim (De preferencia criar cheatChet)

import { ref, provide, useRuntimeConfig } from '#imports'

const runtimeConfig = useRuntimeConfig()

const colapsedMenu = ref(false)

function colapseMenu () {
  colapsedMenu.value = !colapsedMenu.value
}

provide('colapseMenu', colapseMenu)

// class MenuItem {
//   constructor (title, iconClasses, link) {
//     this.title = title
//     this.iconClasses = iconClasses
//     this.link = link
//     this.active = false
//     this.subItems = []
//     this.badge = null
//     this.badgeClasses = null
//     this.isOpen = false
//   }
//
//   setActive (active) {
//     this.active = active
//     return this
//   }
//
//   addSubItem (subItem) {
//     if (subItem instanceof SubMenuItem) {
//       this.subItems.push(subItem)
//     } else {
//       throw new TypeError('Invalid subItem. Expected instance of SubMenuItem.')
//     }
//     return this
//   }
//
//   setBadge (badge, badgeClasses) {
//     this.badge = badge
//     this.badgeClasses = badgeClasses
//     return this
//   }
// }
//
// class SubMenuItem {
//   constructor (title, iconClasses, link) {
//     this.title = title
//     this.iconClasses = iconClasses
//     this.link = link
//     this.active = false
//   }
//
//   setActive (active) {
//     this.active = active
//     return this
//   }
// }

// const dashboard = new MenuItem('Dashboard', ['pi', 'pi-home'], '#')
//   .setActive(true)
//   .addSubItem(new SubMenuItem('Dashboard v1', ['pi', 'pi-circle-on'], '../../index.html'))
//   .addSubItem(new SubMenuItem('Dashboard v2', ['pi', 'pi-circle-on'], '../../index2.html'))
//   .addSubItem(new SubMenuItem('Dashboard v3', ['pi', 'pi-circle-on'], '../../index3.html'))
//
// const widgets = new MenuItem('Widgets', ['pi', 'pi-calculator'], '../widgets.html')
//   .setBadge('New', ['badge-danger'])
//   .addSubItem(new SubMenuItem('Dashboard v1', ['pi', 'pi-circle-on'], '../../index.html'))
//   .addSubItem(new SubMenuItem('Dashboard v2', ['pi', 'pi-circle-on'], '../../index2.html'))
//   .addSubItem(new SubMenuItem('Dashboard v3', ['pi', 'pi-circle-on'], '../../index3.html'))
//
// const calendar = new MenuItem('Calendar', ['pi', 'pi-calendar'], '../calendar.html')
//   .setBadge('2', ['badge-info'])
//   .addSubItem(new SubMenuItem('Dashboard v1', ['pi', 'pi-circle-on'], '../../index.html'))
//   .addSubItem(new SubMenuItem('Dashboard v2', ['pi', 'pi-circle-on'], '../../index2.html'))
//   .addSubItem(new SubMenuItem('Dashboard v3', ['pi', 'pi-circle-on'], '../../index3.html'))
//
// const kanbanBoard = new MenuItem('Kanban Board', ['pi', 'pi-clone'], '../kanban.html')
//
// const menuItems = ref([dashboard, widgets, calendar, kanbanBoard])

// console.log('X', JSON.stringify(menuItems, undefined, ' '))

</script>
