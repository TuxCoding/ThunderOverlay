// @ts-check

// add ts type data
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        // ignored compiled and configs
        ignores: ['jest.config.js', 'src/assets/**', 'eslint.config.mjs'],
    },
    {
        // Add warnings for missing simicolons
        rules: {
            semi: ["warn", "always"],
        },
    },

    // parser is necessary for typed checking
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigDirName: import.meta.dirname,
            },
        },
    },

    // enable strict configuration
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
);
