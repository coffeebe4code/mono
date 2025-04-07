import * as v from './validations.js';

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function cmd_install(args) {
  /** @type {string | undefined} */
  const name = args._[1];
  /** @type {string | undefined} */
  const dev = args['save-dev'] ?? args.D;
  const non_dev = args._.slice(2);

  if (!name) {
    v.suggestions(
      `Error: expected target`,
      `
      suggestions:
      - use monojs install --help
      - provide a workspace member name '@my-scope/lib-name'
      - provide '.' to indicate global install 'monojs i . typescript'`,
    );
  }
  if (!dev && !non_dev) {
    v.suggestions(
      `Error: expected installs`,
      `
      suggestions:
      - use monojs install --help
      - example: 'monojs i @my-scope/lib-name lodash'
      - example: 'monojs install @my-scope/lib-name -D @types/node'`,
    );
  }

  const gitdir = v.git_dir_exists();
  const package_file = v.package_exists();
  const monojs_file = v.mono_exists();
  const git = v.git_dir_exists();

  await Promise.all([gitdir, package_file, monojs_file, git]);

  let install;
  if (name == '.') {
    if (dev) {
      install = v.npm_install(`npm install -D ${dev + non_dev.join(' ')}`);
    } else {
      install = v.npm_install(`npm install ${non_dev.join(' ')}`);
    }
  } else if (dev) {
    install = v.npm_install(`npm install -D ${dev + non_dev.join(' ')} -w ${name}`);
  } else {
    install = v.npm_install(`npm install ${non_dev.join(' ')} -w ${name}`);
  }
  return await install;
}
