/** @type {import('jest').Config} */
const config = {
  bail: 1,
  cacheDirectory: '.mono-cache/jest_rs',
  clearMocks: true,
  maxWorkers: '50%',
};

export default config;
