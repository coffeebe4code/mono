import * as fs from 'node:fs/promises';
// @ts-ignore
import { v4 } from 'uuid';
import { TemplateKind } from './templates.js';

/**
 * Gets the targets for a given template
 * @param {string} kind - the template kind
 * @returns {string[] | undefined} all target kinds needed
 */
export function get_target_kinds(kind) {
  switch (kind) {
    case TemplateKind.SERVICE:
      return ['lint', 'build', 'test', 'e2e', 'serve'];
    case TemplateKind.CLI:
      return ['lint', 'build', 'test', 'install', 'publish'];
    case TemplateKind.UI:
      return ['lint', 'build', 'test', 'e2e', 'serve'];
    case TemplateKind.LIB:
      return ['lint', 'build', 'test', 'publish'];
    default:
      return undefined;
  }
}

export const TargetValues = {
  LINT: 'lint',
  BUILD: 'build',
  TEST: 'test',
  E2E: 'e2e',
  INSTALL: 'install',
  PUBLISH: 'publish',
  SERVE: 'serve',
};

/**
 * @param {string} val - this is the kind
 * @returns {number} returns the index
 */
function get_order(val) {
  switch (val) {
    case TargetValues.LINT:
      return 0;
    case TargetValues.BUILD:
      return 1;
    case TargetValues.TEST:
      return 2;
    case TargetValues.E2E:
      return 2;
    case TargetValues.INSTALL:
      return 3;
    case TargetValues.PUBLISH:
      return 3;
    case TargetValues.SERVE:
      return 2;
    default:
      return -1;
  }
}

/**
 * Represents the Runs structure
 * @typedef {object} RunsStruct
 * @property {string[]} lint - lints to be ran
 * @property {string[]} build - builds to be ran
 * @property {string[]} test - tests to be ran
 * @property {string[]} e2e - e2es to be ran
 * @property {string[]} install - installs to be ran
 * @property {string[]} publish - publishs to be ran
 * @property {string[]} serve - serves to be ran
 */

/**
 * Represents the Dependencies structure
 * @typedef {object} DependencyStruct
 * @property {string} path - path to the Project
 * @property {string} uuid - uuid of the target
 */

/**
 * Represents the Targets structure
 * @typedef {object} TargetStruct
 * @property {string} kind - kind of the target build, lint, test, etc
 * @property {string} cmd - cmd the target needs
 * @property {string} uuid - uuid of the target
 * @property {DependencyStruct[]} dependencies_up - the dependency of the project up
 * @property {DependencyStruct[]} dependencies_down - the dependency of the project down
 */

/**
 * Represents the Projects structure
 * @typedef {object} ProjectStruct
 * @property {string} path - file location
 * @property {string} name - scoped or unscoped name
 * @property {string} type - service, cli, etc
 * @property {TargetStruct[]} targets - the targets of the project
 */

/**
 * Represents the Monojs.json structure
 * @typedef {object} MonoStruct
 * @property {number} version - the version of the js file
 * @property {ProjectStruct[] | undefined} projects - the version of the js file
 */

/**
 * Loads the monojs.json file and validates with current version of monojs
 * @returns {Promise<MonoStruct>} mono struct of a certain version
 */
export async function load_mono() {
  return await fs
    .readFile(process.cwd() + '/monojs.json', { encoding: 'utf8' })
    .then(data => {
      /** @type {MonoStruct} */
      const obj = JSON.parse(data);
      if (obj.version > 0) {
        console.error(`!expected correct monojs version for monojs file
        found '${obj.version}' expected version 0
        suggestions:
        - install an older version of monojs globally
        - or upgrade the current monojs file with \`monojs upgrade\``);
        throw Error('error');
      }
      return obj;
    });
}

/**
 * @param {string} cmd - this is the cmd for the target
 * @param {string} kind - this is the kind for the target. TargetValues
 * @returns {TargetStruct} returns the target
 */
export function create_target(cmd, kind) {
  /** @type {TargetStruct} */
  const target = {
    cmd,
    kind,
    uuid: v4(),
    dependencies_down: [],
    dependencies_up: [],
  };
  return target;
}

/**
 * @param {string} path - this is the path for the project
 * @param {string} name - this is the name for the project
 * @param {string} type - this is the template type for the project
 * @param {boolean} publishable - this is if publishable
 * @returns {ProjectStruct} returns the project
 */
export function create_project(path, name, type, publishable) {
  let cmds = get_target_kinds(type);
  if (!publishable) {
    cmds = cmds.filter(ele => ele !== 'publish');
  }
  /** @type {TargetStruct[]} */
  const targets = cmds.map(kind => {
    switch (kind) {
      case 'lint':
        return create_target(`node ./node_modules/bin/eslint ${path}`, kind);
      case 'build':
        return create_target(`node ./monojs/build.js ${path}`, kind);
      case 'test':
        return create_target(
          `node --experimental-vm-modules ./node_modules/.bin/jest ${path} `,
          kind,
        );
      case 'install':
        return create_target(`npm i ${path} -g`, kind);
      default:
        return undefined;
    }
  });

  /** @type {ProjectStruct} */
  const project = {
    path,
    name,
    type,
    targets: targets,
  };
  return project;
}

/**
 * @param {ProjectStruct} up_project - this is the project receiving the dependency
 * @param {ProjectStruct} down_project  this is the project that is becoming an upstream dependency
 * @param {TargetStruct} up_target - this is the higher target
 * @param {TargetStruct} down_target - this is the lower target
 * @returns {void}
 */
export function add_dependency(up_project, down_project, up_target, down_target) {
  /** @type {DependencyStruct} */
  const bottom_dep = {
    path: up_project.path,
    uuid: up_target.uuid,
  };
  /** @type {DependencyStruct} */
  const top_dep = {
    path: down_project.path,
    uuid: down_target.uuid,
  };

  up_target.dependencies_down.push(bottom_dep);
  down_target.dependencies_up.push(top_dep);
}

/**
 * @param {MonoStruct} mono - this is the mono struct object
 * @param {ProjectStruct} project - this is the project getting ran
 * @param {string} kind - this is the project that is becoming an upstream dependency
 * @returns {RunsStruct} returns an array of command arrays to be ran in parallel
 */
export function get_run_chain_top(mono, project, kind) {
  //* @type {RunsStruct} */
  let result = {
    lint: Array(),
    build: Array(),
    test: Array(),
    e2e: Array(),
    install: Array(),
    publish: Array(),
    serve: Array(),
  };
  //* @type {string[]} */
  const processed = Array();

  result = get_run_chain_top_rec(mono, project, kind, processed, result);
  return result;
}

/**
 * @param {MonoStruct} mono - this is the mono struct object
 * @param {ProjectStruct} project - this is the project getting ran
 * @param {string} kind - this is the project that is becoming an upstream dependency
 * @param {string[]} processed - this is the array of already processed target guids
 * @param {RunsStruct} result - an array of command arrays to be ran in parallel
 * @returns {RunsStruct} returns result
 */
export function get_run_chain_top_rec(mono, project, kind, processed, result) {
  project.targets.forEach(t => {
    const has_processed = processed.some(p => p === t.uuid);
    if (!has_processed) {
      if (t.kind === kind || get_order(kind) > get_order(t.kind)) {
        Object.entries(result).forEach(([key, val]) => {
          if (key === t.kind) {
            val.push(t.cmd);
            processed.push(t.uuid);
          }
        });
        t.dependencies_down.forEach(dep => {
          mono.projects.forEach(p => {
            if (p.path === dep.path) {
              p.targets.forEach(inner => {
                if (inner.kind === kind || get_order(kind) > get_order(inner.kind)) {
                  result = get_run_chain_top_rec(mono, p, inner.kind, processed, result);
                }
              });
            }
          });
        });
      }
    }
  });
  return result;
}
