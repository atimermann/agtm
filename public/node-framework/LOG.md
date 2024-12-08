### 07/12/2024

- TODO: verificar se o vuetify minifica o json me prod, se não implementar um serializar especial
  - fastify.setSerializer((payload) => JSON.stringify(payload));
  - criar validação AJV no Auto schema igual fiz no front
  - Tratamento padronizado de erro baseado no fastify
  - Implementar estesão de schema atualmente só gera do autoschema, mas permitir q seja customizado (código antigo
    comentado)
  - Implementar rota /info para depuração (só modo desenvolvedor): Retorna relatório compleato de todas as rotas,
    controllers, esquemas etc...
- DOcumentar que exitem dois mapper: AutoSChema => CrudSChema, AutoSchema => HttpSchema (Fastify/AJV)
  - Além do CrudSchema => FormSchema/GridSChema 
