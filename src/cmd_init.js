import * as fs from 'node:fs/promises';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execCb);
let error_code = 0;

/**
 *
 */
export async function cmd_init() {
  const gitignore = fs.access('./.gitignore', fs.constants.F_OK).catch(git_suggestion);
  const gitdir = fs.access('.git').catch(git_suggestion);
  const package_file = fs.readFile('package.json').catch(node_suggestion);
  const readdir = fs
    .readdir('.')
    .then(async files => {
      let local_error = false;
      files.map(x => {
        if (
          x.includes('eslint.config') ||
          x.includes('prettier.config') ||
          x.includes('jest.config') ||
          x.includes('tsconfig')
        ) {
          error_code += 1;
          local_error = true;
        }
      });
      if (local_error) {
        console.error(`
!expected to be in a repo without an "eslint.config", "prettier.config", "jest.config", or "tsconfig" file
monojs has an opinionated setup, and wants to manage those files for the initial js setup
    suggestions:
    - rename those files temporarily, and merge the config to your liking later
    - monojs requires a clean working git tree, revert if the changes are not adequate
  `);
      }
    })
    .catch(critical_error);

  await gitignore;
  await gitdir;
  await package_file;
  await readdir;

  if (error_code > 0) {
    process.exit(error_code);
  }

  const git = exec('git status -s')
    .then(async (/** @type {{stdout:string}} */ { stdout }) => {
      if (stdout.length > 1) {
        error_code += 1;
        console.error(`!expected a clean working branch
          please handle all local pending changes in your current branch.`);
      }
    })
    .catch(git_suggestion);

  await git;

  if (error_code > 0) {
    process.exit(error_code);
  }

  console.info('installing necessary npm dev dependencies');
  const npm = exec('npm install -D eslint eslint-plugin-jsdoc jsdoc prettier typescript @types/jest @types/node eslint-plugin-jest')
    .then(async (/** @type {{stderr:string}} */ { stderr }) => {
      if (stderr.length > 1) {
        error_code += 1;
        console.error('!npm failed with a stderr log\n ${stderr}');
      }
    })
    .catch(npm_suggestion);
  await npm;

  if (error_code > 0) {
    process.exit(error_code);
  }

  // start copying files.
  console.info('modifying .gitignore');
  const gitignore_write = fs
    .appendFile('./.gitignore', '\n# monojs\n.monojs\n.mono-cache\n', 'utf8')
    .catch(critical_error);

  const cp = fs.cp(__dirname + '/assets', process.cwd(), { recursive: true });

  await gitignore_write;
  await cp;
}

/**
 * @param {any} err - the error from the callback
 */
function critical_error(err) {
  error_code += 1;
  console.error(err);
}

/**
 * @param {any} err - the error from the callback
 */
function npm_suggestion(err) {
  error_code += 1;
  console.error(err);
  console.error(`!expected npm to work
    suggestions:
    - ensure there is enough space on your machine
    - ensure you have node/npm installed
    - ensure you do not have legacy peer deps with your existing config
    - ensure that you have enough memory on your machine`);
}

/**
 * @param {any} err - the error from the callback
 */
function node_suggestion(err) {
  error_code += 1;
  console.error(err);
  console.error(`!expected to be ran in a node project
    suggestions:
    - ensure there is an existing package.json file
    - ensure this command was ran at root of repository
    - ensure that npm init was ran in this repository`);
}

/**
 * @param {any} err - the error from the callback
 */
function git_suggestion(err) {
  error_code += 1;
  console.error(err);
  console.error(`!expected to be ran in a git repository
    suggestions:
    - ensure there is an existing .git folder and .gitignore file
    - ensure this command was ran at root of repository
    - ensure the .gitignore file is not locked by another process
    - ensure git is installed`);
}
