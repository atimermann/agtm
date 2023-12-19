<template>
  <Toast position="bottom-right" />
  <div class="login-box">
    <div class="login-logo">
      <div>{{ template.logoLabel }}</div>
    </div>
    <!-- /.login-logo -->
    <div class="card">
      <div class="card-body login-card-body">
        <p class="login-box-msg">
          Digite seus dados para entrar
        </p>

        <form @submit.prevent="login">
          <div class="input-group mb-3">
            <input
              v-model="usarname"
              type="text"
              class="form-control"
              placeholder="Usuário"
            >
            <div class="input-group-append">
              <div class="input-group-text">
                <span class="fas fa-envelope" />
              </div>
            </div>
          </div>
          <div class="input-group mb-3">
            <input
              v-model="password"
              type="password"
              class="form-control"
              placeholder="Senha"
            >
            <div class="input-group-append">
              <div class="input-group-text">
                <span class="fas fa-lock" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-8" />
            <!-- /.col -->
            <div class="col-4">
              <button class="btn btn-primary btn-block">
                Entrar
              </button>
            </div>
            <!-- /.col -->
          </div>
        </form>
        <!--        {{ AuthStore }}-->

        <!--        <div class="social-auth-links text-center mb-3">-->
        <!--          <p>- OR -</p>-->
        <!--          <a href="#" class="btn btn-block btn-primary">-->
        <!--            <i class="fab fa-facebook mr-2" /> Sign in using Facebook-->
        <!--          </a>-->
        <!--          <a href="#" class="btn btn-block btn-danger">-->
        <!--            <i class="fab fa-google-plus mr-2" /> Sign in using Google+-->
        <!--          </a>-->
        <!--        </div>-->
        <!--        &lt;!&ndash; /.social-auth-links &ndash;&gt;-->

        <!--        <p class="mb-1">-->
        <!--          <a href="forgot-password.html">I forgot my password</a>-->
        <!--        </p>-->
        <!--        <p class="mb-0">-->
        <!--          <a href="register.html" class="text-center">Register a new membership</a>-->
        <!--        </p>-->
      </div>
      <!-- /.login-card-body -->
    </div>
  </div>
  <!-- /.login-box -->
</template>

<script setup>
/*
TODO: O cookie "auth" não tem o atributo "SameSite" com valor válido. Em breve, cookies sem o atributo
 "SameSite" ou com valor inválido serão tratados como "Lax". Significa que o cookie não será mais enviado em
 contextos de terceiros. Se sua aplicação depender da disponibilidade deste cookie em tais contextos, adicione
 o atributo "SameSite=None". Saiba mais sobre o atributo "SameSite" em
 https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie/SameSite
*/

import Toast from 'primevue/toast'

import { useToast } from 'primevue/usetoast'
import { definePageMeta, navigateTo, ref, useAppConfig } from '#imports'
import { useAuthStore } from '../stores/auth.mjs'

const AuthStore = useAuthStore()
const { template } = useAppConfig()
const toast = useToast()

const usarname = ref('')
const password = ref('')

async function login () {
  const auth = await AuthStore.login(usarname.value, password.value)

  if (auth.auth) {
    navigateTo()
  } else {
    toast.add({ severity: 'error', summary: 'Atenção', detail: auth.message, life: 3000 })
    usarname.value = ''
    password.value = ''
  }
}

definePageMeta({
  layout: 'guest'
})
</script>
