# useLayoutStore

**Tipo:** Store

Responsável por ajustar o layout do template de acordo com configurações dinamicas, util em aplicação Multi Tenant, onde
o layout pode alterar para cada cliente diferente

---

## Configurações

### appConfig

| Atributo        | Tipo   | Padrão | Descrição               |
|-----------------|--------|--------|-------------------------|
| admin.logoLabel | String | ''     | Label exibida no menu . |

### runtimeConfig

| Variável de ambiente | Tipo | Padrão | Descrição |
|----------------------|------|--------|-----------|

Nenhum configuração disponível

---

## Atributos

| Nome              | Tipo   | Padrão                         | Descrição                                                                                                                                                              |
|-------------------|--------|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `login.logoImage` | string | null                           | Imagem usada como logo na tela de login. Para obter o caminho correto utilizar import como no exemplo: (await import('#assets/adminlte/img/AdminLTELogo.png')).default |
| `login.logoLabel` | string | useAppConfig().admin.logoLabel | Label exibita na tela de login                                                                                                                                         |
| `menu.logoImage`  | sring  | ''                             | Imagem usada como logo no menu. Para obter o caminho correto utilizar import como no exemplo: (await import('#assets/adminlte/img/AdminLTELogo.png')).default          |
| `login.logoLabel` | string | 'NLAP Control Panel'           | Label exibida no menu                                                                                                                                                  |

---

## Métodos

### configure()

[TODO]

### loadTheme()

[TODO]

### setLoginLogoImage()

[TODO]

### setLoginLogoLabel()

[TODO]

### setMenuLogoImage()

[TODO]

### setMenuLogoLabel()

[TODO]

#### Parâmetros

| Nome  | Tipo   | Padrão | Descrição               |
|-------|--------|--------|-------------------------|
| label | string | N/A    | Label exibida no menu . |

#### Retorno

VOID

#### Exemplo:

```javascript
// Exemplo completo de uso aqui
```
