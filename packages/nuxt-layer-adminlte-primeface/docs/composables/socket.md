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
