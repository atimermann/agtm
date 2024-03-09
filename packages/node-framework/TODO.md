************************************************************************************************************************
BUGS - URGENT
************************************************************************************************************************

- Monitor com problema, porta sempre ocupada no socket, se tiver ocupada tentar outra, desativado por padrão

************************************************************************************************************************

- Renomear Check para prepare quando todos os erros estiverel corrigidos
- Definir padrão de service, baseado no NEST, ver outros padrões e criar exemplos
- Migrar todos os arquivos para ESM
- Criar teste unitário
- Criar validação restrita do JSDOC com todos os tipos
  - https://github.com/tjw-lint/eslint-config-tjw-jsdoc
  - @ts-check
  - https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html
  - https://www.reddit.com/r/vuejs/comments/st2zkt/jsdoc_or_typescript/

- [FEITO] DOCUMENTAR:
- Setup funciona apenas quando http_server está ativado, como é um metodo global, vamos tirar do http_server e deixar
  rodando independentemente
  - Verificar outros métodos do controller tb
  - remover do escodo do http_server


- configuração CORS
- Suporte CDN https://github.com/niftylettuce/express-cdn
- JS-2-DOC MARDKDOWN
- Revisar cabeçalho de documentação dos arquivos (caminho mudou)
- Migrar para Typescript (pelo menos documentação)
- Estruturar e definir melhor config com DOT ENV (foi atualizado muitas versões)
- CONVERTER TODA CONFIGURAÇÃO PARA ENV, deixar um padrão e converter para ENV verificar se dá pra chamar this.config('
  server.timezone') e em .env ser SERVER_TIMEZONE
- Dupliquei sleep em varios lugares, centralizar no agt/util e puxar de lá ou pensar numa forma melhor
- Parametrizar Cors
- Tratar erro em um unico local, atualmente definido em Controller: socket.#registerEventForSocket
  - Replicar para API REST

************************************************************************************************************************
Socket
************************************************************************************************************************

* Melhorar sistema de socket:
  * No nuxt, criar uma Store/composable central q gerencia todas as conexões
  * Socket.io não gera uma nova conecxão TCP por namespace, então podemos manter varios namespace
  * Atualmente uma nova conexão é feita ao conectar em cada página vamos mudar e centralizar isso
  * Vamos criar um composable global ou Store para geranciar, a conexão é feita uma vez ao iniciar
  * sempre que houver necessidade de comunicação comunicamos com esse composable/store/plugin global
  * Esse componente será responsavel por gerenciar cache, resposta, atualizações:
    * A pagina faz getCategoryByName('name=123')
    * O componente registra a requisição, executa e salva o resultado internamente em um cache
    * O valor do cache é retornado
    * o backend pode enviar uma atualização de dados, neste caso é feita uma nova consulta atualizando o cache
    * Atualizando os componentes automaticamente por reatividade
  * Toda nova página necessário definir quais eventos vão ouvir, ao sair da página esses eventos são desativados
    automaticamente( NUXT )
    * socket.on('eventoNome', meuCallback);
    * socket.off('eventoNome', meuCallback);
    * Toda vez e uma nova página for acessada, vai haver uma nova configuração de listeners para serem ouvido desligando
      os outros, pode ser usado:
      * socket.off();
    * Também é feito pré-cache, necessário definir a requisição previamente para ser usada posteriormente
    

************************************************************************************************************************
JOBS
************************************************************************************************************************

- Verificar (substituir, ou integrar) https://www.npmjs.com/package/bree
- Mudar atributo id para instance (pois ele representa a instancia do jobprocess e não um id unico)
- Verificar se processLog envia erros tb ou só no processError (os dois deve enviar)

- Documentar uso da nova funcionalidade jobs
  - Dizer q implementa jobs simples, sem fila, algo parecido com cron com fork
  - Dizer q precisar ser definido dentro do método jobs
  - schedule null executa imediatamente
  - documentar cron com suporte segundo
  - documentar onde colocar o código de inicialização dos jobs (em jobs)
  - Documentar como funciona jobSetup e jobTeardown
  - Documentar que sigint executa teardown
- Criar 4 funções para serem executadas e documentar:
  - NO MASTER:
    - [OK] createJob -> Renomar job para createJob()
      [OK] Implementar: ao definir schedule para null ou undefined para executar o job imediatamente sem agendamento
    - onJobCreated -> Executa toda vez antes de criar um novo job, ou novo fork (Executa no processo Master)
    - onJobCompleted -> Executa dota vez depois de executar o job finalizar (Executa no processo Master)
  - NO WORkER:
    - [OK] JobSetup ->  Executa no worker antes de iniciar o job (Executa no worker)
    - [OK] JobTeardown ->  Executa no workar antes de finalizar o processo (Executa no worker)
- implementar comunicação com worker de qualquer lugar, ex: em uma API REST -> onMessaFromJOB X

- Criar um teste automatizado que englobe criação de projeto execução (em docker)

- Conceito de schedule deve ficar no WORKER, q é o executor, ao associar ao job vc força ter apenas uma instancia,
  causando confusão, já q varios worker pode executar o mesmo job, neste caso vc está colocando sob responsabilidade
  do job a execução do worker, oq deixa a lógica confusa
  - O lado ruim é q vc teria q ficar defindo um worker para cada job, uma solução e deixar a definição assim, mas ao
    executar ele por baixo dos panos cria um novo worker com schedule automaticamente, mas a lógica de execução e
    agendamento fica no worker, evitando confusão

DOCUMENTAR:

- novo Conceite runId: Como worker para tratar várias execuções do worker, exemplo, no modo agendado, toda vez que é
  disparado uma nova execução runId muda

************************************************************************************************************************
LOGS
************************************************************************************************************************

- Melhorar segurança da conexão socket de log em produção

************************************************************************************************************************
CONFIG
************************************************************************************************************************

Alterar o config para carregar apenas variaveis de ambiente definidos na configurações como nuxt faz:
Your desired variables must be defined in your nuxt.config. This ensures that arbitrary environment variables are not
exposed to your application code.


************************************************************************************************************************
PROBLEMA DO NODE_FRAMEWORK INCOMPATIVEL
************************************************************************************************************************

Quando o projeto carrega um app terceiro em outro modulo, pode acontecer desse módulo estar usando uma versão mais
antiga do '@agtm/node-framework'

Para evitar isso foi criado a função loadApplication em main.js, forçando carregar aplicação na mesma versão do
node-framwork do projeto.

Porém nos controllers definido no app terceiro pode ser chamado dessa forma:

import { Controller, createLogger, JobManager, WorkerManager } from '@agtm/node-framework'

Nesse caso o Controller, createLogger, JobManager e WorkerManager vai não vai ser a mesma instancia da versão usada no
projeto

Isso pode causar incompatibilidades, sendo a mais grade velas do JobManager e WOrkerManager, que armazena dados
internamente
como eventos, variaveis.

Neste caso o WorkerManager carregado desse controller NÂO É O WOrker manager em execução no projeto, ou seja, toda
operação
feita neste WorkerManager será ignroado, pois é outra instancia, ou como se fosse outra aplicação q nem rodando está

o correto seria fazer algo como this.workermanager no controller, infelizmente o controller também é inválido e já
existe uma validação no framework que disparada erro, ou seja o projeto nem vai funcionar

Porém precisamos q apps de terceiro em versões mais antigas continue funcionando, necessário descobrir uma abordagem

DOCUMENTAR IMPLEMENTAÇÂO DE LIBRARY
