/**
 * registerLoader.mjs
 *
 * @description
 *    Este arquivo registra o **esm-module-alias/loader** como um loader ESM no Node.js
 *    utilizando a API oficial de `register()` do módulo `node:module`.
 *
 *
 * **Como ele funciona?**
 * - O módulo `esm-module-alias` permite definir **atalhos (aliases)** para caminhos de importação.
 * - Com isso, em vez de usar caminhos relativos longos como:
 *     ```js
 *     import config from "../../../config/index.js";
 *     ```
 *   Podemos usar um alias mais limpo e intuitivo:
 *     ```js
 *     import config from "~/config";
 *     ```
 * - O alias **`~`** é um alias padrão que normalmente aponta para a pasta `src/` do projeto.
 * - Os aliases são definidos no arquivo **`package.json`** dentro da seção `"_moduleAliases"`:
 *     ```json
 *     {
 *       "_moduleAliases": {
 *         "~": "./src"
 *       }
 *     }
 *     ```
 * - Quando o Node.js carrega um módulo, o **esm-module-alias/loader** converte os aliases para caminhos reais automaticamente.
 *
 * **Onde esse arquivo é usado?**
 * - Ele é importado no script de inicialização do servidor (`tsx watch --import ./register-loader.mjs .`).
 * - Permite o uso de **módulos TypeScript com aliases** sem warnings do Node.js.
 *
 *  **Com isso, o servidor TypeScript pode rodar com suporte a alias de forma limpa e otimizada!**
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("esm-module-alias/loader", pathToFileURL("./"));