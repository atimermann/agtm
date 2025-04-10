TODO:

Documentar que podemos definir atributos especiais nas interfaces por exemplo:

```typescript

export interface AutoSchemaInterface {

  /**
   * Se definido não ignora campos adicionais
   * @default false
   */
  strict?: boolean

}
```

* A anotação JSDOC @default é lido pelo ts-json-schema-generator (https://github.com/vega/ts-json-schema-generator)
* Que vai gerar um schema de validação com valor default
* Esse valor default vai ser processador pelo AJV pois definimos useDefault = true

```
this.ajv = new Ajv({ useDefaults: true })
```

