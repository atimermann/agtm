DOC:

- Criar um resumo do fastify e das funcionalidades usadas
- Servidor tem uma rota GET ping para teste
- Servidor terá uma rota /info para depuração futura
- Procura todos os arquivos .auto.json e retorna um "fileDescriptor" UserClassFileDescription
- Chama uma instancia ApiGenerator
  => Cria um schemaHandler
  => Cria um Controller
  => Cria um Router
  => Configura um Router
- Documentar o ciclo de vida q ilustra

- Router tem methor, url, schema, handler https://fastify.dev/docs/latest/Reference/Routes/#routes-options
- Schema é um JSON, mais aqui: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/
- Também podemos ter parsers, validators
- Tem inumeros configurações q podemos fazer em cada
  rota: https://fastify.dev/docs/latest/Reference/Routes/#routes-options

TODO:

-[OK] findUsereClassFilesInDirectory separar em um serviço próprio

## 09/02/2025

- Problema configuração TypeScript
- Configurar corretamente o .prettier no node-framework, para quebrar linhas apenas quando passar de 120 caracteres
- Comecei usar o TSX, documentar melhor agora não to usando mais o nodemon
- Controller, routes customizado não está carregando revisar
- Criar uma documentação com print de como depurar com TSX e o phpstorm

15/02/2025

---

## ERROS

= PROBLEMA DE PRESSÃO DE DISK NO KUBERNETE DESENVOLVIMENTO LOCAL, tive q reiniciar o k3s, criar um log no sistema para
mostrar essa informação
== Problema do diretório do PV já existir em /tmp/postgres-pv

## 28/02/2025

- Criado documentação Básica
- Finalizado versão inicial
- Próximos PASSOS:
  - fazer tudo apartir de um teste de implementação de API vamos começar com tenant: ERRO, validação, serialização e
    documentação (Swagger)
  - Documentar alguma coisa (sempre todos os dia revisar melhorar ou adicionar algo)
  - Revisão padronização de Erro segundo o fastfy e documentar
  - Revisão e documentar validação e serialização e documentar (principalmente de formulários com descrição do problema,
    padronizar e documentar formato de retorno
  - Geração automática do Swagger (se habilitado)
  - Padronização de logs (configurar o fastfy)
  - Padronização no .env

## 03/03/2025

- Aprendi a usar no Typescript: Omit, Partial, Record, documentar: Estudar/Documentar Typescript Partial, Record,
  Omit, ! (exclamação para dizer q vai ser definido depois)
- Finalização versão básica do sistema com geração Automática baseado em schema. Agora oque falta:
  - Refinar configuração do Fastifyschema à partir do AutoSchema (
    /home/andre/projetos/@agtm/public/node-framework/docs/http2/autoSchema.md)
  - Atualmente temos apenas o AutoSchema que gera rota automaticamente. criando a configuração do FastifySchema, Porém
    para definir rotas manualmente é necessário utilizar o FastifySchema que bem verboso e algunas casos complexo.  
    Vamos criar um schema simplificado (podemos chamar de ApiSchema) compatível com o AutoSchema para configurarmos
    rotas mais facilmente
  - Definir padrões de erro baseado no Fastify. Será muito importante por exemplo para validação de formulário no
    front-end
    Front-end deve conhecer a linguagem de erro do back, para enviar o erro corretamente para o campo certo
    - TER EM MENTE Já diferença entre ambientes DEV/PROD
    - Em prod não pode exibir erro de consulta para o usuario
  - Criar um Service só para gerar schema do front-end para crud, pode ser chamar CrudSchemaService ou crudShema.api
  - formatar logs
  - Configurar autenticação com keycloak

## 04/03/2025

- Implementado um tratamento de erro customizado seguindo padrão **O RFC 7807** e customizado para retornar erros em um
  array para fácil tratamento no front-end
  - Se necessário traduzir no futuro a tradução deve ser feita no AJV com localize.pt_BR (chatGPT)
  - Por padrão o fastify apenas retorna erros em inglês
- Implementado valor default
- Implementar tradução de erro para PT_BR
- Próximo passo: Implementar autenticação com Keycloak e sessão

## 12/03/2025

- https://medium.com/with-orus/the-5-commandments-of-clean-error-handling-in-typescript-93a9cbdf1af5
- Config transformado em configService
- Novo campo "default" no fieldShemaInterface
- Implementado novo serviço KeycloakService usado para integração com keycloak (Versão inicial, só conecta) continuar
  daqui
- atualização documentação
- Definido que roles e grou roles vão ser configurados no keycloak

## 14/03/2025

- Criei um suporte a usar AutoApiService em qualquer lugar como script
  - Agora faltou criar o metodo que vai decodificar a validar o token:
    eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIzamh0STFpV016cUxZNmxlQVh1TFNSSmRPQ2VrNHpkMFRTRnFBbHBhZEM0In0.e...

## 15/03/2025

- Desenvolvi uma padronização de erro, falta por no front uma exibição da descrição do erro padronizado (por enquanto só
  mostra 500 ignora outros atributos)
- Existe diversos tipos derro: erro de requisição ou erro de aplicação, erro para usuário ou erro inesperado

## 16/03/2025

- Atualmente configuração do keycloak está fixo, ou seja , só temos a possibilidade de ter um servidor de autenticação.
  Nó script keycloak eu já deixei genérico podemos selecionar qual instancia.
  - Porém nas rotas só pode ser usado um, se haver necessidade de utilizar mais de um servidor de autenticação será
    necessário alterar o autoschema para suportar esse parâmetro e tb definir uma forma de passar esse parametro para
    cada rota.

- Proximos passos:
  TODO 01: Prisma deve ser carregado via plugin também, ver se existe plugin ou criar (deve estar no node-framework)
  https://github.com/joggrdocs/fastify-prisma (parece ruim)
  - Vamos criar um plugin do prismaeu

    [OK] TODO 01: Prisma deve ser carregado via plugin também, ver se existe plugin ou criar (deve estar no node-framework)  
    Problema: Criar um plugin que disponibiliza USUARIO e ACCOUNT Interno (atualmente só trás do Keycloak)
      - É uma regra da aplicação e não do framework, portanto criar esse plugin

    TODO 02:  Projetar e Implementar uma forma padronizada e alterar o fastify, definir plugins (node-framework)
    TODO 03:  Então implementar o plugin q faz esse vinculo, deve validar e ajustar caso usuário esteja desincronizado (aplicação)

    TODO 04: Verificar se a conta do usuário é do tipo tenantAdmin
    TODO 05: Verificar se o usuário tem a permissão tenant-create

    TODO 06: Criar um tenant onde o owner é a conta atual

    TODO 07: Registar quem fez essa criação (Analisar melhor forma)

## 18/03/2025

- Vamos user apenas uma instancia do PRISMA, se um dia precisar de mais instancia será necessário criar mais schema:
  - output = "./generated/client1" no schema definindo um diretório (gera apartir do diretório prisma)
  - Definir no config yaml o caminho para esse cliente
  - Criar um client para cada caminho
  - Configurar o ENV para suportar mais de um:
    ex:
    - NF_PRISMA_DEFAULT_CLIENT_PATH="generated/client"
      NF_PRISMA_DEFAULT_PROVIDER="postgresql"
      NF_PRISMA_DEFAULT_HOST="localhost"
      NF_PRISMA_DEFAULT_PORT="30100"
      NF_PRISMA_DEFAULT_DATABASE=""
      NF_PRISMA_DEFAULT_USERNAME=""
      NF_PRISMA_DEFAULT_PASSWORD=""
      NF_PRISMA_DEFAULT_OPTIONS="schema=public"
- Adicionar essa informação na documenação do prisma

## 19/03/2025

- Implementei o serviço prisma e acesso ao fastify no controller

## 22/03/2025

- Alterado para que o campos adicionais não sejam ignorados

## 28/03/2025

- Agora temos default separado em dois contexto no schema: initial e default (se tem default, qualquer dado vazio é
  preenchido)

## 30/03/2025

- Se eu não quiser usar o prisma? o controller (que instancia automaticamente) vai funcionar?

## 31/03/2025

- Refactory do loading, agora separa por App
- TODO: Criado factory para o Controller (criar mais factories)
- TODO: Criar uma Helper global para validate instance das classes usado em factories por exemplo
- TOOD: Atualizar documentação: agora temos o autoApi para customizar consultas no controller das queries automaticas

## 04/04/2025

- DIlema: Validação só é aplicada quando usada com api rest, script e outros códigos ficam fora da validação
- Onde definir validação unique
- Como customizar mensagem de erro na validação do fastify
- Como localizar mensagens de erro para portugues (usar o ajv-i18n) validação do fastify é delegado ao AJV

ficar atento ao código abaixo no httpserver.ts para customizar validação:
this.fastify.setValidatorCompiler(({ schema, method, url, httpPart }) => {
return ajv.compile(schema)
})
// -------

## 05/04/2025

- **TODO:** vamos alterar a configuração do atributo auto no autoSchema para permitir selecionar o Apps
  - Por exemplo, por exemplo se vc tá definindo o modulo tenant, ele tenta carregar automaticamente tenant.auto.ts
  - Se vc definir pode escolher outro modulo exemplo: **auto: "account"** q vai carregar o account.auto.ts
  - Mas se a automação que deseja está em outro app, poderia fazer **auto: "Account:account""** para carregar o
    account.auto.ts do app Account

## 09/04/2025

- TODO: Implementar CACHE de autenticação para agilizar, está lento por bater todas as vezes no keycloak


