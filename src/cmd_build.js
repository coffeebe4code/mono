import { get_run_chain_top, load_mono, project_exists } from './mono_helper';
import { critical_error, suggestions } from './validations';
import { spawn } from 'node:child_process';

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function cmd_build(args) {
  /** @type {string | undefined} */
  const project = args._[1];

  if (!project) {
    suggestions(
      `expected args for project name`,
      `suggestions:
      - provide a scoped or unscoped name
      `,
    );
  }

  const mono_loaded = load_mono().then(mono => {
    const project_loaded = project_exists(mono, project);
    if (!project_loaded) {
      critical_error(`!expected a project that exists
      `);
    }
    let found = false;
    for (const t of project_loaded.targets) {
      if (t.kind === 'build') {
        found = true;
        const cmds = get_run_chain_top(mono, project_loaded, 'build');

        for (const c of cmds.lint) {
          const split = c.split(' ');
          const child = spawn(split[0], split.slice(1, split.length - 1));
          Promise.all([child]);
        }

        break;
      }
    }
    if (!found) {
      suggestions(
        `expected a project and target to contain build`,
        `
      suggestions:
      - this project does not have a build target command
      `,
      );
    }
  });

  await mono_loaded;
}
