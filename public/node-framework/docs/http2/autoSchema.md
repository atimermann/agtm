# Auto Schema

A maneira mais rápida de criar um novo endpoint na API é utilizando o Auto Schema.

O Auto Schema é um esquema definido em um arquivo JSON com a extensão .auto.json, que descreve todas as informações
necessárias para gerar automaticamente um conjunto de rotas para um recurso específico.

Por exemplo, podemos criar um recurso chamado tenant, onde definimos seus campos e outros atributos, como o nome da
tabela correspondente no banco de dados e a rota de acesso para o usuário. Com base nessa configuração, a API para esse
recurso será gerada automaticamente.

### Como funciona?

O conceito do Auto Schema é semelhante a um esquema de banco de dados, mas, como o modelo exposto ao usuário pode ser
diferente da estrutura do banco, optamos por criar uma configuração independente, sem vínculo direto com o banco de
dados.

**Dentro do arquivo .auto.json, podemos definir:**

- Nome da tabela no banco de dados onde os dados serão armazenados ou extraídos.
- Nome da rota de acesso que será gerada automaticamente para o recurso.
  - Exemplo: "tenants" → Criará a rota http://localhost/tenants.
- Descrição dos campos do recurso, especificando:
  - Se o campo deve ser retornado em requisições GET.
  - Se o campo deve ser aceito apenas em operações de criação/atualização.
- Campos sensíveis, como senhas ou datas de atualização, podem ser configurados para não serem expostos na resposta.

### Extensibilidade e Personalização

O Auto Schema permite a configuração de rotas personalizadas além das rotas padrões geradas automaticamente.

Por exemplo, podemos definir um recurso padrão e, além das operações básicas (CRUD), adicionar novos endpoints
customizados para atender a necessidades específicas.

### Integração com OpenAPI (Swagger)

Além de definir a estrutura dos recursos, o Auto Schema também permite configurar informações para a documentação
OpenAPI, garantindo que os endpoints gerados sejam corretamente documentados na interface do Swagger.

https://swagger.io/specification/#OpenApi%20Object

## Criação de Schemas de configuração de rota do FastifySchema à partir do AutoSchema

Na classe `library/http/mapper/autoToOpenApiSchemaMapper.ts` geramos configuração de rota (validação, serialização entre
outros) à partir do AutoSchema.

Porém isso precisar-a ser refinado constantemente, a documentação e refêrencia completa de como funciona a configuração
das rotas por schema está aqui:

- https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#validation
- https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/#serialization

TODO: Atualmente temos apenas o AutoSchema que gera rota automaticamente. criando a configuração do FastifySchema
Porém para definir rotas manualmente é necessário utilizar o FastifySchema que bem verboso e algunas casos complexo.

TODO: Vamos criar um schema simplificado (podemos chamar de ApiSchema) compatível com o AutoSchema para configurarmos
rotas mais facilmente
