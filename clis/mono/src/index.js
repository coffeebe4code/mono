#!/usr/bin/env node

/**
 * @returns {Promise<void>} returns if nothing failed
 */
async function main() {
  console.log('hello');
}

main().catch(e => {
  console.log(e);
  process.exit(255);
});
