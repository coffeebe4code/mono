/** @type {import('jest').Config} */
const config = {
  bail: 1,
  cacheDirectory: ".mono-cache/jest_rs",
  clearMocks: true,
  maxWorkers: "70%",
  testMatch: [
    "packages/**/src/**/*.spec.js",
    "clis/**/src/**/*.spec.js",
    "apps/**/src/**/*.spec.js",
    "services/**/src/**/*.spec.js",
  ],
};

export default config;
