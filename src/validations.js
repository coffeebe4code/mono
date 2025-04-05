import * as fs from 'node:fs/promises';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execCb);

const git_suggestions = `
    suggestions:
    - ensure git is installed
    - ensure there is an existing .git folder and .gitignore file
    - ensure this command was ran at root of repository
    - ensure the current working tree is clean
`;

const npm_suggestions = `
    suggestions:
    - ensure you have node/npm installed
    - ensure there is enough space on your machine
    - ensure there is an existing package.json file
    - ensure this command was ran at root of repository
    - ensure that npm init was ran in this repository
`;

const mono_suggestions = `
    suggestions:
    - ensure you have monojs installed
    - ensure there is an existing monojs.json file
    - ensure this command was ran at root of repository
`;

/**
 * @returns { Promise<void> } validates
 */
async function git_clean() {
  return exec('git status -s')
    .then(async (/** @type {{stdout:string}} */ { stdout }) => {
      if (stdout.length > 1) {
        critical_error('clean working directory error');
      }
    })
    .catch(e => suggestions(e, git_suggestions));
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
        critical_error(`npm failed with a stderr log\n${stderr}`);
      }
    })
    .catch(e => suggestions(e, npm_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function gitignore_exists() {
  return fs.access('./.gitignore').catch(e => suggestions(e, git_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function mono_exists() {
  return fs.access('monojs.json').catch(e => suggestions(e, mono_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function git_dir_exists() {
  return fs.access('./.git').catch(e => suggestions(e, git_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function package_exists() {
  return fs.access('package.json').catch(e => suggestions(e, npm_suggestions));
}

/**
 * @param {any} err - the error from the callback
 */
function critical_error(err) {
  console.error(`Error: ${err}`);
  throw err;
}

/**
 * @param {any} err - the error from the callback
 * @param {string} suggestion - any suggestions
 */
function suggestions(err, suggestion) {
  console.error(`${err}`);
  console.error(`${suggestion}`);
  throw err;
}

export {
  git_dir_exists,
  gitignore_exists,
  package_exists,
  critical_error,
  suggestions,
  git_clean,
  npm_install,
  append_file,
  mono_exists,
};
