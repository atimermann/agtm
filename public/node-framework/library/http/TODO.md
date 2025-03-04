////////////////////////////////////////////////////////////////////////////////
TODO 1:
////////////////////////////////////////////////////////////////////////////////
[OK] Validar dados  (Usar schema padrão, ver integração com PRISMA)
[OK] Tratar erros (Seguir as padrões de REST API para erros semânticos)
[OK] Documentar com Swagger padronizado
[XX] Criar erros customizados em função e em um arquivo separado .validator.ts
[  ] Autenticar usuario com keycloak
[  ] Processar dados (Criar um service padronizado para isso)
[  ] Revisar e documentar
[  ]  o Fastify já tem um tratamento de erro padrão
[  ] Rate Limite padronizado
[  ] Cors configurado
[  ] Versionar
[  ] Tudo que for padrão deixar numa lib
[  ] Teste Unitário

////////////////////////////////////////////////////////////////////////////////
TODO 2:
////////////////////////////////////////////////////////////////////////////////

PROJECT AUTO API:

[OK] verifica se existe um [NOME_RECURSO].auto.ts
[OK] verifica se existe um [NOME_RECURSO].routes.ts (se não existir gera automaticamente) se exisitir estente
[OK] Verifica se existe um [NOME_RECURSO].controller.ts (se não existir gera automaticamente) se existir estente
[OK] Cria consultas automaticamente, ou se já existir o controller, disponibiliza para uso
[OK] Cria uma rota que gera um .json pronto para o front gerar o crud automaticamente
[OK] Gera schema fastify automaticamente

[  ] - usar errorHandler do fastify
[  ] - retorna uma lista indexada de erros para facilitar trabalho do front

////////////////////////////////////////////////////////////////////////////////
// TODO 3
////////////////////////////////////////////////////////////////////////////////

[  ] 1. Rate Limiting -> Evitar abusos e ataques de força bruta.
[  ] 2. Autenticação -> Garantir acesso apenas a usuários legítimos.
[  ] 3. Validação de Dados -> Certificar que os dados são válidos e seguros.
[  ] 4. Processamento de Dados de Entrada (POST/PUT)
[  ] 5. Consulta -> Obter informações necessárias do banco ou API.
[  ] 6. Processamento de Dados de Saída (GET)
[  ] 7. Tratamento de Erro -> Lidar com exceções e retornar mensagens consistentes.

[  ] Fastify componentes order load:
[  ] https://fastify.dev/docs/latest/Guides/Getting-Started/#loading-order-of-your-plugins
[  ] └── plugins (from the Fastify ecosystem)
[  ] └── your plugins (your custom plugins)
[  ] └── decorators
[  ] └── hooks
[  ] └── your services

////////////////////////////////////////////////////////////////////////////////
// TODO 4
////////////////////////////////////////////////////////////////////////////////

[OK] Precisamos de uma classe de descritor (Descriptor) dos arquivos e uma que carregar esses descriptor
[OK] Documentar a migração do Schema nosso simplificado pro schema padrão do fastify
complexo - https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/

[OK] Documentar o validatorByInterface, como funciona, e como usa-lo por exemplo no autoSchema
[OK] documentar ts-json-schema-generator e o Novo sistema avançado que valida uma estrutura de dados em tempo de
[OK] remover http antigo q esta ali só por referencia
[OK] Implementar Swagger automaticamemte
[  ] Cuidado com a confusão entre AutoSchema e AutoSchemaInterface (AutoSchema é a classe) - Documentar
execução com definição de interface através do ts-json-schema-generator

[  ] Criar um skafoldins q use o TSX
[  ] Middleware ( NO fastify são os plugins q fazem o papel de middleware)

[  ] Validar se todos os logger tá tipado com a interface em vez do serviço
[  ] Criar template no php storm para classe type script com assinatura padrão com data
[  ]  - Verificar os arquivos faltando essa assinatura
[  ] Revisar e definir os logs relevante separando por info e debug e erro
[  ] Ver como é tratado erros genericos (tem q ter um catch all para debugar e retornar usuário dependendo ambiente prod
ou dev)
[  ] Validar logs onde for necessário
[  ] Logger q é o mais usado deixar sempre na frente no contrutor
[  ] Revisar tratamento de erro e log de erro, tá dificil de visualizar
[  ] Estudar/Documentar Typescript Partial, Record, Omit
[  ] Verificar o erro do prisma, ele gera log automaticamente, revisar essa configuração

[  ] Esquema original do fastify é muito feio, temos q rever isso

```
    { params: {
          type: "object",
          properties: {
            id: { type: "integer" },
          },
          required: ["id"],
        },
      }
```


[  ] Analizar diferenças de validação entre fastify e o prisma (os dois realizam validação?), ver diferença produção e
desenvolvimento, ver log de produção com erro pra rastrear

////////////////////////////////////////////////////////////////////////////////
// TODO 5
////////////////////////////////////////////////////////////////////////////////
[  ] - Versionamento de API (Estudar e implementar)
[  ] -
