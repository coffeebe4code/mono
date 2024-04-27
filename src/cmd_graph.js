import { load_mono } from './mono_helper.js';
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
    process.exit(1);
  }

  let mono = load_mono()
    .then(m => {
      let processed = 0;
      if (show) {
        console.info('not implemented yet');
      } else {
        for (const p of m.projects) {
          // todo:: make sure all projects are ready first. then go through targets and make the deps
          if (processed === 2) {
            // add logic in here after we have both ready
            break;
          }
          if (p.name === name) {
            // dep down
            processed++;
          } else if (p.name === depends) {
            // dep up
            processed++;
          }
        }
      }
    })
    .catch(inc_error);

  await mono;
}

/**
 * @param {any} err - the error from the callback
 */
function inc_error(err) {
  error_code += 1;
  console.error(err);
}
