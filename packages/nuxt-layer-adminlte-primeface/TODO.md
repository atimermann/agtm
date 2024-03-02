* Documentar que para texto utilizar o adminlte/bootstap, criar um de para sobre oq é melhor usar no adminlte/bootstrap
  vs primevue
* Converter o PrimeVue para TailWind: https://tailwind.primevue.org/nuxt/
* Verificar compatibilidade com AdminnLTE (verificar AdminLTE com TailWind)
* Converter tema do formkit para Tailwind


* configurar cors e CSP adeaqudamente para evitar invasão por roubo de token
* implementar secure Cookie 
  * no primeiro acesso configura um secureCookie (não funciona pra socket)
  * cada requisição valida accsss tokem e secure cookie
* Implementar um sistema de segurança exclusivo do backend api
  * no primeiro acesso recebe dados do cliente, como ip agent entre outros, salvar
  * se em algum acesso subsequente algo mudar desconecta usuario tanto do keycloak quanto da api
  * dependendo do caso bloquear usuario

Conexão segura websocket:
https://freecodecamp.org/news/how-to-secure-your-websocket-connections-d0be0996c556/
