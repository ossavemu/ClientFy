import builderbotPlugin from 'eslint-plugin-builderbot';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        node: true,
        es2021: true,
      },
    },
    plugins: {
      builderbot: builderbotPlugin,
      jsxA11y: jsxA11yPlugin,
    },
    rules: {
      'no-unsafe-optional-chaining': 'off',
      'import/no-duplicates': 'off',
    },
  },
];
