<template>
  <div class="container-fluid">
    <div class="grid">
      <div class="col-6">
        <NfCard>
          <template #title>
            Seja Bem-vindo ao Template Nuxt Layer AdminLTE + PrimeFaces!
          </template>
          <template #content>
            <p>Aqui estão algumas dicas para começar:</p>
            <ul>
              <li><strong>Ativar Login:</strong> Habilite a funcionalidade de login editando o arquivo <code>src/app.config.ts</code> e definindo <code>template.login.enabled</code> para <code>true</code>.</li>
              <li><strong>Personalização:</strong> Para personalizar a aparência do template, modifique o arquivo <code>src/app.vue</code> conforme suas preferências.</li>
              <li><strong>Configuração do Projeto:</strong> Configure as variáveis de ambiente e outras configurações essenciais no arquivo <code>.env</code>.</li>
            </ul>

          </template>
          <template #footer>
            Nuxt Layer AdminLTE + PrimeFace
          </template>
        </NfCard>
      </div>
      <div class="col-6">
        <NfCard>
          <template #title>
            Interface de Controle
          </template>
          <template #content>
            <Button @click="badge">Atualiza Marcador</button>
          </template>
        </NfCard>
      </div>
    </div>
  </div>
</template>

<script setup>

import {definePageMeta} from '#imports'
import {useAdminStore} from '@/admin'

import Button from 'primevue/button'

const admin = useAdminStore()

definePageMeta({
  layout: 'admin',
  title: 'Dashboard',
  auth: true
})

// Interface de Controle
let count = 0

function badge() {
  count++
  admin.setBadge('dashboard', count)
}

</script>
