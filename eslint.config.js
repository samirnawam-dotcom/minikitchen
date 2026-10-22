'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/',
      'data/',
      // Legacy monolithic scripts, removed as the frontend modules replace them
      'public/js/app.js',
      'public/js/admin.js',
      'public/js/site-data.js',
      'public/js/menu-data.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node }
    },
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error'
    }
  },
  {
    files: ['public/js/**/*.js'],
    languageOptions: { sourceType: 'module', globals: { ...globals.browser } }
  },
  {
    files: ['public/js/theme-init.js'],
    languageOptions: { sourceType: 'script' },
    rules: { 'no-var': 'off' }
  }
];
