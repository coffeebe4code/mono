import { add_dependency, load_mono, project_exists, write_mono } from './mono_helper.js';

import { critical_error, suggestions } from './validations.js';

const project_depends_sug = `
    suggestions:
    - provide a project name and depends: \`monojs graph cool-server --depends-on that feature`;

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function cmd_graph(args) {
  /** @type {string | undefined} */
  const name = args._[1];
  /** @type {string | undefined} */
  const depends = args['depends-on'] ?? args.d;

  if (!name || !depends) {
    suggestions(
      `Error: expected a project name with the --depends-on option`,
      project_depends_sug,
    );
  }

  let mono = load_mono()
    .then(async m => {
      const top = project_exists(m, name);
      const bot = project_exists(m, depends);
      if (!top || !bot) {
        suggestions(
          `Error: expected projects to exist`,
          `
      suggestions:
      - ensure you typed the names correctly
      - ${name} exists: ${!!top}
      - ${depends} exists: ${!!bot}`,
        );
      }
      add_dependency(top, bot);
      return await write_mono(m);
    })
    .catch(e => critical_error(e));

  await mono;
}
