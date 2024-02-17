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
  },
  'no-underscore-method': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'suggest using # instead of _ for private methods',
        category: 'Best Practices',
        recommended: false
      },
      schema: []
    },
    create: function(context) {
      return {
        MethodDefinition(node) {
          if (node.key.name.startsWith('_') && !node.key.name.startsWith('__')) {
            context.report({
              node: node,
              message: 'Replace \'_{{methodName}}\' with \'#{{methodName}}\' to denote a private method.',
              data: {
                methodName: node.key.name.substring(1) // remove the underscore
              }
            });
          }
        }
      };
    }
  }
}
