#!/usr/bin/env node
// @ts-ignore
import mini from 'minimist';
import { cmd_init } from './cmd_init.js';
import { cmd_add } from './cmd_add.js';
import { cmd_graph } from './cmd_graph.js';
import * as templates from './templates.js';

const commands = {
  upgrade: {
    help: `
    monojs upgrade
    examples:
      \`monojs upgrade\` - upgrades the current workspace to the globally installed version of monojs
    
    options:
    --help      ......... shows this help text
  `,
  },
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
  touch: {
    help: `
    monojs touch {projects} <options>
    examples:
      \`monojs touch my-app\`     - runs a build of my-app, and all upstream projects
      \`monojs touch my-app -n\`  - removes the cache, and runs a build of my-app
                                    and all upstream projects
    
    projects:
    {name,name} ......... *required* provided name of projects as comma separated list
                          e.g. \`monojs touch my-app,shopping-cart\`

    options:
    --no-cache  ......... removes cache, and does a fresh build, and upstream projects
                          e.g. \`monojs touch my-app --no-cache\`
    -n          ......... alias of --no-cache
    --help      ......... shows this help text
  `,
  },
  lint: {
    help: `
    monojs lint {project} <options>`,
  },
  serve: {
    help: `
    monojs serve {project} <options>`,
  },
  test: {
    help: `
    monojs test`,
  },
  e2e: {
    help: `
    monojs e2e`,
  },
  project: {
    help: `
    monojs project {project} <options>
    examples:
      \`monojs project shopping-cart -t koa\` - creates a node koa app
        the project location will be \`./src/services/shopping-cart\`

    project:
    {name}      ......... *required* name of the project, can be scoped or unscoped

    options:
    --template  ......... *required* generates the project as a certain type.
                          run \`monojs templates\` to a see a list of supported templates
    -t          ......... alias of --template
    --publish   ......... instructs monojs that the project is publishable
    -p          ......... alias of --publish
    --help      ......... shows this help text
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
    --publish   ......... instructs monojs that the project is publishable
    -p          ......... alias of --publish
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
    monojs graph {project} <options>
    examples:
      \`monojs graph my-app --show\` - shows the graph dependencies
      \`monojs graph my-app --depends-on @org/shopping-cart - adds a dependency on @org/shopping-cart

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
    touch   ............. trigger all dependent upstream projects targets to run
    build   ............. builds a specified project
    lint    ............. runs all analysis against a project
    test    ............. runs all tests against a project
    init    ............. turns the current directory into a monojs monorepo
    graph   ............. all graph work for a project done with this command
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
    case 'upgrade':
      console.info(commands.upgrade.help);
      break;
    case 'build':
      if (args.help) {
        console.info(commands.build.help);
        process.exit(0);
      }
      await cmd_build(args);
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
    case 'add':
      await cmd_add(args);
      break;
    case 'init':
      if (args.help) {
        console.info(commands.init.help);
        process.exit(0);
      }
      await cmd_init();
      break;
    case 'graph':
      if (args.help) {
        console.info(commands.graph.help);
        process.exit(0);
      }
      await cmd_graph(args);
      break;
    case 'e2e':
      console.info(commands.e2e.help);
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

main()
  .then(() => {})
  .catch(() => {
    process.exit(255);
  });

function cmd_build(args) {
  throw new Error('Function not implemented.');
}
