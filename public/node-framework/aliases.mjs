/**
 * **Created on 01/03/2025**
 *
 * aliases.mjs
 *
 * @author André Timermann <andre@timermann.com.br>
 *
 * @file
 * Configura Alias para o projeto e para o node-framework
 *
 * Ref: https://www.npmjs.com/package/esm-module-alias
 *
 * NOTA: em vez de carregar aliases com
 *  --loader=./my-loader.mjs --no-warnings .
 *
 * No nodejs  22 pra frente recomenda-se usar --import e o register, veja em registerLoader.mjs
 *
 * Padrão é "#" para library no node-framework e
 *          "~" para o diretório do usuário
 */

import { dirname, resolve as resolvePath } from "node:path"
import { fileURLToPath } from "node:url"
import generateAliasesResolver from "esm-module-alias"

// Extrai caminho do diretório raiz do node-framework (ou da localização do alias.mjs)
const __dirname = dirname(fileURLToPath(import.meta.url))

// Carrega package.json do diretório do Usuário
const packageJson = await import(resolvePath("./package.json"), {
  assert: { type: "json" },
})

// Extrai configuração do aliases seguindo o padrão do esm-module-alias
const packageAliases = packageJson.aliases || {}

const aliases = {
  "#": resolvePath(__dirname, "library"),
  ...packageAliases,
}

export const resolve = generateAliasesResolver(aliases)
