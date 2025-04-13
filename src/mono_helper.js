import * as fs from 'node:fs/promises';
// @ts-ignore
import { v4 } from 'uuid';
import { TemplateKind } from './templates.js';
import * as v from './validations';

/**
 * Represents the Dependencies structure
 * @typedef {object} DependencyStruct
 * @property {string} name - name of the Project
 * @property {string} uuid - uuid of the target
 */

/**
 * Represents the Targets structure
 * @typedef {object} TargetStruct
 * @property {string} kind - kind of the target build, lint, test, etc
 * @property {string} uuid - uuid of the target
 * @property {DependencyStruct[]} dependencies_down - the dependency of the project down
 */

/**
 * Represents the Projects structure
 * @typedef {object} ProjectStruct
 * @property {string} name - scoped or unscoped name
 * @property {string} type - service, cli, etc
 * @property {TargetStruct[]} targets - the targets of the project
 */

/**
 * Represents the Monojs.json structure
 * @typedef {object} MonoStruct
 * @property {number} version - the version of the js file
 * @property {ProjectStruct[]} projects - the version of the js file
 */

/**
 * Gets the targets for a given template
 * @param {string} kind - the template kind
 * @returns {string[] } all target kinds needed
 */
export function get_target_kinds(kind) {
  // ensure the order elements in the array is increasing with its get order value
  switch (kind) {
    case TemplateKind.SERVICE:
      return ['prettier', 'tsc', 'lint', 'build', 'test', 'serve', 'install'];
    case TemplateKind.CLI:
      return ['prettier', 'tsc', 'lint', 'build', 'test', 'install'];
    case TemplateKind.APP:
      return ['prettier', 'tsc', 'lint', 'build', 'test'];
    case TemplateKind.PACKAGE:
      return ['prettier', 'tsc', 'lint', 'build', 'test'];
    default:
      throw 'Error: internal monojs issue';
  }
}

export const TargetValues = {
  PRETTIER: 'prettier',
  TSC: 'tsc',
  LINT: 'lint',
  BUILD: 'build',
  TEST: 'test',
  INSTALL: 'install',
  SERVE: 'serve',
};

/**
 * @param {string} val - this is the kind
 * @returns {number} returns the index
 */
function get_order(val) {
  switch (val) {
    case TargetValues.PRETTIER:
      return 0;
    case TargetValues.TSC:
      return 1;
    case TargetValues.LINT:
      return 2;
    case TargetValues.BUILD:
      return 3;
    case TargetValues.TEST:
      return 4;
    case TargetValues.SERVE:
      return 5;
    case TargetValues.INSTALL:
      return 5;
    default:
      throw 'invalid target value. internal monojs issue';
  }
}

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
        v.suggestions(
          `Error: expected correct monojs version for monojs file
        found '${obj.version}' expected version 0`,
          `
        suggestions:
        - install an older version of monojs globally`,
        );
      }
      return obj;
    });
}

/**
 * Writes the monojs.json file
 * @param {MonoStruct} mono - the mono struct to be saved
 * @returns {Promise<void>} should be void if no error
 */
export async function write_mono(mono) {
  return await fs.writeFile(
    process.cwd() + '/monojs.json',
    JSON.stringify(mono, undefined, 2),
  );
}

/**
 * @param {string} kind - this is the kind for the target. TargetValues
 * @returns {TargetStruct} returns the target
 */
export function create_target(kind) {
  /** @type {TargetStruct} */
  const target = {
    kind,
    uuid: v4(),
    dependencies_down: [],
  };
  return target;
}

/**
 * @param {string} name - this is the name for the project
 * @param {string} type - this is the template type for the project
 * @returns {ProjectStruct} returns the project
 */
export function create_project(name, type) {
  let kinds = get_target_kinds(type);
  /** @type {TargetStruct[]} */
  const targets = kinds.map(kind => {
    return create_target(kind);
  });

  /** @type {ProjectStruct} */
  const project = {
    name,
    type,
    targets: targets,
  };
  return project;
}

/**
 * @param {MonoStruct} mono - this is the MonoStruct object
 * @param {string} name - this is the name to search for
 * @returns {ProjectStruct | undefined} returns the mono object if a project exists with that name
 */
export function project_exists(mono, name) {
  for (const p of mono.projects) {
    if (p.name === name) {
      return p;
    }
  }
  return undefined;
}

/**
 * @param {ProjectStruct} project - this is the project receiving the dependency
 * @param {ProjectStruct} dproject  this is the project that is becoming a dependency of <project>
 * @returns {void}
 */
export function add_dependency(project, dproject) {
  for (const target of project.targets) {
    for (const dtarget of dproject.targets) {
      if (get_order(target.kind) === get_order(dtarget.kind)) {
        target.dependencies_down.push({
          name: dproject.name,
          uuid: dtarget.uuid,
        });
      }
    }
  }
}

/**
 * @param {MonoStruct} mono - the mono
 * @param {ProjectStruct} project - the project
 * @param {string} kind - the target cmd
 * @returns {Promise<void>}
 */
export async function run_all_commands(mono, project, kind) {
  /** @type {string[]} */
  let processed = [];
  const target = project.targets.find(t => t.kind === kind);
  if (!target) {
    throw `Error: expected target to exist for project ${project.name}: target ${kind}`;
  }
  await recursively_run_target(mono, project, target, processed);
}

/**
 * @param {MonoStruct} mono - the mono structure
 * @param {ProjectStruct} project - the current project
 * @param {TargetStruct} target - the current target to run
 * @param {string[]} processed - list of processed UUIDs
 * @returns {Promise<void>}
 */
export async function recursively_run_target(mono, project, target, processed) {
  if (processed.includes(target.uuid)) {
    return;
  }

  for (const dep of target.dependencies_down) {
    const dep_proj = mono.projects.find(p => p.name === dep.name);
    if (!dep_proj) {
      throw `Error: expected project to exist, target: ${target.uuid} dependency: ${dep.name} `;
    }

    const dep_target = dep_proj.targets.find(t => t.uuid === dep.uuid);
    if (!dep_target) {
      throw `Error: expected target to exist, dependency: ${dep.uuid} dependency: ${dep.name} `;
    }

    await recursively_run_target(mono, dep_proj, dep_target, processed);
  }
  /** @type {{name:string, kind: string, uuid: string}[]} */
  let this_targets = Array();
  for (const targ of project.targets) {
    if (get_order(target.kind) > get_order(targ.kind) || targ.kind === target.kind) {
      this_targets.push({ name: project.name, kind: targ.kind, uuid: targ.uuid });
    }
  }
  const promises = this_targets.map(obj => {
    return v.npm_run_spawn(obj.name, obj.kind);
  });
  await Promise.all(promises);
  processed.push(...this_targets.map(obj => obj.uuid));
}
