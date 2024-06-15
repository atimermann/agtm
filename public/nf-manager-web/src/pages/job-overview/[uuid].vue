<template>
  <div class="container-fluid">
    <div class="grid">
      <div class="col">
        <div class="">
          <JobErrorList :error-list="errorList" />
        </div>
      </div>
      <div class="col">
        <div>
          <!--          <NfCard type="primary">-->
          <!--            <template #title>-->
          <!--              Erros-->
          <!--            </template>-->
          <!--            <template #tools>-->
          <!--              <a>A-</a>-->
          <!--              <a>B-</a>-->
          <!--              <a>C</a>-->
          <!--            </template>-->
          <!--            <template #content>-->
          <!--              Content-->
          <!--            </template>-->
          <!--            <template #footer>-->
          <!--              Footer-->
          <!--            </template>-->
          <!--            <template #overlay>-->
          <!--              <h1>Loading...</h1>-->
          <!--            </template>-->
          <!--          </NfCard>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { io } from 'socket.io-client'

const config = useRuntimeConfig()

const route = useRoute()

const jobUuid = route.params.uuid

const errorList = ref([])

definePageMeta({
  layout: 'admin',
  title: 'Job - Visão Geral'
})

const socket = io(`${config.public.SOCKET_HOSTNAME}:${config.public.SOCKET_PORT}/job`, { query: { uuid: jobUuid } })

socket.on('connect', () => {
  setTimeout(() => {
    console.log('Connect with server.')
  }, 1000)
})

socket.on('allProcessError', processErrors => {
  errorList.value = []
  processErrors.forEach(processError => addError(processError))
})

socket.on('processError', processError => {
  addError(processError)
})

function addError (processError) {
  errorList.value.push({
    id: processError.id,
    dateTime: new Date(processError.errorTimestamp),
    workerName: processError.worker,
    instance: processError.jobInstance,
    description: processError.errorDescription,
    note: processError.note
  })
}

</script>
