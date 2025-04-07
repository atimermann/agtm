# Validação no HTTP2

O módulo HTTP2 do node-framework oferece um sistema robusto de validação de dados através do Fastify. Existem duas
maneiras principais de definir validações:

## 1. Validação Direta com FastifySchema

Você pode definir validações diretamente usando o schema do Fastify. Este é o método mais flexível e permite
configurações avançadas.

Isso pode ser feito diretamente na criação da rota sem uso do autoschema

Exemplo:

```typescript
const schema = {
  body: {
    type: "object",
    required: ["nome", "email"],
    properties: {
      nome: {type: "string", minLength: 3},
      email: {type: "string", format: "email"},
    },
  },
}
```

## 2. Validação com AutoSchema (Recomendado)

O AutoSchema é uma forma simplificada de definir validações. Ao criar uma rota usando o AutoSchema, o framework
automaticamente converte suas definições para o formato do FastifySchema.

Exemplo de arquivo `.auto.json`:

```json
{
  "name": "usuario",
  "fields": [
    {
      "name": "nome",
      "type": "string",
      "required": true
    },
    {
      "name": "email",
      "type": "string",
      "required": true
    }
  ]
}
```

## Diferentes validações

Para entender a validação é necessário entender que a validação na verdade é feita pelo fastify, ou seja, a configuração
e particularidades da validação é feita no mapeador de "Autoschema" para o schema padrão do fastify (que usa o AJV)

Essa configuração é feia no library/http/mapper/autoToOpenApiSchemaMapper.ts

## Validação no ApiAuto / Serviço

Validações mais complexa como Unique é feito diretamente no ApiAuto, implemente ai validações complexas mas padrões

Validações customizada pode ser implementado no serviço ou no AutoApi customizado do usuário

## Scripts e Serviços

Note que a validação é feita pelo fastify portanto IAo usar comandos ou scripts, por fora da API ROTA, essa validação
padrão não funciona.

Como por exemplo UNIQUE

TODO: pensar se vale a pena replicar a validação do fastify no serviço pra quem usa comandos, talvez migrar validação
para ai
