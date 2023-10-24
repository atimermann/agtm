#!/bin/bash

# Este script gera o código estático do nuxt, copia para o assets do app main e executa install-assets copiando para o diretório public

(cd web && npm run generate)
rm -rf src/apps/main/assets
cp -r web/.output/public src/apps/main/assets
npm run install-assets