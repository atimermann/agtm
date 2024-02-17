<template>
  <div>
    <h1>Seja Bem-vindo ao Template Nuxt Layer AdminLTE + PrimeFaces!</h1>
    <p>Aqui estão algumas dicas para começar:</p>
    <ul>
      <li><strong>Ativar Login:</strong> Habilite a funcionalidade de login editando o arquivo <code>src/app.config.ts</code> e definindo <code>template.login.enabled</code> para <code>true</code>.</li>
      <li><strong>Personalização:</strong> Para personalizar a aparência do template, modifique o arquivo <code>src/app.vue</code> conforme suas preferências.</li>
      <li><strong>Configuração do Projeto:</strong> Configure as variáveis de ambiente e outras configurações essenciais no arquivo <code>.env</code>.</li>
    </ul>
  </div>
</template>

<script setup>

// import Keycloak from 'keycloak-js'
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'admin',
  title: 'Dashboard',
  auth: true
})

</script>
