import { load_mono, project_exists, structure_graph, write_mono } from './mono_helper.js';
let error_code = 0;

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
    error_code += 1;
    console.error(`!expected a project name with the --depends-on option
      suggestions:
      - provide a project name: \`monojs graph cool-server --depends-on ${depends}\`
      - use the show command to show the graph: \`monojs graph --show\``);
  }
  if (name && !depends && !show) {
    error_code += 1;
    console.error(`!expected --show or --depends-on option
      suggestions:
      - provide a project name: \`monojs graph ${name} --depends-on my-dependency\`
      - use the show command to show the graph: \`monojs graph ${name} --show\``);
  }
  if (depends && show) {
    error_code += 1;
    console.error(`!expected only one of --show or --depends-on option
      suggestions:
      - choose --show or --depends-on separately
      `);
  }
  if (error_code > 0) {
    process.exit(error_code);
  }

  let mono = load_mono()
    .then(async m => {
      if (show) {
        console.info('not implemented yet');
      } else {
        const top = project_exists(m, name);
        const bot = project_exists(m, depends);
        if (!top || !bot) {
          console.error(`!expected projects to exist
      suggestions:
      - ensure you typed the names correctly
      - ${name} exists: ${!!top}
      - ${depends} exists: ${!!bot}`);
          error_code += 1;
          throw Error('error');
        }
        m = structure_graph(m, name, depends);
        return await write_mono(m);
      }
    })
    .catch(inc_error);

  await mono;

  if (error_code > 0) {
    console.error(
      '!critical issues have happened during destructive file operations from above error. You must restore the current working branch and resolve the above error',
    );
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
