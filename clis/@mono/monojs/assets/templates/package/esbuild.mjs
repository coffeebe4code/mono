import * as esbuild from "esbuild";

const es = esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "node",
  outfile: "dist/index.mjs",
  target: "esnext",
  format: "esm",
  minify: true,
});

await Promise.all([es]);
