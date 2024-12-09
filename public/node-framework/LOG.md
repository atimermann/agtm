### 07/12/2024

- TODO: verificar se o fastify minifica o json me prod, se não implementar um serializar especial
  - fastify.setSerializer((payload) => JSON.stringify(payload));
  - criar validação AJV no Auto schema igual fiz no front
  - Tratamento padronizado de erro baseado no fastify
  - Implementar estesão de schema atualmente só gera do autoschema, mas permitir q seja customizado (código antigo
    comentado)
  - Implementar rota /info para depuração (só modo desenvolvedor): Retorna relatório compleato de todas as rotas,
    controllers, esquemas etc...
- DOcumentar que exitem dois mapper: AutoSChema => CrudSChema, AutoSchema => HttpSchema (Fastify/AJV)
  - Além do CrudSchema => FormSchema/GridSChema
  - Refazer script de geração de projeto

Documentar que a idéia é partir do crud automatico e ir estendendo oq mudar, como rota, controller etc...

- Talvez deixar o auto como padrão

### 08/12/2024

- Bug: o create não está retornando ID
- Configurar um banco de dados local
- Validar erros no Formulário

* Criar um esquema de validação com AJV para as interfaces e gerar interface automaticamente
*
* PROXIMAS TAREFAS:
  * CONFIGURAR BANCO DE DADOS LOCAL
  * IMPLEMENTAR SISTEMA TE TENANT BASICO
    * Vamos ter q salvar imagem, configurar minIO, vamos deixar por texto por enquanto

  * CRIAR Um MÒDULO DEPURAÇÃO:
    * Visualizar todas as rotas/controllers/schema criado
    * Log de acesso com paylods e com mapa todo o ciclo de vida dos dados, desde q chegou no server até persistir no
      banco
      ou ler do banco até chegar ao usuário, passando pela autenticação, transformação etc... inclindo log das query
      executada, tempo de execução


  * Criar versionamento visual auto deploy

  * AutoCrud vai ser o padrão, se precisar estende

  * Implementar um editor de Auto Schema
