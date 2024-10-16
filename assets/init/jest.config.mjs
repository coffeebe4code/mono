/** @type {import('jest').Config} */
const config = {
  bail: 1,
  cacheDirectory: '.mono-cache/jest_rs',
  clearMocks: true,
  maxWorkers: '70%',
};

export default config;
