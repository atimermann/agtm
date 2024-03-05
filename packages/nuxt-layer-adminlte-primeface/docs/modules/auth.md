# Módulo de Autenticação e Autorização

Este layer inclui telas de autorização e autenticação. A configuração é definida através de appConfig ou RuntimeConfig.

# AppConfig Reference

A configuração é definda em

```
src/app.config.mjs
```

Exemplo:

```javascript
export default {
  admin: {
    auth: {
      enabled: false
    }
  }
}

```

As propriedades são referenciadas a partir de:

```
admin.auth
```

| Propriedade | Tipo | Padrão | Descrição                                  |
|-------------|------|--------|--------------------------------------------|
| auth        | Bool | false  | Habilita sistema de autenticação no painel |

# RuntimeConfig Reference

Configurado em nuxt.config.mjs

```
runtimeConfig.public.admin.auth
```

ou via váriavel de ambiente:

```
NUXT_PUBLIC_ADMIN_AUTH_*
```

| Propriedade  | Env                                 | Tipo     | Padrão | Descrição                                                                                                      |
|--------------|-------------------------------------|----------|--------|----------------------------------------------------------------------------------------------------------------|
| url          | NUXT_PUBLIC_ADMIN_AUTH_URL          | String   | ''     | Endereço do servidor de autenticação.                                                                          |
| clientId     | NUXT_PUBLIC_ADMIN_AUTH_CLIENT_ID    | String   | ''     | ID que identifica o admin no servidor de autenticação.                                                         |
| role.enabled | NUXT_PUBLIC_ADMIN_AUTH_ROLE_ENABLED | Bool     | false  | Ativa a autenticação baseada em roles. O usuário deve possuir uma ou mais roles específica para autenticar-se. |
| role.path    | NUXT_PUBLIC_ADMIN_AUTH_ROLE_PATH    | String   | ''     | Localização da lista de roles no access_token. <br/>Exemplo: resource_access.adminui.roles                     |
| role.roles   | NUXT_PUBLIC_ADMIN_AUTH_ROLE_ROLES   | String[] | []     | Define as roles exigidas para a autenticação do usuário no painel admin.                                       |

