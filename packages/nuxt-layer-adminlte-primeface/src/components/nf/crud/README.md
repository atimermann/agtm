# Funcionalidades:

## Próximo(s)

* Implementar cache de socket (projeto definido backend)
* Formatação coluna, implementar tipos de coluna

## Prioridade Alta
 
* Debug deve ser automatica global e não passado por props
* Documentar o ciclo de  vida de um crud, desde o inicio até tratamento de erro
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
  * Definir padrão de validação no backend, atualmente só gera erro na consulta, deve tratar por exemplo se id não foi enviado* 
* Implementar validação Servidor
* Tratar delays do formulário, como habilitar botão apenas quando tiver carregado
* Dialogo modal

## Prioridade Baixa

* Revisar layout input do primeface não está ficando correto no formkit
* Seleção e remoção em lote
* Implementar pré-load no autocomplete, pelo menos pro select inicial padrão
  * Carregar no cache inicial  
* Atualização em tempo real, se outro usuario adicionar um novo registro atualiza em todo os clientes conectado
  * Necessario tratar casos de multi-replicas, as diferentes replicas devem se conectar através de um redis(recomendável)
* Criar mais um objeto options ṕara configurações globais do crud como por exemplo algum titulo etc...
* Configuravel e configuração salva no localStorage como tamanho 
* Necessário ter 2 modos: full, ou por demanda (lazy), quando for por demanda não carrega todos os daods do servidor, muda
  comportamentos, mais acessos ao servidor é necessário, ex: ao submeter não adiciona automaticamente, exige nova
  consulta, pois demende de paginação ordenação do servidor
  * Vamos criar dois layouts searado, um para cada, pois muda muita coisa
  * vamos reaproveitar componente do defalt
  * Recomendar na aplicação do usuario verificar a quantidade de registros se for mais que 10000 por exemplo carrega outro layout 
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
