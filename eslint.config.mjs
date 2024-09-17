// @ts-check

// add ts type data
import eslint from "@eslint/js";

// plugins
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

import jsdoc from "eslint-plugin-jsdoc";

export default tseslint.config(
    {
        // ignored compiled and configs
        ignores: ["jest.config.js", "src/assets/**", "eslint.config.mjs"],
    },
    {
        // Add warnings for missing simicolons
        rules: {
            semi: ["warn", "always"],
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: false },
            ],

            // plugins
            "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
        },
        plugins: {
            jsdoc,
            "@stylistic": stylistic,
            "@typescript-eslint": tseslint.plugin,
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
    // plugins
    //jsdoc.configs["flat/recommended-typescript"],
);
