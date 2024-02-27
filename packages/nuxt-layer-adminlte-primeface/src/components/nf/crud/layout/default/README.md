# Funcionalidades:

* Criar mais um objeto options ṕara configurações globais do crud como por exemplo algum titulo etc...
* Implementar e documentar Toast padrão no layer
* Implementar e documentar confirm dialog padrão no layer
* Tratament servidor => cliente, padronizar formato erro atualmente {success: bool, data: info }
  * Modo produção não pode dar detalhes do erro, definor no servidor
  * Definir padrão de validação no backend, atualmente só gera erro na consulta, deve tratar por exemplo se id não foi enviado
* Configuravel e configuração salva no localStorage como tamanho 
* Necessário ter 2 modos: full, ou por demanda (lazy), quando for por demanda não carrega todos os daods do servidor, muda
  comportamentos, mais acessos ao servidor é necessário, ex: ao submeter não adiciona automaticamente, exige nova
  consulta, pois demende de paginação ordenação do servidor
  * Vamos criar dois layouts searado, um para cada, pois muda muita coisa
  * vamos reaproveitar componente do defalt
  * Recomendar na aplicação do usuario verificar a quantidade de registros se for mais que 10000 por exemplo carrega outro layout 
* Implementar validação Servidor
* Tratar delays do formulário, como habilitar botão apenas quando tiver carregado
* Loading e mensagem nenhum registro 
  * https://primevue.org/button/#loading
* [OK] Listagem 100% largura
* [OK] Formulario popup
* possibilidade de acessar diretamente formulário com uma rota
* [OK] Configuração via Schema
* Exportação
* Paginação on demand
* Dialogo modal
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
* Gerador de list by form
* Eventos botões
* Modo edição inline
  * https://primevue.org/datatable/#row_edit
* Customização com Slot se possível


https://dribbble.com/shots/21735871-User-management-table


Crud completo:
https://primevue.org/datatable/#customers
