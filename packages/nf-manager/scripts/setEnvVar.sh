#!/bin/bash

DIRECTORY="./src/public/nfManager/main"

# Lista de variáveis a serem substituídas
VARIABLES=("SOCKET_HOSTNAME" "SOCKET_PORT")
# Adicione mais variáveis à lista VARIABLES conforme necessário

# Carregar variáveis específicas do arquivo .env se não estiverem definidas no ambiente
if [ -f ".env" ]; then
  for VAR in "${VARIABLES[@]}"; do
    if [ -z "${!VAR}" ]; then
      export $VAR=$(grep "^$VAR=" .env | cut -d '=' -f2-)
    fi
  done
else
  echo "Arquivo .env não encontrado no diretório corrente"
fi

if [ -d "$DIRECTORY" ]; then
  echo Entrando em "$DIRECTORY"
  cd "$DIRECTORY"

  for VAR in "${VARIABLES[@]}"; do
    echo Alterando "$VAR"...
    if [ -z "${!VAR}" ]; then
      echo "A variável de ambiente $VAR não está definida"
      exit 1
    fi

    PATTERN="___NODE_FRAMEWORK_NUXT_REPLACE___${VAR}___"
    REPLACEMENT="${!VAR}"

    FILES=$(grep -rl "$PATTERN" .)

    for FILE in $FILES; do
      echo Substituindo "$PATTERN" em "$FILE"
      sed -i "s|$PATTERN|$REPLACEMENT|g" "$FILE"
    done
  done
else
  echo "O diretório $DIRECTORY não existe"
fi

echo Concluído