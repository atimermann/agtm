# Problemas comuns

## CORS

```
Erro: login:1 Access to fetch at 'https://auth.crontech.com.br/realms/crontech/protocol/openid-connect/token' from
origin 'http://localhost:3030' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on
the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the
resource with CORS disabled.
```

**Solução:**

* Habilitar no keycloak o "authentication flow" "Standard Flow" e "Direct Access Grants".
* adicionar em Web Origins "http://localhost:3030"


