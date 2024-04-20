// eslint.config.js
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.spec.js'],
    ...jest.configs['flat/recommended'],
  },
  jsdoc.configs['flat/recommended'],
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ignores: ['bin/*'],
  },
];
