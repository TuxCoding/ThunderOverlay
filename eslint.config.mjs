// @ts-check

// ts type data
import eslint from "@eslint/js";

// plugins
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

import jsdoc from "eslint-plugin-jsdoc";

export default tseslint.config(
    {
        // ignored compiled and build configs
        ignores: ["jest.config.js", "src/assets/**", "eslint.config.mjs"],
    },
    {
        rules: {
            // Add warnings for missing simicolons
            semi: ["warn", "always"],
            // allow await promises without checking return
            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: false },
            ],

            // plugins
            // standardize qoute handling to use double and allow inner usuage
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
    jsdoc.configs["flat/stylistic-typescript"],
);
