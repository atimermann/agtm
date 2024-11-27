# API's Tool

Node framework disponibiliza seguintes classe para auxiliar na criação de APIs:

# Models
<!-- WARN: Deprecated, usar o Prisma -->
## Visão Geral

Os Models no Node Framework fornecem classes base para auxiliar na interação com o banco de dados. Essas classes são
envolvidas com um proxy (algo pareciso com um decorator) que adicionam alguns processos extras.

Todo método estático criado nessas classes ao ser chamada executam algumas tarefas antes e depois da execução.

Por exemplo, supondo que criemos a seguinte classe:

```javascript
import {PrismaClient} from '@prisma/client'
import {Config, Model} from '@agtm/node-framework'

import ProductValidation from './product.validation.mjs'
import ProductTransform from './product.transform.mjs'

const prisma = new PrismaClient({datasourceUrl: Config.getDSN('prisma')})

class ProductModel extends Model {
  static validation = ProductValidation
  static transform = ProductTransform

  static async save(data) {
    const response = data.id
      ? await prisma.product.update({where: {id: data.id}, data})
      : await prisma.product.create({data})
    return this.get(response.id)
  }
}

export default Model.proxy(ProductModel)
```

Quando o usuário executar o método estático: **ProductModel.save()**, as seguintes tarefas serão executacas:

### 01. Validação

* No atributo validation devemos definir uma classe de validação.
* Casso o atributo estático **validation** esteja definido, e o método save() exista na classe **ProductValidation**:
* o método **ProductValidation.save(data)** será chamado para realizar uma validação dos dados recebidos.
* Caso um erro seja gerado será retornado uma resposta padrão **apiResponse** será retornado
* Caso não ocorra nenhum segue para próxima etapa

### 02. Transformação SET

TODO:

### 03. Execução do método

TODO:

### 04. Transformação GET

TODO:

**IMPORTANTE:**

* Caso não deseje que o método passe por todos esses processo prefixe-o com "$".
  * Exemplo: **Product.$create(data)**
* Métodos privados (prefixo #) não são compativeis com Proxy e não irá funcionar (TODO: encontrar uma solução, por
  enquanto usar $)

# YupValidation

### Descrição

`YupValidation` serve como uma classe base para criar objetos de validação usando Yup. Tem como objetivo fornecer uma
abordagem estruturada para a validação de dados em toda a aplicação, garantindo que os dados de entrada atendam ao
formato e restrições esperados antes do processamento.

TODO: Detalhar explicação

# API ERROR

TODO:

# Utilização

Essas classes são instrumentais no desenvolvimento de endpoints de API, oferecendo uma base sólida para o tratamento de
interações com banco de dados e validação de dados. Ao abstrair padrões comuns como tratamento de erro e validação de
dados, contribuem para bases de código mais limpas e fáceis de manter.

### Exemplo

TODO:
