#!/usr/bin/env node
import mini from "minimist";
import * as cmd from "@mono/cmds";
import * as templates from "@mono/templates";

const commands = {
  deploy: {
    help: `
    monojs deploy {project} <options>
    examples:
      \`monojs deploy @my-app/app\`     - runs a build of my-app
      \`monojs deploy @my-app/app -n\`  - removes the cache, and runs every dependent target
    
    project:
    {name}      ......... *required* provided name of project
                          e.g. \`monojs deploy @my-app/app\`

    options:
    --no-cache  ......... removes cache, and does a fresh deploy
                          e.g. \`monojs deploy @my-app/app --no-cache\`
    -n          ......... alias of --no-cache
    --help      ......... shows this help text
  `,
  },
  serve: {
    help: `
    monojs serve {project} <options>
    examples:
      \`monojs serve @my-app/app\`    - serves @my-app/app
      \`monojs serve @my-app/app -n\` - removes the cache, and runs the serve build of my-app
    
    project:
    {name}      ......... *required* provided name of project
                          e.g. \`monojs serve @my-app/app\`

    options:
    --no-cache  ......... removes cache, and does a fresh build
                          e.g. \`monojs serve @my-app/app --no-cache\`
    -n          ......... alias of --no-cache
    --help      ......... shows this help text
  `,
  },
  build: {
    help: `
    monojs build {project} <options>
    examples:
      \`monojs build @my-app/app\`                  - runs a build of my-app
      \`monojs build @my-app/app -n\`               - removes the cache, and runs a build of my-app
    
    project:
    {name}      ......... *required* provided name of project
                          e.g. \`monojs build @my-app/app\`

    options:
    --no-cache  ......... removes cache, and does a fresh build
                          e.g. \`monojs build @my-app/app --no-cache\`
    -n          ......... alias of --no-cache
    --help      ......... shows this help text
  `,
  },
  touch: {
    help: `
    monojs touch {file_path}
    examples:
      \`monojs touch /home/chris/monojs/packages/@core/cmds/index.js\` - runs the highest target up to 
        'build' on the project where the file is located.

    note: in the future this might run the target up to 'build' on projects which have the touched project in 
      its dependency graph
    
    file_path:
    {path}      ......... *required* provide the file path of the touched project
                          e.g. \`monojs touch /home/chris/chris/.../index.js\`

    options:
    --no-cache  ......... removes cache, and does a fresh touch
                          e.g. \`monojs touch /home/chris/chris/.../index.js --no-cache\`
    -n          ......... alias of --no-cache
    --help      ......... shows this help text
  `,
  },
  install: {
    help: `
    monojs (install | i) {project} <options>
    examples:
      \`monojs install @my-product/api lodash\` - adds lodash as a dependency
      \`monojs i . -D @types/node\`             - adds node types as dev dependencies globally

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
      \`monojs add @shopping-cart/order -t uws\`  - creates a node uwebsocketjs app
          the project location will be \`./src/services/shopping-cart/order\`

    project:
    {name}      ......... *required* name of the project, must be a scoped project

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
  return acc + "    " + val + "\n";
}, "")}
    `,
  },
  graph: {
    help: `
    monojs (graph | g) {project} <options>
    examples:
      \`monojs graph @my-app/app --show\`                     - shows the graph dependencies (not yet supported)
      \`monojs g @my-app/app --depends-on @org/shopping-cart - adds a dependency on @org/shopping-cart

    project:
    {name}        ......... the name of the project to do various graph tasks

    options:
    --show        ......... shows the graph of dependencies of a project if name provided
                            otherwise shows all dependencies (not yet supported)
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
    build   ............. builds a specified project
    b       ............. alias of build
    add     ............. adds a new project to the workspace based on a predefined template
    deploy  ............. deploys the project to the configured location clis get installed
    serve   ............. runs the serve command for the specified project
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
    case "i":
    case "install":
      if (args.help) {
        console.info(commands.install.help);
        return;
      }
      await cmd.install(args);
      break;
    case "build":
    case "b":
      if (args.help) {
        console.info(commands.build.help);
        return;
      }
      await cmd.build(args);
      break;
    case "serve":
      if (args.help) {
        console.info(commands.serve.help);
        return;
      }
      await cmd.serve(args);
      break;
    case "touch":
      if (args.help) {
        console.info(commands.touch.help);
        return;
      }
      await cmd.touch(args);
      break;
    case "deploy":
      if (args.help) {
        console.info(commands.deploy.help);
        return;
      }
      await cmd.deploy(args);
      break;
    case "add":
      if (args.help) {
        console.info(commands.add.help);
        return;
      }
      await cmd.add(args);
      break;
    case "init":
      if (args.help) {
        console.info(commands.init.help);
        process.exit(0);
      }
      await cmd.init();
      break;
    case "g":
    case "graph":
      if (args.help) {
        console.info(commands.graph.help);
        process.exit(0);
      }
      await cmd.graph(args);
      break;
    case "help":
      console.info(commands.help.help);
      break;
    case "template":
      console.info(commands.template.help);
      break;
    case "templates":
      console.info(commands.template.help);
      break;
    default:
      console.info("!invalid command provided");
      console.info(commands.help.help);
      process.exit(255);
  }
}

main().catch((e) => {
  console.log(e);
  process.exit(255);
});
