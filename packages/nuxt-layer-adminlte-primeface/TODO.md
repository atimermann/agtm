# BUG

* Problema para redirecionar do login em alguns casos (testar)
  [ ] - Precisamos otimizar o cache de requisições, vamos adicionar um novos marcadores no cache:
  * Pode ocorrer um congestionamento no servidor e no front, por exemplo uma tela de grid com 500 páginas, o usuario percorre
    todas, vamos ter 500 cache atualizando, 500 rooms no servidor para cada usuario
  * Precisamos fazer uma limpa no cache, colocar um limite, depois X quantidade limpar a sala
  * No Front, se o usuario sair da página o cache para de ouvir atualização do servidor, temos dois cenarios:
    * Cache em memoria (mantém até o limite de memoria estipulado)
    * Cache ouvindo (se usuario sai da página temos que descontectar da sala no servidor)
      * No servidor apenas desconecta o usuario da ROOM, mas não remove a room enquanto tiver usuario
  * No back vamos removendo rooms vazias e antigas e quando back avisar q um usuario saio da págin
  * No Back limitar a quantidade de ouvintes por usuario

# Funcionalidades

* Criar central de mensagem q centraliza erros, em vez de ir direto pro toast vai pra central de mensagem q ai sim
  dispara toast se usuario não tiver no silencioso
* Documentar que para texto utilizar o adminlte/bootstap, criar um de para sobre oq é melhor usar no adminlte/bootstrap
  vs primevue
* Converter o PrimeVue para TailWind: https://tailwind.primevue.org/nuxt/
* Verificar compatibilidade com AdminnLTE (verificar AdminLTE com TailWind)
* Converter tema do formkit para Tailwind

* configurar cors e CSP adeaqudamente para evitar invasão por roubo de token
* implementar secure Cookie
  * no primeiro acesso configura um secureCookie (não funciona pra socket)
  * cada requisição valida accsss tokem e secure cookie
* Implementar um sistema de segurança exclusivo do backend api
  * no primeiro acesso recebe dados do cliente, como ip agent entre outros, salvar
  * se em algum acesso subsequente algo mudar desconecta usuario tanto do keycloak quanto da api
  * dependendo do caso bloquear usuario

* padrão de erro definido em - Front: useSocket: clientSocket.pEmit

Conexão segura websocket:
https://freecodecamp.org/news/how-to-secure-your-websocket-connections-d0be0996c556/

* [OK]Autorização acessar painel: criar uma variavel, que será acessado no access token com as variaveis.

# Funcionalidades:

## Próximo(s)

* Implementar cache de socket (projeto definido backend)
* Formatação coluna, implementar tipos de coluna
* Implementar quantidade ao cadastrar inventario

## Prioridade Alta

* Habilitar o tamanho da calculadora de cache apenas em desenvolvimento pois pode adicionar muito calculo
  * Criar um debug bar igual da Cheap2Ship
* Debug deve ser automatica global e não passado por props
* Documentar o ciclo de vida de um crud, desde o inicio até tratamento de erro
* Criar tratamento para tipos de erros do back no form e grid:
  * GENERIC_ERROR
  * API_ERROR
  * Tratamento diferenciado produção/desenvolvimento
* Paginação / configuração de paginação
* Verificar porque o layout do formkit não carrega em produção
  * Está carregando url inválida do CDN, bug, carregar proprio CSS (definir)
* Implementar e documentar Toast padrão no layer
* Implementar e documentar confirm dialog padrão no layer
* Tratament servidor => cliente, padronizar formato erro atualmente {success: bool, data: info }
  * Modo produção não pode dar detalhes do erro, definor no servidor
  * Definir padrão de validação no backend, atualmente só gera erro na consulta, deve tratar por exemplo se id não foi
    enviado*
* Implementar validação Servidor
* Tratar delays do formulário, como habilitar botão apenas quando tiver carregado
* Dialogo modal

## Prioridade Baixa

* **UseSocket bind:**
  * Não vamo utilizar readonly e ao salvar/atualizar dados já atualiza os dados localmente
  * bindUpdate deve poder funcionar por registro e/ou ignorar bindUpdate quando este clienet q fez a atualização,
    receber apenas o registro alterado com novo id ou formatado
    * Baseado sempre no id/propriedade (ex: atualizar o registro id 40 propriedade status)
  * Modo offline one os novos registros ficam pendente
    * Salvar no localStorage, para longa duração e pode ser cancelado
    * Deve tratar validação por servidor posteriormente
    * Modo não confirmado em vermelho ou uma cor especial indicando q não está confirmado
  * Modo "fastest", similar ao offline, não aguarda confirmação do servidor, atualiza localmente envia pro servidor mais
    tarde
    * Pode ser configurado
  * Criar um tempo minimo de atualização. ex: a cada 10 segundos para não sobrecarregar servidor/cliente (Parametrizável
    por crud pois depende do caso)


* Revisar layout input do primeface não está ficando correto no formkit
* Seleção e remoção em lote
* Implementar pré-load no autocomplete, pelo menos pro select inicial padrão
  * Carregar no cache inicial
* Atualização em tempo real, se outro usuario adicionar um novo registro atualiza em todo os clientes conectado
  * Necessario tratar casos de multi-replicas, as diferentes replicas devem se conectar através de um redis(
    recomendável)
* Criar mais um objeto options ṕara configurações globais do crud como por exemplo algum titulo etc...
* Configuravel e configuração salva no localStorage como tamanho
* Necessário ter 2 modos: full, ou por demanda (lazy), quando for por demanda não carrega todos os daods do servidor,
  muda
  comportamentos, mais acessos ao servidor é necessário, ex: ao submeter não adiciona automaticamente, exige nova
  consulta, pois demende de paginação ordenação do servidor
  * Vamos criar dois layouts searado, um para cada, pois muda muita coisa
  * vamos reaproveitar componente do defalt
  * Recomendar na aplicação do usuario verificar a quantidade de registros se for mais que 10000 por exemplo carrega
    outro layout
* Loading e mensagem nenhum registro
  * https://primevue.org/button/#loading
* possibilidade de acessar diretamente formulário com uma rota
* Exportação
* Paginação on demand

* Coluna customizável
* Ordenação
* Busca
* Seleção
* Modo Compacto (fonte fina https://codepen.io/naikjavaid/pen/XPrpjr)
  * Customização de zoom
* socket (ao vivo)
  * Servidor pode enviar atualização pontual e o grid se atualiza
  * Modo form ao vivo tb
    * Avisa quando dados foram alterados
    * coloca novo valor em volta,
    * ou pede confirmnação para sobrescrever e mostra oq mudou
* Campos em tempo real como gráficos temporizador,
  * Util em relatório de servidor
* Configurável em tempo real

* Eventos botões
* Modo edição inline
  * https://primevue.org/datatable/#row_edit
* Customização com Slot se possível

## Finalizado

* [OK] Validação Servidor
  * [OK] Criar um service de validação e tratamento
* [OK] Campo de Relacionamento AutoComplete
* [OK] Gerador de list by form
* [OK] Listagem 100% largura
* [OK] Formulario popup
* [OK] Configuração via Schema
* [OK] Necessario configurar o server com https com socket
  * https://dev.to/sw360cab/scaling-websockets-in-the-cloud-part-1-from-socket-io-and-redis-to-a-distributed-architecture-with-docker-and-kubernetes-17n3
  * https://dev.to/sw360cab/scaling-websockets-in-the-cloud-part-2-introducing-traefik-the-all-in-one-solution-for-docker-stacks-and-kubernetes-clusters-3e1k

## Links

https://dribbble.com/shots/21735871-User-management-table

Crud completo:
https://primevue.org/datatable/#customers
