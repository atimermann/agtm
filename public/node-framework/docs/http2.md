## HTTP 2 (Fastify)

Inspirado na organização e padrão do NESTJS, fornece uma forma rápida de implementar APIs REST.

Principais objetivos:

* Implementado com typescript nativo do nodejs (apartir 22)
* Estrutura de pasta padronizada
* Uso de injeção de dependencia
* Suporte a configuração de api com Schema
* Auto Generator: Ferramenta que gera toda uma api rapidamente à partir de um schema ***.auto.json**
* Incorpora todas as ajudas e funcionalidades do Fastify
* Configuração de servidor automatico

TODO:

* Melhorar documentação
* Local: library/http
* Bootstrao: httpServer2.ts
* Documentar os 3 metodos de implementação:
  * Automatico: define toda o endpoint apartir do schema
  * Manual: Implementa todas as classes necessária para aplicação
  * Misto: Define automaticamente a partir de um schema, mas permite customizar comportamentos mais comples (Idealmente usando DDD)
