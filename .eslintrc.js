'use strict';

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        parser: 'babylon',
        singleQuote: true,
        trailingComma: 'es5',
      },
    ],
    strict: 'error',
  },
};