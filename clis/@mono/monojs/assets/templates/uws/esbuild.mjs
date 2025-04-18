import * as esbuild from "esbuild";

const es = esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "node",
  outfile: "bin/index.cjs",
  target: "esnext",
  minify: true,
});

await Promise.all([es]);
