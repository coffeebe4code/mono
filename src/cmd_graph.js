import { load_mono, project_exists, structure_graph, write_mono } from './mono_helper.js';

import { suggestions } from './validations.js';

/**
 * @param {string} depends - which depend
 * @returns {string} - the suggestions
 */
const project_depends_sug = depends => `
    suggestions:
    - provide a project name: \`monojs graph cool-server --depends-on ${depends}\`
    - use the show command to show the graph: \`monojs graph --show\``;

const only_one_sug = `
    suggestions:
    - choose --show or --depends-on separately
`;

/**
 * @param {string} name - which name
 * @returns {string} - the suggestions
 */
const project_name_sug = name => `
    suggestions:
    - provide a project name: \`monojs graph ${name} --depends-on my-dependency\`
    - use the show command to show the graph: \`monojs graph ${name} --show\``;

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function cmd_graph(args) {
  /** @type {string | undefined} */
  const name = args._[1];
  /** @type {string | undefined} */
  const depends = args['depends-on'] ?? args.d;
  ///** @type {boolean | undefined} */
  const show = args.show ?? args.s;

  if (!name && depends) {
    suggestions(
      `Error: expected a project name with the --depends-on option`,
      project_depends_sug(depends),
    );
  }
  if (name && !depends && !show) {
    suggestions(`Error: expected --show or --depends-on option`, project_name_sug(name));
  }
  if (depends && show) {
    suggestions(
      `Error: expected only one of --show or --depends-on option`,
      only_one_sug,
    );
  }

  let mono = load_mono().then(async m => {
    if (show) {
      console.info('not implemented yet');
    } else {
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
      m = structure_graph(m, name, depends);
      return await write_mono(m);
    }
  });

  await mono;
}
