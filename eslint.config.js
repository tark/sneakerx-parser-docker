import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginTypeScript from "@typescript-eslint/eslint-plugin";
import eslintPluginImport from "eslint-plugin-import";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    env: {
      es6: true,
      node: true,
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "@typescript-eslint": eslintPluginTypeScript,
      import: eslintPluginImport,
    },
    ignores: [
      "node_modules/",
      "public/",
      "build/",
      "*.css",
      "*.svg",
    ],
    rules: {
      "@typescript-eslint/no-throw-literal": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "import/prefer-default-export": "off",
      "@typescript-eslint/type-annotation-spacing": ["warn"],
      "@typescript-eslint/naming-convention": ["warn"],
      indent: "off",
      "@typescript-eslint/indent": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-redeclare": "off",
      eqeqeq: "off",
      "import/no-unresolved": "off",
      "prettier/prettier": "off",
      "react/jsx-filename-extension": [0],
      "import/extensions": "off",
    },
  },
];
