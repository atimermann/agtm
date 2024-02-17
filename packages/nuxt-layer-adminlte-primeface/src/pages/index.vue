<template>
  <div>

    <div class="login-logo">
      <b>Nuxt Layer Admin LTE + Primeface</b>
      <p>Page index must be created.</p>
    </div>
    <NfCard :padding="false">
      <template #title>
        Sample card
      </template>
      <template #content>
        <p>
          Padding model
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam
          deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate
          neque
          quas!
        </p>
      </template>
    </NfCard>
    <NfCard>
      <template #title>
        Sample card 2
      </template>
      <template #content>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam
          deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate
          neque
          quas!
        </p>
      </template>
    </NfCard>
  </div>
</template>

<script setup>

import { definePageMeta } from '#imports'


definePageMeta({
  layout: 'admin',
  title: 'Hello World'
})

</script>

<style scoped>
</style>
