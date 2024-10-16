import * as fs from 'node:fs/promises';
import * as v from './validations.js';

let error_code = 0;

/**
 *
 */
export async function cmd_init() {
  //  const gitignore = v.gitignore_exists().catch(inc_error);
  const gitdir = v.git_dir_exists().catch(inc_error);
  const package_file = v.package_exists().catch(inc_error);
  const readdir = fs
    .readdir('.')
    .then(async files => {
      let local_error = false;
      files.map(x => {
        if (
          x.includes('eslint.config') ||
          x.includes('prettier.config') ||
          x.includes('jest.config') ||
          x.includes('monojs.json') ||
          x.includes('tsconfig')
        ) {
          local_error = true;
        }
      });
      if (local_error) {
        console.error(`
!expected to be in a repo without an "eslint.config", "prettier.config", "jest.config", "monojs.json", or "tsconfig" file
monojs has an opinionated setup, and wants to manage those files for the initial js setup
    suggestions:
    - rename those files temporarily, and merge the config to your liking later
    - monojs requires a clean working git tree, revert if the changes are not adequate
  `);
      }
    })
    .catch(inc_error);

  // await gitignore;
  await gitdir;
  await package_file;
  await readdir;

  if (error_code > 0) {
    process.exit(error_code);
  }

  const git = v.git_clean().catch(inc_error);

  await git;

  if (error_code > 0) {
    process.exit(error_code);
  }

  console.info('installing necessary npm dev dependencies. this could take a minute');
  const npm = v
    .npm_install(
      'npm install -D eslint eslint-plugin-jsdoc jsdoc prettier typescript @types/jest @types/node eslint-plugin-jest',
    )
    .catch(inc_error);
  await npm;

  if (error_code > 0) {
    process.exit(error_code);
  }

  console.info('modifying .gitignore');
  const gitignore_write = v
    .append_file(
      './.gitignore',
      `# monojs
.monojs
.mono-cache
bin
node_modules
dist`,
    )
    .catch(inc_error);

  console.info('creating configs');
  const cp = fs
    .cp(__dirname + '/assets/init', process.cwd(), { recursive: true })
    .catch(inc_error);

  await gitignore_write;
  await cp;

  if (error_code > 0) {
    process.exit(error_code);
  }

  console.info('completed initialization');
}

/**
 */
function inc_error() {
  error_code += 1;
}
