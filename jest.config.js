/** @type {import("ts-jest").JestConfigWithTsJest} **/
module.exports = {
    // might switch later to happy-dom for browser test environments
    testEnvironment: "node",

    // including only test files
    testMatch: ["**/tests/**/*.test.ts"],
    // Use Typescript test runner
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
};
