// eslint.config.js
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import jest from "eslint-plugin-jest";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.spec.js"],
    ...jest.configs["flat/recommended"],
  },
  jsdoc.configs["flat/recommended"],
  {
    files: ["src/**/*.js"],
    languageOptions: { globals: { ...globals.nodeBuiltin } },
    rules: {
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-type": ["error"],
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-type": ["error"],
    },
  },
  {
    ignores: ["dist/*", "assets/*"],
  },
];

