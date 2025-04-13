import * as esbuild from 'esbuild';
import * as fs from 'node:fs/promises';

const cp = fs.cp('assets', 'bin/assets', { recursive: true });
const es = esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  outfile: 'bin/index.mjs',
  format: 'esm',
  minify: true,
});

await Promise.all([cp, es]);
