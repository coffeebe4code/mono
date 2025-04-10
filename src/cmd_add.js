import * as fs from 'node:fs/promises';
import * as v from './validations.js';
import * as t from './templates.js';
import { project_exists, create_project, load_mono, write_mono } from './mono_helper.js';
/** @typedef {import('./mono_helper.js').MonoStruct} MonoStruct */

/**
 * @param {any} args - the args from command
 * @returns {Promise<void>}
 */
export async function cmd_add(args) {
  /** @type {string | undefined} */
  const name = args._[1];
  /** @type {string | undefined} */
  const template = args.template ?? args.t;

  if (!name || !template) {
    v.suggestions(
      `Error: expected args for name and template option`,
      `
      suggestions:
      - provide a scoped or unscoped name: {${name}} was provided
      - provide a template: {${template}} was provided`,
    );
  } else {
    if (name.includes('@') || name.includes('/')) {
      if (!name.includes('@') || !name.includes('/')) {
        v.suggestions(
          `Error: expected scoped package to contain an '@' and '/'`,
          `
      suggestions:
      - provide a correctly scoped project: ${name} was provided`,
        );
      }
      if (name.split('/')[2]) {
        v.suggestions(
          `Error: expected scoped package to be of depth 1`,
          `
      suggestions:
      - provide 'flat featured' scoped project: ${name} was provided`,
        );
      }
    }
  }
  const clean = v.git_clean();
  await clean;

  const scoped_name = name.includes('@') && name.includes('/');
  const template_loc = t.get_template_kind_path(template);

  if (!template_loc) {
    v.suggestions(
      `Error: expected supported template. '${template}' provided`,
      `
    suggestions:
    - provide one of ${t.get_templates()}`,
    );
  }
  const resolved_dir = `${template_loc}/${name}`;

  const loc = fs
    .access('./' + resolved_dir)
    .then(() => {
      v.suggestions(
        `Error: expected ./${resolved_dir} to not exist`,
        `
      suggestions:
      - rename the directory and commit those changes
      - if you are not satisfied, you can undo your changes`,
      );
    })
    .catch(() => console.log('safe to create'));

  await loc;

  const gitdir = v.git_dir_exists();
  const package_file = v.package_exists();
  const monojs_file = v.mono_exists();
  const git = v.git_dir_exists();

  await Promise.all([gitdir, package_file, monojs_file, git]);

  const init = v.npm_init_workspace(name, resolved_dir, scoped_name);

  await init;

  const cp = fs.cp(
    __dirname + '/assets/templates/' + template,
    process.cwd() + '/' + resolved_dir,
    {
      recursive: true,
    },
  );
  await cp;
  const files = fs
    .readdir(resolved_dir, { recursive: true, withFileTypes: true })
    .then(async files => {
      for (let file of files) {
        if (file.isFile()) {
          const path = `${process.cwd()}/${file.path}/${file.name}`;
          await fs.readFile(path, { encoding: 'utf8' }).then(async data => {
            if (data.indexOf('{{') != -1) {
              const replaced = data.replaceAll(/{{\s*project_name\s*}}/gi, name);
              await fs.writeFile(path, replaced, {
                encoding: 'utf8',
              });
            }
          });
        }
      }
    })
    .catch(e => v.critical_error(e));
  await files;

  const path = process.cwd() + '/' + resolved_dir;
  const installs = fs
    .readFile(path + '/installs.txt', { encoding: 'utf8' })
    .then(async data => {
      if (data.length > 5) {
        const split = data.split('\n');
        const installD = v.npm_install(split[0].trimEnd());
        let install = undefined;
        if (split.length > 1) {
          install = v.npm_install(split[1].trimEnd());
        }
        const del = fs.unlink(path + '/installs.txt');
        return await Promise.all([install, installD, del]);
      }
    })
    .catch(e => v.critical_error(e));

  await installs;

  const monojs = load_mono().then(async (/** @type {MonoStruct} */ mono) => {
    if (project_exists(mono, name)) {
      v.suggestions(
        `Error: expected ${name} to not exist in project tree`,
        `
        suggestions:
        - choose a different project name
        - a project cannot share the same name across types services, apps, clis, etc`,
      );
    }
    let proj = create_project('./' + resolved_dir, name, template_loc);
    mono.projects.push(proj);
    write_mono(mono);
  });

  const tsconfig = fs
    .readFile('./tsconfig.json', { encoding: 'utf8' })
    .then(async data => {
      const obj = JSON.parse(data);
      obj.compilerOptions.paths = obj.compilerOptions.paths || {};
      obj.compilerOptions.paths[name] = [`./${resolved_dir}/*`];
      return fs.writeFile('./tsconfig.json', JSON.stringify(obj, undefined, 2));
    });

  await Promise.all([monojs, tsconfig]);
}
