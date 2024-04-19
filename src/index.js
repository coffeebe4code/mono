#!/usr/bin/env node
// @ts-ignore
import mini from 'minimist';
import { cmd_init } from './cmd_init.js';

const commands = {
  build: {
    help: `monojs build [target] <options>
    examples:
      \`monojs build my-app\` - runs a build of my-app
      \`monojs build my-app -n\` - removes the cache, and runs a build of my-app
    
    target:
    {name}      ......... *required* provided name of target
                          e.g. \`monojs build my-app\`

    options:
    --no-cache  ......... removes cache, and does a fresh build
                          e.g. \`monojs build my-app --no-cache\`
    -n          ......... alias of --no-cache
  `,
  },
  touch: {
    help: `monojs touch [target] <options>
    examples:
      \`monojs touch my-app\` - runs a build of my-app, and all upstream targets
      \`monojs touch my-app -n\` - removes the cache, and runs a build of my-app
                                  and all upstream targets
    
    target:
    {name}      ......... *required* provided name of target
                          e.g. \`monojs touch my-app\`

    options:
    --no-cache  ......... removes cache, and does a fresh build, and upstream targets
                          e.g. \`monojs touch my-app --no-cache\`
    -n          ......... alias of --no-cache
  `,
  },
  lint: {
    help: `
    monojs lint <options>`,
  },
  test: {
    help: `
    monojs lint <options>`,
  },
  init: {
    help: `
    monojs init <options>`,
  },
  graph: {
    help: `
    monojs graph <options>`,
  },
  help: {
    help: `monojs [command] <options>
    examples:
      \`monojs build my-app\` - runs a build of my-app
      \`monojs graph\` - gets the help text of the graph command

    commands:
    touch   ............. trigger all dependent upstream targets to run
    build   ............. builds a specified target
    lint    ............. runs all analysis against target
    init    ............. turns the current directory into a monojs monorepo
    graph   ............. all graph work for a target done with this command
    help    ............. shows this help message. no options available
  `,
  },
};

/**
 *
 */
function main() {
  const args = mini(process.argv.slice(2));
  const command = args?._[0];
  if (!command) {
    console.info(commands.help.help);
    process.exit(0);
  }
  switch (command) {
    case 'build':
      console.info(commands.build.help);
      break;
    case 'touch':
      console.info(commands.touch.help);
      break;
    case 'lint':
      console.info(commands.lint.help);
      break;
    case 'test':
      console.info(commands.test.help);
      break;
    case 'init':
      console.info('initializing monorepo');
      cmd_init();
      break;
    case 'graph':
      console.info(commands.graph.help);
      break;
    case 'help':
      console.info(commands.help.help);
      break;
    default:
      console.info('!invalid command provided');
      console.info(commands.help.help);
      process.exit(1);
  }
}

main();
