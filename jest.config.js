/** @type {import("ts-jest").JestConfigWithTsJest} **/

const { pathsToModuleNameMapper } = require("ts-jest");

module.exports = {
    // might switch later to happy-dom for browser test environments
    testEnvironment: "node",

    // including only test files
    testMatch: ["**/tests/**/*.test.ts"],
    // Use Typescript test runner
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },

    moduleNameMapper: pathsToModuleNameMapper({
        "@App/*": ["src/*"],
        "@Mapping/*": ["src/mappings/*"]
    }, { prefix: '<rootDir>/' }),
};
