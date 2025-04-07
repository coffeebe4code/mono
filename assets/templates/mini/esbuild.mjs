import * as esbuild from 'esbuild';

const es = esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  outfile: 'bin/index.cjs',
  minify: true,
});

await Promise.all([es]);
