// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        // config with just ignores is the replacement for `.eslintignore`
        ignores: ['**/build/**', '**/dist/**', 'jest.config.js', 'src/assets/**', 'webpack.config.js'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
);
