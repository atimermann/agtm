# Componente NfCard

O componente NfCrud é projetado para facilitar a criação de interfaces CRUD (Criar, Ler, Atualizar, Deletar) em
aplicações Vue.js/Nuxt.Js, utilizando as bibliotecas PrimeVue e FormKit. Destina-se a simplificar fluxos de trabalho de
desenvolvimento, minimizando a necessidade de configurações extensas.

## Principais Características

* **Implementação Eficiente:** Projetado para uma rápida integração de funcionalidades CRUD sem complexas configurações.
* **Versatilidade de Layout:** Suporta diversos layouts, por exemplo visualizações CRUD básicas com operações CRUD
  baseadas em modais.
* **Customização Mínima:** O NfCrud limita as opções de customização para enfatizar a facilidade de uso e a velocidade
  de implementação, recomendando o uso direto de componentes PrimeVue e FormKit para necessidades de customização
  avançada.

## Props

| Atributo | Tipo   | padrão    | Descrição                                                                                 |
|----------|--------|-----------|-------------------------------------------------------------------------------------------|
| idKey    | String | 'id'      | Identificador único dentro do CRUD. Utilizado como chave primária para operações de CRUD. |
| label    | String | Undefined | Texto exibido para o usuário como rótulo do campo.                                        |
| schema   | Array  | []        | Define a estrutura dos dados, configuração de colunas no CRUD e campos no formulário.     |

## Schema

O nfCrud pode ser gerado apartir de um schema, que descreve os campos e colunas do crud, o schema tem os seguines
atributos:

| Atributo   | Tipo   | Padrão    | Descrição                                                                                                                              |
|------------|--------|-----------|----------------------------------------------------------------------------------------------------------------------------------------|
| name       | String | Undefined | O identificador exclusivo do campo dentro do formulário ou CRUD. Mapeaia os valores dos dados aos campos correspondentes na interface. |
| label      | String | Undefined | Rótulo do campo na interface do usuário                                                                                                |
| form       | Object | Undefined | Atributos usados apenas pelo formulário. Deve ser um objeto no padrão formKit, estende atributos raiz.                                 |
| ignoreForm | Bool   | false     | Ignora renderização no formulário                                                                                                      |
| ignoreGrid | Bool   | valse     | Ignora renderização no datagrid                                                                                                        |

## Eventos

| Atributo      | Parâmetros | Tipo                  | Descrição                                                                                                                                                                              |
|---------------|------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **submit**    |            |                       | Um formulário foi submetido                                                                                                                                                            |
|               | values     | Array                 | valores do formulário                                                                                                                                                                  |
|               | callback   | Function(err, values) | Obrigatório enviar pelo callback status da requisição com servidor:<br/> Err: Objeto erro em caso de erro<br/>Values: {success: Boolean, data: Object(dados salvo no servidor com id}) |
| **submitted** |            |                       | Formulário foi submetido e salvo com sucesso, só é emitido depois que evento submit é retornado com sucesso.                                                                           |
|               | new        | Bool                  | Verdadeiro se novo registro, false se for uma atualização                                                                                                                              |
|               | values     | Array                 | valores atualizados atualizado do servidor com id                                                                                                                                      |

## Exemplo básico

## Slots

# Layouts Disponíveis

## Default

