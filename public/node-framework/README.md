# Projeto Node Framework

Framework minimalista para nodejs com objetivo de disponibilizar uma base de código pronta para o rápido inicio de
projeto e codificação, utilizando tecnologias já disponíveis.

Tecnologias utilizada:

- HttpServer (Legado): ExpressJS
- Http 2 (Exclusivo para api): Fastify
- ORM: Prisma

Para novas versões foi adotado o typescript nativo do nodejs, que não exige compilação, um processo de migração está 
sendo realizado de forma gradual.



## Guia de Inicio

Um novo projeto pode ser criado utilizando um esqueleto básico esse esqueleto pode ser configurado da seguinte forma:

    TODO: Revisar e criar um script baseado em template para geração de novo projeto, ncli-create ficou complexo, refatorar

# Módulos

O Node framework é composto por vários subsistemas e modulos, a seguir os principais

## HTTP SERVER 2 (Fastify)

Inicializa e configura um servidor HTTP usando o fastify focado em criação de APIs REST rápidas e de rápida implementação.

[Mais detalhes aqui](./docs/http2.md)

TODO: usar TSX, documentar
