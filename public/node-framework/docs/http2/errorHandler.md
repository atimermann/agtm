# Error Handler - Padrão de retorno

Refs:

- [Documentação do RFC7807](https://datatracker.ietf.org/doc/html/rfc7807)
- [Documentação do setErrorHandler](https://fastify.dev/docs/latest/Reference/Server/#seterrorhandler)

## Visão Geral

O ErrorHandlerService é um serviço projetado para lidar com erros dentro de uma aplicação Fastify. Ele segue o padrão
RFC 7807 - Problem Details for HTTP APIs, garantindo que as respostas de erro sejam estruturadas de maneira padronizada
e compreensível para clientes da API.

Este serviço tem como objetivo:

- Melhorar a organização das mensagens de erro.
- Fornecer respostas de erro no formato RFC 7807, permitindo que o front-end associe erros aos campos correspondentes.
- Separar a lógica de manipulação de erros da lógica de negócio da API.

A principal motivação para criação desse Handler é poder separar os erros por campos para correto tratamento do
front-end e seguindo algum padrão reconhecido.

## RFC 7807 - Problem Details for HTTP APIs

RFC 7807 define um padrão para erros em APIs HTTP, oferecendo uma estrutura consistente para os clientes interpretarem
os problemas de forma padronizada. Ele sugere que cada erro contenha:

- **type:** Um identificador do tipo de erro. Se nenhum for fornecido, usa-se "about:blank".
- **title:** Um título descritivo do erro.
- **status:** O código de status HTTP correspondente ao erro.
- **detail:** Uma descrição mais detalhada sobre o problema ocorrido.
- **errors (customização para fields):** Um objeto que lista os campos problemáticos e suas respectivas mensagens de
  erro.

Exemplo de resposta no formato RFC 7807:

```json
{
  "type": "about:blank",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more fields have errors.",
  "errors": {
    "email": [
      "Email is required",
      "Invalid email format"
    ],
    "password": [
      "Minimum length is 6 characters"
    ]
  }
}
```

## Uso

ErrorHandle é implementado em:

`library/http/services/errorHandlerService.ts`

e definido com o setErrorHandler em:

`library/http/httpServer.ts`

## Notas

- Por padrão o fastify apenas retorna erros em inglês
- Se necessário traduzir no futuro a tradução deve ser feita no AJV com localize.pt_BR (chatGPT) ajv-i18n

# ApiError e erros customizados

**IMPORTANTE:**

- Use ApiError e outros erros personalizados para erros esperados, onde as informações sempre serão enviados para ao
  usuário
- Para Erros de sistema não esperado use o padrão Error o outro padrão do javascript, esses erros serão ocultos do
  usuário no ambiente de produção e exibido no ambiente de desenvolvimento e homologação

**ATENÇÃO:**

- Os erros podem ser classificados em dois tipos:
  - **Erros de requisição:** Que ocorre quando usuário realiza uma requisição, esse erro será tratado pela API fastify,
    podemos utilizar o ApiError ou outros tipos personalizados para padronizar o retorno para o usuário
  - **Errros de aplicação:** São erros que ocorrem na inicialização da aplicação e não são relacionados com requisição
    de usuário, o erro é exibido diretamente no log, neste caso **NãO UTILIZAR ApiError outros customizados**
  - **Erros em comandos (Scripts):** Similar ao erro de requisição

ErrorHandler, como nome diz, é apenas um manipulador de erro, caso queira lançar um erro em sua aplicação (ou mesmo
internamente) você pode lançar um error comum caso não queria especificar mais detalhes ou recomendável, crie um
apiError

Exemplo:

```typescript
if (request.routeOptions.config.auth === undefined) {
  throw new ApiError(
    "If Keycloak plugin is enabled it is mandatory to define whether the route is authenticated or not!",
    "Missing Authentication Configuration",
  )
}
```

A RFC 7807 permite erros mais customizados com parâmetros especiais, por exemplo:

```
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json
Content-Language: en

{
  "type": "https://example.com/probs/out-of-credit",
  "title": "You do not have enough credit.",
  "detail": "Your current balance is 30, but that costs 50.",
  "instance": "/account/12345/msgs/abc",
  "balance": 30,
  "accounts": ["/account/12345","/account/67890"]
}
```

neste caso não devemos utilizar o ApiError e definir nosso próprio erro

Deve implementar a interface: RFC7807ErrorInterface

exemplo:

```typescript
import type {FastifyReply} from "fastify"
import {RFC7807ErrorInterface} from "#/http/interfaces/RFC7807ErrorInterface.js"

export class MyError extends Error implements RFC7807ErrorInterface {
  public title: string
  public status: number

  constructor(message: string, title: string = "Internal Server Error", status: number = 500, balance: number = 0) {
    super(message)
    this.title = title
    this.status = status
    this.name = "ApiError"
  }

  setResponse(reply: FastifyReply) {
    reply.status(this.status).send({
      type: "about:blank",
      title: this.title,
      status: this.status,
      detail: this.message,
      balance: this.balance,
    })
  }
}
```
