<template>
  <div class="container-fluid">
    <div class="grid">
      <div class="col-3">
        <NfCard>
          <template #title>
            Job Info
          </template>
          <template #content>
            <ul class="list-group list-group-unbordered mb-3">
              <li class="list-group-item">
                <b>Application</b> <a class="float-right">{{ job.applicationName }}</a>
              </li>
              <li class="list-group-item">
                <b>App</b> <a class="float-right">{{ job.appName }}</a>
              </li>
              <li class="list-group-item">
                <b>Controller</b> <a class="float-right">{{ job.controllerName }}</a>
              </li>
              <li class="list-group-item">
                <b>Job</b> <a class="float-right">{{ job.name }}</a>
              </li>
            </ul>
            <strong><i class="pi pi-tag" /> Agendamento</strong>
            <p class="text-muted">
              {{ job.schedule }}
            </p>
          </template>
        </NfCard>
      </div>
      <!--      <div class="col-3">-->
      <!--        <NfCard>-->
      <!--          <template #title>-->
      <!--            Status-->
      <!--          </template>-->
      <!--          <template #content>-->
      <!--            <ul class="list-group list-group-unbordered mb-3">-->
      <!--              <li class="list-group-item">-->
      <!--                <b>Instancias</b> <a class="float-right">3</a>-->
      <!--              </li>-->
      <!--              <li class="list-group-item">-->
      <!--                <b>Status</b> <a class="float-right">Executando</a>-->
      <!--              </li>-->
      <!--              <li class="list-group-item">-->
      <!--                <b>Contagem de erro</b> <a class="float-right">25</a>-->
      <!--              </li>-->
      <!--              <li class="list-group-item">-->
      <!--                <b>Ultima execução</b> <a class="float-right">há 2 dias</a>-->
      <!--              </li>-->
      <!--            </ul>-->
      <!--          </template>-->
      <!--        </NfCard>-->
      <!--      </div>-->
      <div class="col">
        <NfCard>
          <template #title>
            Execuções
          </template>
          <template #content>
            <DataTable
              v-show="executionList.length > 0"
              :value="executionList"
              selection-mode="single"
              scrollable
              scroll-height="400px"
              class="p-datatable-sm"
              @row-select="onExecutionListRowSelect"
            >
              <Column field="startAt" header="Inicializado em" />
              <Column field="endAt" header="Finalizado em" />
              <Column field="duration" header="Duração" />
              <Column field="status" header="Status">
                <template #body="{data}">
                  <Badge :value="data.status" :severity="data.severity" />
                </template>
              </Column>
            </DataTable>
          </template>
        </NfCard>
      </div>
    </div>

    <div class="grid">
      <div class="col">
        <NfCard>
          <template #title>
            Processos
          </template>
          <template #content>
            <DataTable
              v-show="processList.length > 0"
              :value="processList"
              selection-mode="single"
              scrollable
              scroll-height="400px"
              class="p-datatable-sm"
              @row-select="onProcessListRowSelect"
            >
              <Column field="startAt" header="Inicializado em" />
              <Column field="endAt" header="Finalizado em" />
              <Column field="duration" header="Duração" />
              <Column field="instance" header="Instancia" />
              <Column field="pid" header="PID" />
              <Column field="lastLog" header="Último Log" />
              <Column field="status" header="Status">
                <template #body="{data}">
                  <Badge :value="data.status" :severity="data.severity" />
                </template>
              </Column>
            </DataTable>
            <Message v-show="processList.length === 0" :closable="false">
              Selecione uma execução na lista acima.
            </Message>
          </template>
        </NfCard>
      </div>
      <div class="col">
        <NfCard>
          <!-- TODO: Implementar seleção de level de log -->
          <template #title>
            Logs
          </template>

          <template #content>
            <DataTable
              v-show="logList.length > 0"
              :value="logList"
              selection-mode="single"
              scrollable
              scroll-height="400px"
              class="p-datatable-sm"
            >
              <Column field="datetime" header="Data" style="min-width: 150px" />
              <Column field="level" header="tipo">
                <template #body="{data}">
                  <Badge :value="data.level" :severity="data.severity" />
                </template>
              </Column>
              <Column field="message" header="Log">
                <template #body="{data}">
                  <span :class="{ 'text-red-500': data.level === 'Error' }">{{ data.message }}</span>
                </template>
              </Column>
            </DataTable>
            <Message v-show="logList.length === 0" :closable="false">
              Nenhum log disponível.
            </Message>
          </template>
        </NfCard>
      </div>
    </div>
  </div>
</template>

<script setup>

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Message from 'primevue/message'
import cronstrue from 'cronstrue/i18n'
// import as component

import { computed, useSocketTools, ref } from '#imports'
import Badge from 'primevue/badge'
import { io } from 'socket.io-client'

const props = defineProps({
  uuid: {
    type: String,
    required: true
  }
})

const executions = ref([])
const processes = ref([])
const logs = ref([])
const job = ref({})

// Conecta com servidor e passa paramâmetro job
const socket = useSocketTools.connect(io, '/job', {
  query: {
    job: props.uuid
  }
})

// Evento de conexão
socket.on('connect', () => {
  // TODO: Criar um indicador de conexão, interno automatico, sem necessidade de definir aqui, incorporado ao template
  // TODO: Ver qual melhor forma de usar log no vue2/nuxt3
  console.log('CONNECTED')

  socket.emit('getJobInfo', props.uuid, response => {
    executions.value = response.executions
    job.value = {
      ...response.job,
      schedule: cronstrue.toString(response.job.schedule, { locale: 'pt_BR' })
    }
  })
})

const executionList = computed(() => {
  const statusDict = {
    E: 'Em execução',
    S: 'Sucesso',
    F: 'Erro'
  }

  const severityDict = {
    E: '',
    S: 'success',
    F: 'danger'
  }

  return executions.value.map(execution => {
    return {
      ...execution,
      startAt: (new Date(execution.startAt)).toLocaleString(),
      status: statusDict[execution.status],
      severity: severityDict[execution.status],
      duration: '---',
      endAt: '---'
    }
  })
})

const onExecutionListRowSelect = event => {
  const jobExecutionId = event.data.id

  socket.emit('getProcessList', jobExecutionId, response => {
    processes.value = response.processes

    if (processes.value.length > 0) {
      // TODO: SImula evento, mas corrigir
      // TODO: Selecionar linha em processos
      onProcessListRowSelect({ data: processes.value[0] })
    }
  })
}

const onProcessListRowSelect = event => {
  const jobExecutionProcessId = event.data.id

  socket.emit('getProcessLog', jobExecutionProcessId, response => {
    logs.value = response.logs
  })
}

const processList = computed(() => {
  // TODO: Código repetido corrigir criando entidade unica no model
  const statusDict = {
    E: 'Em execução',
    S: 'Sucesso',
    F: 'Erro'
  }

  const severityDict = {
    E: '',
    S: 'success',
    F: 'danger'
  }

  return processes.value.map(process => {
    return {
      ...process,
      startAt: (new Date(process.startAt)).toLocaleString(),
      instance: `#${process.instance}`,
      status: statusDict[process.status],
      severity: severityDict[process.status],
      duration: '---',
      endAt: '---',
      lastLog: '---'
    }
  })
})

const logList = computed(() => {
  // TODO: Código repetido corrigir criando entidade unica no model

  const severityDict = {
    debug: 'success',
    info: 'info',
    error: 'danger'
  }

  return logs.value.map(log => {
    return {
      ...log,
      datetime: (new Date(log.datetime)).toLocaleString(),
      level: log.level,
      severity: severityDict[log.level]
    }
  })
})

</script>

<style scoped>

</style>
