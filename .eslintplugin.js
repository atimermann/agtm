const {builtinModules} = require("module");

exports.rules = {
  'import-require-node-prefix': {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Disallow imports of built-in Node.js modules without the `node:` prefix',
        category: 'Best Practices',
        recommended: true
      },
      fixable: 'code',
      schema: []
    },
    create: context => ({
      ImportDeclaration (node) {
        const { source } = node

        if (source?.type === 'Literal' && typeof source.value === 'string') {
          const moduleName = source.value

          if (builtinModules.includes(moduleName) && !moduleName.startsWith('node:')) {
            context.report({
              node: source,
              message: `Import of built-in Node.js module "${moduleName}" must use the "node:" prefix.`,
              fix: fixer => fixer.replaceText(source, `"node:${moduleName}"`)
            })
          }
        }
      }
    })
  }
}
