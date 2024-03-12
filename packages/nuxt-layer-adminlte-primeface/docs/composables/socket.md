# Documentação do Composable useSocket

## Visão Geral

Este módulo gerencia uma conexão de socket com o servidor, fornecendo funcionalidades para conectar-se a um servidor
Socket.io e armazenar a conexão em cache para reutilização. Ele também estende o cliente de socket com um método para
emitir mensagens e aguardar por uma resposta, com suporte para espera de conexão e timeout.

## Configurações

| Valor                          | Tipo   | Padrão | Descrição                                            |
|--------------------------------|--------|--------|------------------------------------------------------|
| `config.public.socket.host`    | String | ''     | A URL do host do servidor.                           |
| `config.public.socket.timeout` | Number | 30000  | O timeout em milissegundos para operações de socket. |

## Padrão de Retorno em Caso de Erro

Quando ocorre um erro, o método retorna um objeto com a seguinte estrutura:

- `success`: false
- `type`: "FRONTEND_ERROR"
- `data`: "Mensagem de erro"

Padrão também utilizado pelo node framework para compatibilidade

## Métodos

### `pEmit`

Emite uma mensagem e aguarda por uma resposta. Se o socket não estiver conectado, espera pela conexão antes de emitir.
Suporta `await` e implementa um timeout para a resposta.

# Exemplo de uso

```vue

<script setup>

  import {ref, onMounted, useSocket} from '#imports'

  const {clientSocket} = useSocket('/inventory')

  const data = ref([])

  onMounted(async () => {
    const response = await clientSocket.pEmit('product:getAll')
    if (response.success) {
      data.value = response.data
    } else {
      console.error('Erro:', response.data)
    }
  })

</script>

```

### `get`

Recupera dados para um dado nome de evento e argumentos do servidor, armazenando o resultado em cache. Se os dados já
estiverem em cache, retorna os dados em cache em vez de fazer uma nova solicitação.

**Nota:** Este método não deve ser usado para eventos que enviam dados para o servidor, como operações de
inserção/atualização/exclusão. Devido ao risco de atualizações e inserções que podem não ser enviadas ao servidor.

Requisições de persistência podem ser armazenadas em cache e nunca enviadas ao servidor sem aviso (já que retornará
sucesso como se tivesse sido enviada), causando inconsistência de dados.

### `cache`

Pré-armazena em cache a resposta para um dado nome de evento e argumentos, fazendo uma requisição ao servidor, mesmo que
os dados não tenham sido solicitados ainda. Útil para dados que serão necessários em breve.

**Exemplo:**

```vue

<template>
  <NfCrud
    v-model="data"
    id-key="id"
    :schema="schema"
    :handlers
  />

</template>

<script setup>

  import {ref, onMounted, useSocket} from '#imports'
  import schema from './schema.json'

  const {clientSocket} = useSocket('/inventory')

  const data = ref([])

  onMounted(async () => {
    // Pré Cache
    const cacheInfo = await clientSocket.cache({}, 'productCategory:findByName', {find: '', limit: 19})
    console.log('CACHE INFO:', cacheInfo)
  })

  const handlers = {
    form: {
      search: async (query) => {
        const findQuery = {
          find: query,
          limit: 19
        }
        const response = await clientSocket.get('productCategory:findByName', findQuery)
        if (response.success) {
          return response.data
        }
      }
    }
  }

</script>
```

### `bind`

Registra uma vinculação do lado do cliente a um evento específico do servidor e armazena a resposta em cache. Este
método emite um evento 'bind' para o servidor com o nome do evento e argumentos especificados. Em seguida, escuta por
eventos 'bindUpdated' do servidor para atualizar o cache local com os dados mais recentes. Os dados vinculados são
tornados reativos e somente leitura para evitar modificações do lado do cliente, garantindo que a consistência dos dados
seja mantida pelas atualizações do servidor.

Os dados vinculados são acessíveis como uma referência do Vue, e as atualizações irão disparar reatividade em
componentes que utilizam os dados. Este método é particularmente útil para dados que precisam permanecer atualizados com
o estado do servidor sem requerer solicitações de atualização manual.

**Exemplo:**

```vue

<template>
  <pre>{{ bindData }}</pre>
</template>

<script setup>

  import {useSocket} from '#imports'

  const {clientSocket} = useSocket('/inventory')

  const bindData = clientSocket.bind([], 'productCategory:findByName', {find: '', limit: 19})

</script>
```

### `bindWait`

Registra uma vinculação do lado do cliente a um evento específico do servidor e armazena a resposta em cache, assim como
bind. Porém em vez de retornar um valor reativo direto para ser populado posteriormente, aguarda a primeira atualização
do servidor.

Este método é útil para esperar que dados sejam carregados ou atualizados a partir do servidor antes de prosseguir com a
lógica dependente desses dados no lado do cliente.

#### Parâmetros

**TTL (Time To Live):** O primeiro argumento, se for um número inteiro, especifica o tempo máximo em milissegundos que a
função deve esperar pela vinculação do evento antes de rejeitar a promessa. Padrão é 30000(30 segundos)

**eventName:** Nome do evento a ser vinculado.

**args:** Argumentos adicionais que devem ser passados com o evento.

**Exemplo:**

```vue
<template>
  <pre>{{ bindData }}</pre>
</template>

<script setup>
  import {ref, onMounted} from 'vue';
  import {useSocket} from '#imports';

  const {clientSocket} = useSocket('/path-do-seu-endpoint');

  const bindData = ref([]);

  onMounted(async () => {
    bindData.value = await clientSocket.bindWait(5000, 'eventoDoServidor', {seus: 'dados'});
  })
</script>
```
