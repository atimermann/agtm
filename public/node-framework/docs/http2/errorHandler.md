# Error Handler - Padrão de retorno

Refs:
* [Documentação do RFC7807](https://datatracker.ietf.org/doc/html/rfc7807)
* [Documentação do setErrorHandler](https://fastify.dev/docs/latest/Reference/Server/#seterrorhandler)

## Visão Geral

O ErrorHandlerService é um serviço projetado para lidar com erros dentro de uma aplicação Fastify. Ele segue o padrão
RFC 7807 - Problem Details for HTTP APIs, garantindo que as respostas de erro sejam estruturadas de maneira padronizada
e compreensível para clientes da API.

Este serviço tem como objetivo:

* Melhorar a organização das mensagens de erro.
* Fornecer respostas de erro no formato RFC 7807, permitindo que o front-end associe erros aos campos correspondentes.
* Separar a lógica de manipulação de erros da lógica de negócio da API.

A principal motivação para criação desse Handler é poder separar os erros por campos para correto tratamento do
front-end e seguindo algum padrão reconhecido.


## RFC 7807 - Problem Details for HTTP APIs

RFC 7807 define um padrão para erros em APIs HTTP, oferecendo uma estrutura consistente para os clientes interpretarem os problemas de forma padronizada. Ele sugere que cada erro contenha:

* **type:** Um identificador do tipo de erro. Se nenhum for fornecido, usa-se "about:blank".
* **title:** Um título descritivo do erro.
* **status:** O código de status HTTP correspondente ao erro.
* **detail:** Uma descrição mais detalhada sobre o problema ocorrido.
* **errors (customização para fields):** Um objeto que lista os campos problemáticos e suas respectivas mensagens de erro.

Exemplo de resposta no formato RFC 7807:

```json
{
  "type": "about:blank",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more fields have errors.",
  "errors": {
    "email": ["Email is required", "Invalid email format"],
    "password": ["Minimum length is 6 characters"]
  }
}
```

## Uso

ErrorHandle é implementado em:

  `library/http/services/errorHandlerService.ts`

e definido com o setErrorHandler em:

  `library/http/httpServer.ts`

## Notas

* Por padrão o fastify apenas retorna erros em inglês
* Se necessário traduzir no futuro a tradução deve ser feita no AJV com localize.pt_BR (chatGPT) ajv-i18n
