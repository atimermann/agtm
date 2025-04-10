# Documentação do Módulo HTTP2

O HTTP2 é um novo módulo do node-framework responsável pela implementação de APIs utilizando como engine o Fastify. Seu
foco é a criação de APIs REST robustas, rápidas e fáceis de implementar.

Inspirado na organização e nos padrões do NestJS, este módulo fornece uma maneira acelerada de desenvolver e estruturar
APIs REST. Abaixo, estão descritas as principais características e componentes que formam esse módulo.

O Grande trunfo desse módulo é permitir criação de apis à partir de definições em arquivos schemas, permitindo criar e
subir novas api em tempo reduzido. E além disso tem suporte a geração de CRUD, fornecendo schemas para o front-end.

## Principais Características

- Implementado em TypeScript nativo (a partir da versão 22 do Node.js). **Observação:** Requer o uso do TSX
  provisoriamente.
- Estrutura de pastas padronizada para facilitar a organização do projeto.
- Utiliza injeção de dependência internamente
- **Auto Generator:** Gera uma API completa automaticamente a partir de arquivos *.auto.json. Além de schemas para o
  front gerar crud automaticamente
- Schemas e tipos são validados em tempo de execução automaticamente com definições em interfaces usando
  ts-json-schema-generator, então se tiver que adicionar novas propriedades, antes necessário atualizar as interfaces. 
- Compatível com todas as funcionalidades nativas do Fastify, permitindo extensões e plugins.
- Configuração de servidor automatizada, pronta para uso com poucas configurações iniciais.
- Focado em velocidade
- Segue o padrão Open API

## Requisitos iniciais

- Este módulo utiliza o Fastify para criação do servidor HTTP, é importante entender seu funcionamento para aproveitar
  todas as características que este modulo tem a oferecer
  Veja o básico sobre o Fastify aqui: REF: [Fastify](http2/fastify.md)

## Componentes Chaves

`Server - Router - Controller - SCHEMA - AUTO`

### 01 - Server

REF: [Server](http2/server.md)

- Classe responsável por configurar e inicializar o Fastify, sendo o ponto de entrada do servidor HTTP.
- Carrega configurações do servidor por meio de variáveis de ambiente (por exemplo, via .env).
- Disponibiliza rotas de monitoramento e teste, como /ping e /info.
- Garante a inicialização de middlewares como o CORS e a definição de rotas básicas.

### 02 - Router

REF: [Router](http2/router.md)

- Gerenciado internamente pelo RouterService (e instâncias de ApiRouter), onde a API é efetivamente configurada.
- Ponto de entrada para a definição das rotas da aplicação.
- Cada rota define o endpoint, o controller responsável e esquemas de validação (schemas).
- Carrega e instancia automaticamente:
  Controllers (lógica de negócios de cada rota).
  Schemas de validação, quando definidos em arquivos .auto.json.

* Permite configurar rotas de forma manual ou automática (por meio de *.auto.json).

### 03. Controller

REF: [Controller](./http2/controller.md)

- São classes que implementado a lógica por trás de cada rota.
- Cada Controller está vinculado a uma ou mais rota.
- De forma simplificada controller são conjunto de métodos que são chamado para determinada rota

### 04. API Schema (fastify)

REF: [apiSchema](apiSchema.md)

- Ainda não totalmente implementado neste módulo.
- Representará, no futuro, os Schemas Fastify para validações de entrada, saída e serialização.
- Por enquanto passamos o schema diretamente na rota

### 05. Auto Schema

REF: [autoSchema](autoSchema.md)

- Permite a geração automática de uma API completa (CRUD e afins) a partir de um arquivo .auto.json.
- Funciona em conjunto com AutoSchemaService e AutoApiService.

### 06. Documentação com Swagger

REF: [swagger](http2/plugins/swagger.md)

- Geração automática de documentação com swagger

### 07. Validação em tempo de execução com interfaces

REF: [interfaceValidator](interfaceValidator.md)

- Valida estruturas complexas como schemas em tempo de execução com interfaces

### 08. Validação de dados

REF: [Validação](./http2/validation.md)

## Arquitetura

A titulo de manutenção, veja aqui documentação detalhada sobre a implementação do modulo http2 no node-framework
REF: [Arquitetura](http2/arquitetura.md)

## Guia de inicio

REF: [Guia de inicio](http2/guia.md)


## Mais documentação

* [Auto Api Service](./http2/autoApiService.md)
* [Keycloak](services/keycloak.md)
* [Schemas](./schemas.md)
