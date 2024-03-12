# Componente NfCrud

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

| Atributo    | Tipo     | padrão    | Descrição                                                                                      |
|-------------|----------|-----------|------------------------------------------------------------------------------------------------|
| idKey       | String   | 'id'      | Identificador único dentro do CRUD. Utilizado como chave primária para operações de CRUD.      |
| label       | String   | Undefined | Texto exibido para o usuário como rótulo do campo.                                             |
| schema      | Array    | []        | Define a estrutura dos dados, configuração de colunas no CRUD e campos no formulário.          |
| debug       | Bool     | false     | Exibe dados do crud para melhor depuração.                                                     |
| loadingGrid | Bool     | false     | Grid no modo carregamento (Aguardando dados do servidor)                                       |
| autoUpdate  | Bool     | true      | Atualiza crud automaticamente após criar novo registros, sem aguardar atualização do servidor. |
| formLoad    | Function | Undefined | Recebe valores de todos os inputs e deve retornar os mesmos valores formatado                  |
| - formValue | Object   | {}        | Valores de todos os inputs do formulário                                                       |

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

**NOTA:**

* Em form, por padrão, se $formkit, $el ou $cmp não for definido, será gerado um input do tipo **text**

## Eventos

| Atributo      | Parâmetros | Tipo                  | Descrição                                                                                                                                                                                                                   |
|---------------|------------|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **submit**    |            |                       | Um formulário foi submetido                                                                                                                                                                                                 |
|               | values     | Array                 | valores do formulário                                                                                                                                                                                                       |
|               | callback   | Function(err, values) | Obrigatório enviar pelo callback status da requisição com servidor:<br/> Err: Objeto erro em caso de erro<br/>Values: {success: Boolean, data: Object(dados salvo no servidor com id, e formatado para crud se necessário}) |
| **submitted** |            |                       | Formulário foi submetido e salvo com sucesso, só é emitido depois que evento submit é retornado com sucesso.                                                                                                                |
|               | new        | Bool                  | Verdadeiro se novo registro, false se for uma atualização                                                                                                                                                                   |
|               | values     | Array                 | valores atualizados atualizado do servidor com id                                                                                                                                                                           |
| **delete**    |            |                       | Um pedido para remover registro                                                                                                                                                                                             |
|               | id         | Number                | Id do registro a ser removido                                                                                                                                                                                               |
|               | callback   | Function(err, values) | Obrigatório enviar pelo callback status da requisição com servidor:<br/> Err: Objeto erro em caso de erro<br/>Values: {success: Boolean})                                                                                   |
| **deleted**   |            |                       | Registro foi removido com sucesso. Só é emitido quando remoção foi concluída com sucesso.                                                                                                                                   |
|               | values     | Array                 | Valores removidos                                                                                                                                                                                                           |

## Handlers

A maioria dos CRUD são gerados a partir de schemas, os quais são serializados em formato JSON. Devido a esta
característica, a definição de funções ou outros elementos programáticos diretamente dentro dos schemas
não é possível. Entretanto, diversas situações demandam a aplicação de funções específicas nos inputs, como é o caso da
funcionalidade de busca em campos de autocompletar.

Diante da impossibilidade de incorporar funções diretamente em um schema JSON serializado, a utilização de handlers
surge como solução para este impasse. Assim, procedemos à criação de todas as funções necessárias para os inputs dentro
destes handlers, permitindo a sua referência dentro dos nossos schemas. A referência a essas funções é realizada
conforme exemplificado a seguir, estabelecendo um método indireto, porém eficaz, de integração de lógicas programáticas
aos schemas JSON.

Definindo handlers:

```vue

<template>
  <NfCrud
    v-model="data"
    id-key="id"
    :schema="schema"
    :handlers
  />
</template>

<script setup>

  import {ref} from '#imports'
  import schema from './schema.json'

  const data = ref([])

  const handlers = {
    form: {
      search: (event) => {
        return ['Afghanistan', 'Brasil', 'Argentina', 'Colimbia'].filter(item =>
          item.toLowerCase().includes(event.query.toLowerCase())
        )
      }
    }
  }
</script>
```

**Importante:**

* Dado que o sistema CRUD gera formulários (form) e tabelas de dados (datatable), precisamos especificar o contexto de
  aplicação dos handlers. É obrigatório alocar o handler correspondente dentro do atributo correto form ou grid.

Agora para referenciar a função search na prop search do componente autocomplete, definimos da seguinte maneira:

```json
[
  {
    "name": "id",
    "label": "#id",
    "ignoreForm": true
  },
  {
    "name": "productCategoryId",
    "label": "Categoria",
    "number": true,
    "form": {
      "$formkit": "autocomplete",
      "search": "$search",
      "validation": "required"
    }
  }
]
```

Documentação do formkit aqui : https://formkit.com/essentials/schema#referencing-functions

**IMPORTANTE:** Note que não estamos utilizando schema do formkit, esse é o schema padrão do NfCrud. O schema utilizado
pelo formkit é gerado dinamicamente a partir deste. Vocẽ deve inserir os atributos do schema do formkit dentro do
atributo form.

**IMPORTANTE:** Podemos passar em handlers funções para tratar eventos, funciona se você estiver
utilizando [Elementos HTML](https://formkit.com/essentials/schema#html-elements-el) ou
carregando [Componentes](https://formkit.com/essentials/schema#components-cmp). Porém não com inputs ($formkit). Isso se
deve ao fato dos inputs do Formkit não emitir eventos, por isso utilizamos funções.

### Handlers Aninhados

Você pode enviar handlers aninhados se desejar (por exemplo se houver conflitos de nome):

```javascript
const handlers = {
  form: {
    categoria: {
      search: () => {
        console.log('my handler')
      }
    }
  }
}
```

```json
[
  {
    "form": {
      "search": "$categoria.search"
    }
  }
]
```

## Slots

### form

Usamos este slot pra definir inputs sem uso do schema ou de forma mesclada, por exemplo:

```vue

<template>
  <NfCrud
    v-model="data"
    id-key="id"
    :schema="schema"
  >
    <template #form="{ formSchema }">
      <FormKitSchema :schema="formSchema">
        <template #productCategoryId>
          <FormKit
            type="autocomplete"
            label="Categoria"
          />
        </template>
      </FormKitSchema>
    </template>
  </NfCrud>
</template>
```

**Notas:**

* **formSchema** é o schema final gerado dinamicamente à partir do schema do nfCrud. Use-o se for utilizar *
  *FormKitSchema**
* Note que estamos utilizando slots dentro do FormKitSchema, com essa funcionalidade podemos definir um slot e
  referencia-la dentro do schema, isso é util pra definirmos a posição do input dentro da lista de inputs. De outra
  maneira seriamos obrigados a posicionar os inputs no inicio ou fim do formulário

```json
// schema.json'
[
  {
    "name": "id",
    "label": "#id",
    "ignoreForm": true
  },
  {
    "name": "productCategoryId",
    "ignoreGrid": true,
    "form": {
      "$el": "div",
      "children": "$slots.productCategoryId"
    }
  },
  {
    "name": "description",
    "label": "Descrição",
    "form": {
      "$formkit": "textarea",
      "validation": "required"
    }
  }
]
```

**Notas:**

* Observe que utilizamos "$el" em vez de "$formkit", ou seja, estamos simplesmente adicionando uma div e carregando o
  slot definido anteriormente entre os campos id e description
* Mais sobre slots em schamas aqui: https://formkit.com/essentials/schema#slots
* Mais sobre elementos html no schema aqui: https://formkit.com/essentials/schema#html-elements-el

Podemos simplesmente ignorar schema e definir todos os inputs via template:

```vue

<template>
  <NfCrud
    v-model="data"
    id-key="id"
    :schema="schema"
  >
    <template #form>
      <FormKit
        name="name"
        label="Nome"
        type="text"
      />
      <FormKit
        name="category"
        label="Categoria"
        type="autocomplete"
      />
    </template>
  </NfCrud>
</template>
```

# Inputs / Colunas customizada

O nfCrud disponibiliza alguns inputs extras para serem usada no formulário (formkit), veja documentação de cada um na
pasta inputs
A referencia de colunas podem será encontrado na pasta columns (não implementado ainda, por enquanto tudo é texto)

# Layouts Disponíveis

## Default

Caracteristicas:

* Listagem em tela cheia
* Formulário em modal

