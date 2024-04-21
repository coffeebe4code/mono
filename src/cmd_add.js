import * as fs from 'node:fs/promises';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execCb);
let error_code = 0;

/**
 * @param {any} args - the args from command
 */
export async function cmd_add(args) {
  /** @type {string | undefined} */
  const name = args._[1];
  /** @type {boolean | undefined} */
  const template = args.template ?? args.t;
  ///** @type {boolean | undefined} */
  const publish = args.publish ?? args.p;

  if (!name || !template) {
    error_code += 1;
    console.error(`!expected args for name and template option
      suggestions:
      - provide a scoped or unscoped name: ${name} was provided
      - provide a template: ${template} was provided`);
  } else {
    if (name.includes('@') || name.includes('/')) {
      if (!name.includes('@') || !name.includes('/')) {
        error_code += 1;
        console.error(`!expected scoped package to contain an '@' and '/'
      suggestions:
      - provide a correctly scoped project: ${name} was provided`);
      }
      if (name.split('/')[2]) {
        error_code += 1;
        console.error(`!expected scoped package to be of depth 1
      suggestions:
      - provide 'flat featured' scoped project: ${name} was provided`);
      }
    }
  }

  if (error_code > 1) {
    process.exit(error_code);
  }
  const scoped_name = name.includes('@') && name.includes('/');
  const resolved_dir = `./src/services/${scoped_name ? name.split('@')[1] : name}`;

  const loc = fs
    .access(resolved_dir)
    .then(() => {
      error_code += 1;
      console.error(`!expected ${resolved_dir} to not exist
      suggestions:
      - rename the directory and commit those changes
      - if you are not satisfied, you can undo your changes`);
    })
    .catch(() => {});

  await loc;
  if (error_code > 1) {
    process.exit(1);
  }

  const gitdir = fs.access('.git').catch(git_suggestion);
  const package_file = fs.readFile('package.json').catch(node_suggestion);
  const monojs_file = fs.access('monojs.json').catch(mono_suggestion);

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
  await gitdir;
  await package_file;
  await monojs_file;

  // todo:: still need to get this correct
  const cp = fs.cp(__dirname + '/assets/templates/', process.cwd(), { recursive: true });

  await cp;
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
function mono_suggestion(err) {
  error_code += 1;
  console.error(err);
  console.error(`!expected to be ran in a monojs repository
    suggestions:
    - ensure there is an existing monojs.json file
    - ensure this command was ran at root of repository`);
}

/**
 * @param {any} err - the error from the callback
 */
function git_suggestion(err) {
  error_code += 1;
  console.error(err);
  console.error(`!expected to be ran in a git repository
    suggestions:
    - ensure there is an existing .git folder
    - ensure this command was ran at root of repository
    - ensure git is installed`);
}
