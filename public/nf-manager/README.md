# NF Manager

Api e interface web para gestão do node-framework

# Instalação

Instale com

    npm i @agtm/nf-manager

Em seguida é necessário carregar a aplicação em

    src/main.mjs

Adicione

```javascript
    import nfManager from '@agtm/nf-manager'

myApplication.loadApplication(nfManager)
```

Exemplo:

```javascript

import { Application, checkExecution } from '@agtm/node-framework'
import nfManager from '@agtm/nf-manager'

checkExecution(import.meta.url)

const MyApplication = new Application(__dirname(import.meta.url), 'MyApplication')
MyApplication.loadApplication(nfManager)

export default MyApplication

```

# Configuração

Caso queira utilizar a interface web disponível na aplicação defina uma rota em config.default.yaml:

```yaml
httpServer:
  customStaticRoutes:
    - staticRoute: "/manager"
      staticPath: "public/nfManager/main"

  # Necessário para liberar a execução do nuxt (executa script inline) Adaptar de acordo com o projeto
  helmet:
    contentSecurityPolicy:
      directives:
        scriptSrcElem:
          - "'self'"
          - "'unsafe-inline'"
        connect-src:
          - "'self'"
          - "http://localhost:4001"
          - "ws://localhost:4001"
```

Em seguida execute:

```shell
npm run install-assets
```

ou, instale o @agtm/ncli e execute:

```shell
ncli-install-assets
```

por fim execute

```shell
npx nfmanager-setEnvVar
```

**IMPORTANTE:** Deve ser executado na pasta raiz do projeto, este script assume que o fonte foi copiado para
./src/public/nfManager/main

Se alterou o caminho, deve copiar o script e alterar o diretório manualmente

Este script configura as váraiveis de ambiente SOCKET_HOSTNAME e SOCKET_PORT que é a porta que a interface web vai tentar se
conectar. **Deve ser configurado no .env do projeto**, é a porta do servidor socket

Edite o arquivo .env e defina as variaveis:

SOCKET_HOSTNAME=http://[HOST_DO_SOCKETIO_BACKEND]
SOCKET_PORT=[PORTA_DO_SOCKETIO_BACKEND]


# Storage (Docker)

NFClient utiliza SQLite para gravar informações sobre os jobs, como lista de erro e status, a base de dados é salva
localmente no diretório storage, portanto é necessário dar permissão escrita e criar um volume no docker para este
diretório

    storage/nfmonitor.sqlite.db

No futuro, se necessário teremos suporte a banco de dados externos

# Acessando API (WebSocket)

# Aproveitando os componentes em vez de utilizar o frontend completo

É possivel desativar o frontend, mantendo apenas api para isso:

<TODO>

Caso de uso seria quando precisar incorporar o fonte em sua própria interface web, caso esteja utilizando Nuxt ou vue3 é
possível aproveitar o código atual

Nd Manager foi desenvolvido em vários componentes pensando no reaproveitamento conforme abaixo:

<TODO>

# Desenvolvimento - Frontend nuxt

O frontend está incorporado ao nf-manager em vez de um repositório separado, localizado na pasta web.

O desenvolvimento e execução e scripts do nuxt deve ser feito diretamente na pasta web, apenas para gerar o código para
carregar no projeto executar conforme abaixo:

Foi adicionado uma rota customizada no backend (nf-manager):

    /manager

Apontando para

    src/public/nf_manager/main

Com isso para acessar a interface web usar:

    http://<url>/manager

Código fonte da interface está na pasta web, usar o comando a seguir para gerar e copiar frontent para node-framework:

    npm run generate-web


