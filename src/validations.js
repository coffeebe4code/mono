import * as fs from 'node:fs/promises';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execCb);

/**
 * @returns { Promise<void> } validates
 */
async function git_clean() {
  return exec('git status -s')
    .then(async (/** @type {{stdout:string}} */ { stdout }) => {
      if (stdout.length > 1) {
        console.error(`!expected a clean working branch
          please handle all local pending changes in your current branch.`);
        throw Error('clean working directory error');
      }
    })
    .catch(git_clean_suggestion);
}

/**
 * @param { string } file_dir - path of file to append
 * @param { string } text - the text appended at the end of file
 * @returns { Promise<void> } validates
 */
async function append_file(file_dir, text) {
  return fs.appendFile(file_dir, text, 'utf8').catch(critical_error);
}

/**
 * @param { string } installs - the full npm command
 * @returns { Promise<void> } validates
 */
async function npm_install(installs) {
  return exec(installs)
    .then(async (/** @type {{stderr:string}} */ { stderr }) => {
      if (stderr.length > 1) {
        critical_error(`!npm failed with a stderr log\n${stderr}`);
      }
    })
    .catch(npm_suggestion);
}

/**
 * @returns { Promise<void> } validates
 */
async function gitignore_exists() {
  return fs.access('./.gitignore').catch(git_suggestion);
}

/**
 * @returns { Promise<void> } validates
 */
async function mono_exists() {
  return fs.access('monojs.json').catch(git_suggestion);
}

/**
 * @returns { Promise<void> } validates
 */
async function git_dir_exists() {
  return fs.access('.git').catch(git_suggestion);
}

/**
 * @returns { Promise<void> } validates
 */
async function package_exists() {
  return fs.access('package.json').catch(node_suggestion);
}

/**
 * @param {any} err - the error from the callback
 */
function critical_error(err) {
  console.error(err);
  throw err;
}

/**
 * @param {any} err - the error from the callback
 */
function npm_suggestion(err) {
  console.error(err);
  console.error(`!expected npm to work
    suggestions:
    - ensure there is enough space on your machine
    - ensure you have node/npm installed
    - ensure you do not have legacy peer deps with your existing config
    - ensure that you have enough memory on your machine`);
  throw err;
}

/**
 * @param {any} err - the error from the callback
 */
function node_suggestion(err) {
  console.error(err);
  console.error(`!expected to be ran in a node project
    suggestions:
    - ensure there is an existing package.json file
    - ensure this command was ran at root of repository
    - ensure that npm init was ran in this repository`);
  throw err;
}

/**
 * @param {any} err - the error from the callback
 */
function git_clean_suggestion(err) {
  console.error(`!expected a clean working branch
          please handle all local pending changes in your current branch.`);
  throw err;
}

/**
 * @param {any} err - the error from the callback
 */
function git_suggestion(err) {
  console.error(err);
  console.error(`!expected to be ran in a git repository
    suggestions:
    - ensure there is an existing .git folder and .gitignore file
    - ensure this command was ran at root of repository
    - ensure the .gitignore file is not locked by another process
    - ensure git is installed`);
  throw err;
}

export {
  git_dir_exists,
  gitignore_exists,
  git_suggestion,
  node_suggestion,
  npm_suggestion,
  critical_error,
  package_exists,
  git_clean,
  git_clean_suggestion,
  npm_install,
  append_file,
  mono_exists,
};
