#!/usr/bin/env node
// @ts-ignore
import mini from 'minimist';

const commands = {
  build: `
    monojs build <options>`,
  touch: `
    monojs touch <options>`,
  lint: `
    monojs lint <options>`,
  init: `
    monojs init <options>`,
  graph: `
    monojs graph <options>`,
  help: {
    message: `
    monojs [command] <options>

    touch   .............
    build   ............. 
    lint    .............
    init    .............
    analyze .............
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
    console.info(commands.help.message);
  }
}

main();
