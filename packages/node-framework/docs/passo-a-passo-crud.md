# Passo a passo (Roteiro) para criação de crud

# 01 - Definição de esquema de banco de dados com Prisma

# 02 - Criação da API REST/SOCKET

# 03 - Criação do Model

# 04 - Configuração da Validação com YUP Validation

### Opções de validação para registro simples:

| Validação  | Descrição                                     |   
|------------|-----------------------------------------------|
| number()   | Valor numérico                                | 
| required() | Campo obrigatório                             |
| positive() | Numero Positivo                               |
| min(0)     | Substitui positive(), valor positivo com zero |
| integer()  | Valor inteiro                                 |

### Opções de validação para multiples registros em array

| Validação | Descrição                         |
|-----------|-----------------------------------|
| min(1)    | Obrigatório pelo menos 1 registro |

Exemplo:

```javascript

const schema = Yup.object().noUnknown().shape({  
  items: Yup.array().of(
    Yup.object().shape({
      sellPrice: Yup.number().required().min(0),
      description: Yup.string(),
      inventoryId: Yup.number().required().positive().integer()
    })
  ).required().min(1)
})

```

# 05 - Configuração Transform

# 06 - Criação do Teste

# 07 - FRONTEND: Criação do Crud






