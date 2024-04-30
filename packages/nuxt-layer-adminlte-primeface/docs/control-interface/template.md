# useModuleNameStore

**Tipo:** [Store ou Composable]

[DESCRIÇÃO]

---

## Configurações

### appConfig

| Atributo     | Tipo    | Padrão | Descrição                                    |
|--------------|---------|--------|----------------------------------------------|
| auth.enabled | Boolean | false  | Se o módulo de autenticação está habilitado. |

### runtimeConfig

| Propriedade  | Env                                 | Tipo     | Padrão | Descrição                                                                                                      |
|--------------|-------------------------------------|----------|--------|----------------------------------------------------------------------------------------------------------------|
| url          | NUXT_PUBLIC_ADMIN_AUTH_URL          | String   | ''     | Endereço do servidor de autenticação.                                                                          |


---

## Atributos

| Nome            | Tipo    | Descrição                                                                |
|-----------------|---------|--------------------------------------------------------------------------|
| `authenticated` | boolean | Indica se o usuário está atualmente autenticado.                         |
| `scope`         | ?string | O escopo do token de acesso indicando quais permissões foram concedidas. |

---

## Métodos

### defineMenu()

[DESCRIÇÃO]

#### Parâmetros

| Nome | Tipo | Padrão | Descrição                                 |
|------|------|--------|-------------------------------------------|
| menu | Menu | N/A    | Objeto de menu a ser definido e indexado. |

#### Retorno

| Nome             | Tipo    | Descrição         |
|------------------|---------|-------------------|
| response.success | Boolean | True se sucesso   |
| response.status  | String  | status do retorno |

ou VOID

#### Exemplo:

```javascript
// Exemplo completo de uso aqui
```
