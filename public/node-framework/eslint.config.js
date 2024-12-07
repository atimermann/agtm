import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    languageOptions: { globals: globals.browser },
    // Adiciona o plugin para regras de estilo
    plugins: {},
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports", // Força o uso de `import type`
          disallowTypeAnnotations: true, // Opcional: impede `type` redundante em declarações
        },
      ],
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-explicit-any": "error"
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]
