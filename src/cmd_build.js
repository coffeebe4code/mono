import { get_run_chain_top, load_mono, project_exists } from './mono_helper';
import { spawn } from 'node:child_process';
let error_code = 0;

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function cmd_build(args) {
  /** @type {string | undefined} */
  const project = args._[1];

  if (!project) {
    error_code += 1;
    console.error(`!expected args for project name
      suggestions:
      - provide a scoped or unscoped name
      `);
  }

  if (error_code > 0) {
    process.exit(error_code);
  }
  const mono_loaded = load_mono()
    .then(mono => {
      const project_loaded = project_exists(mono, project);
      if (!project_loaded) {
        error_code += 1;
        console.error(`!expected a project that exists
      suggestions:
      - provide a scoped or unscoped name that exists in the project tree and monojs.json
      `);
        throw Error('error');
      }
      let found = false;
      for (const t of project_loaded.targets) {
        if (t.kind === 'build') {
          found = true;
          const cmds = get_run_chain_top(mono, project_loaded, 'build');

          for (const c of cmds.lint) {
            const split = c.split(' ');
            const child = spawn(split[0], split.slice(1, split.length - 1));
          }

          break;
        }
      }
      if (!found) {
        error_code += 1;
        console.error(`!expected a project and target to contain build
      suggestions:
      - this project does not have a build target command
      `);
      }
    })
    .catch(inc_error);

  await mono_loaded;

  if (error_code > 0) {
    process.exit(error_code);
  }
}

/**
 * @param {any} err - the error from the callback
 */
function inc_error(err) {
  error_code += 1;
  console.error(err);
}
