# Autocomplete

TODO: Documentar melhor

* Você deve passar uma prop search que deve retornar uma lista de opções
* Essa lista deve ser um array de objetos com os atributos:
  * label: String, texto que será exibido no formulário
  * value: valor que será usado efetivamente pelo input

# Documentação do Componente Autocomplete

O componente `Autocomplete` fornece uma interface de usuário rica para seleção de itens a partir de uma lista de
sugestões conforme o usuário digita. Ele é ideal para situações onde você quer permitir que os usuários rapidamente
encontrem e selecionem de uma lista de opções enquanto digitam, reduzindo a necessidade de navegação adicional.

## Props

| Nome      | Tipo     | Descrição                                                                                    |
|-----------|----------|----------------------------------------------------------------------------------------------|
| `search`  | Function | Uma função que recebe o texto de entrada do usuário e retorna uma lista de opções sugeridas. |
| `getItem` | Function | Uma função para recuperar um item específico baseado em seu id.                              |
| `value`   | Any      | O valor atualmente selecionado pelo componente.                                              |

## Exemplo de Uso

Quando você está construindo um formulário que inclui um campo Autocomplete, você pode especificar as
propriedades `search`, `getItem`, e `value` dentro da configuração do campo. Abaixo está um exemplo de como definir
essas propriedades para um campo de produto em um formulário:

```json
{
  "name": "productId",
  "label": "Produto",
  "number": true,
  "form": {
    "$formkit": "autocomplete",
    "search": "$searchProduct",
    "getItem": "$getItemProduct",
    "validation": "required"
  }
}
```

Ver mais detalhes na documentação formKit