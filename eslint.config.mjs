// @ts-check

// add ts type data
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        // ignored compiled and configs
        ignores: ['jest.config.js', 'src/assets/**'],
    },
    {
        // Add warnings for missing simicolons
        rules: {
            semi: ["warn", "always"],
        },
    },

    // enable strict configuration
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
);
