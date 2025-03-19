
- Vamos user apenas uma instancia do PRISMA, se um dia precisar de mais instancia será necessário criar mais schema:
  - output          = "./generated/client1" no schema definindo um diretório (gera apartir do diretório prisma)
  - Definir no config yaml o caminho para esse cliente
  - Criar um client para cada caminho
  - Configurar o ENV para suportar mais de um:
    ex:
    - NF_PRISMA_DEFAULT_CLIENT_PATH="generated/client"
      NF_PRISMA_DEFAULT_PROVIDER="postgresql"
      NF_PRISMA_DEFAULT_HOST="localhost"
      NF_PRISMA_DEFAULT_PORT="30100"
      NF_PRISMA_DEFAULT_DATABASE=""
      NF_PRISMA_DEFAULT_USERNAME=""
      NF_PRISMA_DEFAULT_PASSWORD=""
      NF_PRISMA_DEFAULT_OPTIONS="schema=public"
- Adicionar essa informação na documenação do prisma
