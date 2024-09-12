// @ts-check

// add ts type data
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

// plugins
import stylistic from "@stylistic/eslint-plugin"

export default tseslint.config(
    {
        // ignored compiled and configs
        ignores: ["jest.config.js", "src/assets/**", "eslint.config.mjs"],
    },
    {
        // Add warnings for missing simicolons
        rules: {
            semi: ["warn", "always"],
            // plugins
            "@stylistic/quotes": "warn",
        },
        plugins: {
            "@stylistic": stylistic
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
