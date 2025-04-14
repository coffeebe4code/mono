#!/usr/bin/env node
import mini from 'minimist';
import { cmd_init } from './cmd_init.js';
import { cmd_add } from './cmd_add.js';
import { cmd_graph } from './cmd_graph.js';
import { cmd_build } from './cmd_build.js';
import * as templates from './templates.js';
import { cmd_install } from './cmd_install.js';

const commands = {
  build: {
    help: `
    monojs build {project} <options>
    examples:
      \`monojs build my-app\` - runs a build of my-app
      \`monojs build my-app -n\` - removes the cache, and runs a build of my-app
    
    project:
    {name}      ......... *required* provided name of project
                          e.g. \`monojs build my-app\`

    options:
    --no-cache  ......... removes cache, and does a fresh build
                          e.g. \`monojs build my-app --no-cache\`
    -n          ......... alias of --no-cache
    --help      ......... shows this help text
  `,
  },
  install: {
    help: `
    monojs (install | i) {project} <options>
    examples:
      \`monojs install @my-product/api lodash\` - adds lodash as a dependency
      \`monojs i . -D @types/node\` - adds node types as dev dependencies

    project:
    {name}      ......... *required* name of the project, uses the root scope if there is
                          one in package.json
    options:
    --save-dev  ......... *optional* if the packages to be installed are dev dependencies
    -D          ......... alias of --save-dev
    `,
  },
  add: {
    help: `
    monojs add {project} <options>
    examples:
      \`monojs add @my-product/api -t koa\` - creates a scoped node koa app
        the project location will be \`./src/services/my-product/api\`
      \`monojs add shopping-cart -t koa\` - creates a node koa app
        the project location will be \`./src/services/shopping-cart\`

    project:
    {name}      ......... *required* name of the project, uses the root scope if there is
                          one in package.json
    options:
    --template  ......... *required* generates the project as a certain type.
                          run \`monojs templates\` to a see a list of supported templates
    -t          ......... alias of --template
    --help      ......... shows this help text
    `,
  },
  init: {
    help: `
    monojs init <options>
    examples:
      \`monojs init\` - initializes the repo. monojs will make sure everything is okay

    options:
    --help      ......... shows this help text`,
  },
  template: {
    help: `
    monojs template [supported]
    examples:
      \`monojs template\` - shows this help text

    supported:
${templates.get_templates().reduce((acc, val) => {
  return acc + '    ' + val + '\n';
}, '')}
    `,
  },
  graph: {
    help: `
    monojs (graph | g) {project} <options>
    examples:
      \`monojs graph my-app --show\` - shows the graph dependencies
      \`monojs g my-app --depends-on @org/shopping-cart - adds a dependency on @org/shopping-cart

    project:
    {name}        ......... the name of the project to do various graph tasks

    options:
    --show        ......... shows the graph of dependencies of a project if name provided
                            otherwise shows all dependencies
    -s            ......... alias of --show
    --depends-on  ......... adds a downstream dependency on the project provided
    -d            ......... alias of --depends-on`,
  },
  help: {
    help: `monojs [command] <options>
    examples:
      \`monojs build my-app\` - runs a build of my-app
      \`monojs graph --help\` - gets the help text of the graph command

    commands:
    install ............. installs packages at root or at workspace members
    i       ............. alias of install
    build   ............. builds a specified project add     ............. adds a new project to the workspace based on a predefined template
    init    ............. turns the current directory into a monojs monorepo
    graph   ............. all graph work for a project done with this command
    g       ............. alias of graph
    help    ............. shows this help message. no options available
  `,
  },
};

/**
 * @returns {Promise<any>} returns if nothing failed
 */
async function main() {
  const args = mini(process.argv.slice(2));
  const command = args?._[0];
  if (!command) {
    console.info(commands.help.help);
    process.exit(0);
  }
  switch (command) {
    case 'i':
    case 'install':
      if (args.help) {
        console.info(commands.install.help);
        return;
      }
      await cmd_install(args);
      break;
    case 'build':
      if (args.help) {
        console.info(commands.build.help);
        return;
      }
      await cmd_build(args);
      break;
    case 'add':
      if (args.help) {
        console.info(commands.add.help);
        return;
      }
      await cmd_add(args);
      break;
    case 'init':
      if (args.help) {
        console.info(commands.init.help);
        process.exit(0);
      }
      await cmd_init();
      break;
    case 'g':
    case 'graph':
      if (args.help) {
        console.info(commands.graph.help);
        process.exit(0);
      }
      await cmd_graph(args);
      break;
    case 'help':
      console.info(commands.help.help);
      break;
    case 'template':
      console.info(commands.template.help);
      break;
    case 'templates':
      console.info(commands.template.help);
      break;
    default:
      console.info('!invalid command provided');
      console.info(commands.help.help);
      process.exit(1);
  }
}

main().catch(e => {
  console.log(e);
  process.exit(255);
});
