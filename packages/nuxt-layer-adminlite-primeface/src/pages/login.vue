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

        <div class="input-group mb-3">
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="Email"
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
            <button class="btn btn-primary btn-block" @click="login">
              Entrar
            </button>
          </div>
          <!-- /.col -->
        </div>

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

import Toast from 'primevue/toast'

import { useToast } from 'primevue/usetoast'
import { definePageMeta, navigateTo, ref, useAppConfig, useNuxtTools } from '#imports'

const { template, unsafeAuth } = useAppConfig()

const { encryptText } = useNuxtTools

const toast = useToast()

const email = ref('')
const password = ref('')

localStorage.setItem('logged', '')

async function login () {
  if (email.value !== unsafeAuth.email) {
    toast.add({ severity: 'error', summary: 'Atenção', detail: 'E-mail inválido', life: 3000 })
    return
  }

  if (await encryptText(password.value) !== unsafeAuth.password) {
    toast.add({ severity: 'error', summary: 'Atenção', detail: 'Senha inválida', life: 3000 })
    return
  }

  localStorage.setItem('logged', 'logged')
  navigateTo({ path: '/' })
}

definePageMeta({
  layout: 'guest'
})
</script>
