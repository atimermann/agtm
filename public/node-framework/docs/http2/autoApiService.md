# Utilizando Serviço AutoApiService

Podemos aproveitar nosso gerador de API automática para criar scripts para criar/editar/obter/remover registros com
validação, dados default, de forma automática, à partir de schemas (Auto Schema).

## Introdução

O `AutoApiService` é uma classe responsável por automatizar as operações CRUD (Create, Read, Update, Delete) de um
modelo de banco de dados, a partir de um **schema** definido em JSON. Através desse schema, o serviço:

- Gera dinamicamente queries no banco de dados usando o Prisma.
- Permite configurar quais campos podem ser criados, atualizados ou visualizados.
- Facilita a criação de rotas REST e a integração com frontends que precisam de funcionalidades genéricas de CRUD.

Normalmente é utilizado internamente para gerar as API automática, porém podemos aproveitar para gerar nossos scripts
ou em qualquer outro lugar que precisar

AutoApiService utiliza o  [AutoSchema (Clique aqui)](./autoSchema.md).

## Exemplo

```javascript

import {AutoApiService} from "@agtm/node-framework"

try {
  const userCrudService = await AutoApiService.createFromSchemaFile("./src/apps/AccountService/http/user.auto.json")

  const createdUser = await userCrudService.create({
    name: "Admin",
    email: "admin09@admin.com",
  })

  console.log("User created successfully:", createdUser)

} catch (error:any) {
  console.error("Error creating user:", error.message)
  console.error("Error creating user:", error.stack)
}
```

user.auto.json:

```json
{
  "model": "user",
  "key": "id",
  "route": "users",
  "fields": [
    {
      "name": "email",
      "type": "string",
      "unique": true,
      "required": true
    },
    {
      "name": "name",
      "type": "string",
      "required": true,
      "create": true,
      "update": true,
      "view": true
    }
  ]
}
```

## Conclusão

O AutoApiService simplifica a criação de CRUDs no backend ao ler configurações de um schema (JSON ou objeto em memória).

Ele evita a necessidade de escrever manualmente controllers repetitivos, permitindo que a lógica de negócios seja
configurada de forma mais declarativa. Isso garante consistência, produtividade e flexibilidade na manutenção de seus
serviços e endpoints.

