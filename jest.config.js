/** @type {import("ts-jest").JestConfigWithTsJest} **/

const { pathsToModuleNameMapper } = require("ts-jest");

module.exports = {
    // might switch later to happy-dom for browser test environments
    testEnvironment: "node",

    // Test naming convention to use ./tests/**/FILE.test.ts
    testMatch: ["**/tests/**/*.test.ts"],

    // Use Typescript test runner
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },

    // Allow TS name mapper in test files too although requires duplicate defs
    moduleNameMapper: pathsToModuleNameMapper(
        {
            "@App/*": ["src/*"],
            "@Mapping/*": ["src/lang/mappings/*"],
        },
        { prefix: "<rootDir>/" },
    ),
};
