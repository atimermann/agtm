# API's Tool

Node framework disponibiliza seguintes classe para auxiliar na criação de APIs:

# Serviços de API do Node Framework

## Visão Geral

Os Serviços de API do Node Framework fornecem classes base para auxiliar no desenvolvimento tanto de APIs REST quanto de
APIs Socket. Essas classes base incluem `ServiceService`, para interações com banco de dados, e `YupValidation`, para
validação de dados, facilitando a criação de lógica do lado do servidor robusta e de fácil manutenção.

## `Service`

### Descrição

`ServiceService` é projetado para simplificar as operações de consulta ao banco de dados usando Prisma. Ele abstrai a
lógica de tentativa e captura (try-catch), oferecendo tratamento de erro uniforme e estruturas de retorno padronizadas
para operações de consulta. Esta classe é particularmente hábil em distinguir erros de validação do Yup de erros de
banco de dados do Prisma, permitindo que os desenvolvedores tratem esses tipos distintos de erro de maneira apropriada
na lógica de sua API.

### Método: `prismaQuery`

- **Propósito**: Executa uma consulta ao banco de dados Prisma, gerenciando tanto erros de validação quanto erros de
  banco de dados.
- **Parâmetros**:
  - `fn`: Uma função que realiza a operação de consulta Prisma. Deve ser uma função assíncrona ou retornar uma Promise.
- **Retorno**: Uma Promise que resolve para um objeto indicando o resultado da operação. Em caso de sucesso, contém os
  dados da consulta. Em caso de falha, inclui detalhes do erro, que podem ser originados de erro de validação do Yup ou
  problemas do banco de dados Prisma.

## `YupValidation`

### Descrição

`YupValidation` serve como uma classe base para criar objetos de validação usando Yup. Tem como objetivo fornecer uma
abordagem estruturada para a validação de dados em toda a aplicação, garantindo que os dados de entrada atendam ao
formato e restrições esperados antes do processamento.

### Propriedades

- `schema` (`YupSchema`): O esquema de validação Yup contra o qual os dados são validados.

### Método: `validate`

- **Propósito**: Valida os dados de acordo com o esquema Yup definido.
- **Parâmetros**:
  - `data`: Os dados a serem validados.
- **Retorno**: Uma Promise que resolve para o resultado da validação. Lança um `ApiError` se o esquema não estiver
  definido ou se a validação falhar, encapsulando os erros de validação.

# Utilização

Essas classes são instrumentais no desenvolvimento de endpoints de API, oferecendo uma base sólida para o tratamento de
interações com banco de dados e validação de dados. Ao abstrair padrões comuns como tratamento de erro e validação de
dados, contribuem para bases de código mais limpas e fáceis de manter.

### Exemplo

Para usar esses serviços em sua API, defina seu esquema Yup em `YupValidation`, configure-o como o `schema` da classe e,
em seguida, utilize `prismaQuery` dentro dos métodos de serviço para interagir com o banco de dados de maneira limpa e
eficiente. Use `YupValidation.validate` para garantir que os payloads de dados aderem aos requisitos da sua aplicação
antes de proceder com operações no banco de dados ou lógica de negócios.

```javascript
import {PrismaClient} from '@prisma/client'
import {Config, Service} from '@agtm/node-framework'
import ProductValidation from '~/apps/Inventory/services/product.validation.mjs'

const prisma = new PrismaClient({datasourceUrl: Config.getDSN('prisma')})

export default class ProductService extends Service {

  static async create(data) {
    return this.prismaQuery(async () => {
      const validData = await ProductValidation.validate(data)
      return prisma.product.create({data: validData})
    })
  }
}
```
```javascript
import { YupValidation } from '@agtm/node-framework'
import * as Yup from 'yup'

export default class ProductValidation extends YupValidation {

  static schema = Yup.object().shape({
    productCategoryId: Yup
      .number()
      .required()
      .positive()
      .integer(),
    name: Yup
      .string()
      .required()
      .max(255),
    description: Yup
      .string()
      .max(255),
    brand: Yup
      .string()
      .max(255),
    tags: Yup.number().required()
  })
}

```
