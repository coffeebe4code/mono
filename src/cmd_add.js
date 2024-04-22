import * as fs from 'node:fs/promises';
import * as v from './validations.js';
import * as t from './templates.js';

let error_code = 0;

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function cmd_add(args) {
  /** @type {string | undefined} */
  const name = args._[1];
  /** @type {string | undefined} */
  const template = args.template ?? args.t;
  ///** @type {boolean | undefined} */
  //const publish = args.publish ?? args.p;

  if (!name || !template) {
    error_code += 1;
    console.error(`!expected args for name and template option
      suggestions:
      - provide a scoped or unscoped name: ${name} was provided
      - provide a template: ${template} was provided`);
  } else {
    if (name.includes('@') || name.includes('/')) {
      if (!name.includes('@') || !name.includes('/')) {
        error_code += 1;
        console.error(`!expected scoped package to contain an '@' and '/'
      suggestions:
      - provide a correctly scoped project: ${name} was provided`);
      }
      if (name.split('/')[2]) {
        error_code += 1;
        console.error(`!expected scoped package to be of depth 1
      suggestions:
      - provide 'flat featured' scoped project: ${name} was provided`);
      }
    }
  }

  if (error_code > 0) {
    process.exit(error_code);
  }
  const scoped_name = name.includes('@') && name.includes('/');
  const template_loc = t.get_template_kind_path(template);

  if (!template_loc) {
    error_code += 1;
    console.error(`!expected supported template. '${template}' provided
    suggestions:
    - provide one of ${t.get_templates()}`);
  }
  const resolved_dir = `src/${template_loc}/${scoped_name ? name.split('@')[1] : name}`;

  if (error_code > 0) {
    process.exit(error_code);
  }

  const loc = fs
    .access('./' + resolved_dir)
    .then(() => {
      error_code += 1;
      console.error(`!expected ./${resolved_dir} to not exist
      suggestions:
      - rename the directory and commit those changes
      - if you are not satisfied, you can undo your changes`);
    })
    .catch(() => {});

  await loc;
  if (error_code > 0) {
    process.exit(error_code);
  }

  const gitdir = v.git_dir_exists().catch(inc_error);
  const package_file = v.package_exists().catch(inc_error);
  const monojs_file = v.mono_exists().catch(inc_error);
  const git = v.git_dir_exists().catch(inc_error);

  await gitdir;
  await package_file;
  await monojs_file;
  await git;

  if (error_code > 0) {
    process.exit(error_code);
  }

  const cp = fs.cp(
    __dirname + '/assets/templates/' + template,
    process.cwd() + '/' + resolved_dir,
    {
      recursive: true,
    },
  );

  return await cp;
}

/**
 * @param {any} err - the error from the callback
 */
function inc_error(err) {
  error_code += 1;
  console.error(err);
}
