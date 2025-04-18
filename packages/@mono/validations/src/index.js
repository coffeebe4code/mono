import * as fs from "node:fs/promises";
import { exec as execCb, spawn } from "node:child_process";
import { promisify } from "node:util";

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

const mono_not_suggestions = `
    suggestions:
    - ensure you have monojs installed
    - ensure there is not an existing monojs.json file
    - ensure this command was ran at root of repository
`;

/**
 * @returns { Promise<void> } validates
 */
async function git_clean() {
  return exec("git status -s")
    .then(async (/** @type {{stdout:string}} */ { stdout }) => {
      if (stdout.length > 1) {
        critical_error("clean working directory error");
      }
    })
    .catch((e) => suggestions(e, git_suggestions));
}

/**
 * @param { string } file_dir - path of file to append
 * @param { string } text - the text appended at the end of file
 * @returns { Promise<void> } validates
 */
async function append_file(file_dir, text) {
  return fs.appendFile(file_dir, text, "utf8").catch(critical_error);
}

/**
 * @param { string } name - the name scoped or unscoped
 * @param { string } resolved_dir - the directory location
 * @param { boolean } is_scoped - scoped portion, needs --scope
 * @returns { Promise<{stdout:string, stderr:string}> } validates
 */
function npm_init_workspace(name, resolved_dir, is_scoped) {
  const rem = is_scoped ? ` --scope ${name.slice(1).split("/")[0]}` : "";
  console.log(`npm init -y -w ${resolved_dir}${rem}`);
  return exec(`npm init -y -w ${resolved_dir}${rem}`);
}

/**
 * @param { string } scope - the full npm command
 * @param { string } target - the workspace
 * @returns { Promise<number | null> } validates
 */
function npm_run_spawn(scope, target) {
  return new Promise((res, rej) => {
    const ins = spawn(`npm`, ["run", target, "-w", scope]);
    ins.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });
    ins.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });
    ins.on("close", (code) => {
      if (code !== 0) {
        rej(`npm run ${target} -w ${scope} failed with exit code ${code}`);
      } else {
        res(code);
      }
    });
    ins.on("error", (err) => {
      rej(err);
    });
  });
}

/**
 * @param { string } scope - the full npm command
 * @param { string } target - the workspace
 * @returns { Promise<number | null> } validates
 */
async function npm_run_exec(scope, target) {
  return new Promise((res, rej) => {
    const ins = execCb(`npm run ${target} -w ${scope}`);
    ins.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });
    ins.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });
    ins.on("close", (code) => {
      if (code !== 0) {
        rej(new Error(`npm install failed with exit code ${code}`));
      } else {
        res(code);
      }
    });
    ins.on("error", (err) => {
      rej(err);
    });
  });
}

/**
 * @param { string } installs - the full npm command
 * @returns { Promise<void> } validates
 */
async function npm_install(installs) {
  return new Promise((res, rej) => {
    const ins = execCb(installs);
    ins.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });
    ins.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });
    ins.on("close", (code) => {
      if (code !== 0) {
        rej(new Error(`npm install failed with exit code ${code}`));
      } else {
        res(code);
      }
    });
    ins.on("error", (err) => {
      rej(err);
    });
  }).catch((e) => suggestions(e, npm_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function gitignore_exists() {
  return fs
    .access("./.gitignore")
    .catch((e) => suggestions(e, git_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function mono_exists() {
  return fs
    .access("monojs.json")
    .catch((e) => suggestions(e, mono_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function mono_not_exists() {
  return fs
    .access("monojs.json")
    .then(() =>
      suggestions("Error: monojs.json found error", mono_not_suggestions),
    )
    .catch(() => console.log("not in monojs repo"));
}
/**
 * @returns { Promise<void> } validates
 */
async function git_dir_exists() {
  return fs.access("./.git").catch((e) => suggestions(e, git_suggestions));
}

/**
 * @returns { Promise<void> } validates
 */
async function package_exists() {
  return fs
    .access("package.json")
    .catch((e) => suggestions(e, npm_suggestions));
}

/**
 * @param {any} err - the error from the callback
 * @returns {never} - throws error
 */
function critical_error(err) {
  console.error(`Error: ${err}`);
  throw err;
}

/**
 * @param {any} err - the error from the callback
 * @param {string} suggestion - any suggestions
 * @returns {never} - not reachable after this point
 */
function suggestions(err, suggestion) {
  console.error(`${err}`);
  console.error(`${suggestion}`);
  throw err;
}

export {
  git_dir_exists,
  gitignore_exists,
  npm_init_workspace,
  package_exists,
  critical_error,
  suggestions,
  git_clean,
  npm_install,
  append_file,
  mono_exists,
  mono_not_exists,
  npm_run_exec,
  npm_run_spawn,
};
