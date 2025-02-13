module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
      'prettier',
      'plugin:prettier/recommended',
    ],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'error',
      // ... (other rules)
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };