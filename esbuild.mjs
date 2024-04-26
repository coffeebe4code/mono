import * as esbuild from 'esbuild';
import * as fs from 'node:fs/promises';

const cp = fs.cp('assets', 'bin/assets', { recursive: true });
const es = esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  outfile: 'bin/index.cjs',
  minify: true,
});

await cp;
await es;
