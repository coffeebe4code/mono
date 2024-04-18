// eslint.config.js
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ignores: ['bin/*'],
  },
];
