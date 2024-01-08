/**
 * @file Define and export a resolver for module aliases "~" using 'esm-module-alias'.
 */

import generateAliasesResolver from 'esm-module-alias'

const aliases = {
  '~': 'src'
}
export const resolve = generateAliasesResolver(aliases)
