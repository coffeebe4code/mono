import * as fs from 'node:fs/promises';
let error_code = 0;

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
    - ensure the .gitignore file is not locked by another process`);
}

/**
 *
 */
export async function cmd_init() {
  const gitignore = fs
    .access('./.gitignore', fs.constants.F_OK)
    .then(async () => {
      //await fs
      //  .appendFile('./.gitignore', '\n# monojs\n.monojs\n.mono-cache', 'utf8')
      //  .catch(critical_error);
    })
    .catch(git_suggestion);
  const gitdir = fs.access('.git').catch(git_suggestion);
  const package_file = fs.readFile('package.json').catch(node_suggestion);
  const readdir = fs
    .readdir('.')
    .then(async files => {
      console.log(files);
    })
    .catch(critical_error);

  await gitignore;
  await gitdir;
  await package_file;
  await readdir;

  process.exit(error_code);
}
