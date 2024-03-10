# Servidor de Socket (WebSocket) com Socket.io

O Node framework utiliza o Socket.io para comunicação via socket.io. Toda a configuração e inicialização do servidor
socket é abstraída pelo framework, permitindo implementar facilmente a lógica de aplicação socket diretamente nos
controllers com métodos auxiliares.

## Métodos Auxiliares

| Método       | Descrição                                                                                                                                                                                                                                                                       |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **on**       | Método legado, utilizado para registrar ouvintes de eventos no socket. Recomendado para uso apenas em casos específicos onde a nova estrutura com `onQuery` e `onMutate` não se aplica. Não permite bind com cliente e não dispara atualização para o cliente.                  |
| **onQuery**  | Utilizado para registrar ouvintes de eventos destinados a operações de busca ou recuperação de dados, que não modificam o estado no servidor. Esses eventos podem ser cacheados e são ideais para atualizações dinâmicas no cliente com base em mudanças de estado no servidor. |
| **onMutate** | Utilizado para registrar ouvintes de eventos que realizam operações de criação, atualização ou exclusão de dados no servidor. Esses eventos não são cacheáveis e garantem que ações importantes sejam realizadas e propagadas em tempo real.                                    |

# Modo Bind

O modo Bind no **node-framework** com **nuxt-layer-adminlte-primeface** é uma funcionalidade poderosa que permite
vincular dados do servidor ao cliente de maneira reativa. Esse modo é especialmente útil para atualizações em tempo
real, onde o estado do servidor precisa ser refletido no cliente sem a necessidade de requisições manuais para verificar
mudanças.

**IMPORTANTE:**
Você deve utilizar um controller para cada conjunto de dados, os eventos mutaveis (onMutate) vai disparar evento
update todos as query deste controller independente se o namespace é o mesmo ou diferente de outro controller

## Funcionamento

Quando um cliente se conecta a um determinado namespace e se "vincula" a um evento específico usando o modo Bind, ele
informa ao servidor que está interessado em receber atualizações automáticas sempre que os dados associados a esse
evento forem alterados. Isso é feito emitindo um evento especial de `bind` do cliente para o servidor, com o nome do
evento ao qual deseja se vincular e, opcionalmente, argumentos adicionais.

O servidor, ao receber um evento de `bind`, registra o cliente como um ouvinte para atualizações desse evento
específico. Sempre que os dados relevantes no servidor mudam (por exemplo, um novo item é adicionado a uma lista que o
cliente está observando), o servidor automaticamente emite um evento de `bindUpdated` para todos os clientes vinculados,
enviando a eles os dados atualizados.

# Servidor de Socket (WebSocket) baseado no socket.io

TODO: documentar retorno padrão de erros para o front onde os erros são classificados e retornado por tipo como
API_ERROR e GENERIC_ERROR

REF: https://socket.io/docs/v4/server-socket-instance/

Node framework adota o Socket.io para comunicação via websocket. Toda configuração é inicialização do servidor socket é
abstraida pelo framework.

Você pode implementar sua aplicação socket diretamente no controller com alguns métodos auxiliares.

Exemplo básico:

```javascript

import {SocketController} from '@agtm/node-framework'

export default class HelloWorldController extends SocketController {
  namespace = '/helloWorld'

  async setup() {
    this.onMutate('create', async (data) => {
      return true
    })

    this.onQuery('get', async (data) => {
      return {data: 'new data'}
    })
  }
}
```

* Ao definir a propriedade "namespace", internamente o controller cria um novo evento "onConnection" e executa os
  eventos configurados em setup()
* Não é necessário realizar tratamento de erro com try catch, já é realizado internamente.
* O retorn padrão é {success: false, data: "Erro ou dados"}
* Não é necessário utilizar callback, o retorno é enviado de volta, por isso obrigatório criar função assincrona

No cliente você pode ser conectar à api da seguinte maneira:

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

**Exemplo com bind:**

```vue

<template>
  <pre>{{ bindData }}</pre>
</template>

<script setup>

  import {useSocket} from '#imports'

  const {clientSocket} = useSocket('/inventory')

  const bindData = clientSocket.bind('productCategory:findByName', {find: '', limit: 19})

</script>
```

# Acesso direto

Caso precisa de um controle maior da api, você tem acesso as seguintes propriedades:

* **this.io**: Retorna objeto io
* **this.nsp**: Retorna io.of (namespace já configurado)

# Padrão de retorno

O padrão de retorno é

```
{sucess: boolean, data: any}
```

# Padrão de retorno e de erro

Quando um evento manipulado no servidor encontra um erro, o retorno para o cliente segue um padrão estruturado que
facilita o entendimento e tratamento do erro no lado do cliente. Até o momento os erros são classificados em dois tipos
principais: `API_ERROR` e `GENERIC_ERROR`.


