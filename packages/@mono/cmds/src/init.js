import * as fs from "node:fs/promises";
import * as v from "@mono/validations";

const read_suggestions = `
    suggestions:
    - rename those files temporarily, and merge the config to your liking later
    - monojs requires a clean working git tree, revert if the changes are not adequate
`;

const gitignore_contents = `
# monojs
.monojs
.mono-cache
bin
node_modules
dist
.env
`;

/**
 *
 */
export async function init() {
  const mono = v.mono_not_exists();

  await mono;

  const gitignore = v.gitignore_exists();
  const gitdir = v.git_dir_exists();
  const package_file = v.package_exists();
  const readdir = fs.readdir(".").then(async (files) => {
    files.map((x) => {
      if (
        x.includes(".editorconfig") ||
        x.includes("jest.config") ||
        x.includes("monojs.json") ||
        x.includes("tsconfig")
      ) {
        v.suggestions(
          `Error: found either ".editorconfig", "jest.config", "monojs.json", or "tsconfig" file`,
          read_suggestions,
        );
      }
    });
  });

  await Promise.all([gitignore, gitdir, package_file, readdir]);

  const git = v.git_clean();

  await git;

  console.info(
    "installing necessary npm dev dependencies. this could take a minute",
  );
  const npm = v.npm_install(
    "npm install -D esbuild eslint eslint-plugin-jsdoc jsdoc prettier typescript @types/jest @types/node eslint-plugin-jest",
  );
  await npm;

  console.info("modifying .gitignore");
  const gitignore_write = v.append_file("./.gitignore", gitignore_contents);

  console.info("creating configs");
  const cp = fs.cp(import.meta.dirname + "/assets/init/", process.cwd(), {
    recursive: true,
  });

  await Promise.all([gitignore_write, cp]);

  console.info("completed initialization");
}
