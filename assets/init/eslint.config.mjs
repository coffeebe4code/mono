// eslint.config.js
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import jest from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: [
      'services/**/*.spec.js',
      'packages/**/*.spec.js',
      'clis/**/*.spec.js',
      'apps/**/*.spec.js',
    ],
    ...jest.configs['flat/recommended'],
  },
  jsdoc.configs['flat/recommended'],
  {
    files: ['services/**/*.js', 'packages/**/*.js', 'clis/**/*.js', 'apps/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    ignores: ['**/bin/*', '**/assets/*', '**/node_modules/**'],
  },
];
